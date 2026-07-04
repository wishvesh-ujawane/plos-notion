#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { Client } = require('@notionhq/client')

const SCHEMA_DIR = path.resolve(__dirname, '..', 'schema')
const MANIFEST_PATH = path.resolve(__dirname, '..', 'notion-manifest.json')

const seedData = {
  trading: {
    strategies: [
      { Name: 'ORB 15-min', Type: 'Intraday', Status: 'Active', Rules: 'Break of first 15-min range, RR 1:2', 'Entry Criteria': 'Buy above opening range', 'Exit Criteria': 'Target 2R, or first 15-min close', 'Risk Management': 'Stop loss 1R' },
      { Name: 'Weekly Trend Pullback', Type: 'Swing', Status: 'Active', Rules: 'Buy pullbacks in stocks above the 50-DMA', 'Entry Criteria': 'Pullback to support within trend', 'Exit Criteria': 'Trend break or target', 'Risk Management': 'Fixed risk per trade' },
      { Name: 'Earnings Momentum', Type: 'Swing', Status: 'Paused', Rules: 'Enter on gap-up after beat', 'Entry Criteria': 'High volume, strength on open', 'Exit Criteria': 'Trailing stop or gap fill', 'Risk Management': 'Reduce size after earnings' }
    ],
    trades: [
      { Instrument: 'RELIANCE', Direction: 'LONG', Status: 'Closed', 'Entry Date': '2026-06-15', 'Entry Price': 2820, 'Exit Date': '2026-06-19', 'Exit Price': 2895, Size: 20, Setup: 'Breakout', Notes: 'Held through consolidation; kept size moderate.', Strategy: 'Weekly Trend Pullback' },
      { Instrument: 'BANKNIFTY', Direction: 'SHORT', Status: 'Closed', 'Entry Date': '2026-06-24', 'Entry Price': 51200, 'Exit Date': '2026-06-24', 'Exit Price': 51050, Size: 15, Setup: 'Reversal', Notes: 'Quick scalp after range rejection.', Strategy: 'ORB 15-min' },
      { Instrument: 'INFY', Direction: 'LONG', Status: 'Open', 'Entry Date': '2026-07-01', 'Entry Price': 1690, Size: 30, Setup: 'Trend', Notes: 'Holding for earnings continuation.', Strategy: 'Weekly Trend Pullback' }
    ],
    trading_journal: [
      { Date: '2026-06-15', 'Market Conditions': 'Bullish', Mood: '4', Lessons: 'Held winner instead of scaling out early' },
      { Date: '2026-06-24', 'Market Conditions': 'Volatile', Mood: '2', Lessons: 'Revenge-traded after morning stop' },
      { Date: '2026-07-01', 'Market Conditions': 'Rangebound', Mood: '3', Lessons: 'Waited for setup; no forced trades' }
    ],
    trading_tasks: [
      { Title: 'Backtest ORB on Bank Nifty (30d)', Status: 'Todo', Priority: 'P2', Type: 'Backtest', Due: '2026-07-10', Notes: 'Confirm edge and sample size.' },
      { Title: 'Weekly journal review', Status: 'Todo', Priority: 'P1', Type: 'Journal Review', Due: '2026-07-05', Notes: 'Capture lessons and plan next week.' },
      { Title: 'Set up TradingView alerts for pullbacks', Status: 'Doing', Priority: 'P3', Type: 'Setup', Due: '2026-07-07', Notes: 'Alerts for 50-DMA bounce and trend confirmation.' }
    ],
    watchlist: [
      { Ticker: 'HDFCBANK', Sector: 'Finance', Status: 'Watching', 'Target Price': 1720, 'Stop Loss': 1610 },
      { Ticker: 'TCS', Sector: 'Tech', Status: 'Watching', 'Target Price': 4200, 'Stop Loss': 3950 },
      { Ticker: 'ADANIENT', Sector: 'Industrials', Status: 'Skipped' }
    ]
  },
  salesforce: {
    learning_sf: [
      { Title: 'Apex Specialist Superbadge', Type: 'Trailhead', Status: 'Active', Provider: 'Trailhead', 'Progress %': 40 },
      { Title: 'Salesforce Certified Administrator', Type: 'Certification', Status: 'Completed', Provider: 'Salesforce', 'Progress %': 100 },
      { Title: 'LWC Fundamentals Course', Type: 'Course', Status: 'Active', Provider: 'Focus on Force', 'Progress %': 65 }
    ],
    certifications: [
      { 'Cert Name': 'Salesforce Certified Administrator', Status: 'Passed', 'Exam Date': '2025-11-20', Score: 78, Notes: 'Strength in declarative automation.' },
      { 'Cert Name': 'Platform Developer I', Status: 'Studying', 'Exam Date': '2026-08-15', Notes: 'Focus on Apex and data modelling.' },
      { 'Cert Name': 'Platform App Builder', Status: 'Planned' }
    ],
    sf_projects: [
      { Title: 'Cohort Management App', Type: 'Portfolio', Status: 'In Progress', Tech: ['Apex', 'LWC', 'Flow'], Description: 'Manage training cohort intake and progress.', Started: '2026-06-01' },
      { Title: 'PLOS integration prototype', Type: 'Personal', Status: 'Backlog', Tech: ['Integration', 'Apex'], Description: 'Prototype data sync for PLOS workflow.' },
      { Title: 'Superbadge — Business Admin', Type: 'Trailhead Superbadge', Status: 'Done', Tech: ['Flow', 'Reports'], Description: 'Completed business admin requirements.' }
    ],
    career_pipeline: [
      { Company: 'Deloitte', Role: 'SF Consultant', Stage: 'Screen', 'Applied Date': '2026-06-22', 'Next Step': 'Recruiter call', 'Next Step Date': '2026-07-05', Source: 'Referral' },
      { Company: 'Salesforce', Role: 'Associate SE', Stage: 'Applied', 'Applied Date': '2026-06-30', 'Next Step': 'Wait 5 business days', 'Next Step Date': '2026-07-08', Source: 'Company Site' },
      { Company: 'ThoughtSpot', Role: 'SF Admin (contract)', Stage: 'Prospecting', 'Next Step': 'Cold outreach to hiring mgr', 'Next Step Date': '2026-07-04', Source: 'LinkedIn' }
    ],
    career_tasks: [
      { Title: 'Rehearse interview stories', Type: 'Interview Prep', Status: 'Todo', Priority: 'P1', Due: '2026-07-04', Notes: 'Practice STAR stories for product and dev questions.' },
      { Title: 'Publish portfolio project #1', Type: 'Portfolio', Status: 'Doing', Priority: 'P2', Due: '2026-07-10', Notes: 'Add GitHub repo and demo notes.' },
      { Title: 'Weekly LinkedIn engagement', Type: 'Networking', Status: 'Todo', Priority: 'P3', Due: '2026-07-07', Notes: 'Comment on 5 relevant posts.' }
    ]
  },
  cloud101: {
    cohorts: [
      { 'Batch Name': 'SF-ADMIN-2026-05', Track: 'SF Admin', Status: 'Live', 'Start Date': '2026-05-04', 'End Date': '2026-07-27' },
      { 'Batch Name': 'SF-DEV-2026-08', Track: 'SF Dev', Status: 'Planning', 'Start Date': '2026-08-10', 'End Date': '2026-11-02' },
      { 'Batch Name': 'SF-COMBO-2026-03', Track: 'Combined', Status: 'Completed', 'Start Date': '2026-03-02', 'End Date': '2026-05-25' }
    ],
    students: [
      { Name: 'Ananya Rao', Email: 'ananya.rao@example.com', Status: 'Active', 'Enrolled Date': '2026-05-04', 'Payment Status': 'Paid', 'Progress %': 55 },
      { Name: 'Rahul Iyer', Email: 'rahul.iyer@example.com', Status: 'Active', 'Enrolled Date': '2026-05-04', 'Payment Status': 'Partial', 'Progress %': 20 },
      { Name: 'Priya Menon', Email: 'priya.menon@example.com', Status: 'Completed', 'Enrolled Date': '2026-03-02', 'Payment Status': 'Paid', 'Progress %': 100 }
    ],
    curriculum: [
      { 'Module Title': 'Data Model 101', Track: 'Both', 'Duration (min)': 90, Order: 1, Status: 'Ready' },
      { 'Module Title': 'Flow Automation Basics', Track: 'SF Admin', 'Duration (min)': 120, Order: 2, Status: 'Ready' },
      { 'Module Title': 'Apex Fundamentals', Track: 'SF Dev', 'Duration (min)': 120, Order: 3, Status: 'Delivered' }
    ],
    sessions: [
      { 'Session Title': 'Kickoff & Data Model', Date: '2026-05-04', 'Delivered By': 'Both', Attendance: 18, 'Duration (min)': 90, Notes: 'Introduced data model fundamentals.' },
      { 'Session Title': 'Flow Deep-dive', Date: '2026-05-11', 'Delivered By': 'You', Attendance: 16, 'Duration (min)': 120, Notes: 'Built record-triggered automations.' },
      { 'Session Title': 'Apex Class + Trigger', Date: '2026-03-16', 'Delivered By': 'Friend', Attendance: 12, 'Duration (min)': 120, Notes: 'Reviewed test coverage and bulk patterns.' }
    ],
    business_tasks: [
      { Title: 'Publish SF-DEV-2026-08 landing page', Area: 'Marketing', Status: 'Doing', Priority: 'P1', Due: '2026-07-15', Notes: 'Include curriculum and registration link.' },
      { Title: 'Weekly LinkedIn post — student win story', Area: 'Content', Status: 'Todo', Priority: 'P2', Due: '2026-07-05', Notes: 'Share a recent cohort success.' },
      { Title: 'Reconcile May expenses', Area: 'Finance', Status: 'Todo', Priority: 'P2', Due: '2026-07-07', Notes: 'Match invoices and ad spend.' }
    ],
    cloud101_finance: [
      { Date: '2026-05-01', Description: 'Ananya Rao — full fee', Kind: 'Revenue', Amount: 25000, Category: 'Fees', Note: 'SF-ADMIN-2026-05' },
      { Date: '2026-05-03', Description: 'Zoom subscription (May)', Kind: 'Expense', Amount: 1500, Category: 'Tools', Note: 'SF-ADMIN-2026-05' },
      { Date: '2026-05-06', Description: 'LinkedIn ads — SF-DEV cohort', Kind: 'Expense', Amount: 4000, Category: 'Ads', Note: 'SF-DEV-2026-08' }
    ]
  },
  personal: {
    projects: [
      { Title: 'PLOS second brain (this workspace)', Type: 'Personal', Status: 'Active', Emoji: '🧠', Color: 'Blue', Notes: 'Meta-project: build & maintain it' },
      { Title: 'Home renovation — kitchen', Type: 'Personal', Status: 'Paused', Emoji: '🔨', Color: 'Orange', Notes: 'Waiting on contractor quotes' },
      { Title: 'Weekend blog restart', Type: 'Personal', Status: 'Active', Emoji: '✍️', Color: 'Green', Notes: '1 post/month minimum' }
    ],
    tasks: [
      { Title: 'Book dentist appointment', Status: 'Todo', Priority: 'P2', Due: '2026-07-08', Today: false, Notes: '' },
      { Title: 'Draft blog post #1', Status: 'Doing', Priority: 'P2', Due: '2026-07-15', Today: true, Notes: 'Outline and first draft.' },
      { Title: 'Weekly grocery run', Status: 'Todo', Priority: 'P3', Due: '2026-07-05', Today: false, Notes: '' }
    ],
    habits: [
      { Title: 'Meditation 10 min', Ritual: 'Morning', Active: true },
      { Title: '30-min walk', Ritual: 'Morning', Active: true },
      { Title: 'Read 20 pages', Ritual: 'Evening', Active: true }
    ],
    habit_logs: [
      { Date: '2026-07-01', Completed: true, Note: '' },
      { Date: '2026-07-02', Completed: false, Note: 'Rain' },
      { Date: '2026-07-03', Completed: true, Note: '' }
    ],
    goals: [
      { Title: 'Pass PD1 certification', Category: 'Career', Horizon: 'Short', 'Target Date': '2026-08-15', 'Progress %': 40, Status: 'Active' },
      { Title: 'Run first half-marathon', Category: 'Health', Horizon: 'Medium', 'Target Date': '2026-11-30', 'Progress %': 25, Status: 'Active' },
      { Title: 'Read 24 books in 2026', Category: 'Learning', Horizon: 'Long', 'Target Date': '2026-12-31', 'Progress %': 65, Status: 'Active' }
    ],
    daily_plan: [
      { Date: '2026-07-01', 'Work Mode': 'WFO', 'Top Priorities': 'Cohort ops, PD1 study, journal', 'Morning Note': '', 'Evening Note': '' },
      { Date: '2026-07-02', 'Work Mode': 'WFH', 'Top Priorities': 'Deep work on portfolio project', 'Morning Note': '', 'Evening Note': '' }
    ],
    time_blocks: [
      { Title: 'Morning ritual', Date: '2026-07-03', 'Start Time': '06:00', 'End Time': '07:30', Kind: 'Ritual', Locked: true },
      { Title: 'PLOS build session', Date: '2026-07-03', 'Start Time': '09:00', 'End Time': '11:00', Kind: 'Deep Work', Locked: true }
    ],
    journal: [
      { Date: '2026-07-01', Mood: '4', Tags: ['wins', 'focus'] },
      { Date: '2026-07-02', Mood: '3', Tags: ['tired', 'admin'] }
    ],
    health_logs: [
      { Date: '2026-07-01', Type: 'Sleep', Value: 7, Unit: 'hr', Note: '' },
      { Date: '2026-07-01', Type: 'Steps', Value: 8200, Unit: 'steps', Note: '' }
    ]
  }
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Could not find notion-manifest.json. Aborting.')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
}

function loadSchema(areaKey) {
  const schemaPath = path.resolve(SCHEMA_DIR, `${areaKey}.json`)
  if (!fs.existsSync(schemaPath)) return null
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
}

function getTitleProp(schema) {
  return Object.entries(schema.databases || {}).find(([, db]) =>
    Object.values(db.properties || {}).some(prop => prop.type === 'title')
  )
}

function formatProperty(config, value, createdRecords, areaKey) {
  if (value === undefined || value === null || value === '') return null
  switch (config.type) {
    case 'title':
      return { title: [{ type: 'text', text: { content: String(value) } }] }
    case 'rich_text':
      return { rich_text: [{ type: 'text', text: { content: String(value) } }] }
    case 'number':
      return { number: Number(value) }
    case 'select':
      return { select: { name: String(value) } }
    case 'multi_select':
      return {
        multi_select: Array.isArray(value)
          ? value.map(item => ({ name: String(item) }))
          : [{ name: String(value) }]
      }
    case 'date':
      return { date: { start: String(value) } }
    case 'url':
      return { url: String(value) }
    case 'email':
      return { email: String(value) }
    case 'phone_number':
      return { phone_number: String(value) }
    case 'checkbox':
      return { checkbox: value === true || value === '✓' || value === 'yes' || value === 'Yes' }
    case 'relation': {
      if (!config.databaseKey) return null
      const targetName = String(value)
      const targetId = createdRecords[areaKey] && createdRecords[areaKey][config.databaseKey] && createdRecords[areaKey][config.databaseKey][targetName]
      if (!targetId) {
        console.warn(`Missing relation target for ${config.databaseKey} value ${targetName} in area ${areaKey}`)
        return null
      }
      return { relation: [{ id: targetId }] }
    }
    default:
      return { rich_text: [{ type: 'text', text: { content: String(value) } }] }
  }
}

async function seedDatabase(notion, areaKey, dbKey, rows, schema, createdRecords, dry) {
  const areaManifest = manifest.areas && manifest.areas[areaKey]
  if (!areaManifest || !areaManifest.databases || !areaManifest.databases[dbKey] || !areaManifest.databases[dbKey].id) {
    console.warn(`Skipping ${areaKey}.${dbKey} because the database is missing from manifest.`)
    return
  }

  const databaseId = areaManifest.databases[dbKey].id
  const dbSchema = schema.databases[dbKey]
  if (!dbSchema) {
    console.warn(`Skipping ${areaKey}.${dbKey}: schema missing for database.`)
    return
  }

  const titlePropKey = Object.keys(dbSchema.properties).find(key => dbSchema.properties[key].type === 'title')
  if (!titlePropKey) {
    console.warn(`Skipping ${areaKey}.${dbKey}: no title property in schema.`)
    return
  }

  for (const row of rows) {
    const properties = {}
    for (const [propName, config] of Object.entries(dbSchema.properties || {})) {
      const value = row[propName]
      const formatted = formatProperty(config, value, createdRecords, areaKey)
      if (formatted) {
        properties[propName] = formatted
      }
    }

    if (dry) {
      console.log(`[dry-run] create ${areaKey}.${dbKey}`, JSON.stringify(row))
      continue
    }

    const created = await notion.pages.create({
      parent: { database_id: databaseId },
      properties
    })

    const titleValue = String(row[titlePropKey] || created.id)
    createdRecords[areaKey] = createdRecords[areaKey] || {}
    createdRecords[areaKey][dbKey] = createdRecords[areaKey][dbKey] || {}
    createdRecords[areaKey][dbKey][titleValue] = created.id
    console.log(`Created row in ${areaKey}.${dbKey}: ${titleValue}`)
  }
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('Could not find notion-manifest.json. Aborting.')
    process.exit(1)
  }
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
}

function loadSchema(areaKey) {
  const schemaPath = path.resolve(SCHEMA_DIR, `${areaKey}.json`)
  if (!fs.existsSync(schemaPath)) return null
  return JSON.parse(fs.readFileSync(schemaPath, 'utf8'))
}

const token = process.env.NOTION_TOKEN
const dry = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true'
if (!dry && !token) {
  console.error('Please set NOTION_TOKEN in your environment or use DRY_RUN=1.')
  process.exit(1)
}

const notion = dry ? null : new Client({ auth: token })
const manifest = loadManifest()

;(async () => {
  const createdRecords = {}

  for (const [areaKey, dbRows] of Object.entries(seedData)) {
    const schema = loadSchema(areaKey)
    if (!schema) {
      console.warn(`No schema found for area ${areaKey}; skipping.`)
      continue
    }

    for (const [dbKey, rows] of Object.entries(dbRows)) {
      console.log(`\nSeeding ${areaKey}.${dbKey} (${rows.length} rows)`)
      await seedDatabase(notion, areaKey, dbKey, rows, schema, createdRecords, dry)
    }
  }

  console.log('\nSeed process complete.')
})().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
