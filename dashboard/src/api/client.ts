const BASE = window.location.origin

async function fetchJSON(path: string) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API ${res.status}`)
  return res.json()
}

export interface OverviewData {
  discovery: number
  strategy: number
  spec: number
  review: number
  approved: number
  blocked: number
  done: number
  recent_actions: Array<{
    agent: string
    action_type: string
    title: string
    created_at: string
  }>
}

export interface Initiative {
  id: number
  slug: string
  title: string
  description: string
  status: string
  updated_at: string
  created_at: string
}

export interface Action {
  agent: string
  action_type: string
  content: string
  created_at: string
}

export interface Criterion {
  id: number
  criterion: string
  met: number
}

export interface InitiativeDetail {
  initiative: Initiative
  actions: Action[]
  criteria: Criterion[]
}

export interface AgentStat {
  agent: string
  total_actions: number
  initiatives_count: number
}

export function fetchOverview(): Promise<OverviewData> {
  return fetchJSON('/api/overview')
}

export function fetchInitiatives(status?: string): Promise<Initiative[]> {
  const qs = status ? `?status=${status}` : ''
  return fetchJSON(`/api/initiatives${qs}`)
}

export function fetchInitiative(id: number): Promise<InitiativeDetail> {
  return fetchJSON(`/api/initiatives/${id}`)
}

export function fetchAgents(): Promise<AgentStat[]> {
  return fetchJSON('/api/agents')
}
