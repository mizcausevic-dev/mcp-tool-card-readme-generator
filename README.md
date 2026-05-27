# mcp-tool-card-readme-generator

[![CI](https://github.com/mizcausevic-dev/mcp-tool-card-readme-generator/actions/workflows/ci.yml/badge.svg)](https://github.com/mizcausevic-dev/mcp-tool-card-readme-generator/actions/workflows/ci.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/License-AGPL--3.0--or--later-blue.svg)](LICENSE)

Generate a human-readable Markdown README from a **single MCP Tool Card** JSON document (per [mcp-tool-card-spec v0.1](https://github.com/mizcausevic-dev/mcp-tool-card-spec)).

Per-doc analog to [`mcp-server-readme-generator`](https://github.com/mizcausevic-dev/mcp-server-readme-generator) — that one renders an MCP server's full `tools/list`; this one renders a single Tool Card spec doc.

**Closes the per-doc readme-gen pattern across all 4 governance protocols:**

- [`agent-card-readme-generator`](https://github.com/mizcausevic-dev/agent-card-readme-generator) — A2A AgentCards
- **`mcp-tool-card-readme-generator`** — MCP Tool Cards
- [`prompt-provenance-readme-generator`](https://github.com/mizcausevic-dev/prompt-provenance-readme-generator) — prompt-provenance docs
- [`evidence-bundle-readme-generator`](https://github.com/mizcausevic-dev/evidence-bundle-readme-generator) — evidence bundles

Part of the [Kinetic Gain Suite](https://suite.kineticgain.com/).

---

## What it renders

| section | source |
|---|---|
| **Title + description** | `tool.name`, `tool.description` |
| **Identity badges** | side-effect class (🟢 read / 🟡 mutating / 🟠 external / 🔴 destructive), PII exposure, secrets exposure, requires-human-approval, not-reversible, rate-limited |
| **Identity block** | server_id, tool name, version, mcp_server_uri |
| **Safety** | side-effect class, external systems, reversibility, rate-limiting, PII / secrets exposure, refusal modes |
| **Input schema** | inline JSON code-fence OR `input_schema_uri` link OR "no schema declared" |
| **Tested with** | LLM × provider × pass-rate × sample-size × tested-at × test-suite link table |
| **Performance** | p50 / p95 / p99 latency + measurement window (only when declared) |
| **Cost** | per_call_usd + measurement window (only when declared) |
| **Audit** | log URI, retention, signer, incident response URI (only when declared) |

## CLI

```bash
npx mcp-tool-card-readme-generator path/to/tool-card.json > README.md
```

### Options

| flag             | meaning |
|---|---|
| `--out FILE`     | Write to `FILE` instead of stdout |
| `--hide-badges`  | Suppress the identity-badge line under the title |
| `-h`, `--help`   | Print help and exit |

Exit codes:

- `0` — README emitted
- `2` — usage / I/O error or malformed Tool Card

## Library API

```ts
import { generateReadme } from "mcp-tool-card-readme-generator";
import type { ToolCard } from "mcp-tool-card-readme-generator";

const card: ToolCard = JSON.parse(readFileSync("tool-card.json", "utf8"));
const md = generateReadme(card, { hideBadges: false });
```

Throws on missing `tool` or `safety` blocks.

## License

[AGPL-3.0-or-later](LICENSE)
