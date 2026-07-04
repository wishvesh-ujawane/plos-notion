Patch scripts to perform small schema fixes via Notion MCP.

Usage:

1. Ensure `NOTION_TOKEN` is set in your environment (use VS Code MCP user config or export in PowerShell):

```powershell
$env:NOTION_TOKEN = 'ntn_...'
```

2. Install deps and run:

```powershell
npm install
npm run patch:trading
```

If PowerShell blocks `npm.ps1` because script execution is disabled, use the
Windows command shim instead:

```powershell
npm.cmd install
npm.cmd run patch:trading
```

To verify the script can read the local manifest without writing to Notion:

```powershell
$env:DRY_RUN = '1'
node .\scripts\patch-trading-dbs.js
```

The script will rename title properties and add the `Strategy` relation.

Do not commit `notion-manifest.json` — it is gitignored.
