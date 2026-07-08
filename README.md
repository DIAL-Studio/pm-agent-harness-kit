# tpm-tools

> **Technical Product Manager** — agent + 59 PM skills for AI coding runtimes.  
> Today ships opencode support; designed to grow into Claude Code, Cursor, and others.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-59-informational?style=flat-square)](catalog/comparison-analysis.md)

## What's inside

| Path | Type | Runtime | What it does |
|------|------|---------|--------------|
| `skills/*/SKILL.md` | Skills (59) | opencode+ | Full PM skill library — PRDs, user stories, strategy, RICE, experiments, metrics, stakeholder, AI agents, career, and more |
| `agents/tpm.md` | Agent | opencode | Primary TPM agent. Translates ambiguity into crisp requirements, prioritizes rigorously (RICE), orchestrates work without writing code. |
| `.well-known/skills.json` | Manifest | opencode | Discoverable skill listing for `skills.urls`. |

## Full Skill Library (59 skills)

### Artifacts & Docs (13)
| Skill | Description |
|-------|-------------|
| `tpm-artifacts` | Quick templates: PRD, one-pager, RICE, RFC, epic, experiment, roadmap |
| `prd-development` | 8-phase structured PRD (2-4 days) |
| `user-story` | Mike Cohn + Gherkin acceptance criteria |
| `user-story-mapping` | Activities → steps → tasks → release slices |
| `user-story-mapping-workshop` | Facilitated story mapping |
| `user-story-splitting` | 8 split patterns for large stories |
| `epic-hypothesis` | Frame epic as testable hypothesis |
| `epic-breakdown-advisor` | Richard Lawrence's 9 patterns |
| `press-release` | Amazon Working Backwards PR/FAQ |
| `eol-message` | End-of-life announcement |
| `proto-persona` | Assumption-based persona |
| `customer-journey-map` | End-to-end journey map |
| `customer-journey-mapping-workshop` | Facilitated journey mapping |

### Strategy & Discovery (12)
| Skill | Description |
|-------|-------------|
| `product-strategy-session` | Full strategy arc workflow (2-4 weeks) |
| `strategy-canvas` | **New** — 9-section single-artifact strategy canvas (vision → defensibility) |
| `discovery-process` | Complete discovery cycle (3-4 weeks) |
| `discovery-interview-prep` | Mom Test-style interview planning |
| `opportunity-solution-tree` | Teresa Torres OST |
| `problem-framing-canvas` | MITRE problem framing |
| `problem-statement` | User-centered problem statement |
| `positioning-statement` | Geoffrey Moore positioning |
| `positioning-workshop` | Facilitated positioning workshop |
| `jobs-to-be-done` | JTBD format |
| `pestel-analysis` | PESTEL framework |
| `company-intel` | 7-lens company/competitor research |
| `company-research` | Company profile brief |

### Prioritization & Roadmapping (3)
| Skill | Description |
|-------|-------------|
| `prioritization-advisor` | Framework selection (RICE/ICE/Kano) |
| `roadmap-planning` | Inputs → epics → prioritize → sequence |
| `feature-investment-advisor` | Build/don't build ROI |

### Metrics & Finance (8)
| Skill | Description |
|-------|-------------|
| `business-health-diagnostic` | SaaS health diagnostic |
| `saas-revenue-growth-metrics` | MRR, ARR, churn, NRR |
| `saas-economics-efficiency-metrics` | CAC, LTV, payback, Rule of 40 |
| `finance-metrics-quickref` | Formulas & benchmarks |
| `finance-based-pricing-advisor` | Pricing change impact |
| `acquisition-channel-advisor` | Channel evaluation |
| `tam-sam-som-calculator` | Market sizing |

### Stakeholder & Alignment (3)
| Skill | Description |
|-------|-------------|
| `stakeholder-identification` | Brainstorm + equity lens |
| `stakeholder-mapping` | Power×Interest + Impact×Power grids |
| `stakeholder-engagement-advisor` | Per-stakeholder engagement planning |

### AI & Agent Orchestration (5)
| Skill | Description |
|-------|-------------|
| `ai-shaped-readiness-advisor` | AI-first vs AI-shaped maturity |
| `context-engineering-advisor` | Context stuffing vs engineering |
| `agent-orchestration-advisor` | Multi-agent workflow design |
| `recommendation-canvas` | AI product idea evaluation |
| `derisk-measurement-advisor` | DUFV + PESTEL de-risking |

### Validation & Experimentation (4)
| Skill | Description |
|-------|-------------|
| `experiment-designer` | **New** — A/B test with power analysis, sample size calculation |
| `pol-probe-advisor` | Choose proof-of-life probe type |
| `pol-probe` | Lightweight validation experiment |
| `derisk-measurement-advisor` | Shared w/ AI section |

### Growth (3)
| Skill | Description |
|-------|-------------|
| `growth-plg-advisor` | **New** — PLG readiness, activation, viral loops, freemium conversion |
| `organic-growth-advisor` | McKinsey Growth Pyramid |
| `acquisition-channel-advisor` | Shared w/ Metrics |

### Workshops & Facilitation (4)
| Skill | Description |
|-------|-------------|
| `workshop-facilitation` | Generic facilitation protocol |
| `lean-ux-canvas` | Lean UX Canvas v2 |
| `storyboard` | 6-frame storyboard |
| Various shared workshop skills (positioning, OST, journey mapping, story mapping) |

### Career & Leadership (5)
| Skill | Description |
|-------|-------------|
| `altitude-horizon-framework` | PM-to-Director mental model |
| `director-readiness-advisor` | PM→Director transition coaching |
| `vp-cpo-readiness-advisor` | Director→VP/CPO coaching |
| `executive-onboarding-playbook` | 30-60-90 day playbook |
| `product-sense-interview-answer` | PM interview answer structure |

### Meta / Authoring (2)
| Skill | Description |
|-------|-------------|
| `skill-authoring-workflow` | Create repo-compliant skills |
| `pm-skill-creator` | Design skills via conversation |

### Agent
| Asset | Description |
|-------|-------------|
| `agents/tpm.md` | TPM primary agent — skill index, operating principles, workflow |

## Supported runtimes

| Runtime | Status | Config root | Notes |
|---------|--------|-------------|-------|
| `opencode` | ✅ supported | `~/.config/opencode` | Default. Agent + skills auto-discovered. |
| `claude` | 🟡 planned | `~/.claude` | SKILL.md format-compatible; agent frontmatter needs adaptation. |
| `copilot` | 🟡 planned | `~/.github/copilot` | Chatmode format under validation. |
| `cursor` | 🟡 planned | `~/.cursor` | Spec TBD. |

Vote or track progress: https://github.com/DIAL-Studio/tpm-tools/issues

## Install

### One-liner (recommended, default runtime = opencode)

Installs the TPM agent + all 59 skills:

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/install.sh | bash
```

**After install:** Restart opencode, press **Tab**, and the `tpm` agent is there with the full skill library.

### Choose a runtime

```bash
./install.sh --runtime opencode
./install.sh --list-runtimes

# curl | bash with env var
curl -fsSL .../install.sh | TPM_TOOLS_RUNTIME=opencode bash

# Pin a release
TPM_TOOLS_BRANCH=v1.0.0 ./install.sh --runtime opencode

# Custom config dir (opencode only)
OPENCODE_CONFIG_DIR=/custom/path ./install.sh --runtime opencode
```

### One-liner uninstall

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/uninstall.sh | bash
```

### Remote discovery (optional, for advanced users)

If you prefer to keep skills remote rather than vendored locally:

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

Then install the agent locally (opencode has no remote-agent channel):

```bash
curl -fsSL https://raw.githubusercontent.com/DIAL-Studio/tpm-tools/main/agents/tpm.md \
  -o ~/.config/opencode/agents/tpm.md
```

### Verify

- Press **Tab** → `tpm` appears as a selectable primary agent.
- In `tpm` mode, ask it to write a PRD, run RICE, design an experiment, or build a strategy canvas — the matching skill loads automatically.

## What the agent does

The `tpm` agent owns the bridge between business intent and engineering execution:

- Starts from the **problem**, not the solution
- Makes ambiguity **explicit**: numbered assumptions, open-question lists
- Uses **RICE** before recommending priority
- One decision per artifact — a PRD owns one decision
- Slices work into **smallest-shippable** increments with acceptance criteria
- Every recommendation lists **2–3 options** + rejected alternatives
- Estimates are **ranges** with confidence %
- Every feature ships with a **leading metric** + **guardrail metric**

## Permissions posture

`tpm.md` is read-only by design:

- `edit: ask` — must confirm any file write
- `bash: ask` for everything except read-only git/gh/rg/ls
- `task: allow` — delegates to `@explore` and `@general`
- `skill: *: allow` — the agent has access to all 59 skills

## Skill origins

This library is a curated consolidation of battle-tested PM frameworks:

| Source | Contribution | License |
|--------|-------------|---------|
| [`deanpeters/Product-Manager-Skills`](https://github.com/deanpeters/Product-Manager-Skills) | 55 core skills (all categories) | CC BY-NC-SA 4.0 |
| [`alirezarezvani/claude-skills`](https://www.skills.sh/alirezarezvani/claude-skills/product-skills) | Inspiration for `experiment-designer` | Reference |
| [`phuryn/pm-skills`](https://www.skills.sh/phuryn/pm-skills/product-strategy) | Inspiration for `strategy-canvas` | Reference |
| [`digidai/product-manager-skills`](https://www.skills.sh/digidai/product-manager-skills/product-manager-skills) | Inspiration for `growth-plg-advisor`, coaching patterns | Reference |
| DIAL-Studio original | `tpm-artifacts`, `agents/tpm.md`, install/uninstall scripts, transformation tooling | MIT |

See [`catalog/comparison-analysis.md`](catalog/comparison-analysis.md) for the full gap analysis.

## Roadmap

- [x] opencode agent + 59 skills (`--runtime opencode`)
- [ ] `--runtime claude` adapter
- [ ] `--runtime copilot` adapter
- [ ] `--runtime cursor` adapter
- [ ] More skills: `competitive-teardown`, `coaching-mode`, `defensibility-analysis`, `code-to-prd`
- [ ] PM Sprint workflow (Discover→Position→Prioritize→Specify→Validate→Measure)
- [ ] Per-agent permission config in install.sh

## Contributing

PRs welcome. Skill format:

- Frontmatter: `name`, `description`, `compatibility`, `metadata` (opencode); `argument-hint` (Claude)
- Body: Purpose, Input, Key Concepts, Application, Examples, Common Pitfalls, References
- Name is lowercase kebab-case, matches folder name
- No `$ARGUMENTS` — use plain-language `## Input` section instead

## License

`tpm-tools` original content: MIT.  
Content adapted from `deanpeters/Product-Manager-Skills`: CC BY-NC-SA 4.0.  
See [`catalog/comparison-analysis.md`](catalog/comparison-analysis.md) for full attribution.
