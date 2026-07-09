#!/usr/bin/env bash
# transform-frontmatter.sh — converts an opencode agent file to the target runtime format.
#
# The canonical source is always agents/*.md in opencode format.
# This script reads the canonical file and outputs a runtime-specific version.
#
# Usage:
#   ./scripts/transform-frontmatter.sh agents/pm-lead.md --runtime opencode
#   ./scripts/transform-frontmatter.sh agents/pm-lead.md --runtime claude-code
#
# Output: transformed file content (stdout)

set -euo pipefail

# --- Args --------------------------------------------------------------------
AGENT_FILE=""
RUNTIME="opencode"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --runtime) RUNTIME="${2:-}"; shift 2 ;;
    --runtime=*) RUNTIME="${1#*=}"; shift ;;
    -h|--help)
      echo "Usage: transform-frontmatter.sh <agent-file> --runtime <runtime>"
      echo "Runtimes: opencode (default), claude-code, copilot, codex"
      exit 0 ;;
    -*)
      echo "Unknown flag: $1" >&2
      exit 1 ;;
    *)
      AGENT_FILE="$1"
      shift ;;
  esac
done

if [[ -z "$AGENT_FILE" ]]; then
  echo "error: missing agent file argument" >&2
  exit 1
fi

if [[ ! -f "$AGENT_FILE" ]]; then
  echo "error: file not found: $AGENT_FILE" >&2
  exit 1
fi

# --- Parse canonical frontmatter --------------------------------------------
# File structure: --- \n frontmatter \n --- \n body

RAW="$(cat "$AGENT_FILE")"

# Split on --- markers. First empty section (before first ---), then frontmatter, then body.
FRONTMATTER="$(echo "$RAW" | awk 'BEGIN { RS="^---\n"; ORS="" } NR==2 { print }')"
BODY="$(echo "$RAW" | awk 'BEGIN { RS="\n---"; ORS="" } NR==2 { print }' | tail -n +2)"

if [[ -z "$FRONTMATTER" ]]; then
  echo "error: no frontmatter found in $AGENT_FILE" >&2
  exit 1
fi

# --- Extract canonical fields -----------------------------------------------

get_yaml_value() {
  local key="$1"
  echo "$FRONTMATTER" | grep -E "^${key}:" | head -1 | sed 's/^[^:]*: *//' | sed 's/^"//;s/"$//' || true
}

get_nested_yaml_value() {
  local parent="$1" child="$2"
  # Matches "  child: value" after "parent:" line
  echo "$FRONTMATTER" | grep -A5 "^${parent}:" | grep -E "^\s+${child}:" | head -1 | awk '{ $1=""; print $0 }' | sed 's/^ *//' | sed 's/^"//;s/"$//' || true
}

has_yaml_key() {
  local key="$1"
  echo "$FRONTMATTER" | grep -qE "^${key}:"
}

DESCRIPTION="$(get_yaml_value "description")"
EDIT_MODE="$(get_nested_yaml_value "permission" "edit")"
AGENT_NAME="$(basename "$AGENT_FILE" .md)"

# --- Detect tools ------------------------------------------------------------
# In opencode, if a tool category is listed (even as "ask"), it's available.
# The ask/allow/deny distinction maps to permissionMode, not tool presence.
# We just need to check if the category key exists in frontmatter.

HAS_BASH=false
if echo "$FRONTMATTER" | grep -qE '^  bash:'; then
  HAS_BASH=true
fi

HAS_TASK=false
if echo "$FRONTMATTER" | grep -qE '^  task:'; then
  HAS_TASK=true
fi

HAS_SKILL=false
if echo "$FRONTMATTER" | grep -qE '^  skill:'; then
  HAS_SKILL=true
fi

HAS_WEBFETCH=false
if echo "$FRONTMATTER" | grep -qE '^  webfetch:'; then
  HAS_WEBFETCH=true
fi

# --- Generate output ---------------------------------------------------------

case "$RUNTIME" in
  opencode)
    # No transformation — pass through as-is
    echo "$RAW"
    ;;

  claude-code)
    # Map permission.edit → permissionMode
    case "$EDIT_MODE" in
      allow) PERMISSION_MODE="acceptEdits" ;;
      ask)   PERMISSION_MODE="plan" ;;
      deny|"") PERMISSION_MODE="default" ;;
      *)     PERMISSION_MODE="plan" ;;
    esac

    # Build tools list
    TOOLS=("Read")
    $HAS_BASH && TOOLS+=("Bash")
    $HAS_TASK && TOOLS+=("Task")
    $HAS_SKILL && TOOLS+=("Skill")
    $HAS_WEBFETCH && TOOLS+=("WebFetch")
    [[ "$EDIT_MODE" == "allow" ]] && TOOLS+=("Write" "Edit")

    # Build output
    echo "---"
    echo "name: $AGENT_NAME"
    echo "description: $DESCRIPTION"
    echo "tools:"
    for t in "${TOOLS[@]+"${TOOLS[@]}"}"; do
      echo "  - $t"
    done
    echo "permissionMode: $PERMISSION_MODE"
    echo "---"
    echo ""
    echo "$BODY"
    ;;

  copilot)
    # Copilot uses .github/prompts/<name>.prompt.md — no special frontmatter, just the body
    echo "# ${AGENT_NAME}"
    echo ""
    echo "$BODY"
    ;;

  codex)
    # Codex uses .codex/agents/<name>.toml format
    case "$EDIT_MODE" in
      allow) SANDBOX_MODE="workspace-write" ;;
      *)     SANDBOX_MODE="read-only" ;;
    esac
    printf 'name = "%s"\nsandbox_mode = "%s"\n\n[developer_instructions]\n"""\n%s\n"""\n' \
      "$AGENT_NAME" \
      "$SANDBOX_MODE" \
      "$BODY"
    ;;

  *)
    echo "error: unknown runtime '$RUNTIME'" >&2
    exit 1
    ;;
esac
