#!/usr/bin/env bash
# pm-agent-harness-kit installer — copies the PM-AHK agents and full skill library into the
# discovery paths of the chosen runtime. No config file edits required.
#
# Usage (default runtime: opencode):
#   curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/install.sh | bash
#
# Pick a runtime:
#   curl -fsSL .../install.sh | TPM_TOOLS_RUNTIME=opencode bash
#   ./install.sh --runtime opencode
#   ./install.sh --list-runtimes
#
# Pin a branch/version:
#   TPM_TOOLS_BRANCH=v1.0.0 ./install.sh --runtime opencode
#
# Override the config dir (opencode only):
#   OPENCODE_CONFIG_DIR=/custom/path ./install.sh --runtime opencode

set -euo pipefail

# --- Config -----------------------------------------------------------------

REPO="DIAL-Studio/pm-agent-harness-kit"
BRANCH="${TPM_TOOLS_BRANCH:-main}"
BASE_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}"
ARCHIVE_URL="https://github.com/${REPO}/archive/${BRANCH}.tar.gz"
RUNTIME="${TPM_TOOLS_RUNTIME:-opencode}"

# --- Helpers ----------------------------------------------------------------

cyan()   { printf "\033[36m%s\033[0m\n" "$*"; }
green()  { printf "\033[32m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
die()    { red "error: $*" >&2; exit 1; }
has()    { command -v "$1" >/dev/null 2>&1; }

# --- Runtime registry -------------------------------------------------------
RUNTIME_TABLE=(
  "opencode    supported   \$HOME/.config/opencode    opencode (default)"
  "claude-code supported   \$HOME/.claude              Claude Code"
  "copilot     planned     \$HOME/.github/copilot      GitHub Copilot Chat"
  "cursor      planned     \$HOME/.cursor              Cursor"
)

list_runtimes() {
  cyan "Available runtimes:"
  printf "  %-10s %-10s %-26s %s\n" "RUNTIME" "STATUS" "DEFAULT CONFIG ROOT" "TOOL"
  printf "  %-10s %-10s %-26s %s\n" "-------" "------" "--------------------" "----"
  for row in "${RUNTIME_TABLE[@]}"; do
    read -r id status root display <<< "$row"
    printf "  %-10s %-10s %-26s %s\n" "$id" "$status" "$root" "$display"
  done
  cat <<EOF

Only "supported" runtimes will install. "planned" runtimes print this list
and exit non-zero. Vote or track progress at:
  https://github.com/DIAL-Studio/pm-agent-harness-kit/issues
EOF
}

usage() {
  cat <<EOF
pm-agent-harness-kit installer — PM-AHK agents + full skill library

Usage:
  curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/install.sh | bash
  curl -fsSL .../install.sh | TPM_TOOLS_RUNTIME=opencode bash
  ./install.sh --runtime opencode
  ./install.sh --list-runtimes

Flags:
  --runtime <id>       Choose runtime (default: opencode)
  --list-runtimes      Print all known runtimes and exit
  -h, --help           Show this help

Environment:
  TPM_TOOLS_RUNTIME      Same as --runtime (useful for curl|bash)
  TPM_TOOLS_BRANCH       Pin a git ref (default: main)
  OPENCODE_CONFIG_DIR    Override opencode config root (default: ~/.config/opencode)
EOF
}

# --- Arg parsing ------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case "$1" in
    --runtime)        RUNTIME="${2:-}"; shift 2 ;;
    --runtime=*)      RUNTIME="${1#*=}"; shift ;;
    --list-runtimes)  list_runtimes; exit 0 ;;
    -h|--help)        usage; exit 0 ;;
    --)               shift; break ;;
    *)                die "Unknown flag: '$1'. Try --help." ;;
  esac
done

# --- Preflight --------------------------------------------------------------

if [[ -z "${HOME:-}" ]]; then
  die "HOME is not set. Cannot locate config directory."
fi

case "$(uname -s)" in
  Darwin|Linux|MINGW*|MSYS*|CYGWIN*) : ;;
  *) die "Unsupported OS: $(uname -s). See manual install in the README." ;;
esac

if ! has curl; then
  die "curl is required. Install it and re-run."
fi

if ! has tar; then
  die "tar is required. Install it and re-run."
fi

# --- Resolve runtime --------------------------------------------------------

case "$RUNTIME" in
  opencode)
    OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
    SKILL_DIR="$OC_ROOT/skills"
    AGENT_DIR="$OC_ROOT/agents"
    VERSION_FILE="$OC_ROOT/pm-ahk.version"
    BINARY_NAME="opencode"
    BINARY_URL="https://opencode.ai"
    VERIFY_HINT="Press Tab to switch to 'pm-lead' — the primary PM-AHK agent."
    ;;
  claude-code)
    OC_ROOT="${HOME}/.claude"
    SKILL_DIR="$OC_ROOT/skills"
    AGENT_DIR="$OC_ROOT/agents"
    VERSION_FILE="$OC_ROOT/pm-ahk.version"
    BINARY_NAME="claude"
    BINARY_URL="https://docs.anthropic.com/en/docs/claude-code"
    VERIFY_HINT="In Claude Code, use '/agent pm-lead' or select pm-lead from the agent menu."
    ;;
  claude|copilot|cursor)
    red "runtime '$RUNTIME' is planned but not yet supported."
    echo
    list_runtimes
    exit 2
    ;;
  "")
    die "No runtime specified. Use --runtime <id> or TPM_TOOLS_RUNTIME=<id>. See --list-runtimes."
    ;;
  *)
    die "Unknown runtime: '$RUNTIME'. See --list-runtimes."
    ;;
esac

cyan "Installing pm-agent-harness-kit for runtime '$RUNTIME' into $OC_ROOT/"

# --- Soft presence check on the runtime binary ------------------------------

if ! has "$BINARY_NAME"; then
  yellow "warning: '$BINARY_NAME' not found on PATH."
  yellow "         Files will still be installed; install $BINARY_NAME from $BINARY_URL to use them."
fi

# --- Download archive -------------------------------------------------------

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

cyan "Downloading skills library ($BRANCH branch)..."
curl -fsSL "$ARCHIVE_URL" -o "$tmp_dir/repo.tar.gz" \
  || die "Failed to download archive from $ARCHIVE_URL"

cyan "Extracting..."
tar xzf "$tmp_dir/repo.tar.gz" -C "$tmp_dir" \
  || die "Failed to extract archive."

EXTRACTED_DIR="$tmp_dir/pm-agent-harness-kit-${BRANCH}"

# Guard: verify extraction produced a directory
if [[ ! -d "$EXTRACTED_DIR" ]]; then
  # try with main -> main rename or alternative extraction patterns
  EXTRACTED_DIR="$tmp_dir/$(ls "$tmp_dir" | grep -v 'repo.tar.gz' | head -1)"
fi
if [[ ! -d "$EXTRACTED_DIR" ]]; then
  die "Extraction failed — expected directory not found."
fi

# --- Install skills ---------------------------------------------------------

mkdir -p "$SKILL_DIR" "$AGENT_DIR"

backup_path() {
  local src="$1"
  if [[ -e "$src" ]]; then
    local bak="${src}.bak.$(date +%s)"
    mv "$src" "$bak"
    yellow "Backed up existing: $src -> $bak"
  fi
}

# Remove old tpm-artifacts if exists (replaced by full library)
backup_path "$SKILL_DIR/tpm-artifacts"

if [[ -d "$EXTRACTED_DIR/skills" ]]; then
  skill_count="$(ls "$EXTRACTED_DIR/skills" | wc -l | tr -d ' ')"
  cyan "Installing $skill_count skills..."

  for skill_dir in "$EXTRACTED_DIR/skills"/*/; do
    skill_name="$(basename "$skill_dir")"
    target="$SKILL_DIR/$skill_name"
    backup_path "$target"
    cp -r "$skill_dir" "$target"
  done
  green "Skills installed to $SKILL_DIR/"
else
  die "No skills/ directory found in the archive."
fi

# --- Install agents ----------------------------------------------------------

# Choose agent source directory based on runtime
if [[ "$RUNTIME" == "claude-code" ]]; then
  AGENT_SOURCE_DIR="$EXTRACTED_DIR/.claude/agents"
  # Remove old monolithic tpm.md if it exists (replaced by 7-agent harness)
  backup_path "$AGENT_DIR/tpm.md"
else
  AGENT_SOURCE_DIR="$EXTRACTED_DIR/agents"
  # Remove old monolithic tpm.md if it exists (replaced by 7-agent harness)
  backup_path "$AGENT_DIR/tpm.md"
fi

cyan "Installing 7 PM-AHK agents..."

agent_count=0
for agent_file in "$AGENT_SOURCE_DIR"/*.md; do
  agent_name="$(basename "$agent_file")"
  # Skip README.md — it's documentation, not an agent
  [[ "$agent_name" == "README.md" ]] && continue
  # Skip archived files
  [[ "$agent_name" == *.archived ]] && continue

  target="$AGENT_DIR/$agent_name"
  backup_path "$target"
  cp "$agent_file" "$target"
  ((agent_count++)) || true
done

if [[ $agent_count -gt 0 ]]; then
  green "$agent_count agents installed to $AGENT_DIR/"
else
  yellow "warning: No agent files found in archive. The repo structure may have changed."
fi

# --- Claude Code-specific: create settings.json ------------------------------

if [[ "$RUNTIME" == "claude-code" ]]; then
  SETTINGS_FILE="$OC_ROOT/settings.json"
  if [[ -f "$SETTINGS_FILE" ]]; then
    # Check if settings.json already has an agent setting
    if grep -q '"agent"' "$SETTINGS_FILE" 2>/dev/null; then
      yellow "settings.json already has an 'agent' setting — not overwriting."
    else
      backup_path "$SETTINGS_FILE"
      cat > "$SETTINGS_FILE" <<- 'CFG'
{
  "agent": "pm-lead"
}
CFG
      green "settings.json created: $SETTINGS_FILE"
    fi
  else
    cat > "$SETTINGS_FILE" <<- 'CFG'
{
  "agent": "pm-lead"
}
CFG
    green "settings.json created: $SETTINGS_FILE"
  fi
fi

# --- Store installed version -------------------------------------------------

echo "$(cat "$EXTRACTED_DIR/VERSION" 2>/dev/null || echo 'unknown')" > "$VERSION_FILE"
green "Version stored: $(cat "$VERSION_FILE")"

# --- Post-install hints -----------------------------------------------------

cat <<EOF

$(green "pm-agent-harness-kit installed successfully!")
$(green "  Skills:   $SKILL_DIR/ (59 skills)")
$(green "  Agents:   $AGENT_DIR/ ($agent_count agents — pm-lead, pm-explorer, pm-strategist, pm-builder, pm-reviewer, pm-coach, pm-smith)")
$(green "  Version:  $(cat "$VERSION_FILE")")

Next:
  1. If $BINARY_NAME was running, quit and restart it so it re-scans.
  2. $VERIFY_HINT
  3. Ask pm-lead anything — it classifies your request and routes to specialist agents.

To check for updates:
  curl -fsSL $BASE_URL/scripts/check-update.sh | bash

To update:
  curl -fsSL $BASE_URL/update.sh | bash

To uninstall:
  curl -fsSL $BASE_URL/uninstall.sh | TPM_TOOLS_RUNTIME=$RUNTIME bash

Branch: $BRANCH
Runtime: $RUNTIME
EOF
