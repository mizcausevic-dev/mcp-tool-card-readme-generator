# Changelog

## v0.1.0 — 2026-05-27

- Initial release: `generateReadme(card, opts?)` → Markdown for a single MCP Tool Card.
- Renders title + description + identity-badge line (side-effect class, PII, secrets, human-approval, reversibility, rate-limit).
- Safety section with side-effect class, external systems, reversibility, rate-limit, PII / secrets exposure, refusal modes.
- Input schema section with inline JSON code-fence OR external URI OR explicit "not declared" callout.
- Tested-with table (LLM × provider × pass-rate% × sample-size × tested-at × test-suite link).
- Optional Performance / Cost / Audit blocks (only when declared).
- CLI: `mcp-tool-card-readme-generator <tool-card.json> [--out FILE] [--hide-badges]`.
- Two fixtures: a destructive `tenant-reset` (full safety+audit+tested-with surface) and a read-only `search-vectorstore` (perf+cost focus).
- **Per-doc analog to `mcp-server-readme-generator`** — together they cover server-level and per-tool MCP rendering.
- **Closes the per-doc readme-gen pattern** across all 4 governance protocols (agent-card / mcp-tool-card NEW / prompt-provenance / evidence-bundle).
- Node 20/22 CI (lint, typecheck, coverage, build, demo, `npm audit`), AGPL-3.0-or-later, Dependabot.
