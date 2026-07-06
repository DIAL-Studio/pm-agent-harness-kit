#!/usr/bin/env bash
# tpm-tools uninstaller — removes the global agent and skill installed by install.sh.

set -euo pipefail

OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
SKILL_DIR="$OC_ROOT/skills/tpm-artifacts"
AGENT_FILE="$OC_ROOT/agents/tpm.md"

rm -rf "$SKILL_DIR"
rm -f  "$AGENT_FILE"

green() { printf "\033[32m%s\033[0m\n" "$*"; }
green "Removed:"
green "  $SKILL_DIR"
green "  $AGENT_FILE"
green "Restart opencode to reflect the change."