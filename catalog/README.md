# Catalog Artifacts

These files are generated navigation indexes for skills, commands, and agents.

- `skills-index.yaml` - machine-readable skill metadata index
- `commands-index.yaml` - machine-readable command metadata index
- `skills-by-type.md` - human-readable browse view by skill type
- `commands.md` - human-readable command catalog

See `../agents/README.md` for the 7-agent PM-AHK pipeline. Agents are thin wrappers around the skill library — each agent owns a domain and delegates to skills for deep work.

Regenerate any time skills or commands change:

```bash
python3 scripts/generate-catalog.py
```
