I built something I wish I had years ago as a PM.

It's called pm-agent-harness-kit — 7 AI agents that work as your product team:

• **Lead** — decomposes initiatives and routes work
• **Explorer** — researches users, markets, competitors (with evidence)
• **Strategist** — advises on positioning, sizing, and tradeoffs
• **Builder** — writes PRDs, user stories, acceptance criteria
• **Reviewer** — validates specs and blocks what's not ready

The pipeline: Lead → Explorer → Builder → Reviewer. One sentence triggers it.

"Write a PRD for checkout v2"

The Explorer finds top abandonment causes with confidence levels. The Builder produces a full PRD with three slices, metrics, rollback triggers, and acceptance criteria. The Reviewer returns specific blockers: "guardrail metric is temporally impossible to measure." Not a generic "needs work" — actual, fixable issues.

It ships with 59 PM skills — problem statements, RICE prioritization, A/B testing, stakeholder mapping, JTBD, positioning, journey maps. Everything a PM does, structured and agentic.

Two things I'm proud of:

1. It works for both new PMs and veterans. If you're learning, there's a 4-week guide from zero to pipeline. If you're experienced, it saves hours on every spec.

2. The agents don't replace PMs — they force-multiply them. The Explorer won't let you build without evidence. The Reviewer won't approve without metrics. The pipeline enforces the discipline you know you should have but don't always.

curl install. Works with opencode and Claude Code. Open source.

github.com/DIAL-Studio/pm-agent-harness-kit

If you're a PM using AI, I'd love feedback. If you're not yet, this is a good place to start.
