#!/usr/bin/env bash
# tpm-tools installer — copies the TPM agent and tpm-artifacts skill into opencode's
# global discovery paths. No config file edits required.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/install.sh | bash
#
# After install, restart opencode. The `tpm` agent appears on Tab; the
# `tpm-artifacts` skill is available to any agent via the `skill` tool.

set -euo pipefail

# --- Config -----------------------------------------------------------------

REPO="DIAL-Studio/tpm-tools"
BRANCH="${TPM_TOOLS_BRANCH:-main}"
BASE_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}"

# --- Helpers ----------------------------------------------------------------

cyan()   { printf "\033[36m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
die() { red "error: $*" >&2; exit 1; }

has() { command -v "$1" >/dev/null 2>&1; }

# --- Preflight --------------------------------------------------------------

if [[ -z "${HOME:-}" ]]; then
  die "HOME is not set. Cannot locate opencode config dir."
fi

case "$(uname -s)" in
  Darwin|Linux) OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}" ;;
  MINGW*|MSYS*|CYGWIN*) OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}" ;;
  *) die "Unsupported OS: $(uname -s). Install manually by copying skills/ and agents/ into ~/.config/opencode/." ;;
esac

SKILL_DIR="$OC_ROOT/skills/tpm-artifacts"
AGENT_DIR="$OC_ROOT/agents"

cyan "Installing tpm-tools into $OC_ROOT/"

if ! has curl; then
  die "curl is required. Install it and re-run."
fi

# --- opencode presence check (soft) -----------------------------------------

if ! has opencode; then
  yellow "warning: 'opencode' not found on PATH."
  yellow "         Files will still be installed; install opencode from https://opencode.ai to use them."
fi

# --- Fetch files -------------------------------------------------------------

mkdir -p "$SKILL_DIR" "$AGENT_DIR"

tmp_skill="$(mktemp)"
tmp_agent="$(mktemp)"
trap 'rm -f "$tmp_skill" "$tmp_agent"' EXIT

cyan "Downloading SKILL.md..."
curl -fsSL "$BASE_URL/skills/tpm-artifacts/SKILL.md" -o "$tmp_skill" \
  || die "Failed to fetch SKILL.md from $BASE_URL"

cyan "Downloading tpm.md..."
curl -fsSL "$BASE_URL/agents/tpm.md" -o "$tmp_agent" \
  || die "Failed to fetch tpm.md from $BASE_URL"

# Guard: ensure we got actual content (raw returns 200 even for tiny 404 pages sometimes)
if [[ ! -s "$tmp_skill" ]] || ! grep -q '^---' "$tmp_skill"; then
  die "SKILL.md download is empty or missing frontmatter. Check the URL or branch."
fi
if [[ ! -s "$tmp_agent" ]] || ! grep -q '^---' "$tmp_agent"; then
  die "tpm.md download is empty or missing frontmatter. Check the URL or branch."
fi

# --- Install ----------------------------------------------------------------

backup_if_exists() {
  local f="$1"
  if [[ -f "$f" ]]; then
    local bak="${f}.bak.$(date +%s)"
    cp "$f" "$bak"
    yellow "Existing file backed up: $f -> $bak"
  fi
}

backup_if_exists "$SKILL_DIR/SKILL.md"
backup_if_exists "$AGENT_DIR/tpm.md"

mv "$tmp_skill" "$SKILL_DIR/SKILL.md"
mv "$tmp_agent"  "$AGENT_DIR/tpm.md"

green "Installed:"
green "  $SKILL_DIR/SKILL.md"
green "  $AGENT_DIR/tpm.md"

# --- Post-install hints ------------------------------------------------------

cat <<EOF

Next:
  1. If opencode was running, quit and restart it so it re-scans skills/agents.
  2. Press Tab to switch to the tpm primary agent.
  3. In tpm mode, ask for a PRD / RICE / RFC — the skill loads automatically.

To uninstall:
  rm -rf "$SKILL_DIR" "$AGENT_DIR/tpm.md"

Branch: $BRANCH   (override with TPM_TOOLS_BRANCH=v1.0.0 ./install.sh)
EOF