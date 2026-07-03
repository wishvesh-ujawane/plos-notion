# plos-notion — PLOS as a Notion workspace

Standalone companion to the [PLOS](https://github.com/wishvesh-ujawane/PLOS) Next.js app. Instead of a web UI, this repo is the source of truth for a Notion "second brain" workspace that mirrors PLOS in shape but is organized by **life areas** (Trading / Salesforce Career / Cloud101 Business / Personal) rather than by module.

The actual Notion pages and databases are built directly in Notion via the [official Notion MCP server](https://github.com/makenotion/notion-mcp-server) driven by Copilot Chat. This repo holds:

| File | What it is |
| ---- | ---------- |
| [BUILD.md](BUILD.md) | **Start here on the home PC.** Master playbook: phase-by-phase build order, API shapes, error handling, sanity checks. |
| [SETUP.md](SETUP.md) | One-time setup: create Notion integration, share parent page, configure MCP in VS Code. |
| [WORKSPACE-DESIGN.md](WORKSPACE-DESIGN.md) | Authoritative schema — every database's properties, options, and relations. |
| [design/00-conventions.md](design/00-conventions.md) | Icons, statuses, priority vocab, reusable formula library, view patterns. Read before any area file. |
| [design/01-trading.md](design/01-trading.md) | 🧭 Trading — extra properties, views, templates, seed rows. |
| [design/02-salesforce.md](design/02-salesforce.md) | ☁️ Salesforce Career — extra properties, views, templates, seed rows. |
| [design/03-cloud101.md](design/03-cloud101.md) | 🎓 Cloud101 Business — extra properties, views, templates, seed rows. |
| [design/04-personal.md](design/04-personal.md) | 🧘 Personal — extra properties, views, templates, seed rows (largest area). |
| [design/05-home-dashboard.md](design/05-home-dashboard.md) | 🏠 Home dashboard — linked-view layout, built last. |
| [.github/agents/git-push.agent.md](.github/agents/git-push.agent.md) | Custom Copilot agent used from the office PC to commit + push design changes. |
| `notion-manifest.json` | *(created after first successful build; gitignored)* Maps `areaKey/dbKey` → Notion page/database IDs so future runs can address them by name. |

## Current status

Phase 0 (Notion integration + parent page) is complete. Phase 0 MCP install was attempted on an office PC where the corporate network resets TLS to `api.notion.com`, so live-build via MCP from that machine is not possible.

Design docs for **all four areas + Home dashboard + master build playbook** are now complete in this repo — the home-PC agent has everything it needs.

**Resume path** (on home PC):
1. Repeat Step 3 of [SETUP.md](SETUP.md) to install the Notion MCP server.
2. `git pull` this repo.
3. Start a fresh Copilot Chat conversation.
4. Ask it: *"Read `BUILD.md` and build the PLOS — Second Brain workspace. Stop between phases and wait for my go."*

## Role

- **Scaffold once, then use Notion natively.** The PLOS Next.js app stays as-is; nothing syncs between them.
- **Empty databases at first.** No importer from Postgres; fill in as you go.
- **Personal Notion account only.** Never share the integration with a company-owned workspace.
