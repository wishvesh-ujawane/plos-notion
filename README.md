# plos-notion — PLOS as a Notion workspace

Standalone companion to the [PLOS](https://github.com/wishvesh-ujawane/PLOS) Next.js app. Instead of a web UI, this repo is the source of truth for a Notion "second brain" workspace that mirrors PLOS in shape but is organized by **life areas** (Trading / Salesforce Career / Cloud101 Business / Personal) rather than by module.

The actual Notion pages and databases are built directly in Notion via the [official Notion MCP server](https://github.com/makenotion/notion-mcp-server) driven by Copilot Chat. This repo holds:

| File | What it is |
| ---- | ---------- |
| [WORKSPACE-DESIGN.md](WORKSPACE-DESIGN.md) | The four-area layout and every database schema (properties, options, relations). Source of truth for the build. |
| [SETUP.md](SETUP.md) | One-time setup: create Notion integration, share parent page, configure MCP in VS Code. |
| `notion-manifest.json` | *(created after first successful build; gitignored)* Maps `areaKey/dbKey` → Notion page/database IDs so future runs can address them by name. |

## Current status

Phase 0 (Notion integration + parent page) is complete. Phase 0 MCP install was attempted on an office PC where the corporate network resets TLS to `api.notion.com`, so live-build via MCP from that machine is not possible.

**Resume path**: repeat the MCP install (Step 3 of [SETUP.md](SETUP.md)) on a machine that can reach `api.notion.com` — home PC, personal laptop, or GitHub Codespaces — then start a fresh Copilot Chat conversation and ask it to build the workspace from `WORKSPACE-DESIGN.md`.

## Role

- **Scaffold once, then use Notion natively.** The PLOS Next.js app stays as-is; nothing syncs between them.
- **Empty databases at first.** No importer from Postgres; fill in as you go.
- **Personal Notion account only.** Never share the integration with a company-owned workspace.
