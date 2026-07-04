#!/usr/bin/env node
const { Client } = require('@notionhq/client')
const fs = require('fs')
const path = require('path')

async function main(){
  const token = process.env.NOTION_TOKEN
  if(!token){
    console.error('Please set NOTION_TOKEN in your environment and rerun.')
    process.exit(1)
  }
  const notion = new Client({ auth: token })

  const manifestPath = path.resolve(__dirname, '..', 'notion-manifest.json')
  if (!fs.existsSync(manifestPath)){
    console.error('manifest not found at', manifestPath)
    process.exit(1)
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath,'utf8'))
  const tradingPageId = manifest.areas && manifest.areas.trading && manifest.areas.trading.page_id
  if(!tradingPageId){
    console.error('trading.page_id not found in manifest')
    process.exit(1)
  }

  const schemaPath = path.resolve(__dirname, '..', 'schema', 'trading.json')
  const schema = JSON.parse(fs.readFileSync(schemaPath,'utf8'))

  const dry = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'

  for(const [dbKey, dbSpec] of Object.entries(schema.databases)){
    console.log('Preparing DB:', dbKey)
    const properties = buildNotionProperties(dbSpec.properties)
    if(dry){
      console.log('DRY RUN - would create database with:', dbSpec.title, properties)
      continue
    }
    try{
      const res = await notion.databases.create({
        parent: { type: 'page_id', page_id: tradingPageId },
        title: [{ type: 'text', text: { content: dbSpec.title } }],
        properties
      })
      console.log('Created DB', dbKey, res.id)
    }catch(err){
      console.error('Failed to create', dbKey, err.message || err)
    }
  }
}

function buildNotionProperties(spec){
  const props = {}
  for(const [name, p] of Object.entries(spec)){
    switch(p.type){
      case 'title':
        props[name] = { title: {} }
        break
      case 'rich_text':
        props[name] = { rich_text: {} }
        break
      case 'number':
        props[name] = { number: { format: 'number' } }
        break
      case 'select':
        props[name] = { select: { options: (p.options||[]).map(o=>({ name: o })) } }
        break
      case 'multi_select':
        props[name] = { multi_select: { options: (p.options||[]).map(o=>({ name: o })) } }
        break
      case 'date':
        props[name] = { date: {} }
        break
      case 'formula':
        props[name] = { formula: { expression: p.formula } }
        break
      case 'files':
        props[name] = { files: {} }
        break
      default:
        props[name] = { rich_text: {} }
    }
  }
  return props
}

main()
