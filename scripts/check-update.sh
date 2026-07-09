#!/usr/bin/env bash
# Check if a newer version of pm-agent-harness-kit is available.
#
# Usage:
#   ./scripts/check-update.sh
#   ./scripts/check-update.sh --json    # machine-readable output
#
# Exit codes:
#   0 — up to date
#   1 — update available
#   2 — could not check (network error, missing VERSION file, etc.)
#
# Reads installed version from ~/.config/opencode/pm-ahk.version (default runtime).
# Set OPENCODE_CONFIG_DIR to override.

set -euo pipefail

OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
LOCAL_VERSION_FILE="$OC_ROOT/pm-ahk.version"
REMOTE_VERSION_URL="https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/VERSION"
JSON_OUTPUT=false

# --- Arg parsing ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --json) JSON_OUTPUT=true; shift ;;
    -h|--help)
      echo "Usage: check-update.sh [--json]"
      echo "Exit: 0=up-to-date, 1=update-available, 2=check-failed"
      exit 0
      ;;
    *) shift ;;
  esac
done

# --- Resolve local version ---
if [[ ! -f "$LOCAL_VERSION_FILE" ]]; then
  if $JSON_OUTPUT; then
    echo '{"status":"not_installed","installed":null,"latest":null}'
  else
    echo "pm-agent-harness-kit is not installed."
    echo "Install: curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/install.sh | bash"
  fi
  exit 2
fi

LOCAL_VERSION="$(cat "$LOCAL_VERSION_FILE" | tr -d '[:space:]')"

# --- Fetch remote version ---
REMOTE_VERSION="$(curl -fsSL "$REMOTE_VERSION_URL" 2>/dev/null | tr -d '[:space:]' || true)"

if [[ -z "$REMOTE_VERSION" ]]; then
  if $JSON_OUTPUT; then
    echo "{\"status\":\"error\",\"installed\":\"$LOCAL_VERSION\",\"latest\":null,\"message\":\"could not reach remote\"}"
  else
    echo "Could not check for updates (network error)."
    echo "Installed: v$LOCAL_VERSION"
  fi
  exit 2
fi

# --- Compare ---
if [[ "$LOCAL_VERSION" == "$REMOTE_VERSION" ]]; then
  if $JSON_OUTPUT; then
    echo "{\"status\":\"up_to_date\",\"installed\":\"$LOCAL_VERSION\",\"latest\":\"$REMOTE_VERSION\"}"
  else
    echo "pm-agent-harness-kit is up to date (v$LOCAL_VERSION)."
  fi
  exit 0
else
  if $JSON_OUTPUT; then
    echo "{\"status\":\"update_available\",\"installed\":\"$LOCAL_VERSION\",\"latest\":\"$REMOTE_VERSION\"}"
  else
    echo "Update available: v$LOCAL_VERSION → v$REMOTE_VERSION"
    echo "Run: curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/update.sh | bash"
  fi
  exit 1
fi
