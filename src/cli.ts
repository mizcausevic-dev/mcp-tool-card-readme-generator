#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

import { generateReadme } from "./generate.js";
import type { ToolCard } from "./types.js";

interface Args {
  input?: string;
  out?: string;
  hideBadges: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { hideBadges: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "-h" || a === "--help") args.help = true;
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--hide-badges") args.hideBadges = true;
    else if (!a.startsWith("-")) args.input = a;
    else throw new Error(`Unknown option: ${a}`);
  }
  return args;
}

const HELP = `mcp-tool-card-readme-generator — emit a Markdown README from a single MCP Tool Card

Usage:
  mcp-tool-card-readme-generator <tool-card.json> [--out README.md] [--hide-badges]

Sections rendered:
  - Title + description + side-effect / PII / secrets / approval / reversibility badges
  - Server + tool identity (server_id, name, version, mcp_server_uri)
  - Safety (side-effect class, external systems, refusal modes)
  - Input schema (inline JSON or external URI)
  - Tested-with (LLM × provider × pass-rate table)
  - Performance (p50/p95/p99 latency)
  - Cost (per_call_usd)
  - Audit (log URI, retention, signer, IRU)

Exit codes:
  0 — README emitted
  2 — usage / I/O error`;

export function run(argv: string[]): number {
  let args: Args;
  try {
    args = parseArgs(argv);
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }
  if (args.help || !args.input) {
    process.stdout.write(`${HELP}\n`);
    return args.help ? 0 : 2;
  }

  let card: ToolCard;
  try {
    card = JSON.parse(readFileSync(args.input, "utf8")) as ToolCard;
  } catch (e) {
    process.stderr.write(`error reading input: ${(e as Error).message}\n`);
    return 2;
  }

  let md: string;
  try {
    md = generateReadme(card, { hideBadges: args.hideBadges });
  } catch (e) {
    process.stderr.write(`${(e as Error).message}\n`);
    return 2;
  }

  if (args.out) writeFileSync(args.out, md, "utf8");
  else process.stdout.write(md);
  return 0;
}

const invokedDirectly =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    process.exit(run(process.argv.slice(2)));
  } catch (e) {
    process.stderr.write(`fatal: ${(e as Error).message}\n`);
    process.exit(2);
  }
}
