---
name: growth-plg-advisor
argument-hint: "[product or growth context]"
description: "Design product-led growth strategies: activation, virality, freemium conversion, and PLG readiness assessment. Use when you want to transition to PLG or optimize an existing growth engine."
compatibility: opencode
metadata:
  intent: >-
    Guide product managers through designing product-led growth (PLG) strategies. Assesses PLG readiness across 5 dimensions (time-to-value, onboarding, virality, monetization, data infrastructure), then provides concrete recommendations on activation optimization, viral loop design, freemium conversion mechanics, and growth metric selection. Use this to build or improve a self-serve growth engine.
  type: interactive
  theme: growth
  best_for:
    - "Assessing whether your product is ready for PLG"
    - "Designing or optimizing a freemium conversion funnel"
    - "Building viral loops into your product"
    - "Improving activation rates and time-to-value"
  scenarios:
    - "We want to add a freemium tier — how do we design the conversion mechanics?"
    - "Our activation rate is 15% — help me diagnose what's broken"
    - "How do we build viral loops into our B2B SaaS product?"
    - "Is our product ready for product-led growth, or should we stay sales-led?"
  estimated_time: "25-40 min"
sources:
  - "OpenView — 2025 PLG Report"
  - "Wes Bush — Product-Led Growth (book)"
  - "Kyle Poyar — Growth Unhinged (newsletter, PLG benchmarks)"
  - "Lenny Rachitsky — Lenny's Newsletter (growth, PLG, activation)"
---

# Growth PLG Advisor

## Purpose

Design product-led growth strategies by assessing PLG readiness across 5 dimensions: time-to-value, onboarding, virality, monetization, and data infrastructure. Whether you're transitioning from sales-led to PLG or optimizing an existing growth engine, this skill diagnoses your biggest constraint and delivers concrete next steps.

PLG isn't just "add a free tier." It's a product architecture decision that affects onboarding, pricing, feature packaging, and data infrastructure — all of which this skill covers.

## Input

**Works best with:** Your product, current growth model, and any growth metrics you have.
**Also useful:** Current conversion rates (trial→paid, free→paid), activation metrics, retention cohorts.

Anything supplied with the invocation counts as answers already given.

**Arriving empty-handed?** The skill assesses your PLG readiness first, then recommends next steps.

**Example invocation:** "We're a B2B SaaS with enterprise sales. Help me add a PLG motion for mid-market."

## Key Concepts

### The 5 PLG Readiness Dimensions

| # | Dimension | What it measures | Red flag |
|---|-----------|-----------------|----------|
| 1 | **Time-to-Value** | How fast a new user gets their first win | > 30 minutes = poor |
| 2 | **Onboarding** | % of users who reach the "aha moment" in the first session | < 20% activation = critical |
| 3 | **Virality / Loop Potential** | Whether usage naturally spreads | No sharing or collaboration = no PLG virality |
| 4 | **Monetization** | Ability to convert free users to paid | No clear upgrade trigger = leaky funnel |
| 5 | **Data Infrastructure** | Ability to measure and optimize the loop | Can't segment free users by behavior = blind |

### PLG Growth Loops

| Loop Type | How it works | Example |
|-----------|-------------|---------|
| **Inherent** | product usage = invitation sent | Figma (collaboration = new users) |
| **Network** | more users = more value | Slack, Notion |
| **Content** | output = distribution | Canva (designed asset = watermark = signup) |
| **API** | integration = installation | Stripe, Twilio |
| **Community** | participation = recirculation | Product Hunt, GitHub |

### The PLG Conversion Funnel

```
Visit → Sign up → Activate → Engage → Convert → Expand
  │          │          │          │         │         │
  │          │          │          │         │   NRR/upsell
  │          │          │          │    free→paid
  │          │          │    D1/D7/D30 retention
  │          │    activation rate (aha moment)
  │    signup rate
traffic
```

## Application

This interactive skill asks **up to 5 adaptive questions**, then produces a PLG action plan.

### Question 1 — Current State

**Agent asks:** "Where are you in your PLG journey?"

1. **Pre-PLG** — We're sales-led or service-led. No free tier, no self-serve.
2. **Early PLG** — We have a free trial or freemium tier, but conversion is low or unclear.
3. **Growth PLG** — We have PLG working, but we want to optimize loops, virality, or expansion.
4. **PLG + Sales hybrid** — We want to add a sales motion on top of existing PLG.

### Question 2 — Time-to-Value

**Agent asks:** "How long does it take a new user to get their first meaningful outcome?"

1. **< 5 minutes** — Near-instant value (e.g., "upload → result")
2. **5-30 minutes** — Quick setup required (e.g., "connect account → dashboard")
3. **30 min - 2 hours** — Configuration needed (e.g., "invite team → first project")
4. **> 2 hours** — Significant setup/integration
5. **Not sure** — We haven't measured it

### Question 3 — Activation & Onboarding

**Agent asks:** "What does 'activation' look like for your product, and what is the current rate?"

1. **We know our activation metric** — User provides rate and definition
2. **We don't have one** — Agent helps define it
3. **We have an aha moment** — User provides context for optimization

### Question 4 — Viral Potential

**Agent asks:** "Does your product naturally involve collaboration or sharing?"

1. **Multiplayer** — Multiple users needed for full value (e.g., collaboration, communication)
2. **Shared output** — Users share output that links back to the product (e.g., design tools, docs)
3. **API/integration** — Other tools talk to your product; adoption spreads through ecosystem
4. **Single-player** — One user gets full value; no natural sharing (challenging for PLG)

### Question 5 — Monetization Model

**Agent asks:** "How do you convert free users to paid?"

1. **Usage-based** — Free tier has limits (seats, features, volume); upgrade removes them
2. **Time-based** — Free trial expires; convert or lose access
3. **Feature-gated** — Free tier has core features; premium features require payment
4. **Hybrid** — Combination of usage + features

### Output

After all questions, the agent produces:

```markdown
## PLG Action Plan: <Product>

### PLG Readiness Score
| Dimension | Score (1-5) | Status | Priority |
|-----------|-------------|--------|----------|
| Time-to-Value | ? | ? | ? |
| Onboarding | ? | ? | ? |
| Virality | ? | ? | ? |
| Monetization | ? | ? | ? |
| Data Infrastructure | ? | ? | ? |

### Biggest Constraint
<The dimension with the lowest score — this is your PLG bottleneck>

### Recommended Actions

1. **<Action 1>** — <specific next step, owner, timeline>
2. **<Action 2>**
3. **<Action 3>**

### Growth Loop Design
<If applicable, the recommended primary loop and how to build it>

### Metrics to Track
| Metric | Current | Target | Why it matters |
|--------|---------|--------|----------------|
| | | | |
```

## Examples

### Example 1: B2B Analytics Tool Going PLG

**Context:** Enterprise analytics product wants to add a PLG tier. Time-to-value is 45 min (too long). Current activation rate: 12%. Product is single-player.

**PLG Readiness:**
- Time-to-Value: 2/5 (45 min setup with SQL knowledge)
- Onboarding: 1/5 (12% activation)
- Virality: 1/5 (single-player, no sharing)
- Monetization: 3/5 (clear usage limits possible)
- Data Infrastructure: 2/5 (can't segment free vs. paid users)

**Biggest Constraint:** Time-to-value. No one will convert if they don't see value in the first session.

**Recommendation:** Before building a free tier, invest in guided onboarding with sample data. Add "share dashboard" as built-in virality mechanism. Target getting TTV under 5 min and activation to 30% before launching PLG tier.

## Common Pitfalls

### Pitfall 1: Freemium Without a Funnel
**Symptom:** "We'll launch a free tier and figure out conversion later."
**Consequence:** Free users churn at 80%+ with zero path to paid. You get volume, not revenue.
**Fix:** Design the free→paid trigger before launching: what behavior predicts willingness to pay? Gate that feature behind the upgrade.

### Pitfall 2: Copying Consumer PLG for B2B
**Symptom:** "Slack grew through virality, so we should too!"
**Consequence:** If your product is single-player (see Q4), you can't rely on inherent virality. You need a different loop (API, content, community).
**Fix:** Match your growth loop to your product architecture. Single-player products need content or API loops, not inherent virality.

### Pitfall 3: Activation Theater
**Symptom:** "Our activation rate is 60%!" ... because activation is defined as "clicked the start button"
**Consequence:** Vanity metric. True activation is "user experienced the core value and came back the next day."
**Fix:** Define activation as the combination of behavior + retention. If they activate but never return, it's not activation.

### Pitfall 4: Free Tier Cannibalization
**Symptom:** Free users love the product but see no reason to upgrade
**Consequence:** You're paying infrastructure costs for users who will never pay you
**Fix:** The free tier must have a hard ceiling — usage limit, team size, time, or features — that makes the upgrade inevitable for growth-stage users.

## References

### Related Skills
- `acquisition-channel-advisor` — Channel evaluation for paid acquisition once PLG is set up
- `organic-growth-advisor` — McKinsey Growth Pyramid for broader growth strategy
- `experiment-designer` — A/B testing for PLG experiments (pricing page, signup flow)
- `saas-revenue-growth-metrics` — Tracking the revenue impact of PLG

### External Resources
- Wes Bush, *Product-Led Growth* — The canonical PLG book
- OpenView PLG Index — Industry benchmarks by product category
- Kyle Poyar's Growth Unhinged — PLG conversion benchmarks
- Lenny Rachitsky's Newsletter — Growth case studies
- Andrew Chen, *The Cold Start Problem* — Network effects and virality
