# PM-AHK: What It Is and Why It Exists

**PM-AHK** is the concept name for pm-agent-harness-kit's agent harness architecture. It adapts the [agent-harness-kit](https://github.com/enmanuelmag/agent-harness-kit) pipeline pattern — originally built for software development — to product management. Instead of a single monolithic TPM agent trying to do everything, PM-AHK gives you a pipeline of specialized agents, each with deep domain focus.

---

## The Problem It Solves

**Before PM-AHK**: One TPM agent with 218 lines of instructions covering 59 skills across 8 domains. The agent had surface-level knowledge of everything and deep knowledge of nothing — the classic "context stuffing" anti-pattern.

**With PM-AHK**: Seven specialized agents, each ~100–200 lines focused on a single PM domain. Each has a consistent persona, domain-specific operating principles, and guardrails that prevent scope creep.

---

## The Pipeline

```
                  PM-AHK PIPELINE
                  
  ┌──────────┐
  │ pm-lead  │  Orchestrator. Decomposes initiatives, routes to specialists.
  │          │  Handles lightweight queries directly.
  │          │  "What kind of PM problem is this?"
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │pm-explorer│  Discovery. Researches users, markets, problems.
  │          │  Produces structured evidence with confidence levels.
  │          │  "Show me the data. Have we talked to a customer?"
  └────┬─────┘
       │
       ▼ (conditional — strategic initiatives only)
  ┌──────────┐
  │pm-strate-│  Strategy advisor. Recommends positioning, sizing, tradeoffs.
  │  gist    │  Consumes Explorer's evidence; output feeds Builder.
  │          │  "What are we saying no to? Why is this hard to copy?"
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │pm-builder│  Delivery. Writes PRDs, user stories, acceptance criteria.
  │          │  Only agent that produces engineering-ready specs.
  │          │  "No story leaves without rollback trigger and estimate range."
  └────┬─────┘
       │
       ▼
  ┌──────────┐
  │pm-reviewer│  Validation. Checks evidence quality, metric readiness, rigor.
  │          │  Only agent that can approve or block a deliverable.
  │          │  "Approve, block with specific fixes, or approve with warnings."
  └──────────┘
```

Plus two auxiliary agents outside the pipeline:

| Agent | Role | When to use |
|-------|------|-------------|
| `pm-coach` | Career coach | Interview prep, leadership readiness, role transitions |
| `pm-smith` | Skill authoring | Creating or maintaining PM skills (maintainer tool) |

---

## How It Maps to AHK

PM-AHK mirrors the agent-harness-kit pipeline role-for-role:

| AHK (Dev) | PM-AHK (PM) | What It Does |
|-----------|-------------|-------------|
| `lead` | `pm-lead` | Decomposes tasks, routes to specialists |
| `explorer` | `pm-explorer` | Researches the landscape, produces structured analysis |
| `consultant` | `pm-strategist` | Provides advisory (conditional — only for strategic work) |
| `builder` | `pm-builder` | Produces the deliverable (specs, not code) |
| `reviewer` | `pm-reviewer` | Validates quality, approves or blocks |

The `pm-` prefix ensures PM-AHK and AHK can coexist in the same project without agent name collisions.

---

## Quick Start

1. **Install pm-agent-harness-kit** if you haven't already:
   ```bash
   curl -sSL https://raw.githubusercontent.com/DIAL-Studio/pm-agent-harness-kit/main/install.sh | bash
   ```

2. **Open pm-lead** in your AI tool (opencode: `Tab → pm-lead`)

3. **Describe your PM task.** The agent classifies it and either:
   - Answers directly (lightweight mode — "what's our churn rate?")
   - Routes to the pipeline (pipeline mode — "write a PRD for checkout v2")

That's it. `pm-lead` decides whether you need Explorer, Strategist, Builder, and Reviewer — or just a quick answer.

---

## Key Principles

1. **Agents are thin wrappers around skills.** Each agent owns 8–15 skills from the pm-agent-harness-kit library. The agent provides persona and principles; skills provide workflow and templates.

2. **Boundaries are enforced by persona, not just permissions.** An Explorer *could* write a spec, but its persona says "I don't propose solutions." The behavioral guardrail matters more than the technical one.

3. **Pipeline is sequential with one conditional branch.** Explorer always runs first. Strategist runs only for strategic initiatives. Builder produces the deliverable. Reviewer validates it.

4. **The Lead never writes deliverables.** It classifies, decomposes, and routes. If the Lead starts writing specs, the pipeline discipline breaks.

---

## What PM-AHK Is Not

- **Not a replacement for AHK.** PM-AHK produces specs; AHK produces code. They're complementary.
- **Not a replacement for the skills library.** Agents *use* skills. The library remains the source of PM domain knowledge.
- **Not a replacement for commands.** Commands (`/write-prd`, `/discover`) remain as convenient shortcuts. Agents are the execution engine underneath.
- **Not fully automated yet (Level 2 pending).** Today agents are manual — you switch between them. Phase 5 of the roadmap adds the full harness infrastructure (backlog, audit trail, quality gate, dashboard).

---

## Where to Go Next

- [agents/README.md](../agents/README.md) — Full pipeline documentation, agent boundaries, skill mappings
- [docs/ROADMAP.md](ROADMAP.md) — Development phases: cross-compatibility, harness infrastructure, dashboard
- [README.md](../README.md) — Repo overview and skill library index
