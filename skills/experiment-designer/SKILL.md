---
name: experiment-designer
argument-hint: "[experiment context or hypothesis]"
description: "Design rigorous A/B experiments with sample size calculation, power analysis, and statistical hypothesis structuring. Use when you need measurable, statistically sound evidence."
compatibility: opencode
metadata:
  intent: >-
    Guide product managers through designing rigorous online experiments (A/B tests). Covers hypothesis structuring, choosing the right metric family (count-based, ratio-based, Bayesian), calculating minimum sample size for desired power and MDE, documenting threats to validity, and producing a ready-to-implement experiment spec. Use this when a qualitative PoL probe is insufficient and you need statistical confidence before shipping.
  type: interactive
  theme: validation-experimentation
  best_for:
    - "Designing an A/B test for a feature launch"
    - "Calculating sample size and runtime for an experiment"
    - "Structuring a testable hypothesis with statistical rigor"
    - "Choosing between frequentist and Bayesian approaches"
  scenarios:
    - "We want to A/B test a new pricing page — how long do we need to run it?"
    - "Help me design an experiment for our onboarding flow redesign"
    - "What sample size do I need for 80% power with a 5% MDE?"
    - "Should I use a frequentist or Bayesian approach for this test?"
  estimated_time: "15-30 min"
sources:
  - "Kohavi, Tang, Xu — Trustworthy Online Controlled Experiments (2020)"
  - "Kohavi & Longbotham — Online Controlled Experiments and A/B Testing (Encyclopedia of Machine Learning)"
  - "Evan Miller — Sample Size Calculator (evanmiller.org)"
---

# Experiment Designer

## Purpose

Design rigorous A/B experiments by structuring hypotheses, choosing the right metric family, calculating required sample size and duration, and documenting threats to validity. Use this when a qualitative PoL probe is insufficient and you need statistical confidence before shipping.

This skill bridges the gap between "we should test this" and "here is exactly how long to run the experiment and what to watch for."

## Input

**Works best with:** What you want to test and the metric(s) you care about.
**Also useful:** Baseline conversion rate, minimum detectable effect (MDE), traffic estimates, and any context about the feature being tested.

Anything supplied with the invocation — text after the skill name, a pasted context dump, or an appended `ARGUMENTS:` line — counts as answers already given. Use it and skip whatever it covers.

**Arriving empty-handed?** That works too. The skill starts with the hypothesis and builds from there.

**Example invocation:** `Design an experiment for our new checkout flow — current conversion is 12%, we want to detect a 2% relative lift, and we have 50K daily visitors.`

## Key Concepts

### The Four Pillars of Experiment Design

1. **Hypothesis** — What exactly are you testing, and what do you expect to happen?
2. **Metric** — What are you measuring, and how is it computed (count vs. ratio vs. Bayesian)?
3. **Power & Sample Size** — How many users do you need to detect the effect at a given confidence level?
4. **Validity** — What threats could make your results misleading (novelty, primacy, SIMON, etc.)?

### Metric Families

| Family | Example | Formula | When to use |
|--------|---------|---------|-------------|
| **Count-based** | Click-through rate | Binomial: successes / trials | Binary outcomes (clicked / didn't click) |
| **Ratio-based** | Revenue per visitor | Continuous: sum / count | Revenue, time spent, sessions |
| **Bayesian** | Probability B > A | Beta-Binomial conjugate | When you want a probability distribution, not a p-value |

### Sample Size Formula (simplified)

For a **two-tailed test** with significance α = 0.05 and power β = 0.80:

```
n ≈ (Z_α/2 + Z_β)² × (p₁(1-p₁) + p₂(1-p₂)) / (p₂ - p₁)²
```

Where:
- Z_α/2 = 1.96 (for α = 0.05)
- Z_β = 0.84 (for β = 0.80, i.e. 80% power)
- p₁ = baseline conversion
- p₂ = expected conversion under treatment
- n = required sample **per variant**

**Rule of thumb:** For a relative MDE of 5% and 80% power, expect ~1-2 weeks for most consumer products, longer for B2B / low-traffic scenarios.

## Application

This interactive skill asks **up to 5 adaptive questions**, then produces a complete experiment spec.

### Question 1 — Hypothesis

**Agent asks:** "What is the hypothesis you want to test?"

1. **User behavior change** — e.g., "Adding social proof to the pricing page will increase signup conversion"
2. **UX/UI change** — e.g., "A one-step checkout will reduce abandonment vs. the current multi-step flow"
3. **Algorithm/model change** — e.g., "Our new recommendation model will increase click-through rate"
4. **Pricing/packaging change** — e.g., "Offering an annual plan at a discount will increase LTV"

**Or describe your hypothesis directly.**

### Question 2 — Primary Metric

**Agent asks:** "What is the primary metric you'll use to measure success?"

1. **Conversion rate** (count-based) — e.g., signup rate, purchase rate, click rate
2. **Revenue per user** (ratio-based) — e.g., average revenue per visitor (ARPV)
3. **Engagement metric** (ratio-based) — e.g., sessions per user, time on task
4. **Retention metric** (ratio/cohort) — e.g., D1/D7/D30 retention, NRR
5. **Not sure — help me choose**

### Question 3 — Parameters

**Agent asks:** "What are your current numbers and traffic estimates?"

1. **I know —** User provides: baseline rate, MDE, daily traffic, desired power (or defaults)
2. **I'm not sure —** Agent guides with industry defaults and conservative estimates
3. **I have traffic data —** Agent computes from provided metrics

### Question 4 — Threats to Validity

**Agent asks:** "Which threats to validity are most relevant for this experiment?"

1. **Novelty effect** — Users behave differently because it's new (not because it's better)
2. **Primacy effect** — Existing users resist change (revert to familiar behavior)
3. **Interaction effects** — Results change when both variants interact (e.g., social features)
4. **SIMON (Sample Ratio Mismatch)** — Your split isn't 50/50 because of a technical bug
5. **Day-of-week / seasonal effects** — Traffic or behavior varies by day/week
6. **All of the above — run full threat assessment**

### Question 5 — Decision Threshold

**Agent asks:** "What will trigger a ship / kill / iterate decision?"

1. **Ship if statistically significant positive** — p < 0.05, effect > 0
2. **Ship if positive AND no guardrail metric regresses** — More conservative
3. **Bayesian decision** — P(Beats baseline) > threshold (e.g., 90%)
4. **Iterate-based decision** — Use directionality even if not significant, design follow-up test

### Output

After all 5 questions, the agent produces:

```markdown
## Experiment Spec: <title>

### Hypothesis
If we <change> for <segment>, then <metric> will change by <expected effect>.

### Design
- Type: A/B / A/B/n / holdout
- Population: <segment, % of eligible>
- Variant assignment: <randomization key>

### Metrics
- Primary: <metric> — direction: ↑ | ↓
- Guardrails: <metric 1, metric 2>
- Secondary: <exploratory metrics>

### Sample Size Calculation
- Baseline rate: ___%
- Minimum detectable effect: ___% (relative/absolute)
- Significance level (α): 0.05
- Power (1-β): ___%
- Sample size per variant: ___
- Daily traffic per variant: ___
- Estimated duration: ___ days

### Threats to Validity & Mitigations
- <threat> → <mitigation>

### Decision Rules
- Ship if:
- Kill if:
- Iterate if:

### Entrance / Exit Criteria
- Entrance:
- Exit:
```

## Examples

### Example 1: Pricing Page A/B Test

**Context:**
- Baseline signup rate: 12%
- Expected relative lift: 15% (absolute: 12% → 13.8%)
- Daily visitors: 50K across both variants (25K each)
- Power: 80%

**Calculation:**
```
Z_α/2 = 1.96, Z_β = 0.84
p₁ = 0.12, p₂ = 0.138
n ≈ (1.96 + 0.84)² × (0.12×0.88 + 0.138×0.862) / (0.018)²
n ≈ 7.84 × (0.1056 + 0.1190) / 0.000324
n ≈ 7.84 × 0.2246 / 0.000324
n ≈ 7.84 × 693.2
n ≈ 5,435 per variant
```

**Result:** ~5,500 users per variant needed. At 25K/day per variant, run for ~1 day. Run for 7 days to capture day-of-week effects.

## Common Pitfalls

### Pitfall 1: Peeking at Results
**Symptom:** Checking the p-value every hour and stopping as soon as it's "significant"
**Consequence:** Massively inflated false positive rate (type I error). With continuous peeking, actual α can exceed 30%.
**Fix:** Set a fixed duration before the experiment starts. Use a sequential testing framework if early stopping is necessary (e.g., always-valid p-values).

### Pitfall 2: Insufficient Sample Size
**Symptom:** Running a 3-day experiment because "that's how long the sprint is"
**Consequence:** Low power means you fail to detect a real effect (type II error). You ship something that doesn't work, or kill something that does.
**Fix:** Calculate required sample size before starting. If traffic is insufficient, extend the duration, reduce the MDE, or switch to a qualitative PoL probe.

### Pitfall 3: Metric Pollution
**Symptom:** Using 15 metrics and declaring victory if any one of them is significant
**Consequence:** Multiple comparison problem — at α=0.05, 1 in 20 metrics will be "significant" by chance
**Fix:** Pre-register one primary metric. Use Bonferroni correction for secondary metrics. Or switch to Bayesian methods.

### Pitfall 4: Ignoring Guardrail Metrics
**Symptom:** Conversion went up 10%, but customer support tickets went up 40%
**Consequence:** You won the metric, lost the customer experience
**Fix:** Always pre-define guardrail metrics (at least one per dimension: engagement, support, revenue, performance).

## References

### Related Skills
- `pol-probe-advisor` — Chooses probe type; use this when you're not sure an experiment is needed vs. a qualitative probe
- `pol-probe` — Lightweight validation template; use this for early-stage validation before a full experiment
- `recommendation-canvas` — Evaluates AI product ideas; experiment design is one pillar of that canvas

### External Resources
- Kohavi, Tang, Xu, *Trustworthy Online Controlled Experiments* (Cambridge, 2020)
- Evan Miller's Sample Size Calculator: https://www.evanmiller.org/ab-testing/sample-size.html
- Kohavi & Longbotham, "Online Controlled Experiments and A/B Testing" in *Encyclopedia of Machine Learning*
- Sequential testing: Always-valid p-values (Johari et al., 2017) — more efficient than fixed-horizon in many product contexts
