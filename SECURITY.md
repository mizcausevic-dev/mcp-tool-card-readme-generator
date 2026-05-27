# Security Policy

`mcp-tool-card-readme-generator` is a pure-transform library and CLI: it reads a Tool Card JSON file and emits Markdown. No network listener, no remote fetch, no execution of user-supplied code, no live MCP server invocation.

The input may include internal MCP server URIs, audit log URIs, incident-response URIs, and tool descriptions that are sensitive in your environment. The Markdown output includes those values verbatim — be deliberate about where you publish the rendered README.

## Supported versions

Only the latest tagged release is supported.

## Reporting a vulnerability

Please use GitHub Security Advisories for private disclosure:

- [Open a security advisory](https://github.com/mizcausevic-dev/mcp-tool-card-readme-generator/security/advisories/new)

Do not file public issues for security reports.
