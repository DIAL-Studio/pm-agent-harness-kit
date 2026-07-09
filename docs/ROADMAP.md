# PM-AHK Roadmap

**PM-AHK** is the agent harness kit for product managers, modeled on [agent-harness-kit](https://github.com/enmanuelmag/agent-harness-kit). It decomposes the monolithic TPM agent into a 5-stage pipeline of specialized agents, each with a defined role, input contract, and output contract.

---

## Phase 0 — Agent Definitions (DONE)

> **Completed: July 2026**

- [x] Decomposed monolithic `tpm.md` into 7 specialized PM agents
- [x] `pm-lead` — Orchestrator. Classifies requests, decomposes initiatives, routes to specialists. Handles lightweight queries.
- [x] `pm-explorer` — Discovery. Researches users, markets, problems. Produces structured evidence. Does NOT propose solutions.
- [x] `pm-strategist` — Strategy advisory (conditional). Advises on positioning, sizing, tradeoffs, moats. Invoked for strategic initiatives only.
- [x] `pm-builder` — Spec creation. Writes PRDs, user stories, acceptance criteria. Only agent that produces engineering-ready specs.
- [x] `pm-reviewer` — Quality validation. Verifies evidence quality, metric readiness, experiment design. Only agent that can approve/block.
- [x] `pm-coach` — Career coach (auxiliary). Career transitions, interview prep, leadership readiness.
- [x] `pm-smith` — Skill authoring (auxiliary, maintainer tool). Creates and maintains PM skills.
- [x] Pipeline documented in `agents/README.md`
- [x] `tpm.md` archived as `tpm.md.archived`

---

## Phase 1 — Documentation, Validation & Claude Code (CURRENT)

> **In progress — July 2026**

### 1a: Documentation Update
- [x] `docs/ROADMAP.md` — this document
- [x] `docs/PM-AHK.md` — concept explainer for new users
- [x] `README.md` — rewritten for PM-AHK positioning
- [x] `agents/README.md` — pipeline guide + roadmap link
- [x] `catalog/README.md` — agents section added
- [x] `docs/CHANGELOG.md` — v1.1.0 milestone entry
- [x] `catalog/comparison-analysis.md` — agent gap addressed
- [x] `docs/INSTALL-CLAUDE-CODE.md` — integration guide

### 1b: Validation
- [ ] Skill name audit — verify all skill references in agent frontmatter match exact skill names in the library
- [ ] opencode agent registration — ensure agents are auto-discovered by the runtime
- [ ] End-to-end pipeline test — one full pass through Lead → Explorer → Builder → Reviewer
- [ ] Permission model validation per agent

### 1c: Claude Code Integration (DONE)

- [x] Create `.claude/agents/pm-lead.md` — map opencode frontmatter → Claude Code format
- [x] Create `.claude/agents/pm-explorer.md`
- [x] Create `.claude/agents/pm-strategist.md`
- [x] Create `.claude/agents/pm-builder.md`
- [x] Create `.claude/agents/pm-reviewer.md`
- [x] Create `.claude/agents/pm-coach.md`
- [x] Create `.claude/agents/pm-smith.md`
- [x] Create `.claude/settings.json` — set `pm-lead` as default agent
- [x] Map opencode `permission` blocks → Claude Code `tools` and `permissionMode` fields
- [x] Write `docs/INSTALL-CLAUDE-CODE.md` — integration guide
- [ ] **Beta tester validation pass** — awaiting beta tester feedback

**To test:** Install with `curl .../install.sh | TPM_TOOLS_RUNTIME=claude-code bash` and verify `/agent pm-lead` works in Claude Code.

**Claude Code frontmatter mapping:**

| opencode field | Claude Code equivalent |
|---------------|----------------------|
| `description` | `description` |
| `mode: primary` | `agent: "pm-lead"` in `settings.json` |
| `color` | No equivalent (omit) |
| `temperature` | No equivalent (omit) |
| `permission.edit` | `permissionMode: acceptEdits` (allow) / `plan` (ask) / `default` (deny) |
| `permission.bash` | `tools: Bash` with path restrictions |
| `permission.skill` | `tools: Skill` with per-skill allow list |
| `permission.task` | `tools: Task` (subagent delegation) |
| `permission.webfetch` | `tools: WebFetch` |

---

## Phase 2 — GitHub Copilot Integration

- [ ] Generate `.github/copilot-instructions.md` — single-file agent prompt format
- [ ] Generate `.github/prompts/pm-lead.prompt.md` — per-agent prompt files
- [ ] Generate `.github/prompts/pm-explorer.prompt.md`
- [ ] Generate `.github/prompts/pm-strategist.prompt.md`
- [ ] Generate `.github/prompts/pm-builder.prompt.md`
- [ ] Generate `.github/prompts/pm-reviewer.prompt.md`
- [ ] Generate `.github/prompts/pm-coach.prompt.md`
- [ ] Generate `.github/prompts/pm-smith.prompt.md`
- [ ] Map opencode permission blocks → Copilot instruction format
- [ ] Write `docs/INSTALL-COPILOT.md` — integration guide

---

## Phase 3 — Codex (OpenAI) Integration

- [ ] Generate `.codex/agents/pm-lead.toml` — per-agent TOML files
- [ ] Generate `.codex/agents/pm-explorer.toml`
- [ ] Generate `.codex/agents/pm-strategist.toml`
- [ ] Generate `.codex/agents/pm-builder.toml`
- [ ] Generate `.codex/agents/pm-reviewer.toml`
- [ ] Generate `.codex/agents/pm-coach.toml`
- [ ] Generate `.codex/agents/pm-smith.toml`
- [ ] Generate `.codex/config.toml` — MCP server + agent registration
- [ ] Map opencode permission blocks → Codex `sandbox_mode`
- [ ] Write `docs/INSTALL-CODEX.md` — integration guide

---

## Phase 4 — Commands ↔ Agents Integration

- [ ] Commands become agent-aware dispatchers (hybrid approach)
- [ ] `/write-prd` → routes to `pm-lead` → `pm-builder`
- [ ] `/discover` → routes to `pm-lead` → `pm-explorer`
- [ ] `/strategy` → routes to `pm-lead` → `pm-strategist`
- [ ] `/prioritize` → routes to `pm-lead` (lightweight) or `pm-strategist` (strategic)
- [ ] `/plan-roadmap` → routes to `pm-lead` → `pm-strategist` → `pm-builder`
- [ ] `/leadership-transition` → routes to `pm-coach`
- [ ] Commands remain user-facing shortcuts; agents are the execution engine

---

## Phase 5 — Level 2: Harness Infrastructure

The full AHK-equivalent infrastructure that makes agents work as a coordinated system rather than independent tools:

- [ ] **Initiative backlog** — track what's in discovery/spec/review across sessions (parallel to AHK's `feature_list.json`)
- [ ] **Action audit trail** — log what each agent produced, when, based on what evidence (parallel to AHK's `actions.*` MCP tools)
- [ ] **Quality gate** — enforce that Explorer evidence exists before Builder can start (parallel to AHK's `health.sh`)
- [ ] **Atomic claiming** — prevent two agents from working the same initiative (parallel to AHK's `tasks.claim`)
- [ ] **Agent sync script** — `pm-ahk build` regenerates agent files from canonical source, provider-adaptive (parallel to AHK's `ahk build`)
- [ ] **MCP server** — expose PM-specific tools: task management, artifact tracking, evidence validation

---

## Phase 6 — AHK Interop Guide

For projects running both PM-AHK and [agent-harness-kit](https://github.com/enmanuelmag/agent-harness-kit) simultaneously:

- [ ] Guide: "Running PM-AHK alongside AHK in a monorepo"
- [ ] Handoff protocol: when `pm-builder` output becomes AHK `builder` input
- [ ] Agent collision avoidance: `pm-` prefix convention documentation
- [ ] Shared project walkthrough: a product initiative flowing from PM pipeline → engineering pipeline
- [ ] CI/CD integration: quality gate across both harnesses

---

## Phase 7 — PM Decision Dashboard

- [ ] Visualize pipeline state: what's in discovery, in spec, in review, blocked, approved
- [ ] Decision log: what was decided, by whom, based on what evidence
- [ ] Timeline view: initiative lifecycle from problem statement to validated deliverable
- [ ] Web UI with real-time updates (parallel to AHK's `ahk dashboard`)

---

## Phase 8 — Ecosystem & Community (Backlog)

- [ ] New skills:
  - `competitive-teardown` — 12-dimension structured scoring matrix
  - `code-to-prd` — reverse-engineer PRD from existing codebase
  - `defensibility-analysis` — network effects, switching costs, IP moats
  - `coaching-mode` — explicit coaching protocol with anti-pattern detection
- [ ] PM Sprint workflow — Discover → Position → Prioritize → Specify → Validate → Measure (single compound command)
- [ ] Provider adapter generator — one canonical agent source → multi-provider output script
- [ ] Community agent contribution guidelines — submitter template + validation checklist
- [ ] More runtimes: Cursor, Windsurf, Bolt, Replit, n8n
