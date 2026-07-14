import { openSQLite, type SQLiteDB } from './sqlite-adapter'
import { SCHEMA_SQL } from '../schema/init'
import type { InitiativeRow, ActionRow, CriteriaRow, ActionFileRow, ActionToolRow } from '../types'

const STATUS_FLOW = ['pending', 'discovery', 'strategy', 'spec', 'review', 'approved', 'blocked', 'done']

export class PmAhkDB {
  private db: SQLiteDB

  constructor(dbPath: string) {
    this.db = openSQLite(dbPath)
    this.db.exec('PRAGMA journal_mode = WAL')
    this.db.exec('PRAGMA foreign_keys = ON')
    this.db.exec(SCHEMA_SQL)
    this.migrate()
  }

  private migrate(): void {
    const cols = ['archived_at TEXT', "status TEXT NOT NULL DEFAULT 'completed'", 'completed_at TEXT', 'summary TEXT']
    for (const colDef of cols) {
      try {
        this.db.exec(`ALTER TABLE actions ADD COLUMN ${colDef}`)
      } catch { /* column exists */ }
    }
    try { this.db.exec('ALTER TABLE initiatives ADD COLUMN archived_at TEXT') } catch { /* exists */ }
  }

  close(): void {
    this.db.close()
  }

  // ─── Initiatives ─────────────────────────────────────────────────────────

  createInitiative(slug: string, title: string, description?: string): InitiativeRow {
    const stmt = this.db.prepare(
      `INSERT INTO initiatives (slug, title, description) VALUES (?, ?, ?) RETURNING *`
    )
    return stmt.get(slug, title, description ?? null) as unknown as InitiativeRow
  }

  listInitiatives(status?: string): InitiativeRow[] {
    if (status) {
      const stmt = this.db.prepare(
        `SELECT * FROM initiatives WHERE status = ? ORDER BY updated_at DESC`
      )
      return stmt.all(status) as InitiativeRow[]
    }
    const stmt = this.db.prepare(
      `SELECT * FROM initiatives ORDER BY updated_at DESC`
    )
    return stmt.all() as InitiativeRow[]
  }

  claimInitiative(id: number): boolean {
    const result = this.db.prepare(
      `UPDATE initiatives SET status = 'discovery', updated_at = datetime('now') WHERE id = ? AND status = 'pending'`
    ).run(id)
    return (result?.changes ?? 0) > 0
  }

  updateInitiativeStatus(id: number, status: string): boolean {
    if (!STATUS_FLOW.includes(status)) throw new Error(`Invalid status: ${status}`)
    const result = this.db.prepare(
      `UPDATE initiatives SET status = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(status, id)
    return (result?.changes ?? 0) > 0
  }

  getInitiative(id: number): InitiativeRow | undefined {
    return this.db.prepare(`SELECT * FROM initiatives WHERE id = ?`).get(id) as InitiativeRow | undefined
  }

  editInitiative(id: number, title?: string, description?: string): boolean {
    const sets: string[] = []
    const vals: unknown[] = []
    if (title !== undefined) { sets.push('title = ?'); vals.push(title) }
    if (description !== undefined) { sets.push('description = ?'); vals.push(description) }
    if (sets.length === 0) return false
    sets.push("updated_at = datetime('now')")
    vals.push(id)
    const result = this.db.prepare(`UPDATE initiatives SET ${sets.join(', ')} WHERE id = ?`).run(...vals)
    return (result?.changes ?? 0) > 0
  }

  archiveInitiative(id: number): boolean {
    const result = this.db.prepare(
      `UPDATE initiatives SET archived_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`
    ).run(id)
    return (result?.changes ?? 0) > 0
  }

  unarchiveInitiative(id: number): boolean {
    const result = this.db.prepare(
      `UPDATE initiatives SET archived_at = NULL, updated_at = datetime('now') WHERE id = ?`
    ).run(id)
    return (result?.changes ?? 0) > 0
  }

  // ─── Actions ─────────────────────────────────────────────────────────────

  startAction(initiativeId: number, agent: string, actionType?: string): ActionRow {
    const stmt = this.db.prepare(
      `INSERT INTO actions (initiative_id, agent, action_type, content, status) VALUES (?, ?, ?, '', 'in_progress') RETURNING *`
    )
    return stmt.get(initiativeId, agent, actionType ?? 'action') as unknown as ActionRow
  }

  writeAction(initiativeId: number, agent: string, actionType: string, content: string): { id: number } {
    const result = this.db.prepare(
      `INSERT INTO actions (initiative_id, agent, action_type, content) VALUES (?, ?, ?, ?) RETURNING id`
    ).get(initiativeId, agent, actionType, content) as { id: number }
    return result
  }

  getActionsForInitiative(initiativeId: number): ActionRow[] {
    return this.db.prepare(
      `SELECT * FROM actions WHERE initiative_id = ? ORDER BY created_at`
    ).all(initiativeId) as ActionRow[]
  }

  handoffRead(initiativeId: number): ActionRow | undefined {
    return this.db.prepare(
      `SELECT * FROM actions WHERE initiative_id = ? ORDER BY created_at DESC LIMIT 1`
    ).get(initiativeId) as ActionRow | undefined
  }

  completeAction(actionId: number, summary?: string): boolean {
    const result = this.db.prepare(
      `UPDATE actions SET status = 'completed', completed_at = datetime('now'), summary = ? WHERE id = ? AND status = 'in_progress'`
    ).run(summary ?? '', actionId)
    return (result?.changes ?? 0) > 0
  }

  recordFile(actionId: number, filePath: string, operation: string, notes?: string): void {
    this.db.prepare(
      `INSERT INTO action_files (action_id, file_path, operation, notes) VALUES (?, ?, ?, ?)`
    ).run(actionId, filePath, operation, notes ?? null)
  }

  recordTool(actionId: number, toolName: string, argsJson?: string, resultSummary?: string): void {
    this.db.prepare(
      `INSERT INTO action_tools (action_id, tool_name, args_json, result_summary) VALUES (?, ?, ?, ?)`
    ).run(actionId, toolName, argsJson ?? null, resultSummary ?? null)
  }

  // ─── Criteria ────────────────────────────────────────────────────────────

  addCriteria(initiativeId: number, criterion: string): CriteriaRow {
    const stmt = this.db.prepare(
      `INSERT INTO criteria (initiative_id, criterion) VALUES (?, ?) RETURNING *`
    )
    return stmt.get(initiativeId, criterion) as unknown as CriteriaRow
  }

  listCriteria(initiativeId: number): CriteriaRow[] {
    return this.db.prepare(
      `SELECT * FROM criteria WHERE initiative_id = ? ORDER BY id`
    ).all(initiativeId) as CriteriaRow[]
  }

  checkCriteria(id: number): boolean {
    const result = this.db.prepare(`UPDATE criteria SET met = 1 WHERE id = ?`).run(id)
    return (result?.changes ?? 0) > 0
  }

  // ─── Doctor ──────────────────────────────────────────────────────────────

  getDiagnostics(agentsDir?: string, skillsDir?: string): Record<string, unknown> {
    return {
      lib_version: '2.2.0',
      db_path: 'connected',
      agents: agentsDir ?? 'not checked',
      skills: skillsDir ?? 'not checked',
    }
  }
}
