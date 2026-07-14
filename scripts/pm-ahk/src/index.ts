import { Command } from 'commander'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import { PmAhkDB } from './core/db'
import { startMcpServer } from './core/mcp-server'

const VERSION = '2.2.0'

const program = new Command()

program.name('pm-ahk').description('PM Agent Harness Kit — MCP server for PM workflows').version(VERSION)

program
  .command('serve')
  .description('Start the MCP server (stdio)')
  .option('--db <path>', 'Path to the SQLite database')
  .action(async (opts) => {
    const dbPath = opts.db ?? resolve(process.cwd(), '.harness', 'harness.db')
    process.stderr.write(`[pm-ahk] MCP server starting (stdio)\n`)
    try {
      const db = new PmAhkDB(dbPath)
      await startMcpServer(db)
    } catch (err) {
      process.stderr.write(`[pm-ahk] Fatal: ${err instanceof Error ? err.message : String(err)}\n`)
      process.exit(1)
    }
  })

program
  .command('status')
  .description('Show initiative backlog')
  .option('--db <path>', 'Path to the SQLite database')
  .option('--json', 'Output as JSON')
  .action(async (opts) => {
    const dbPath = opts.db ?? resolve(process.cwd(), '.harness', 'harness.db')
    const db = new PmAhkDB(dbPath)
    const initiatives = db.listInitiatives()
    if (opts.json) {
      console.log(JSON.stringify(initiatives, null, 2))
    } else {
      console.log('\n  PM Agent Harness Kit')
      console.log(`  ${'─'.repeat(50)}`)
      if (initiatives.length === 0) {
        console.log('  No initiatives yet.')
      } else {
        console.log(`  ${'ID'.padEnd(4)} ${'Status'.padEnd(14)} ${'Title'}`)
        console.log(`  ${'─'.repeat(4)} ${'─'.repeat(14)} ${'─'.repeat(30)}`)
        for (const i of initiatives) {
          console.log(`  ${String(i.id).padEnd(4)} ${i.status.padEnd(14)} ${i.title.slice(0, 40)}`)
        }
      }
      console.log()
    }
    db.close()
  })

program
  .command('initiative')
  .description('Manage initiatives')
  .addCommand(
    new Command('list')
      .description('List initiatives')
      .option('--db <path>')
      .option('--status <status>')
      .action(async (opts) => {
        const dbPath = opts.db ?? resolve(process.cwd(), '.harness', 'harness.db')
        const db = new PmAhkDB(dbPath)
        const initiatives = db.listInitiatives(opts.status)
        console.log(JSON.stringify(initiatives, null, 2))
        db.close()
      }),
  )
  .addCommand(
    new Command('add')
      .description('Add an initiative')
      .argument('<title>', 'Initiative title')
      .option('--db <path>')
      .action(async (title, opts) => {
        const dbPath = opts.db ?? resolve(process.cwd(), '.harness', 'harness.db')
        const db = new PmAhkDB(dbPath)
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50)
        const initiative = db.createInitiative(slug, title)
        console.log(JSON.stringify(initiative))
        db.close()
      }),
  )
  .addCommand(
    new Command('done')
      .description('Mark initiative as done')
      .argument('<id>', 'Initiative ID or slug')
      .option('--db <path>')
      .action(async (id, opts) => {
        const dbPath = opts.db ?? resolve(process.cwd(), '.harness', 'harness.db')
        const db = new PmAhkDB(dbPath)
        const idNum = parseInt(id, 10)
        if (isNaN(idNum)) {
          console.error('ID must be a number')
          process.exit(1)
        }
        db.updateInitiativeStatus(idNum, 'done')
        console.log(JSON.stringify({ id: idNum, status: 'done' }))
        db.close()
      }),
  )

program.parse(process.argv)
