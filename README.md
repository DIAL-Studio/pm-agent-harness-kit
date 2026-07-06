# tpm-tools

Reusable **Technical Product Manager** agent + skills for AI coding runtimes. Today ships opencode support; designed to grow into Claude Code, Cursor, and others.

## What's inside

| Path | Type | Runtime | What it does |
|------|------|---------|--------------|
| `skills/tpm-artifacts/SKILL.md` | Skill | opencode | Templates & scaffolds for PM deliverables: PRD, one-pager, RICE, RFC, sliced epic, experiment design, roadmap entry. |
| `agents/tpm.md` | Agent | opencode | Primary agent. Translates ambiguity into crisp requirements, prioritizes rigorously (RICE), orchestrates engineering work without writing code itself. |
| `.well-known/skills.json` | Manifest | opencode | Discoverable skill listing consumed by `skills.urls`. |

## Install (opencode)

### One-liner (recommended)

opencode auto-discovers any `SKILL.md` under `~/.config/opencode/skills/<name>/` and any agent under `~/.config/opencode/agents/`. The installer just copies both files there — **no config editing required**:

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/install.sh | bash
```

Restart opencode, press **Tab**, and `tpm` is there.

### One-liner uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/uninstall.sh | bash
```

### Manual install

```bash
mkdir -p ~/.config/opencode/skills/tpm-artifacts ~/.config/opencode/agents
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/skills/tpm-artifacts/SKILL.md \
  -o ~/.config/opencode/skills/tpm-artifacts/SKILL.md
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/agents/tpm.md \
  -o ~/.config/opencode/agents/tpm.md
```

### Remote discovery (optional, advanced)

If you prefer to keep skills remote rather than vendored locally, point your `~/.config/opencode/opencode.json` at the published manifest:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "skills": {
    "urls": [
      "https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/.well-known/skills.json"
    ]
  }
}
```

You still need to install the agent file locally (opencode has no remote-agent channel):

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/agents/tpm.md \
  -o ~/.config/opencode/agents/tpm.md
```

### Restart opencode

opencode reads its config once at startup. Quit and reopen the session so newly placed files are picked up.

### Verify

- Press **Tab** → `tpm` appears as a selectable primary agent.
- In `tpm` mode, ask it to write a PRD / RFC / RICE ranking — the `tpm-artifacts` skill loads automatically.

## What the agent does

The `tpm` agent owns the bridge between business intent and engineering execution:

- Starts from the **problem**, not the solution — inverts solutions into underlying user pains.
- Makes ambiguity **explicit**: numbered assumptions, open-question lists.
- Uses **RICE** (Reach × Impact × Confidence × Effort) before recommending priority.
- One decision per artifact — a PRD owns a single decision, a one-pager testes a single bet.
- Slices work into **smallest-shippable** increments, each with Given/When/Then acceptance and rollback triggers.
- Every recommendation lists **2–3 options** plus rejected alternatives.
- Estimates are **ranges** (optimistic / likely / pessimistic) with confidence %.
- Every feature ships with a **leading metric**, a **guardrail metric**, and entrance/exit thresholds.

## Skill templates

`tpm-artifacts` ships seven templates:

- **A — PRD** (single decision for a new feature)
- **B — One-pager** (small scoped bet before investing in a full PRD)
- **C — RICE prioritization** (ranking candidates)
- **D — RFC / Design review** (technical sign-off)
- **E — Epic with sliced tickets** (PRD/RFC → executable work)
- **F — Experiment design** (A/B / holdout with power, MDE, guardrails)
- **G — Roadmap entry** (Now / Next / Later + Recently shipped)

Every template ends with **"Decisions still needed"** and **"Next concrete step"** sections.

## Permissions posture

`tpm.md` is read-only by design:

- `edit: ask` — must confirm any file write
- `bash: ask` for everything except read-only git/gh/rg/ls
- `task: allow` — delegates to `@explore` and `@general` subagents
- `skill: tpm-artifacts` and `skill: graphify` allowed

## Roadmap

- [x] opencode agent + skill
- [ ] Claude Code adapter (`SKILL.claude.md`)
- [ ] Cursor adapter
- [ ] More skills under `skills/` (metrics-kit, stakeholder-brief)

## Contributing

PRs welcome. Keep `SKILL.md` frontmatter fields (`name`, `description`, `license`, `compatibility`, `metadata`) — opencode filters out skills without `name` + `description`. Skill names must be lowercase hyphen-separated and match the folder name.

## License

MIT — see [LICENSE](./LICENSE).