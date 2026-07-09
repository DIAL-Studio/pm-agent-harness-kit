#!/usr/bin/env bash
# pm-ahk-cron.sh — silent daily update check for pm-agent-harness-kit.
#
# Checks the remote VERSION once a day and writes a flag file if an update
# is available. pm-lead reads this flag on startup and notifies the user.
#
# No notifications. No pop-ups. No output unless there's an error.
#
# Install (launchd — macOS):
#   cp pm-ahk-cron.sh ~/.config/opencode/
#   cat > ~/Library/LaunchAgents/com.pm-ahk.update-check.plist << EOF
#   <?xml version="1.0" encoding="UTF-8"?>
#   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
#   <plist version="1.0">
#   <dict>
#     <key>Label</key><string>com.pm-ahk.update-check</string>
#     <key>ProgramArguments</key><array><string>~/.config/opencode/pm-ahk-cron.sh</string></array>
#     <key>StartInterval</key><integer>86400</integer>
#     <key>RunAtLoad</key><true/>
#   </dict>
#   </plist>
#   EOF
#   launchctl load ~/Library/LaunchAgents/com.pm-ahk.update-check.plist
#
# Install (cron — Linux/WSL):
#   (crontab -l 2>/dev/null; echo "0 10 * * * ~/.config/opencode/pm-ahk-cron.sh") | crontab -
#
# This script also runs during install.sh to set up the flag for first use.

set -euo pipefail

# Try both opencode and claude-code config paths
OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
CC_ROOT="$HOME/.claude"

LOCAL_VERSION_FILE=""
REMOTE_VERSION_URL="https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/VERSION"
UPDATE_FLAG=""

# Pick the right config root based on which one has a version file
if [[ -f "$OC_ROOT/pm-ahk.version" ]]; then
  LOCAL_VERSION_FILE="$OC_ROOT/pm-ahk.version"
  UPDATE_FLAG="$OC_ROOT/pm-ahk.update-available"
elif [[ -f "$CC_ROOT/pm-ahk.version" ]]; then
  LOCAL_VERSION_FILE="$CC_ROOT/pm-ahk.version"
  UPDATE_FLAG="$CC_ROOT/pm-ahk.update-available"
else
  # Not installed — exit silently
  exit 0
fi

LOCAL_VERSION="$(cat "$LOCAL_VERSION_FILE" | tr -d '[:space:]')"
REMOTE_VERSION="$(curl -fsSL --connect-timeout 5 "$REMOTE_VERSION_URL" 2>/dev/null | tr -d '[:space:]' || true)"

if [[ -z "$REMOTE_VERSION" ]]; then
  # Network unavailable — exit silently
  exit 0
fi

if [[ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]]; then
  # Update available — write flag
  echo "$REMOTE_VERSION" > "$UPDATE_FLAG"
else
  # Up to date — remove flag if it exists
  rm -f "$UPDATE_FLAG"
fi

exit 0
