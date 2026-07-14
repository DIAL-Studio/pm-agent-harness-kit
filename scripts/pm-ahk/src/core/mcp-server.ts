import { Server } from '@modelcontextprotocol/sdk/server'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  type CallToolResult,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'

import type { PmAhkDB } from './db'

const _require = createRequire(import.meta.url)

const VERSION = '2.2.0'

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'initiatives_create',
    description: 'Create a new initiative in the backlog',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Short action-oriented title' },
        slug: { type: 'string', description: 'URL-friendly slug (auto-generated if omitted)' },
        description: { type: 'string', description: 'Goal and context' },
      },
      required: ['title'],
    },
  },
  {
    name: 'initiatives_list',
    description: 'List initiatives, optionally filtered by status',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', description: 'Filter: pending|discovery|spec|review|approved|blocked|done' },
      },
    },
  },
  {
    name: 'initiatives_claim',
    description: 'Atomically claim a pending initiative',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number', description: 'Initiative ID' } },
      required: ['id'],
    },
  },
  {
    name: 'initiatives_update',
    description: 'Change initiative status',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        status: { type: 'string', description: 'pending|discovery|strategy|spec|review|approved|blocked|done' },
      },
      required: ['id', 'status'],
    },
  },
  {
    name: 'initiatives_get',
    description: 'Get initiative details',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id'],
    },
  },
  {
    name: 'initiatives_edit',
    description: 'Edit initiative title or description',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        title: { type: 'string', description: 'New title (optional)' },
        description: { type: 'string', description: 'New description (optional)' },
      },
      required: ['id'],
    },
  },
  {
    name: 'initiatives_archive',
    description: 'Archive an initiative',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id'],
    },
  },
  {
    name: 'initiatives_unarchive',
    description: 'Unarchive a previously archived initiative',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number' } },
      required: ['id'],
    },
  },
  {
    name: 'actions_start',
    description: 'Start a new action for an initiative, returns action_id',
    inputSchema: {
      type: 'object',
      properties: {
        initiative_id: { type: 'number', description: 'Initiative ID' },
        agent: { type: 'string', description: 'Agent name (lead, explorer, strategist, builder, reviewer, coach, smith)' },
        action_type: { type: 'string', description: 'Action type (optional)' },
      },
      required: ['initiative_id', 'agent'],
    },
  },
  {
    name: 'actions_write',
    description: 'Log an agent action with content',
    inputSchema: {
      type: 'object',
      properties: {
        initiative_id: { type: 'number' },
        agent: { type: 'string' },
        action_type: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['initiative_id', 'agent', 'action_type', 'content'],
    },
  },
  {
    name: 'actions_get',
    description: 'Get full action history for an initiative',
    inputSchema: {
      type: 'object',
      properties: { initiative_id: { type: 'number' } },
      required: ['initiative_id'],
    },
  },
  {
    name: 'actions_complete',
    description: 'Close an action with a summary',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'number', description: 'Action ID' },
        summary: { type: 'string', description: 'One-line summary of what was done' },
      },
      required: ['action_id'],
    },
  },
  {
    name: 'handoff_read',
    description: 'Read the most recent action content (previous agent handoff)',
    inputSchema: {
      type: 'object',
      properties: { initiative_id: { type: 'number' } },
      required: ['initiative_id'],
    },
  },
  {
    name: 'actions_record_file',
    description: 'Record a file touched during an action. Call once per file.',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'number' },
        file_path: { type: 'string', description: 'Path of the file' },
        operation: { type: 'string', enum: ['read', 'created', 'modified', 'deleted'] },
        notes: { type: 'string', description: 'Optional note' },
      },
      required: ['action_id', 'file_path', 'operation'],
    },
  },
  {
    name: 'actions_record_tool',
    description: 'Record a PM skill/tool used during an action',
    inputSchema: {
      type: 'object',
      properties: {
        action_id: { type: 'number' },
        tool_name: { type: 'string', description: 'Name of the tool/skill used' },
        args_json: { type: 'string', description: 'Optional JSON args' },
        result_summary: { type: 'string', description: 'Optional result summary' },
      },
      required: ['action_id', 'tool_name'],
    },
  },
  {
    name: 'criteria_add',
    description: 'Add an acceptance criterion',
    inputSchema: {
      type: 'object',
      properties: {
        initiative_id: { type: 'number' },
        criterion: { type: 'string', description: 'The acceptance criterion text' },
      },
      required: ['initiative_id', 'criterion'],
    },
  },
  {
    name: 'criteria_list',
    description: 'List acceptance criteria for an initiative',
    inputSchema: {
      type: 'object',
      properties: { initiative_id: { type: 'number' } },
      required: ['initiative_id'],
    },
  },
  {
    name: 'criteria_check',
    description: 'Mark an acceptance criterion as met',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'number', description: 'Criterion ID' } },
      required: ['id'],
    },
  },
  {
    name: 'skills_search',
    description: 'Search the PM skills library',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string', description: 'Search terms' } },
      required: ['query'],
    },
  },
  {
    name: 'docs_search',
    description: 'Search project PM docs and skills',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term' },
        scope: { type: 'string', description: 'all|skills|docs (default: all)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'docs_save',
    description: 'Save a validated document to the PM docs directory',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path (e.g. delivery/prds/checkout-v2.md)' },
        content: { type: 'string', description: 'Document content' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'pmahk_doctor',
    description: 'Check harness version, agents, and skills sync status',
    inputSchema: { type: 'object', properties: {} },
  },
] as const

// ─── Server ───────────────────────────────────────────────────────────────────

export async function startMcpServer(db: PmAhkDB): Promise<void> {
  const server = new Server(
    { name: 'pm-agent-harness-kit', version: VERSION },
    { capabilities: { tools: {} } },
  )

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }))

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    const a = (args ?? {}) as Record<string, unknown>
    try {
      const result = await dispatch(name, a, db)
      return result
    } catch (err) {
      return ok(`Error: ${err instanceof Error ? err.message : String(err)}`, true)
    }
  })

  const transport = new StdioServerTransport()
  await server.connect(transport)
}

// ─── Dispatch ─────────────────────────────────────────────────────────────────

async function dispatch(
  name: string,
  args: Record<string, unknown>,
  db: PmAhkDB,
): Promise<CallToolResult> {
  switch (name) {
    case 'initiatives_create': {
      const title = str(args, 'title')
      const slug = (args.slug as string) ?? slugify(title)
      const description = args.description as string | undefined
      const initiative = db.createInitiative(slug, title, description)
      return ok(JSON.stringify(initiative))
    }

    case 'initiatives_list': {
      const status = args.status as string | undefined
      const initiatives = db.listInitiatives(status)
      return ok(JSON.stringify(initiatives, null, 2))
    }

    case 'initiatives_claim': {
      const id = num(args, 'id')
      const claimed = db.claimInitiative(id)
      if (!claimed) {
        const existing = db.getInitiative(id)
        if (!existing) return ok(JSON.stringify({ error: 'not_found', id }), true)
        return ok(JSON.stringify({ claimed: false, id, status: `already ${existing.status}` }))
      }
      return ok(JSON.stringify({ claimed: true, id }))
    }

    case 'initiatives_update': {
      const id = num(args, 'id')
      const status = str(args, 'status')
      try {
        db.updateInitiativeStatus(id, status)
        return ok(JSON.stringify({ id, status }))
      } catch (e) {
        return ok(JSON.stringify({ error: (e as Error).message }), true)
      }
    }

    case 'initiatives_get': {
      const id = num(args, 'id')
      const initiative = db.getInitiative(id)
      if (!initiative) return ok(JSON.stringify({ error: `initiative ${id} not found` }), true)
      return ok(JSON.stringify(initiative))
    }

    case 'initiatives_edit': {
      const id = num(args, 'id')
      const title = args.title as string | undefined
      const description = args.description as string | undefined
      db.editInitiative(id, title, description)
      return ok(JSON.stringify({ id, edited: true }))
    }

    case 'initiatives_archive': {
      const id = num(args, 'id')
      db.archiveInitiative(id)
      return ok(JSON.stringify({ id, archived: true }))
    }

    case 'initiatives_unarchive': {
      const id = num(args, 'id')
      db.unarchiveInitiative(id)
      return ok(JSON.stringify({ id, unarchived: true }))
    }

    case 'actions_start': {
      const initiativeId = num(args, 'initiative_id')
      const agent = str(args, 'agent')
      const actionType = args.action_type as string | undefined
      const action = db.startAction(initiativeId, agent, actionType)
      return ok(JSON.stringify({ action_id: action.id, status: action.status, agent }))
    }

    case 'actions_write': {
      const initiativeId = num(args, 'initiative_id')
      const agent = str(args, 'agent')
      const actionType = str(args, 'action_type')
      const content = str(args, 'content')
      const result = db.writeAction(initiativeId, agent, actionType, content)
      return ok(JSON.stringify(result))
    }

    case 'actions_get': {
      const initiativeId = num(args, 'initiative_id')
      const actions = db.getActionsForInitiative(initiativeId)
      return ok(JSON.stringify(actions, null, 2))
    }

    case 'actions_complete': {
      const actionId = num(args, 'action_id')
      const summary = args.summary as string | undefined
      db.completeAction(actionId, summary)
      return ok(JSON.stringify({ action_id: actionId, status: 'completed' }))
    }

    case 'handoff_read': {
      const initiativeId = num(args, 'initiative_id')
      const last = db.handoffRead(initiativeId)
      if (!last) return ok(JSON.stringify({ content: null, agent: null, action_type: null }))
      return ok(JSON.stringify(last))
    }

    case 'actions_record_file': {
      const actionId = num(args, 'action_id')
      const filePath = str(args, 'file_path')
      const operation = str(args, 'operation')
      const notes = args.notes as string | undefined
      db.recordFile(actionId, filePath, operation, notes)
      return ok(JSON.stringify({ action_id: actionId, file_path: filePath, recorded: true }))
    }

    case 'actions_record_tool': {
      const actionId = num(args, 'action_id')
      const toolName = str(args, 'tool_name')
      const argsJson = args.args_json as string | undefined
      const resultSummary = args.result_summary as string | undefined
      db.recordTool(actionId, toolName, argsJson, resultSummary)
      return ok(JSON.stringify({ action_id: actionId, tool_name: toolName, recorded: true }))
    }

    case 'criteria_add': {
      const initiativeId = num(args, 'initiative_id')
      const criterion = str(args, 'criterion')
      const c = db.addCriteria(initiativeId, criterion)
      return ok(JSON.stringify(c))
    }

    case 'criteria_list': {
      const initiativeId = num(args, 'initiative_id')
      const criteria = db.listCriteria(initiativeId)
      return ok(JSON.stringify(criteria, null, 2))
    }

    case 'criteria_check': {
      const id = num(args, 'id')
      db.checkCriteria(id)
      return ok(JSON.stringify({ id, met: true }))
    }

    case 'skills_search': {
      const query = str(args, 'query')
      const results = searchDir(query, process.cwd(), 'skills')
      return ok(JSON.stringify(results.slice(0, 20), null, 2))
    }

    case 'docs_search': {
      const query = str(args, 'query')
      const scope = (args.scope as string) ?? 'all'
      const results: unknown[] = []
      if (scope === 'all' || scope === 'skills') {
        results.push(...searchDir(query, process.cwd(), 'skills').map((r) => ({ source: 'skill', ...r })))
      }
      if (scope === 'all' || scope === 'docs') {
        results.push(...searchDir(query, process.cwd(), 'docs').map((r) => ({ source: 'doc', ...r })))
      }
      return ok(JSON.stringify(results.slice(0, 20), null, 2))
    }

    case 'docs_save': {
      const path = str(args, 'path')
      const content = str(args, 'content')
      const docsDir = resolve(process.cwd(), 'docs')
      const fullPath = resolve(docsDir, path)
      if (!fullPath.startsWith(docsDir)) {
        return ok(JSON.stringify({ error: 'path escapes docs directory' }), true)
      }
      mkdirSync(dirname(fullPath), { recursive: true })
      writeFileSync(fullPath, content, 'utf8')
      return ok(JSON.stringify({ path, size: content.length }))
    }

    case 'pmahk_doctor': {
      const diag = db.getDiagnostics()
      return ok(JSON.stringify(diag, null, 2))
    }

    default:
      return ok(`Unknown tool: ${name}`, true)
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ok(text: string, isError = false): CallToolResult {
  return { content: [{ type: 'text' as const, text }], isError }
}

function str(args: Record<string, unknown>, key: string): string {
  const v = args[key]
  if (typeof v !== 'string') throw new Error(`${key} must be a string`)
  return v
}

function num(args: Record<string, unknown>, key: string): number {
  const v = args[key]
  if (typeof v !== 'number') throw new Error(`${key} must be a number`)
  return v
}

function slugify(title: string): string {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 50)
}

function searchDir(query: string, cwd: string, subdir: string): { name: string; path: string }[] {
  const base = join(cwd, subdir)
  const results: { name: string; path: string }[] = []
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (!existsSync(base)) return results
  const walk = (dir: string): void => {
    try {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry)
        const stat = statSync(full)
        if (stat.isDirectory()) {
          walk(full)
        } else if (entry.endsWith('.md')) {
          const content = readFileSync(full, 'utf8').toLowerCase()
          if (terms.every((t) => content.includes(t))) {
            results.push({ name: entry, path: full.replace(base + '/', '') })
          }
        }
      }
    } catch { /* skip */ }
  }
  walk(base)
  return results
}
