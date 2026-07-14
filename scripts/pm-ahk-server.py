#!/usr/bin/env python3
"""MCP over HTTP server for pm-agent-harness-kit — using Flask.

Communicates with opencode/Claude Code via HTTP MCP transport.

Requirements: flask (pip install flask)

Usage:
  pm-ahk serve-http [--port 5431] [--db <path>]
  
  Then configure opencode.json:
  "mcp": {
    "pm-ahk": {
      "type": "remote",
      "url": "http://localhost:5431",
      "enabled": true
    }
  }
"""

from __future__ import annotations

import json
import os
import sqlite3
import sys
from pathlib import Path

import flask

# Ensure the original pm-ahk.py is importable
SCRIPT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPT_DIR))

# Reuse db logic from pm-ahk.py
sys.path.insert(0, str(SCRIPT_DIR.parent))
import importlib.util as _util
_spec = _util.spec_from_file_location("_ahk", str(SCRIPT_DIR / "pm-ahk.py"))
_ahk = _util.module_from_spec(_spec)
_spec.loader.exec_module(_ahk)

app = flask.Flask(__name__)
DB_PATH = None  # set in main()

STATUS_FLOW = ["pending", "discovery", "strategy", "spec", "review", "approved", "blocked", "done"]

MCP_TOOLS = [
    {"name": "initiatives_create", "description": "Create a new initiative",
     "inputSchema": {"type": "object", "properties": {
         "title": {"type": "string"}, "slug": {"type": "string"},
         "description": {"type": "string"}}, "required": ["title"]}},
    {"name": "initiatives_list", "description": "List initiatives",
     "inputSchema": {"type": "object", "properties": {
         "status": {"type": "string"}}}},
    {"name": "initiatives_claim", "description": "Claim a pending initiative",
     "inputSchema": {"type": "object", "properties": {
         "id": {"type": "integer"}}, "required": ["id"]}},
    {"name": "initiatives_update", "description": "Change initiative status",
     "inputSchema": {"type": "object", "properties": {
         "id": {"type": "integer"}, "status": {"type": "string"}}, "required": ["id", "status"]}},
    {"name": "initiatives_get", "description": "Get initiative details",
     "inputSchema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}},
    {"name": "actions_write", "description": "Log an agent action",
     "inputSchema": {"type": "object", "properties": {
         "initiative_id": {"type": "integer"}, "agent": {"type": "string"},
         "action_type": {"type": "string"}, "content": {"type": "string"}},
     "required": ["initiative_id", "agent", "action_type", "content"]}},
    {"name": "actions_get", "description": "Get action history",
     "inputSchema": {"type": "object", "properties": {"initiative_id": {"type": "integer"}}, "required": ["initiative_id"]}},
    {"name": "handoff_read", "description": "Read previous agent's output",
     "inputSchema": {"type": "object", "properties": {"initiative_id": {"type": "integer"}}, "required": ["initiative_id"]}},
    {"name": "criteria_add", "description": "Add acceptance criterion",
     "inputSchema": {"type": "object", "properties": {
         "initiative_id": {"type": "integer"}, "criterion": {"type": "string"}},
     "required": ["initiative_id", "criterion"]}},
    {"name": "criteria_list", "description": "List criteria",
     "inputSchema": {"type": "object", "properties": {"initiative_id": {"type": "integer"}}, "required": ["initiative_id"]}},
    {"name": "criteria_check", "description": "Mark criterion as met",
     "inputSchema": {"type": "object", "properties": {"id": {"type": "integer"}}, "required": ["id"]}},
]


def get_conn():
    return _ahk.get_conn(DB_PATH)


@app.route("/", methods=["GET"])
def index():
    return flask.jsonify({"server": "pm-ahk-mcp", "version": "1.9.6", "protocol": "mcp"}), 200


@app.route("/mcp", methods=["GET", "POST"])
def mcp_endpoint():
    """MCP message endpoint — receives JSON-RPC requests, returns JSON-RPC responses."""
    if flask.request.method == "GET":
        # MCP endpoint info
        return flask.jsonify({"capabilities": {"tools": {}}, "protocolVersion": "2024-11-05"}), 200

    data = flask.request.get_json(silent=True)
    if not data or "method" not in data:
        return flask.jsonify({"jsonrpc": "2.0", "error": {"code": -32600, "message": "Invalid request"},
                              "id": data.get("id") if data else None}), 400

    method = data["method"]
    params = data.get("params", {})
    req_id = data.get("id")

    try:
        if method == "initialize":
            result = {"protocolVersion": "2024-11-05", "capabilities": {"tools": {}}}
        elif method == "tools/list":
            result = {"tools": MCP_TOOLS}
        elif method == "tools/call":
            tool_name = params.get("name", "")
            tool_args = params.get("arguments", {})
            result = handle_tool_call(tool_name.replace("_", "."), tool_args)
        elif method in ("notifications/initialized", "notifications/cancelled"):
            flask.jsonify({}), 202
            return flask.Response(status=202)
        else:
            return flask.jsonify({"jsonrpc": "2.0", "error": {"code": -32601, "message": f"method not found: {method}"},
                                  "id": req_id}), 404
    except Exception as e:
        return flask.jsonify({"jsonrpc": "2.0", "error": {"code": -32000, "message": str(e)},
                              "id": req_id}), 500

    return flask.jsonify({"jsonrpc": "2.0", "result": result, "id": req_id}), 200


def handle_tool_call(tool: str, args: dict) -> dict | str:
    """Execute an MCP tool call (same logic as pm-ahk.py but reuses its helpers)."""
    conn = get_conn()
    cur = conn.cursor()

    if tool == "initiatives.create":
        slug = args.get("slug") or _ahk.slugify(args["title"])
        desc = args.get("description", "")
        try:
            cur.execute("INSERT INTO initiatives (slug, title, description) VALUES (?, ?, ?)",
                        (slug, args["title"], desc))
            conn.commit()
            return {"id": cur.lastrowid, "slug": slug, "title": args["title"], "status": "pending"}
        except sqlite3.IntegrityError:
            return {"error": f"slug '{slug}' already exists"}

    elif tool == "initiatives.list":
        status_filter = args.get("status")
        if status_filter:
            cur.execute("SELECT id, slug, title, status, updated_at FROM initiatives WHERE status = ? ORDER BY updated_at DESC",
                        (status_filter,))
        else:
            cur.execute("SELECT id, slug, title, status, updated_at FROM initiatives ORDER BY updated_at DESC")
        return [dict(r) for r in cur.fetchall()]

    elif tool == "initiatives.claim":
        iid = args["id"]
        cur.execute("UPDATE initiatives SET status = 'discovery', updated_at = datetime('now') WHERE id = ? AND status = 'pending'",
                    (iid,))
        conn.commit()
        if cur.rowcount == 0:
            cur.execute("SELECT title, status FROM initiatives WHERE id = ?", (iid,))
            row = cur.fetchone()
            if row:
                return {"claimed": False, "id": iid, "title": row["title"],
                        "status": f"already {row['status']}"}
            return {"error": f"initiative {iid} not found"}
        return {"claimed": True, "id": iid}

    elif tool == "initiatives.update":
        iid = args["id"]
        status = args["status"]
        if status not in STATUS_FLOW:
            return {"error": f"invalid status '{status}'"}
        cur.execute("UPDATE initiatives SET status = ?, updated_at = datetime('now') WHERE id = ?", (status, iid))
        conn.commit()
        return {"id": iid, "status": status}

    elif tool == "initiatives.get":
        iid = args["id"]
        cur.execute("SELECT * FROM initiatives WHERE id = ?", (iid,))
        row = cur.fetchone()
        return dict(row) if row else {"error": f"initiative {iid} not found"}

    elif tool == "actions.write":
        cur.execute("INSERT INTO actions (initiative_id, agent, action_type, content) VALUES (?, ?, ?, ?)",
                    (args["initiative_id"], args["agent"], args["action_type"], args["content"]))
        conn.commit()
        return {"id": cur.lastrowid}

    elif tool == "actions.get":
        cur.execute("SELECT agent, action_type, content, created_at FROM actions WHERE initiative_id = ? ORDER BY created_at",
                    (args["initiative_id"],))
        return [dict(r) for r in cur.fetchall()]

    elif tool == "handoff.read":
        cur.execute("SELECT content, agent, action_type, created_at FROM actions WHERE initiative_id = ? ORDER BY created_at DESC LIMIT 1",
                    (args["initiative_id"],))
        row = cur.fetchone()
        return dict(row) if row else {"content": None, "agent": None, "action_type": None}

    elif tool == "criteria.add":
        cur.execute("INSERT INTO criteria (initiative_id, criterion) VALUES (?, ?)",
                    (args["initiative_id"], args["criterion"]))
        conn.commit()
        return {"id": cur.lastrowid, "criterion": args["criterion"], "met": False}

    elif tool == "criteria.list":
        cur.execute("SELECT id, criterion, met FROM criteria WHERE initiative_id = ? ORDER BY id",
                    (args["initiative_id"],))
        return [dict(r) for r in cur.fetchall()]

    elif tool == "criteria.check":
        cur.execute("UPDATE criteria SET met = 1 WHERE id = ?", (args["id"],))
        conn.commit()
        return {"id": args["id"], "met": True}

    return {"error": f"unknown tool: {tool}"}


def main():
    import argparse
    parser = argparse.ArgumentParser(description="pm-agent-harness-kit MCP over HTTP server")
    parser.add_argument("--port", type=int, default=5431, help="HTTP port (default: 5431)")
    parser.add_argument("--host", default="127.0.0.1", help="Bind address (default: 127.0.0.1)")
    parser.add_argument("--db", help="Path to harness.db")
    opts = parser.parse_args()

    global DB_PATH
    if opts.db:
        DB_PATH = Path(opts.db)
    else:
        project_db = Path.cwd() / ".harness" / "harness.db"
        global_db = Path.home() / ".config" / "opencode" / ".harness" / "harness.db"
        DB_PATH = project_db if project_db.exists() else global_db

    # Ensure DB exists
    _ahk.init_db(str(DB_PATH))

    print(f"\n  MCP over HTTP server: http://{opts.host}:{opts.port}")
    print(f"  Database: {DB_PATH}")
    print(f"  Press Ctrl+C to stop.\n")

    app.run(host=opts.host, port=opts.port, debug=False)


if __name__ == "__main__":
    main()
