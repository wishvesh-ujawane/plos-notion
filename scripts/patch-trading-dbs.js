#!/usr/bin/env node
const { Client } = require('@notionhq/client')
const fs = require('fs')
const path = require('path')

async function main() {
  const dry = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'
  const token = process.env.NOTION_TOKEN
  if (!token && !dry) {
    console.error('Please set NOTION_TOKEN in your environment and rerun.')
    process.exit(1)
  }

  const notion = dry ? null : new Client({ auth: token })

  const manifestPath = path.resolve(__dirname, '..', 'notion-manifest.json')
  if (!fs.existsSync(manifestPath)) {
    console.error('Could not find notion-manifest.json in repo root. Aborting.')
    process.exit(1)
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const tradingArea = manifest.areas && manifest.areas.trading
  const trading = tradingArea && (tradingArea.databases || tradingArea.dbs)
  if (!trading) {
    console.error('Trading area not found in manifest. Aborting.')
    process.exit(1)
  }

  const ids = {
    trades: trading.trades && trading.trades.id,
    strategies: trading.strategies && trading.strategies.id,
    trading_journal: trading.trading_journal && trading.trading_journal.id,
    trading_tasks: trading.trading_tasks && trading.trading_tasks.id,
    watchlist: trading.watchlist && trading.watchlist.id,
  }

  console.log('IDs loaded:', ids)
  if (dry) {
    console.log('DRY RUN - would rename title properties and add Trades.Strategy relation.')
    return
  }

  try {
    await renameTitle(notion, ids.trades, 'Instrument')
    await renameTitle(notion, ids.trading_journal, 'Date')
    await renameTitle(notion, ids.trading_tasks, 'Title')
    await renameTitle(notion, ids.watchlist, 'Ticker')

    // Add one dual relation. Notion creates the synced reverse property.
    await addRelation(notion, ids.trades, 'Strategy', ids.strategies, 'Trades')

    console.log('Done.')
  } catch (err) {
    console.error('Error:', err)
    process.exit(2)
  }
}

async function renameTitle(notion, dbId, newTitleName) {
  if (!dbId) {
    console.warn('skip rename — missing dbId for', newTitleName)
    return
  }
  console.log(`Retrieving database ${dbId} to rename title -> ${newTitleName}`)
  const db = await notion.databases.retrieve({ database_id: dbId })
  const titleKey = Object.keys(db.properties).find(k => db.properties[k].type === 'title')
  if (!titleKey) {
    console.warn('No title property found for', dbId)
    return
  }
  if (titleKey === newTitleName) {
    console.log('Title property already named', newTitleName)
    return
  }
  const payload = {
    database_id: dbId,
    properties: {
      [titleKey]: { name: newTitleName }
    }
  }
  console.log('Patching database', dbId, 'property', titleKey, '=>', newTitleName)
  const res = await notion.databases.update(payload)
  console.log('Patched:', res.id)
}

async function addRelation(notion, dbId, propName, targetDbId, syncedName) {
  if (!dbId || !targetDbId) {
    console.warn('skip addRelation — missing ids', { dbId, targetDbId })
    return
  }
  console.log(`Adding relation ${propName} on ${dbId} -> ${targetDbId} (reverse: ${syncedName})`)
  const payload = {
    database_id: dbId,
    properties: {
      [propName]: {
        relation: {
          database_id: targetDbId,
          type: 'dual_property',
          dual_property: {}
        }
      }
    }
  }
  const res = await notion.databases.update(payload)
  console.log('Relation added/updated on', res.id, `(reverse property may need manual rename to "${syncedName}")`)
}

main()
