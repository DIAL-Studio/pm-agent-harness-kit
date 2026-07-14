#!/usr/bin/env python3
"""pm-agent-harness-kit MCP server and CLI — Phase 5 harness infrastructure.

Requires: Python >= 3.8 (stdlib only: sqlite3, json, sys, os, argparse, datetime, pathlib)
          3.12+ recommended.

Usage:
  pm-ahk init [--scope global|project]   Interactive harness setup
  pm-ahk serve                            Start MCP server (stdio JSON-RPC)
  pm-ahk status                           Show initiative backlog
  pm-ahk initiative add                   Interactively add to backlog
  pm-ahk initiative list [--status <s>]   List initiatives
  pm-ahk initiative done <id|slug>        Mark initiative as done
"""

from __future__ import annotations

import argparse
import datetime
import json
import os
import sqlite3
import sys
import textwrap
from pathlib import Path

# ── Constants ────────────────────────────────────────────────────────────────

VERSION = "1.7.0"
REPO_OWNER = "DIAL-Studio"
REPO_NAME = "pm-agent-harness-kit"
REMOTE_URL = f"https://raw.githubusercontent.com/{REPO_OWNER}/{REPO_NAME}/main"
COLUMNS = 80

# ── Colors ───────────────────────────────────────────────────────────────────

RESET = "\033[0m"
BOLD = "\033[1m"
DIM = "\033[2m"
GREEN = "\033[32m"
CYAN = "\033[36m"
YELLOW = "\033[33m"
RED = "\033[31m"
MAGENTA = "\033[35m"


def green(s): return f"{GREEN}{s}{RESET}"
def cyan(s): return f"{CYAN}{s}{RESET}"
def yellow(s): return f"{YELLOW}{s}{RESET}"
def red(s): return f"{RED}{s}{RESET}"
def bold(s): return f"{BOLD}{s}{RESET}"
def dim(s): return f"{DIM}{s}{RESET}"
def magenta(s): return f"{MAGENTA}{s}{RESET}"


# ── DB Path resolution ───────────────────────────────────────────────────────

def resolve_db_path(scope: str = "global", cwd: str | None = None) -> Path:
    """Resolve .harness/ path based on scope."""
    cwd = cwd or os.getcwd()
    if scope == "project":
        base = Path(cwd)
    else:
        base = Path.home() / ".config" / "opencode"
    harness_dir = base / ".harness"
    harness_dir.mkdir(parents=True, exist_ok=True)
    return harness_dir / "harness.db"


# ── DB helpers ───────────────────────────────────────────────────────────────

INIT_SQL = """
CREATE TABLE IF NOT EXISTS initiatives (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS actions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  initiative_id INTEGER NOT NULL,
  agent TEXT NOT NULL,
  action_type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (initiative_id) REFERENCES initiatives(id)
);

CREATE TABLE IF NOT EXISTS criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  initiative_id INTEGER NOT NULL,
  criterion TEXT NOT NULL,
  met INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (initiative_id) REFERENCES initiatives(id)
);
"""

STATUS_FLOW = ["pending", "discovery", "strategy", "spec", "review", "approved", "blocked", "done"]


def get_conn(db_path: str | Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db(db_path: str | Path) -> None:
    conn = get_conn(db_path)
    conn.executescript(INIT_SQL)
    conn.commit()
    conn.close()


# ── MCP Protocol (JSON-RPC over stdio) ───────────────────────────────────────

def mcp_read() -> dict | None:
    header = sys.stdin.readline()
    if not header:
        return None
    if not header.startswith("Content-Length:"):
        return None
    length = int(header.split(":")[1].strip())
    # Skip the blank line
    sys.stdin.readline()
    body = sys.stdin.read(length)
    return json.loads(body)


def mcp_send(obj: dict) -> None:
    body = json.dumps(obj)
    sys.stdout.write(f"Content-Length: {len(body)}\r\n\r\n{body}")
    sys.stdout.flush()


# ── Tool handlers ────────────────────────────────────────────────────────────

def slugify(title: str) -> str:
    return title.lower().replace(" ", "-").replace("/", "-")[:50]


def handle_tool_call(conn: sqlite3.Connection, tool: str, args: dict) -> dict | str:
    cur = conn.cursor()

    if tool == "initiatives.create":
        slug = args.get("slug") or slugify(args["title"])
        description = args.get("description", "")
        try:
            cur.execute(
                "INSERT INTO initiatives (slug, title, description) VALUES (?, ?, ?)",
                (slug, args["title"], description),
            )
            conn.commit()
            return {"id": cur.lastrowid, "slug": slug, "title": args["title"], "status": "pending"}
        except sqlite3.IntegrityError:
            return {"error": f"slug '{slug}' already exists"}

    elif tool == "initiatives.list":
        status_filter = args.get("status")
        if status_filter:
            cur.execute(
                "SELECT id, slug, title, status, updated_at FROM initiatives WHERE status = ? ORDER BY updated_at DESC",
                (status_filter,),
            )
        else:
            cur.execute(
                "SELECT id, slug, title, status, updated_at FROM initiatives ORDER BY updated_at DESC"
            )
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    elif tool == "initiatives.claim":
        initiative_id = args["id"]
        cur.execute(
            "UPDATE initiatives SET status = 'discovery', updated_at = datetime('now') WHERE id = ? AND status = 'pending'",
            (initiative_id,),
        )
        conn.commit()
        if cur.rowcount == 0:
            cur.execute("SELECT title, status FROM initiatives WHERE id = ?", (initiative_id,))
            row = cur.fetchone()
            if row:
                return {"claimed": False, "id": initiative_id, "title": row["title"],
                        "status": f"already {row['status']}"}
            return {"error": f"initiative {initiative_id} not found"}
        return {"claimed": True, "id": initiative_id}

    elif tool == "initiatives.update":
        initiative_id = args["id"]
        status = args["status"]
        if status not in STATUS_FLOW:
            return {"error": f"invalid status '{status}'. Must be one of: {', '.join(STATUS_FLOW)}"}
        cur.execute(
            "UPDATE initiatives SET status = ?, updated_at = datetime('now') WHERE id = ?",
            (status, initiative_id),
        )
        conn.commit()
        return {"id": initiative_id, "status": status}

    elif tool == "initiatives.get":
        initiative_id = args["id"]
        cur.execute("SELECT * FROM initiatives WHERE id = ?", (initiative_id,))
        row = cur.fetchone()
        return dict(row) if row else {"error": f"initiative {initiative_id} not found"}

    elif tool == "actions.write":
        cur.execute(
            "INSERT INTO actions (initiative_id, agent, action_type, content) VALUES (?, ?, ?, ?)",
            (args["initiative_id"], args["agent"], args["action_type"], args["content"]),
        )
        conn.commit()
        return {"id": cur.lastrowid, "created_at": datetime.datetime.now().isoformat()}

    elif tool == "actions.get":
        cur.execute(
            "SELECT agent, action_type, content, created_at FROM actions WHERE initiative_id = ? ORDER BY created_at",
            (args["initiative_id"],),
        )
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    elif tool == "handoff.read":
        cur.execute(
            "SELECT content, agent, action_type, created_at FROM actions WHERE initiative_id = ? ORDER BY created_at DESC LIMIT 1",
            (args["initiative_id"],),
        )
        row = cur.fetchone()
        if row:
            return dict(row)
        return {"content": None, "agent": None, "action_type": None}

    elif tool == "criteria.add":
        cur.execute(
            "INSERT INTO criteria (initiative_id, criterion) VALUES (?, ?)",
            (args["initiative_id"], args["criterion"]),
        )
        conn.commit()
        return {"id": cur.lastrowid, "criterion": args["criterion"], "met": False}

    elif tool == "criteria.list":
        cur.execute(
            "SELECT id, criterion, met FROM criteria WHERE initiative_id = ? ORDER BY id",
            (args["initiative_id"],),
        )
        rows = cur.fetchall()
        return [dict(r) for r in rows]

    elif tool == "criteria.check":
        cur.execute("UPDATE criteria SET met = 1 WHERE id = ?", (args["id"],))
        conn.commit()
        return {"id": args["id"], "met": True}

    return {"error": f"unknown tool: {tool}"}


# ── MCP Tool definitions (for tools/list) ─────────────────────────────────────

MCP_TOOLS = [
    {"name": "initiatives_create", "description": "Create a new initiative in the backlog",
     "inputSchema": {"type": "object", "properties": {
         "title": {"type": "string", "description": "Short action-oriented title"},
         "slug": {"type": "string", "description": "URL-friendly slug (auto-generated if omitted)"},
         "description": {"type": "string", "description": "Goal and context"},
     }, "required": ["title"]}},
    {"name": "initiatives_list", "description": "List initiatives, optionally filtered by status",
     "inputSchema": {"type": "object", "properties": {
         "status": {"type": "string", "description": "Filter: pending|discovery|spec|review|approved|blocked|done"},
     }}},
    {"name": "initiatives_claim", "description": "Atomically claim a pending initiative",
     "inputSchema": {"type": "object", "properties": {
         "id": {"type": "integer", "description": "Initiative ID"},
     }, "required": ["id"]}},
    {"name": "initiatives_update", "description": "Change initiative status",
     "inputSchema": {"type": "object", "properties": {
         "id": {"type": "integer"}, "status": {"type": "string"},
     }, "required": ["id", "status"]}},
    {"name": "initiatives_get", "description": "Get initiative details",
     "inputSchema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}},
    {"name": "actions_write", "description": "Log an agent action with content",
     "inputSchema": {"type": "object", "properties": {
         "initiative_id": {"type": "integer"}, "agent": {"type": "string"},
         "action_type": {"type": "string"}, "content": {"type": "string"},
     }, "required": ["initiative_id", "agent", "action_type", "content"]}},
    {"name": "actions_get", "description": "Get full action history for an initiative",
     "inputSchema": {"type": "object", "properties": {"initiative_id": {"type": "integer"}}, "required": ["initiative_id"]}},
    {"name": "handoff_read", "description": "Read the most recent action content (previous agent's output)",
     "inputSchema": {"type": "object", "properties": {"initiative_id": {"type": "integer"}}, "required": ["initiative_id"]}},
    {"name": "criteria_add", "description": "Add an acceptance criterion",
     "inputSchema": {"type": "object", "properties": {
         "initiative_id": {"type": "integer"}, "criterion": {"type": "string"},
     }, "required": ["initiative_id", "criterion"]}},
    {"name": "criteria_list", "description": "List acceptance criteria for an initiative",
     "inputSchema": {"type": "object", "properties": {"initiative_id": {"type": "integer"}}, "required": ["initiative_id"]}},
    {"name": "criteria_check", "description": "Mark an acceptance criterion as met (reviewer only)",
     "inputSchema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}},
]


# ── MCP serve loop ───────────────────────────────────────────────────────────

def cmd_serve(db_path: str | Path) -> None:
    """Start MCP server — reads JSON-RPC from stdin, writes to stdout."""
    conn = get_conn(db_path)

    while True:
        req = mcp_read()
        if req is None:
            break

        req_id = req.get("id")
        method = req.get("method", "")
        params = req.get("params", {})

        if method == "initialize":
            mcp_send({"jsonrpc": "2.0", "result": {"protocolVersion": "2024-11-05",
                       "capabilities": {"tools": {}}}, "id": req_id})

        elif method == "tools/list":
            mcp_send({"jsonrpc": "2.0", "result": {"tools": MCP_TOOLS}, "id": req_id})

        elif method == "tools/call":
            tool_name = params.get("name", "")
            tool_args = params.get("arguments", {})
            try:
                result = handle_tool_call(conn, tool_name.replace("_", "."), tool_args)
                mcp_send({"jsonrpc": "2.0", "result": result, "id": req_id})
            except Exception as e:
                mcp_send({"jsonrpc": "2.0", "error": {"code": -32000, "message": str(e)}, "id": req_id})

        elif method == "notifications/initialized":
            pass

        else:
            mcp_send({"jsonrpc": "2.0", "error": {"code": -32601, "message": f"method not found: {method}"}, "id": req_id})

    conn.close()


# ── CLI: init ────────────────────────────────────────────────────────────────

def prompt(question: str, default: str = "") -> str:
    val = input(f"  {question} [{default}]: ").strip()
    return val if val else default


def cmd_init(scope: str) -> None:
    print()
    print(f"  {bold('pm-agent-harness-kit')} {dim(f'v{VERSION}')}")
    print(f"  {dim('MCP harness initialization')}")
    print()

    # Determine scope
    if scope == "global":
        base_dir = Path.home() / ".config" / "opencode"
        print(f"  {dim('Installing globally:')} {base_dir}")
    else:
        base_dir = Path(os.getcwd())
        print(f"  {dim('Installing in current project:')} {base_dir}")

    harness_dir = base_dir / ".harness"
    db_path = harness_dir / "harness.db"
    feature_json = harness_dir / "feature_list.json"

    # Create directories
    harness_dir.mkdir(parents=True, exist_ok=True)

    # Initialize DB
    init_db(db_path)
    print(f"  {green('✓')} Database: {db_path}")

    # Create feature_list.json
    if not feature_json.exists():
        feature_json.write_text("[\n\n]\n")
        print(f"  {green('✓')} Backlog: {feature_json}")
    else:
        print(f"  {dim('  → feature_list.json already exists, keeping it')}")

    # Add first initiative interactively
    if input(f"  {yellow('Add a first initiative?')} (y/N) ").lower() == "y":
        title = input("  Title: ").strip()
        desc = input("  Description: ").strip()
        conn = get_conn(db_path)
        conn.execute("INSERT INTO initiatives (slug, title, description) VALUES (?, ?, ?)",
                     (slugify(title), title, desc))
        conn.commit()
        conn.close()
        print(f"  {green('✓')} Initiative created: {title}")

    # MCP config snippet (opencode)
    mcp_config = {
        "mcpServers": {
            "pm-ahk": {
                "command": "python3",
                "args": [str(Path(__file__).resolve()), "serve", "--db", str(db_path)],
            }
        }
    }
    print()
    print(f"  {bold('▸ Add to your opencode.json or .opencode/mcp.json:')}")
    print(f"  {json.dumps(mcp_config, indent=2)}")
    print()
    print(f"  {green('Done!')} Run {bold('pm-ahk status')} to see the backlog.")
    print(f"  {dim(f'Python >= 3.8 required (current: {sys.version.split()[0]}) — 3.12+ recommended.')}")


# ── CLI: status ──────────────────────────────────────────────────────────────

def cmd_status(db_path: str | Path) -> None:
    if not os.path.exists(db_path):
        print(f"  {yellow('No harness database found. Run')} pm-ahk init {yellow('first.')}")
        return

    conn = get_conn(db_path)
    cur = conn.execute("SELECT id, slug, title, status, updated_at FROM initiatives ORDER BY updated_at DESC")

    rows = cur.fetchall()
    if not rows:
        print(f"  {yellow('No initiatives yet. Run')} pm-ahk initiative add {yellow('or')} pm-ahk init {yellow('to add one.')}")
        conn.close()
        return

    print(f"  {bold('Initiative Backlog')}")
    print(f"  {dim('─' * 72)}")
    print(f"  {'ID':<4} {'Title':<30} {'Status':<12} {'Updated':<20}")
    print(f"  {'─'*3} {'─'*29} {'─'*11} {'─'*19}")
    for r in rows:
        status_display = r["status"]
        if status_display == "done":
            status_display = green(status_display)
        elif status_display in ("blocked",):
            status_display = red(status_display)
        elif status_display in ("spec", "review"):
            status_display = cyan(status_display)
        print(f"  {r['id']:<4} {r['title'][:29]:<30} {status_display:<28} {r['updated_at'][:19]}")
    conn.close()


# ── CLI: initiative subcommands ──────────────────────────────────────────────

def cmd_initiative(args: argparse.Namespace, db_path: str | Path) -> None:
    conn = get_conn(db_path)

    if args.action == "add":
        title = input("  Title: ").strip()
        desc = input("  Description: ").strip()
        slug = slugify(title)
        try:
            conn.execute("INSERT INTO initiatives (slug, title, description) VALUES (?, ?, ?)",
                         (slug, title, desc))
            conn.commit()
            print(f"  {green('✓')} Created: {title} ({green(slug)})")
        except sqlite3.IntegrityError:
            print(f"  {yellow('A slug conflict occurred. The initiative was probably added before.')}")

    elif args.action == "list":
        status_filter = args.status
        if status_filter:
            cur = conn.execute(
                "SELECT id, slug, title, status, updated_at FROM initiatives WHERE status = ? ORDER BY id",
                (status_filter,),
            )
        else:
            cur = conn.execute("SELECT id, slug, title, status, updated_at FROM initiatives ORDER BY id")
        rows = cur.fetchall()
        if not rows:
            print(f"  {yellow('No initiatives.')}")
        else:
            for r in rows:
                s = r["status"]
                s_display = green(s) if s == "done" else red(s) if s == "blocked" else s
                print(f"  {r['id']:<4} {r['title'][:30]:<32} {s_display:<12} {r['updated_at'][:10]}")
        print(f"  {dim(f'Total: {len(rows)}')}")

    elif args.action == "done":
        identifier = args.id_or_slug
        if identifier.isdigit():
            cur = conn.execute("UPDATE initiatives SET status = 'done', updated_at = datetime('now') WHERE id = ?",
                               (int(identifier),))
        else:
            cur = conn.execute("UPDATE initiatives SET status = 'done', updated_at = datetime('now') WHERE slug = ?",
                               (identifier,))
        conn.commit()
        if cur.rowcount > 0:
            print(f"  {green('✓')} Marked as done: {identifier}")
        else:
            print(f"  {yellow('Not found:')} {identifier}")

    conn.close()


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description=f"pm-agent-harness-kit MCP harness v{VERSION}")
    parser.add_argument("--version", action="version", version=VERSION)
    parser.add_argument("--db", help="Path to harness.db (default: auto-detected)")

    sub = parser.add_subparsers(dest="command")

    sub.add_parser("serve", help="Start MCP server (stdio JSON-RPC)")
    init_p = sub.add_parser("init", help="Initialize harness database")
    init_p.add_argument("--scope", choices=["global", "project"], default="global",
                        help="Install scope (default: global)")
    status_p = sub.add_parser("status", help="Show initiative backlog")

    init_p = sub.add_parser("initiative", help="Manage initiatives")
    init_p.add_argument("action", choices=["add", "list", "done"])
    init_p.add_argument("id_or_slug", nargs="?", help="ID or slug for 'done' action")
    init_p.add_argument("--status", help="Filter list by status")

    opts = parser.parse_args()

    if opts.command is None:
        parser.print_help()
        return

    # Resolve DB path
    if opts.db:
        db_path = Path(opts.db)
    else:
        # Try project-local first, then global
        project_db = Path(os.getcwd()) / ".harness" / "harness.db"
        global_db = Path.home() / ".config" / "opencode" / ".harness" / "harness.db"
        db_path = project_db if project_db.exists() else global_db

    if opts.command == "serve":
        init_db(db_path)  # ensure tables exist
        cmd_serve(db_path)
    elif opts.command == "init":
        cmd_init(opts.scope)
    elif opts.command == "status":
        cmd_status(db_path)
    elif opts.command == "initiative":
        cmd_initiative(opts, db_path)


if __name__ == "__main__":
    main()
