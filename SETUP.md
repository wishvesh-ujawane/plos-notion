# Setup — Notion + MCP for `plos-notion`

One-time setup so Copilot Chat can build and edit the Notion workspace directly. Roughly ~10 minutes end-to-end.

## Prerequisites

- **Node.js** installed (`node -v` returns something). Any recent LTS works.
- **VS Code** with GitHub Copilot Chat.
- A **personal Notion account** (do **not** use a company-owned Notion workspace).
- Network path to `api.notion.com`. Corporate networks with TLS-inspection proxies often block this — see the *Network check* section below before Step 3.

## Step 1 — Create the Notion integration (~2 min)

1. Sign in to Notion in the browser (personal account).
2. Open <https://www.notion.so/profile/integrations>.
3. Click **New integration**.
4. Fill in:
   - **Name**: `PLOS-Copilot`
   - **Associated workspace**: your personal workspace
   - **Type**: Internal
5. Under **Capabilities**, tick: `Read content`, `Update content`, `Insert content`. For **User capabilities**, choose *"No user information"* — we don't need it.
6. Save.
7. Go to the **Configuration** tab → copy the **Internal Integration Secret** (starts with `ntn_...`). Keep this open — you'll paste it in Step 3.

## Step 2 — Create the parent page and share it (~1 min)

1. In Notion, at your workspace root, create a new blank page titled exactly: `PLOS — Second Brain` (em dash `—`, not a hyphen).
2. On that page, click the `···` menu (top-right) → **Connect to integration** → pick **PLOS-Copilot**. Confirm.
3. (Optional) Note the page ID: it's the 32-character hex block at the end of the page URL. You don't need to type it anywhere — Copilot will find the page by title via MCP `search`.

## Step 3 — Configure the Notion MCP server in VS Code

The token stays in VS Code's **user-scoped** MCP config (not in this repo), so it isn't committed and doesn't leak into the workspace.

Important: Do **not** store the token in this repository. If you find a `NOTION_TOKEN` value inside any workspace-scoped file such as `.vscode/mcp.json`, remove it immediately and move the configuration to your **User** MCP settings (Option A above).

If you want to test the MCP server locally in PowerShell without saving the token to disk, set the environment variable for the current session and run the MCP server directly:

```powershell
$env:NOTION_TOKEN = "ntn_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
npx -y @notionhq/notion-mcp-server
```

Replace the value with the token you copied in Step 1. This sets the token only for the current PowerShell session and does not persist it to disk.

### Option A — via Command Palette (recommended)

1. `Ctrl+Shift+P` → `MCP: Add Server` → Enter.
2. Pick **npm Package**.
3. Package name: `@notionhq/notion-mcp-server`
4. Server ID / name: `notionApi`
5. Environment variables:
   - Name: `NOTION_TOKEN`
   - Value: paste the `ntn_...` token from Step 1
6. When asked for scope, pick **User** (not Workspace).

### Option B — manual JSON

`Ctrl+Shift+P` → `MCP: Open User Configuration` → add:

```json
{
  "servers": {
    "notionApi": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "ntn_PASTE_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Save. Reload VS Code (`Ctrl+Shift+P` → `Developer: Reload Window`).

## Step 4 — Verify

1. Open Copilot Chat → tool picker (wrench icon) → confirm `notionApi` appears with ~22 tools (`search`, `create-a-data-source`, `retrieve-a-database`, `update-page-markdown`, `move-page`, …). Enable them.
2. **Start a new chat** (important — MCP tools attach on new conversations).
3. Ask: *"Verify Notion MCP is working — call `get-self` and `search` for 'PLOS — Second Brain'."*
   - Expected: bot user object returned, and the parent page shows up in search results.
   - If both succeed → you're ready for the build. Ask: *"Build the Notion workspace from `plos-notion/WORKSPACE-DESIGN.md`, starting with the Trading area."*

## Network check (do this before Step 3 if you're on a corporate machine)

Run in PowerShell:

```powershell
curl.exe -sS -o NUL -w "HTTP %{http_code}  TLS %{time_appconnect}s`n" https://api.notion.com/v1/users/me
```

- `HTTP 401 · TLS > 0`  → network is fine (401 is expected without a token). Proceed to Step 3.
- `HTTP 000 · TLS 0.000000s` with curl error 35 (`Connection was reset`) → corporate TLS-inspection proxy is blocking `api.notion.com`. MCP will not work from this machine. Do the setup on a home PC, personal laptop, or GitHub Codespaces instead. The Notion setup (Steps 1 & 2) does not need to be repeated — only Step 3 on the new machine.

## Safety notes

- **Personal Notion account only.** Never `Connect to integration` on any page in a company-owned workspace.
- **Token lives in VS Code user settings.** Not in this repo, not in `.env` files. Rotating the token means regenerating it in Notion → updating the same MCP config entry.
- **Revoking access.** Delete the integration at <https://www.notion.so/profile/integrations>. All pages shared with it become inaccessible via that token immediately.
- **Corporate AUP.** Even with a personal account and no code committed, verify your company's software policy before running personal SaaS integrations on a company device.
