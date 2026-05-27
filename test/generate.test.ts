import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { generateReadme } from "../src/generate.js";
import type { ToolCard } from "../src/types.js";

const here = fileURLToPath(new URL(".", import.meta.url));

function load(name: string): ToolCard {
  return JSON.parse(readFileSync(`${here}/../fixtures/${name}`, "utf8")) as ToolCard;
}

describe("generateReadme", () => {
  it("renders title + description + identity block", () => {
    const md = generateReadme(load("destructive-tenant-reset.json"));
    expect(md).toContain("# tenant-reset");
    expect(md).toContain("Resets a tenant to its initial-onboarding state");
    expect(md).toContain("**Server:** `kg-admin-mcp`");
    expect(md).toContain("**Tool:** `tenant-reset`");
    expect(md).toContain("**Version:** `0.3.0`");
    expect(md).toContain("**MCP server URI:** https://admin.kineticgain.com/mcp");
  });

  it("renders all safety badges for destructive tool", () => {
    const md = generateReadme(load("destructive-tenant-reset.json"));
    expect(md).toContain("🔴 destructive");
    expect(md).toContain("🔴 PII: high");
    expect(md).toContain("🔴 writes secrets");
    expect(md).toContain("🔒 requires human approval");
    expect(md).toContain("⚠ not reversible");
    expect(md).toContain("⏱ rate limited");
  });

  it("renders read tool badges (low PII, no secrets, reversible)", () => {
    const md = generateReadme(load("read-search-vectorstore.json"));
    expect(md).toContain("🟢 read");
    expect(md).toContain("🟡 PII: low");
    expect(md).toContain("✅ secrets: none");
    expect(md).toContain("⏱ rate limited");
    expect(md).not.toContain("🔒 requires human approval");
    expect(md).not.toContain("⚠ not reversible");
  });

  it("hides the badge LINE with --hide-badges (Safety section still shows the same labels)", () => {
    const md = generateReadme(load("destructive-tenant-reset.json"), { hideBadges: true });
    expect(md).not.toContain("🔒 requires human approval");
    expect(md).not.toContain("⏱ rate limited");
    expect(md).toContain("# tenant-reset");
    // Safety section still renders the side-effect class — that's a different concern.
    expect(md).toContain("## Safety");
  });

  it("renders Safety block with external systems + refusal modes", () => {
    const md = generateReadme(load("destructive-tenant-reset.json"));
    expect(md).toContain("## Safety");
    expect(md).toContain("**External systems:** `primary-postgres`, `object-storage`, `kms`");
    expect(md).toContain("**Refusal modes:**");
    expect(md).toContain("`no_approver_ticket`");
    expect(md).toContain("`tenant_has_active_incident`");
  });

  it("renders Input schema block with inline JSON", () => {
    const md = generateReadme(load("destructive-tenant-reset.json"));
    expect(md).toContain("## Input schema");
    expect(md).toContain("```json");
    expect(md).toContain('"tenant_id"');
  });

  it("renders schema URI fallback when no inline schema", () => {
    const md = generateReadme({
      ...load("read-search-vectorstore.json"),
      schema: { input_schema_uri: "https://example.com/schema.json" }
    });
    expect(md).toContain("Schema hosted at: https://example.com/schema.json");
  });

  it("renders '_No input schema declared._' when neither inline nor URI", () => {
    const md = generateReadme({ ...load("read-search-vectorstore.json"), schema: {} });
    expect(md).toContain("_No input schema declared._");
  });

  it("renders Tested-with table with pass rate %", () => {
    const md = generateReadme(load("destructive-tenant-reset.json"));
    expect(md).toContain("## Tested with (1)");
    expect(md).toContain("| `claude-opus-4-7` | Anthropic | 100.0% | 50 |");
    expect(md).toContain("[link](https://eval.kineticgain.com/suites/mcp-admin-destructive-v1)");
  });

  it("renders 'No tested_with entries' callout when missing", () => {
    const md = generateReadme(load("read-search-vectorstore.json"));
    expect(md).toContain("_No tested_with entries");
  });

  it("renders Performance + Cost blocks when present", () => {
    const md = generateReadme(load("read-search-vectorstore.json"));
    expect(md).toContain("## Performance");
    expect(md).toContain("**p50 latency:** 90 ms");
    expect(md).toContain("**p95 latency:** 400 ms");
    expect(md).toContain("## Cost");
    expect(md).toContain("**Per call:** `$0.0001` USD");
  });

  it("renders Audit block when present", () => {
    const md = generateReadme(load("destructive-tenant-reset.json"));
    expect(md).toContain("## Audit");
    expect(md).toContain("**Log URI:** https://audit.kineticgain.com/mcp/tenant-reset");
    expect(md).toContain("**Retention:** 2555 days");
    expect(md).toContain("**Signed by:** `kg-admin-mcp`");
    expect(md).toContain("**Incident response:** https://kineticgain.com/security/report");
  });

  it("omits Performance / Cost / Audit blocks when not present", () => {
    const minimal: ToolCard = {
      tool_card_version: "0.1",
      tool: { server_id: "x", name: "minimal", version: "1.0.0", mcp_server_uri: "https://x/", description: "x" },
      schema: { input_schema_inline: {} },
      safety: { side_effect_class: "read" }
    };
    const md = generateReadme(minimal);
    expect(md).not.toContain("## Performance");
    expect(md).not.toContain("## Cost");
    expect(md).not.toContain("## Audit");
  });

  it("falls through unknown side-effect to raw label", () => {
    const md = generateReadme({
      tool_card_version: "0.1",
      tool: { server_id: "x", name: "x", version: "1.0.0", mcp_server_uri: "https://x/", description: "x" },
      schema: { input_schema_inline: {} },
      safety: { side_effect_class: "weird-class" as unknown as "read" }
    });
    expect(md).toContain("weird-class");
  });

  it("renders test entry with missing optional fields as em-dash", () => {
    const md = generateReadme({
      tool_card_version: "0.1",
      tool: { server_id: "x", name: "x", version: "1.0.0", mcp_server_uri: "https://x/", description: "x" },
      schema: { input_schema_inline: {} },
      safety: { side_effect_class: "read" },
      tested_with: [{ llm: "claude" }]
    });
    expect(md).toContain("| `claude` | — | — | — | — | — |");
  });

  it("throws on malformed input", () => {
    expect(() => generateReadme(null as unknown as ToolCard)).toThrow();
    expect(() => generateReadme({} as ToolCard)).toThrow();
    expect(() => generateReadme({ tool: {} } as unknown as ToolCard)).toThrow();
  });
});
