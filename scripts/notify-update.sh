#!/usr/bin/env bash
# notify-update.sh — checks for pm-agent-harness-kit updates and shows a system notification if one is available.
#
# Designed to be run from cron (Linux) or launchd (macOS) to provide passive
# update notifications without the user having to remember to check.
#
# Usage:
#   ./scripts/notify-update.sh
#   ./scripts/notify-update.sh --quiet   # only notify if update available, no "up to date" message
#
# Exit codes:
#   0 — up to date
#   1 — update available
#   2 — check failed

set -euo pipefail

OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
LOCAL_VERSION_FILE="$OC_ROOT/pm-ahk.version"
REMOTE_VERSION_URL="https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/VERSION"
QUIET=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --quiet) QUIET=true; shift ;;
    -h|--help)
      echo "Usage: notify-update.sh [--quiet]"
      echo "Exit: 0=up-to-date, 1=update-available, 2=check-failed"
      exit 0 ;;
    *) shift ;;
  esac
done

# Check local version file
if [[ ! -f "$LOCAL_VERSION_FILE" ]]; then
  $QUIET || echo "pm-agent-harness-kit not installed or no version file found."
  exit 2
fi

LOCAL_VERSION="$(cat "$LOCAL_VERSION_FILE" | tr -d '[:space:]')"
REMOTE_VERSION="$(curl -fsSL --connect-timeout 5 "$REMOTE_VERSION_URL" 2>/dev/null | tr -d '[:space:]' || true)"

if [[ -z "$REMOTE_VERSION" ]]; then
  $QUIET || echo "Could not check for updates (network error)."
  exit 2
fi

if [[ "$LOCAL_VERSION" == "$REMOTE_VERSION" ]]; then
  $QUIET || echo "pm-agent-harness-kit is up to date (v$LOCAL_VERSION)."
  exit 0
fi

# Update available — show notification
MESSAGE="pm-agent-harness-kit update available: v$LOCAL_VERSION → v$REMOTE_VERSION"
COMMAND="curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/update.sh | bash"

case "$(uname -s)" in
  Darwin)
    osascript -e "display notification \"$MESSAGE\" with title \"pm-agent-harness-kit\" subtitle \"Update available\" sound name \"default\"" 2>/dev/null || true
    # Also log to console
    echo "$MESSAGE"
    echo "To update: $COMMAND"
    ;;
  Linux)
    if has notify-send; then
      notify-send "pm-agent-harness-kit" "$MESSAGE" 2>/dev/null || true
    fi
    echo "$MESSAGE"
    echo "To update: $COMMAND"
    ;;
  *)
    echo "$MESSAGE"
    echo "To update: $COMMAND"
    ;;
esac

exit 1
