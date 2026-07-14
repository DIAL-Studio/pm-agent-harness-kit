import { Command } from 'commander'
import { resolve, join, dirname, extname } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:http'
import { PmAhkDB } from './core/db'
import { startMcpServer } from './core/mcp-server'

const VERSION = '2.2.0'

const __dirname = dirname(fileURLToPath(import.meta.url))

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

program
  .command('dashboard')
  .description('Start the dashboard web server')
  .option('--port <port>', 'HTTP port', '3000')
  .option('--db <path>', 'Path to the SQLite database')
  .option('--no-open', 'Do not open browser')
  .action(async (opts) => {
    const dbPath = opts.db ?? resolve(process.cwd(), '.harness', 'harness.db')
    const port = parseInt(opts.port, 10)
    const db = new PmAhkDB(dbPath)
    // Try multiple possible dashboard locations
    const candidates = [
      resolve(__dirname, '..', '..', '..', 'dashboard', 'dist'),        // repo: tpm-tools/scripts/pm-ahk/dist -> ../../../
      resolve(__dirname, '..', '..', 'dashboard', 'dist'),              // repo: tpm-tools/scripts/pm-ahk/dist -> ../../
      resolve(__dirname, '..', '..', 'pm-ahk-dashboard'),               // installed: ~/.config/opencode/pm-ahk/dist -> ../pm-ahk-dashboard
    ]
    const staticDir = candidates.find((d) => existsSync(join(d, 'index.html')))
    if (!staticDir) {
      console.error('Dashboard not found. Run: bash install.sh --with-mcp')
      process.exit(1)
    }

    const MIME: Record<string, string> = {
      '.html': 'text/html; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.json': 'application/json; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.png': 'image/png',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf',
    }

    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', `http://${req.headers.host}`)
      const path = url.pathname

      // ── API: /api/overview ──────────────────────────────────────────────────
      if (path === '/api/overview') {
        const initiatives = db.listInitiatives()
        const statusCounts: Record<string, number> = {
          discovery: 0, strategy: 0, spec: 0, review: 0,
          approved: 0, blocked: 0, done: 0,
        }
        for (const i of initiatives) {
          if (i.status in statusCounts) statusCounts[i.status]++
        }
        const recentActions = db.listInitiatives().slice(0, 10).flatMap((i) =>
          db.getActionsForInitiative(i.id).slice(0, 5).map((a) => ({
            agent: a.agent, action_type: a.action_type,
            title: i.title, created_at: a.created_at,
          }))
        )
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ...statusCounts, recent_actions: recentActions.slice(0, 10) }))
        return
      }

      // ── API: /api/initiatives ────────────────────────────────────────────────
      if (path === '/api/initiatives') {
        const status = url.searchParams.get('status') ?? undefined
        const initiatives = db.listInitiatives(status)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(initiatives))
        return
      }

      // ── API: /api/initiatives/:id ─────────────────────────────────────────────
      const detailMatch = path.match(/^\/api\/initiatives\/(\d+)$/)
      if (detailMatch) {
        const id = parseInt(detailMatch[1], 10)
        const initiative = db.getInitiative(id)
        if (!initiative) {
          res.writeHead(404)
          res.end('Not found')
          return
        }
        const actions = db.getActionsForInitiative(id)
        const criteria = db.listCriteria(id)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ initiative, actions, criteria }))
        return
      }

      // ── API: /api/agents ──────────────────────────────────────────────────────
      if (path === '/api/agents') {
        const initiatives = db.listInitiatives()
        const agentMap = new Map<string, { total_actions: number; initiatives_count: number }>()
        for (const i of initiatives) {
          const actions = db.getActionsForInitiative(i.id)
          for (const a of actions) {
            const entry = agentMap.get(a.agent) ?? { total_actions: 0, initiatives_count: 0 }
            entry.total_actions++
            agentMap.set(a.agent, entry)
          }
          if (actions.length > 0) {
            const seen = new Set<string>()
            for (const a of actions) {
              if (!seen.has(a.agent)) {
                seen.add(a.agent)
                const entry = agentMap.get(a.agent)!
                entry.initiatives_count++
              }
            }
          }
        }
        const agents = Array.from(agentMap.entries()).map(([agent, stats]) => ({
          agent, total_actions: stats.total_actions, initiatives_count: stats.initiatives_count,
        }))
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(agents))
        return
      }

      // ── Static SPA ──────────────────────────────────────────────────────────
      const filePath = path === '/' ? join(staticDir, 'index.html') : join(staticDir, path)
      if (existsSync(filePath)) {
        const ext = extname(filePath)
        res.writeHead(200, { 'Content-Type': MIME[ext] ?? 'application/octet-stream' })
        res.end(readFileSync(filePath))
        return
      }
      // SPA fallback
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end(readFileSync(join(staticDir, 'index.html')))
    })

    server.listen(port, () => {
      const url = `http://localhost:${port}`
      console.log(`Dashboard: ${url}`)
      if (opts.open !== false) {
        import('node:child_process').then((cp) => {
          cp.exec(`open "${url}"`)
        })
      }
    })
  })

program.parse(process.argv)
