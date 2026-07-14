import { createRequire } from 'node:module'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const _require = createRequire(import.meta.url)

export interface SQLRow {
  [key: string]: unknown
}

export interface SQLStatement {
  run(...args: unknown[]): { changes: number; lastInsertRowid: number } | undefined
  get(...args: unknown[]): SQLRow | undefined
  all(...args: unknown[]): SQLRow[]
}

export interface SQLiteDB {
  exec(sql: string): void
  prepare(sql: string): SQLStatement
  close(): void
}

export function openSQLite(path: string): SQLiteDB {
  mkdirSync(dirname(path), { recursive: true })
  const { DatabaseSync } = _require('node:sqlite') as {
    DatabaseSync: new (path: string) => unknown
  }
  return new DatabaseSync(path) as unknown as SQLiteDB
}
