# Comprehensive Skills Analysis & Gap Assessment

## Sources Analyzed

| # | Source | Type | Skills | Orientation |
|---|--------|------|--------|-------------|
| A | `deanpeters/Product-Manager-Skills` | Modular (55 skills) | 55 discrete SKILL.md | Claude Code first, multi-runtime |
| B | `DIAL-Studio/tpm-tools` | Agent + skill (1 agent + 1 skill) | `tpm.md` agent, `tpm-artifacts` skill | opencode first |
| C | `skills.sh/alirezarezvani/claude-skills` | Orchestrator (1 meta-skill → 16 sub-skills) | Orchestrator + RICE, OKRs, UX, design, teardown, analytics, experiments, discovery, roadmap, landing page, SaaS scaffold, Apple HIG, code-to-PRD | Claude Code |
| D | `skills.sh/phuryn/pm-skills` | Component (1 skill) | 9-section Product Strategy Canvas (vision, segments, costs, value props, tradeoffs, metrics, growth, capabilities, defensibility) | Claude Code |
| E | `skills.sh/digidai/product-manager-skills` | Monolithic (1 skill) | 7 domains: Discovery, Strategy, Delivery, Finance, Career, Growth/PLG, AI Product; PM Sprint workflow; coaching mode | Claude Code |

---

## Categorization of deanpeters' 55 Skills

### 🔭 Strategy & Discovery (12 skills)
| Skill | Description |
|-------|-------------|
| `problem-framing-canvas` | MITRE Look Inward / Look Outward / Reframe |
| `positioning-statement` | Geoffrey Moore positioning template |
| `positioning-workshop` | Facilitated positioning workshop |
| `product-strategy-session` | Full strategy arc workflow (2-4 weeks) |
| `discovery-process` | Full discovery cycle workflow (3-4 weeks) |
| `discovery-interview-prep` | Mom Test-style interview planning |
| `opportunity-solution-tree` | Teresa Torres OST |
| `problem-statement` | User-centered problem statement |
| `pestel-analysis` | PESTEL framework |
| `jobs-to-be-done` | JTBD format |
| `company-intel` | 7-lens company/competitor research |
| `company-research` | Company profile brief |

### 📝 Artifacts & Docs (12 skills)
| Skill | Description |
|-------|-------------|
| `prd-development` | 8-phase PRD workflow (2-4 days) |
| `user-story` | Mike Cohn + Gherkin criteria |
| `user-story-mapping` | Activities → steps → tasks → releases |
| `user-story-mapping-workshop` | Facilitated story mapping |
| `user-story-splitting` | 8 split patterns for large stories |
| `epic-hypothesis` | Frame epic as testable hypothesis |
| `epic-breakdown-advisor` | Richard Lawrence's 9 patterns |
| `press-release` | Amazon Working Backwards PR/FAQ |
| `proto-persona` | Assumption-based persona |
| `customer-journey-map` | End-to-end journey map |
| `customer-journey-mapping-workshop` | Facilitated journey mapping |
| `eol-message` | End-of-life / sunset announcement |

### 🛠 Workshops & Facilitation (8 skills)
| Skill | Description |
|-------|-------------|
| `workshop-facilitation` | Generic facilitation protocol |
| `lean-ux-canvas` | Lean UX Canvas v2 |
| `problem-framing-canvas` | MITRE canvas (shared w/ Strategy) |
| `positioning-workshop` | Shared w/ Strategy |
| `customer-journey-mapping-workshop` | Shared |
| `user-story-mapping-workshop` | Shared |
| `opportunity-solution-tree` | Shared |
| `storyboard` | 6-frame storyboard |

### 📊 Metrics & Finance (8 skills)
| Skill | Description |
|-------|-------------|
| `business-health-diagnostic` | SaaS health across growth, retention, efficiency, capital |
| `saas-revenue-growth-metrics` | MRR, ARR, churn, NRR |
| `saas-economics-efficiency-metrics` | CAC, LTV, payback, burn, Rule of 40 |
| `finance-metrics-quickref` | Formulas & benchmarks reference |
| `feature-investment-advisor` | Build/don't build ROI |
| `finance-based-pricing-advisor` | Pricing change impact |
| `acquisition-channel-advisor` | Channel evaluation via unit economics |
| `tam-sam-som-calculator` | Market sizing |

### 👥 Stakeholder & Alignment (4 skills)
| Skill | Description |
|-------|-------------|
| `stakeholder-identification` | Brainstorm + equity lens |
| `stakeholder-mapping` | Power×Interest + Impact×Power grids |
| `stakeholder-engagement-advisor` | Per-stakeholder engagement planning |
| `company-intel` | Shared (competitor research) |

### 🤖 AI & Agent Orchestration (5 skills)
| Skill | Description |
|-------|-------------|
| `ai-shaped-readiness-advisor` | AI-first vs AI-shaped maturity |
| `context-engineering-advisor` | Context stuffing vs engineering |
| `agent-orchestration-advisor` | Multi-agent workflow design |
| `recommendation-canvas` | AI product idea evaluation |
| `derisk-measurement-advisor` | DUFV + PESTEL de-risking |

### 🚀 Career & Executive Transitions (4 skills)
| Skill | Description |
|-------|-------------|
| `altitude-horizon-framework` | PM-to-Director mental model |
| `director-readiness-advisor` | PM→Director transition coaching |
| `vp-cpo-readiness-advisor` | Director→VP/CPO coaching |
| `executive-onboarding-playbook` | 30-60-90 day VP/CPO playbook |
| `product-sense-interview-answer` | PM interview answer structure |

### 🗺 Roadmapping & Prioritization (2 skills)
| Skill | Description |
|-------|-------------|
| `roadmap-planning` | Inputs → epics → prioritize → sequence |
| `prioritization-advisor` | Framework selection (RICE/ICE/Kano) |

### ⚙ Meta / Skill Authoring (2 skills)
| Skill | Description |
|-------|-------------|
| `pm-skill-creator` | Design repo-compliant skills via conversation |
| `skill-authoring-workflow` | Raw content → publish-ready skill |

---

## Gap Analysis: What deanpeters is MISSING (vs B+C+D+E)

### From DIAL-Studio/tpm-tools (B)
| Gap | Priority | Notes |
|-----|----------|-------|
| **Agent definition** (`agents/tpm.md`) | High | deanpeters has no opencode agent files. Port tpm.md: TPM persona, operating principles, workflow. |
| **Well-known manifest** (`.well-known/skills.json`) | High | deanpeters has `.claude-plugin/` but no opencode manifest for URLs-based discovery. |
| **Install/uninstall scripts** | Medium | deanpeters has Bash release scripts; tpm-tools has cleaner `install.sh` / `uninstall.sh` |

### From alirezarezvani (C)
| Gap | Priority | Notes |
|-----|----------|-------|
| **Experiment designer** (A/B test) | High | deanpeters has `pol-probe-advisor` (qualitative/lean). Missing: sample size calculator, power analysis, statistical hypothesis structurer. |
| **Product analytics skill** | High | deanpeters has SaaS-specific metrics (revenue, churn). Missing: generic product analytics — retention cohorts, funnel analysis, KPI dashboards, event tracking metrics. |
| **Competitive teardown** (scoring matrix) | Medium | deanpeters has `company-intel` (7-lens qualitative). Missing: structured 12-dimension competitive scoring with feature matrices, weighted rankings. |
| **Code-to-PRD** | Medium | Reverse-engineer a PRD from an existing codebase. No equivalent in deanpeters. |
| **Orchestrator/routing pattern** | Low | alirezarezvani has a meta-skill that routes to sub-skills. deanpeters' skills are individually invocable — no router needed. |

### From phuryn (D)
| Gap | Priority | Notes |
|-----|----------|-------|
| **Single-artifact strategy canvas** | High | deanpeters has `product-strategy-session` (workflow). Missing: a single self-contained 9-section Strategy Canvas (vision → segments → costs → value props → tradeoffs → metrics → growth → capabilities → defensibility). |
| **Defensibility/moat analysis** | Medium | Network effects, switching costs, IP moats, can't/won't matrix. deanpeters has nothing on this. |
| **Pricing strategy models** | Medium | WTP (willingness to pay), price elasticity, pricing model selection. deanpeters' `finance-based-pricing-advisor` is purely about pricing *changes*, not strategy. |
| **Capabilities analysis** | Low | Build vs partner vs buy competency mapping. Niche need. |

### From Digidai (E)
| Gap | Priority | Notes |
|-----|----------|-------|
| **Coaching mode with anti-patterns** | High | deanpeters has coaching built into interactive skills via Adaptive Decision Ladder. Digidai formalizes this as an explicit mode with conversation anti-pattern detection (analysis paralysis, compliance loop, etc.). |
| **Growth & PLG domain** | High | deanpeters has `organic-growth-advisor` (McKinsey) and `acquisition-channel-advisor`. Missing: PLG readiness, activation frameworks, viral loop design, freemium conversion mechanics, product-qualified lead scoring. |
| **PM Sprint workflow** | Medium | Digidai chains all 6 phases (Discover→Position→Prioritize→Specify→Validate→Measure) as one linear 2-4 week sprint. deanpeters has these as separate workflows — combining them could save context for TPMs who own end-to-end delivery. |

---

## Recommendations for DIAL-Studio/Product-Manager-Skills (fork)

### Phase 1 — Port from tpm-tools (high value, low effort)
These are things our org already owns but lives in a separate repo:

| Item | Action |
|------|--------|
| `agents/tpm.md` | Copy into fork's `agents/` dir. Already opencode-compatible. Link to fork's skills. |
| `.well-known/skills.json` | Copy into fork root. Update URLs to point to fork. Allows `skills.urls` discovery in opencode. |
| `install.sh` / `uninstall.sh` | Copy, update paths to reference the fork. |
| `tpm-artifacts` skill already in fork | Already integrated — the fork inherited it from the standalone file at `~/.config/opencode/skills/tpm-artifacts/`. |

### Phase 2 — Fill high-priority gaps (high value, medium effort)

New skills to create:

| Skill | Source | Why |
|-------|--------|-----|
| `experiment-designer` | alirezarezvani | Sample size calc, power analysis, A/B hypothesis structurer. Complements deanpeters' `pol-probe-advisor`. |
| `product-analytics` | alirezarezvani | Retention cohorts, funnel analysis, event metrics, KPI dashboard design. More PM-general than deanpeters' SaaS-specific `business-health-diagnostic`. |
| `strategy-canvas` | phuryn | 9-section single-artifact strategy canvas. Faster than running the `product-strategy-session` workflow for quick alignment. |
| `coaching-mode` | Digidai | Explicit coaching protocol with anti-pattern detection (analysis paralysis, compliance loop, etc.). Extends deanpeters' Adaptive Decision Ladder. |
| `growth-plg-advisor` | Digidai | PLG readiness, activation frameworks, viral loops, freemium conversion. Adds a domain deanpeters doesn't cover. |

### Phase 3 — Medium-priority additions

| Skill | Source | Why |
|-------|--------|-----|
| `competitive-teardown` | alirezarezvani | 12-dimension scoring matrix. deanpeters has `company-intel` (qualitative) — this adds quantitative scoring. |
| `code-to-prd` | alirezarezvani | Reverse-engineer PRD from existing code. Unique value for TPMs inheriting existing products. |
| `defensibility-analysis` | phuryn | Moat analysis (network effects, switching costs, IP). |
| `pricing-strategy` | phuryn | WTP, elasticity, pricing model selection. Complements `finance-based-pricing-advisor`. |
| `pm-sprint-workflow` | Digidai | Combined 6-phase sprint: Discover→Position→Prioritize→Specify→Validate→Measure. Orchestrates existing skills. |

### Phase 4 — Maintenance & docs

| Item | Action |
|------|--------|
| `catalog/comparison.md` | This document — commit to fork as reference |
| `docs\INSTALL-OPENCODE.md` | Already created in the PR |
| Cross-reference table | Map each new skill back to its source inspiration |
| License alignment | Ensure new skills match `CC BY-NC-SA 4.0` (deanpeters) or `MIT` (tpm-tools) |

---

## Structural Recommendations

### 1. Keep tpm-tools as a separate "starter pack" repo
The fork (Product-Manager-Skills) is the full 55+ skills library. tpm-tools can remain as a lightweight entry point with just the agent + one skill, referencing the fork as the full library.

### 2. Add an `agents/` dir to the fork
This is the deanpeters repo's biggest gap for opencode users. A `tpm.md` agent (ported from tpm-tools) plus specialized agents (`pm-strategist.md`, `discovery-lead.md`) would make the fork opencode-native.

### 3. Add `.well-known/skills.json`
Opencode supports URL-based skill discovery. Adding this manifest allows `skills.urls` in opencode.json to install skills directly from the repo.

### 4. Script the new skills
Use the `skill-authoring-workflow` (already in deanpeters) and `pm-skill-creator` to generate the new Phase 2-3 skills following deanpeters' format exactly.

---

## Data Sources

- deanpeters/Product-Manager-Skills: https://github.com/deanpeters/Product-Manager-Skills
- DIAL-Studio/tpm-tools: https://github.com/DIAL-Studio/tpm-tools
- alirezarezvani product-skills: https://www.skills.sh/alirezarezvani/claude-skills/product-skills
- phuryn pm-skills: https://www.skills.sh/phuryn/pm-skills/product-strategy
- deanpeters prd-development: https://www.skills.sh/deanpeters/product-manager-skills/prd-development
- Digidai product-manager-skills: https://www.skills.sh/digidai/product-manager-skills/product-manager-skills
