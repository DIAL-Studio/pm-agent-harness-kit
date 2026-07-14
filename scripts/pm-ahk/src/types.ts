export type InitiativeStatus = 'pending' | 'discovery' | 'strategy' | 'spec' | 'review' | 'approved' | 'blocked' | 'done'

export interface InitiativeRow {
  id: number
  slug: string
  title: string
  description: string | null
  status: InitiativeStatus
  created_at: string
  updated_at: string
  archived_at: string | null
}

export interface ActionRow {
  id: number
  initiative_id: number
  agent: string
  action_type: string
  content: string
  status: 'in_progress' | 'completed' | 'blocked'
  created_at: string
  completed_at: string | null
  summary: string | null
}

export interface ActionFileRow {
  id: number
  action_id: number
  file_path: string
  operation: 'read' | 'created' | 'modified' | 'deleted'
  notes: string | null
}

export interface ActionToolRow {
  id: number
  action_id: number
  tool_name: string
  args_json: string | null
  result_summary: string | null
  called_at: string
}

export interface CriteriaRow {
  id: number
  initiative_id: number
  criterion: string
  met: number
}
