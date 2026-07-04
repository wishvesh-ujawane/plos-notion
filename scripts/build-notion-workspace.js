#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { Client } = require('@notionhq/client')

const SCHEMA_DIR = path.resolve(__dirname, '..', 'schema')
const MANIFEST_PATH = path.resolve(__dirname, '..', 'notion-manifest.json')

async function main() {
  const token = process.env.NOTION_TOKEN
  const dry = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'

  if (!dry && !token) {
    console.error('Please set NOTION_TOKEN in your environment or use DRY_RUN=1.')
    process.exit(1)
  }

  const notion = dry ? null : new Client({ auth: token })

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Could not find notion-manifest.json. Aborting.')
    process.exit(1)
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
  const parentPageId = manifest.parent && (manifest.parent.pageId || manifest.parent.page_id) ||
    (manifest.parent_page && manifest.parent_page.id)
  if (!parentPageId) {
    console.error('Parent page ID missing in manifest. Aborting.')
    process.exit(1)
  }

  const schemas = loadSchemas()

  for (const schema of schemas) {
    const areaKey = schema.areaKey
    console.log(`\n---\nProcessing area: ${areaKey}`)
    let area = manifest.areas && manifest.areas[areaKey]
    if (!area) {
      area = { pageId: null, page_id: null, databases: {} }
      manifest.areas = manifest.areas || {}
      manifest.areas[areaKey] = area
    }

    if (!area.pageId && area.page_id) {
      area.pageId = area.page_id
    }

    if (!area.pageId) {
      console.log(`Creating area page ${schema.pageTitle}`)
      if (!dry) {
        const res = await notion.pages.create({
          parent: { type: 'page_id', page_id: parentPageId },
          icon: { type: 'emoji', emoji: schema.pageIcon },
          properties: { title: [{ type: 'text', text: { content: schema.pageTitle } }] }
        })
        area.pageId = res.id
      }
      console.log(`Area page ready: ${area.pageId || '<dry-run>'}`)
    } else {
      console.log(`Area page exists: ${area.pageId}`)
    }

    for (const [dbKey, dbSpec] of Object.entries(schema.databases || {})) {
      if (area.databases[dbKey] && area.databases[dbKey].id) {
        console.log(`Database exists: ${dbKey} (${area.databases[dbKey].id})`)
        continue
      }

      const props = buildNotionProperties(dbSpec.properties)
      console.log(`Creating database ${dbSpec.title} under ${schema.pageTitle}`)
      if (!dry) {
        const res = await notion.databases.create({
          parent: { type: 'page_id', page_id: area.pageId },
          icon: { type: 'emoji', emoji: dbSpec.icon || '📄' },
          title: [{ type: 'text', text: { content: dbSpec.title } }],
          properties: props
        })
        area.databases[dbKey] = { id: res.id, data_source_id: res.data_source_id || null }
      } else {
        area.databases[dbKey] = { id: null, data_source_id: null }
      }
      saveManifest(manifest)
      console.log(`Created ${dbKey} ${area.databases[dbKey].id || '<dry-run>'}`)
    }

    if (!dry) {
      await ensureRelationProperties(notion, area, schema)
      if (schema.areaKey === 'home') {
        await buildHomeDashboard(notion, manifest, area, schema)
      }
    } else if (schema.areaKey === 'home') {
      console.log('Dry run: home dashboard would be created after live build.')
    }

    saveManifest(manifest)
  }

  console.log('\nBuild process complete.')
}

function loadSchemas() {
  return fs.readdirSync(SCHEMA_DIR)
    .filter(name => name.endsWith('.json'))
    .map(name => JSON.parse(fs.readFileSync(path.join(SCHEMA_DIR, name), 'utf8')))
}

function buildNotionProperties(spec) {
  const props = {}
  for (const [name, config] of Object.entries(spec || {})) {
    if (!config || config.type === 'relation') continue
    switch (config.type) {
      case 'title': props[name] = { title: {} }; break
      case 'rich_text': props[name] = { rich_text: {} }; break
      case 'number': props[name] = { number: { format: config.format || 'number' } }; break
      case 'select': props[name] = { select: { options: (config.options || []).map(name => ({ name })) } }; break
      case 'multi_select': props[name] = { multi_select: { options: (config.options || []).map(name => ({ name })) } }; break
      case 'date': props[name] = { date: {} }; break
      case 'url': props[name] = { url: {} }; break
      case 'email': props[name] = { email: {} }; break
      case 'phone_number': props[name] = { phone_number: {} }; break
      case 'checkbox': props[name] = { checkbox: {} }; break
      case 'files': props[name] = { files: {} }; break
      case 'formula': props[name] = { formula: { expression: config.formula || '' } }; break
      default: props[name] = { rich_text: {} }
    }
  }
  return props
}

function extractRelationSpecs(schema) {
  const relations = []
  for (const [dbKey, dbSpec] of Object.entries(schema.databases || {})) {
    for (const [propName, config] of Object.entries(dbSpec.properties || {})) {
      if (config.type === 'relation') {
        relations.push({
          dbKey,
          propName,
          targetDbKey: config.databaseKey,
          syncedName: config.syncedName
        })
      }
    }
  }
  return relations
}

async function ensureRelationProperties(notion, area, schema) {
  const relations = extractRelationSpecs(schema)
  for (const relation of relations) {
    const db = area.databases[relation.dbKey]
    const targetDb = area.databases[relation.targetDbKey]
    if (!db || !db.id) {
      console.warn('skip relation — missing source database', relation.dbKey)
      continue
    }
    if (!targetDb || !targetDb.id) {
      console.warn('skip relation — missing target database', relation.targetDbKey)
      continue
    }

    console.log(`Ensuring relation ${relation.propName} on ${relation.dbKey} -> ${relation.targetDbKey}`)
    await notion.databases.update({
      database_id: db.id,
      properties: {
        [relation.propName]: {
          relation: {
            database_id: targetDb.id,
            type: 'dual_property',
            dual_property: {}
          }
        }
      }
    })
  }
}

async function buildHomeDashboard(notion, manifest, area, schema) {
  const config = schema.dashboardConfig
  if (!config) return
  if (area.dashboardCreated) {
    console.log('Home dashboard already exists.')
    return
  }

  const blocks = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: 'Home Dashboard' } }] }
    },
    {
      object: 'block',
      type: 'paragraph',
      paragraph: { rich_text: [{ type: 'text', text: { content: 'Quick access to your core workspaces and boards.' } }] }
    }
  ]

  if (config.areaPages?.length) {
    blocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: 'Areas' } }] }
    })
    for (const areaKey of config.areaPages) {
      const target = manifest.areas && manifest.areas[areaKey]
      if (target && target.pageId) {
        blocks.push({
          object: 'block',
          type: 'link_to_page',
          link_to_page: { type: 'page_id', page_id: target.pageId }
        })
      } else {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ type: 'text', text: { content: `${areaKey} page not created yet.` } }] }
        })
      }
    }
  }

  if (config.databasePages?.length) {
    blocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: { rich_text: [{ type: 'text', text: { content: 'Databases' } }] }
    })
    for (const dbPath of config.databasePages) {
      const [areaKey, dbKey] = dbPath.split('.')
      const target = manifest.areas && manifest.areas[areaKey] && manifest.areas[areaKey].databases && manifest.areas[areaKey].databases[dbKey]
      if (target && target.id) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'mention',
                mention: { database: { id: target.id } }
              }
            ]
          }
        })
      } else {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: [{ type: 'text', text: { content: `${dbPath} database not created yet.` } }] }
        })
      }
    }
  }

  console.log('Creating home dashboard blocks')
  await notion.blocks.children.append({
    block_id: area.pageId,
    children: blocks
  })
  area.dashboardCreated = true
  saveManifest(manifest)
  console.log('Home dashboard created.')
}

function saveManifest(manifest) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
