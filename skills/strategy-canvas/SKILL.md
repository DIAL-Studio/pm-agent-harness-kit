---
name: strategy-canvas
argument-hint: "[product or initiative]"
description: Complete a 9-section product strategy canvas that connects vision to defensibility. Use when you need a single-artifact strategy document for alignment, pitching, or quarterly planning.
compatibility: opencode
metadata:
  intent: >-
    Guide product managers through filling a 9-section Product Strategy Canvas: vision, target segments, relative costs, value propositions, tradeoffs, north star metrics, growth model, capabilities, and defensibility. Use this to produce a single, coherent strategy artifact that surfaces hidden assumptions, tests coherence across sections, and identifies the riskiest hypotheses to validate next.
  type: interactive
  theme: strategy-framing
  best_for:
    - "Producing a single-page strategy artifact for exec alignment"
    - "Connecting vision to defensibility in one coherent document"
    - "Identifying hidden assumptions and the riskiest gaps in your strategy"
    - "Quarterly strategy review or new initiative kickoff"
  scenarios:
    - "I need a strategy document for our new product line to present to the exec team"
    - "Let's build a strategy canvas for our Q3 initiative"
    - "Help me check if our product strategy is coherent across all dimensions"
  estimated_time: "45-90 min"
sources:
  - "Geoffrey Moore — Crossing the Chasm / Escape Velocity (core positioning and segment models)"
  - "Phuryn/pm-skills — Product Strategy Canvas (9-section inspiration)"
  - "Marty Cagan — Empowered (outcome-based strategy)"
---

# Strategy Canvas

## Purpose

Complete a 9-section Product Strategy Canvas that connects vision to defensibility in one coherent artifact. Use this for quarterly strategy reviews, new initiative kickoffs, or exec alignment — when you need a single document that shows the full picture, not a multi-week workflow.

The canvas forces coherence: each section constraints the next. If your vision doesn't match your capabilities, or your growth model contradicts your value prop, the canvas surfaces the tension.

## Input

**Works best with:** The product, feature, or initiative you're building strategy for.
**Also useful:** Competitive context, customer research, revenue data, capability assessments.

Anything supplied with the invocation counts as answers already given. Use it and skip whatever it covers.

**Arriving empty-handed?** The canvas starts at vision and builds section by section — you can fill gaps as you go.

**Example invocation:** `Build a strategy canvas for our AI-powered code review product — here are our current segments and pricing model.`

## Key Concepts

### The 9 Sections

| # | Section | What it captures | Key question |
|---|---------|-----------------|--------------|
| 1 | **Vision** | Where you're going and why | "What world are we building?" |
| 2 | **Target Segments** | Who you serve (with JTBD) | "Who has the job to be done?" |
| 3 | **Relative Costs** | Cost structure vs. alternatives | "Why can we deliver this differently?" |
| 4 | **Value Propositions** | For each segment, what you offer | "What do they buy from us?" |
| 5 | **Tradeoffs** | What you deliberately won't do | "What are we choosing NOT to do?" |
| 6 | **North Star & OMTM** | How you measure success | "What one metric matters most now?" |
| 7 | **Growth Model** | How you acquire and expand | "SLG, PLG, or sales-led? Channels?" |
| 8 | **Capabilities** | What you build vs. buy vs. partner | "What must we own internally?" |
| 9 | **Defensibility** | Your moat and competitive advantage | "Why won't a competitor copy us tomorrow?" |

### Coherence Test

Each section must be consistent with the others. Common violations:
- Vision is "democratize X" but pricing is premium-only → segment contradiction
- Growth depends on PLG but capabilities don't include onboarding → capability gap
- Value prop is "simplicity" but road is full of features → tradeoff violation

## Application

This interactive skill asks **up to 9 adaptive questions** (one per section), offering context-aware options at each step. You can skip sections that are already clear.

### Section 1 — Vision

**Agent asks:** "What is the vision for this product? One sentence."

1. **New market creation** — "We believe [user] should be able to [do X] that currently isn't possible"
2. **Category consolidation** — "We're bringing [features A, B, C] into one integrated experience"
3. **Democratization** — "We're making [capability] accessible to [segment that can't afford it today]"
4. **Displacement** — "We're replacing [incumbent approach] with a fundamentally better model"
5. **Describe your own vision.**

### Section 2 — Target Segments

**Agent asks:** "Who has the job to be done, and how do they segment?"

Based on Q1, agent suggests likely segments with JTBD framing. User selects or customizes.

Segments should be:
- **Identifiable** — You know who they are and how to reach them
- **Differentiable** — Each segment has distinct needs
- **Sizable** — Enough total addressable market

### Section 3 — Relative Costs

**Agent asks:** "What is your cost advantage vs. alternatives?"

1. **Technology advantage** — We can deliver at lower cost due to proprietary tech
2. **Scale advantage** — We benefit from network effects or volume economics
3. **Process advantage** — Our operations are leaner or more automated
4. **No cost advantage** — We compete on value, not price
5. **Not applicable** — We're premium, costs don't drive buying decision

### Section 4 — Value Propositions

**Agent asks:** "What does each segment buy from you?"

For each segment identified in S2, define:
- **Outcome** — What the customer achieves
- **Differentiator** — Why they buy from you vs. the alternative
- **Proof** — Evidence that this works (testimonial, metric, case study)

### Section 5 — Tradeoffs

**Agent asks:** "What are you explicitly choosing NOT to do?"

1. **We won't serve [segment]** — Even though they could use it
2. **We won't build [feature category]** — Even though competitors have it
3. **We won't compete on [dimension]** — Price, speed, breadth, etc.
4. **We won't support [use case]** — Even though users might ask for it

**Why this matters:** A strategy without tradeoffs is a wish list. Tradeoffs make strategy real because they imply scarcity: you can't do everything, so you choose wisely.

### Section 6 — North Star & OMTM

**Agent asks:** "What is the one metric that matters most right now?"

1. **Acquisition** — New users / signups
2. **Activation** — Users reaching the "aha moment"
3. **Retention** — D1/D7/D30/W52 retention
4. **Revenue** — MRR, ARR, LTV
5. **Engagement** — DAU/MAU, sessions per user

**North Star** is the long-term metric that captures the value you deliver. **OMTM** (One Metric That Matters) is the short-term leading indicator you're optimizing now.

### Section 7 — Growth Model

**Agent asks:** "How do you acquire and expand customers?"

1. **PLG (Product-Led Growth)** — Freemium, free trial, self-serve → viral
2. **SLG (Sales-Led Growth)** — Outbound, enterprise, demo-led
3. **Hybrid** — PLG for acquisition, SLG for expansion/enterprise
4. **Channel/Partnership** — Resellers, integrations, marketplace
5. **Community-Led** — Open source, user groups, word of mouth

### Section 8 — Capabilities

**Agent asks:** "What do you need to build vs. buy vs. partner?"

| What | Build | Buy | Partner | Rationale |
|------|-------|-----|---------|-----------|
| Core product | ✓ | | | Differentiator |
| Auth / identity | | ✓ | | Commodity |
| Payment processing | | | ✓ | Requires licensing |

### Section 9 — Defensibility

**Agent asks:** "What prevents a competitor from copying you tomorrow?"

1. **Network effects** — More users = more value (direct, data, or platform)
2. **Switching costs** — Hard to leave (data lock-in, workflow integration, training)
3. **Scale economies** — Unit costs drop as you grow
4. **IP / proprietary tech** — Patents, trade secrets, hard-to-replicate algorithms
5. **Brand / trust** — Reputation, compliance, enterprise trust
6. **Ecosystem** — Integrations, APIs, developer community that orbits your platform

### Output

After completing all sections, the agent produces:

```markdown
# Strategy Canvas: <Product/Initiative>

## 1. Vision
<one sentence>

## 2. Target Segments
| Segment | JTBD | Size estimate | Priority |
|---------|------|---------------|----------|
| | | | |

## 3. Relative Costs
<Cost advantage statement>

## 4. Value Propositions
| Segment | Outcome | Differentiator | Proof |
|---------|---------|----------------|-------|
| | | | |

## 5. Tradeoffs
- We won't: ...

## 6. North Star & OMTM
- North Star: <long-term metric>
- OMTM: <next quarter's metric>

## 7. Growth Model
<Primary + secondary growth motion>

## 8. Capabilities
| Capability | Build / Buy / Partner | Rationale |
|------------|----------------------|-----------|
| | | |

## 9. Defensibility
<Primary moat + secondary moats>

---

### Coherence Check
- <Tension 1 found between sections X and Y>
- <Riskiest assumption:>
- <Recommended first validation:>
```

## Examples

### Example: AI Code Review Tool

**Vision:** "Every developer ships better code by having an AI code reviewer in their PR workflow."

**Segments:**
- **Startups (1-50 devs):** JTBD — "Ship faster without hiring a senior reviewer"
- **Mid-market (50-500 devs):** JTBD — "Standardize code quality across teams"

**Growth:** PLG (GitHub marketplace integration) → hybrid for enterprise

**Defensibility:** Data network effects (more PRs reviewed = better model) + deep GitHub/GitLab integration (switching cost)

**Coherence tension:** "Vision is 'every developer' but pricing is per-seat enterprise → missing PLG tier for individual developers."

## Common Pitfalls

### Pitfall 1: Vision Without Constraints
**Symptom:** Grand vision with no tradeoffs or capability gaps acknowledged
**Consequence:** Strategy is aspirational but not actionable — team can't prioritize
**Fix:** If you haven't identified 3+ explicit tradeoffs, the canvas is incomplete. Go back to Section 5.

### Pitfall 2: Segment Proliferation
**Symptom:** 8 segments listed in Section 2
**Consequence:** You can't serve all of them well. Strategy is watered down.
**Fix:** Max 3 segments. The rest is future scope. Move them to a "future consideration" note.

### Pitfall 3: Defensibility Through Wishful Thinking
**Symptom:** "First-mover advantage" is listed as the primary moat
**Consequence:** First movers rarely win without another moat (network effects, switching costs)
**Fix:** First-mover advantage doesn't count. Pick a real moat from the list in Section 9.

## References

### Related Skills
- `positioning-statement` — Feeds Section 4 (value propositions)
- `tam-sam-som-calculator` — Feeds Section 2 (segment sizing)
- `product-strategy-session` — Full strategy workflow (2-4 weeks) if you need depth
- `growth-plg-advisor` — Feeds Section 7 (growth model), deep PLG design

### External Frameworks
- Geoffrey Moore, *Crossing the Chasm* — Segment-driven strategy
- Marty Cagan, *Empowered* — Outcome-based product strategy
- James Currier, "The 16 Types of Defensibility" (NFX) — Deep moat taxonomy
- Hamilton Helmer, *7 Powers* — Full defensibility framework
