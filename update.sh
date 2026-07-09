#!/usr/bin/env bash
# pm-agent-harness-kit updater — checks for and applies the latest version.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/update.sh | bash
#   ./update.sh --check    # only check, don't install
#   ./update.sh --force    # skip version check, always re-install
#
# Environment:
#   TPM_TOOLS_BRANCH       Pin a git ref (default: main)
#   OPENCODE_CONFIG_DIR    Override opencode config root (default: ~/.config/opencode)

set -euo pipefail

REPO="DIAL-Studio/pm-agent-harness-kit"
BRANCH="${TPM_TOOLS_BRANCH:-main}"
INSTALL_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}/install.sh"
REMOTE_VERSION_URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}/VERSION"
OC_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"
LOCAL_VERSION_FILE="$OC_ROOT/pm-ahk.version"

CHECK_ONLY=false
FORCE=false

green()  { printf "\033[32m%s\033[0m\n" "$*"; }
yellow() { printf "\033[33m%s\033[0m\n" "$*"; }
red()    { printf "\033[31m%s\033[0m\n" "$*"; }
cyan()   { printf "\033[36m%s\033[0m\n" "$*"; }
die()    { red "error: $*" >&2; exit 1; }

# --- Arg parsing ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    --check) CHECK_ONLY=true; shift ;;
    --force) FORCE=true; shift ;;
    -h|--help)
      echo "Usage: update.sh [--check] [--force]"
      echo "  --check   Only check for updates; don't install"
      echo "  --force   Skip version check, always re-install"
      exit 0
      ;;
    *) shift ;;
  esac
done

# --- Resolve local version ---
LOCAL_VERSION=""
if [[ -f "$LOCAL_VERSION_FILE" ]]; then
  LOCAL_VERSION="$(cat "$LOCAL_VERSION_FILE" | tr -d '[:space:]')"
fi

# --- Fetch remote version ---
REMOTE_VERSION="$(curl -fsSL "$REMOTE_VERSION_URL" 2>/dev/null | tr -d '[:space:]' || true)"

if [[ -z "$REMOTE_VERSION" ]]; then
  die "Could not reach remote. Check your internet connection."
fi

# --- Check-only mode ---
if $CHECK_ONLY; then
  if [[ -z "$LOCAL_VERSION" ]]; then
    red "Not installed."
    green "Install: curl -fsSL $INSTALL_URL | bash"
    exit 1
  elif [[ "$LOCAL_VERSION" == "$REMOTE_VERSION" ]]; then
    green "Up to date (v$LOCAL_VERSION)."
    exit 0
  else
    yellow "Update available: v$LOCAL_VERSION → v$REMOTE_VERSION"
    green "Run this script without --check to update."
    exit 1
  fi
fi

# --- Force or check-and-update ---
if ! $FORCE; then
  if [[ -n "$LOCAL_VERSION" ]] && [[ "$LOCAL_VERSION" == "$REMOTE_VERSION" ]]; then
    green "Already up to date (v$LOCAL_VERSION)."
    echo "Use --force to re-install anyway."
    exit 0
  fi
fi

cyan "pm-agent-harness-kit updater"

if [[ -n "$LOCAL_VERSION" ]]; then
  yellow "Updating: v$LOCAL_VERSION → v$REMOTE_VERSION"
else
  cyan "Fresh install: v$REMOTE_VERSION"
fi

# --- Run the installer ---
cyan "Downloading and running installer ($BRANCH branch)..."
curl -fsSL "$INSTALL_URL" | TPM_TOOLS_BRANCH="$BRANCH" bash

green "Update complete (v$REMOTE_VERSION)."
