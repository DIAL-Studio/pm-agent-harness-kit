import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchOverview, type OverviewData } from '../api/client'
import { StatusBadge } from './StatusBadge'

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-lg border ${color} p-4`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
}

function PipelineCard({ item, onClick }: { item: OverviewData['recent_actions'][0]; onClick: (id: number) => void }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="font-mono text-xs text-gray-400 shrink-0">{item.agent}</span>
        <span className="text-gray-500">{item.action_type}</span>
        <span className="text-gray-900 font-medium truncate">{item.title}</span>
      </div>
      <span className="text-xs text-gray-400 shrink-0 ml-2">{relativeTime(item.created_at)}</span>
    </div>
  )
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  return `${h}h ago`
}

export function Overview({ onNavigate }: { onNavigate: (id: number) => void }) {
  const { data, isLoading } = useQuery<OverviewData>({
    queryKey: ['overview'],
    queryFn: fetchOverview,
    refetchInterval: 3000,
  })

  if (isLoading) return <div className="text-gray-400 text-sm animate-pulse">Loading...</div>

  const d = data || { discovery: 0, strategy: 0, spec: 0, review: 0, approved: 0, blocked: 0, done: 0, recent_actions: [] }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pipeline Status</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 mb-8">
        {[
          { label: 'Discovery', count: d.discovery, color: 'border-blue-200' },
          { label: 'Strategy', count: d.strategy, color: 'border-purple-200' },
          { label: 'Spec', count: d.spec, color: 'border-yellow-200' },
          { label: 'Review', count: d.review, color: 'border-orange-200' },
          { label: 'Approved', count: d.approved, color: 'border-green-200' },
          { label: 'Blocked', count: d.blocked, color: 'border-red-200' },
          { label: 'Done', count: d.done, color: 'border-emerald-200' },
        ].map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
      {d.recent_actions.length === 0 ? (
        <p className="text-sm text-gray-400">No activity yet. Run <code className="bg-gray-100 px-1 rounded">pm-ahk initiative add</code>.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          {d.recent_actions.map((a, i) => <PipelineCard key={i} item={a} onClick={onNavigate} />)}
        </div>
      )}
    </div>
  )
}
