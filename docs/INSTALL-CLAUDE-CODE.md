# Using pm-agent-harness-kit with Claude Code

Claude Code is a **Phase 1** integration target (beta tester available). The PM-AHK agents are available as per-agent files that Claude Code auto-discovers.

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) installed
- Running Claude Code from a project directory (or globally)

## Install

### One-liner

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/install.sh | TPM_TOOLS_RUNTIME=claude-code bash
```

This copies all 7 PM-AHK agents into `~/.claude/agents/` and tells Claude Code to default to `pm-lead`.

### What gets installed

```
~/.claude/
├── settings.json      ← sets pm-lead as default agent
└── agents/
    ├── pm-lead.md        Orchestrator — starts here
    ├── pm-explorer.md    Discovery & research
    ├── pm-strategist.md  Strategy advisory (conditional)
    ├── pm-builder.md     Spec & artifact creation
    ├── pm-reviewer.md    Quality validation
    ├── pm-coach.md       Career transitions (auxiliary)
    └── pm-smith.md       Skill authoring (auxiliary)
```

### Uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/uninstall.sh | TPM_TOOLS_RUNTIME=claude-code bash
```

## How to use

1. **Open Claude Code** in your project directory.
2. **Start with `pm-lead`** by typing `/agent pm-lead` or selecting it from the agent menu.
3. **Describe your PM task.** Examples:
   - "Research our churn problem" → pm-lead routes to pm-explorer
   - "Write a PRD for checkout v2" → pm-lead routes to pm-explorer → pm-builder → pm-reviewer
   - "Am I ready for a Director role?" → route to pm-coach

### Agent selection

Claude Code supports per-agent selection. Use `/agent <name>` to switch:

| Command | Agent |
|---------|-------|
| `/agent pm-lead` | Orchestrator (default) |
| `/agent pm-explorer` | Discovery & research |
| `/agent pm-strategist` | Strategy advisory |
| `/agent pm-builder` | Spec creation |
| `/agent pm-reviewer` | Quality validation |
| `/agent pm-coach` | Career coaching |
| `/agent pm-smith` | Skill authoring |

## Permission mapping

| opencode | Claude Code |
|----------|------------|
| `edit: ask` | `permissionMode: plan` |
| `edit: allow` | `permissionMode: acceptEdits` |
| `edit: deny` | `permissionMode: default` |
| `bash`, `task`, `skill`, `webfetch` | `tools: [Bash, Read, Task, Skill, WebFetch]` |

### Per-agent permissions

| Agent | permissionMode | Key tools |
|-------|---------------|-----------|
| `pm-lead` | plan | Read, Bash, Task, Skill, WebFetch |
| `pm-explorer` | plan | Read, Bash, Task, Skill, WebFetch |
| `pm-strategist` | plan | Read, Bash, Task, Skill, WebFetch |
| `pm-builder` | acceptEdits | Read, Bash, Task, Skill, Write, Edit, WebFetch |
| `pm-reviewer` | plan | Read, Bash, Task, Skill, WebFetch |
| `pm-coach` | plan | Read, Bash, Task, Skill, WebFetch |
| `pm-smith` | acceptEdits | Read, Bash, Task, Skill, Write, Edit, WebFetch |

## Skills support

The 59 skills can be loaded individually via Claude Code's Skill tool when an agent needs structured guidance (e.g., loading `prd-development` when pm-builder writes a PRD). Skills are installed into `~/.claude/skills/` by the installer.

## Known limitations

- **Skills discovery**: Claude Code loads skills from `~/.claude/skills/<name>/SKILL.md`. All 59 skills are compatible and auto-discovered.
- **No `skills.urls` equivalent**: Claude Code does not support remote skill discovery. Skills must be vendored locally.
- **Agent switching**: Claude Code supports `/agent <name>` but not opencode's Tab-cycling. Use the command or the agent menu.

## Beta feedback

This is a Phase 1 integration. If you encounter issues or have feedback:
- Open an issue: https://github.com/DIAL-Studio/pm-agent-harness-kit/issues
- Mention `claude-code` in the title

## References

- [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code)
- [pm-agent-harness-kit agents](../agents/README.md)
- [PM-AHK roadmap](ROADMAP.md)
