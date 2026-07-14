import { useQuery } from '@tanstack/react-query'
import { fetchInitiative, type Criterion } from '../api/client'
import { StatusBadge } from './StatusBadge'

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export function InitiativeDetail({ id, onBack }: { id: number; onBack: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ['initiative', id],
    queryFn: () => fetchInitiative(id),
    refetchInterval: 3000,
  })

  if (isLoading) return <div className="text-gray-400 text-sm animate-pulse">Loading...</div>
  if (!data) return <div className="text-red-500">Initiative not found.</div>

  const { initiative, actions, criteria } = data

  return (
    <div>
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4 inline-block cursor-pointer">&larr; Back to initiatives</button>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold">{initiative.title}</h1>
        <StatusBadge status={initiative.status} />
      </div>
      <p className="text-sm text-gray-500 mb-6">#{initiative.id} &middot; created {initiative.created_at?.slice(0, 10)}</p>
      {initiative.description && <p className="text-sm text-gray-700 mb-6">{initiative.description}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Actions</h2>
          {actions.length === 0 ? (
            <p className="text-sm text-gray-400">No actions recorded.</p>
          ) : (
            <div className="space-y-0">
              {actions.map((a, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full mt-2 ${i < actions.length - 1 ? 'bg-blue-400' : 'bg-green-400'}`} />
                    {i < actions.length - 1 && <div className="w-px flex-1 bg-gray-200 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{a.agent}</span>
                      <span className="text-xs text-gray-500">{a.action_type}</span>
                      <span className="text-xs text-gray-400">{relativeTime(a.created_at)}</span>
                    </div>
                    <pre className="text-sm text-gray-700 mt-1 whitespace-pre-wrap line-clamp-3 font-sans">{a.content}</pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="text-lg font-semibold mb-3">Acceptance Criteria</h2>
          {criteria.length === 0 ? (
            <p className="text-sm text-gray-400">No criteria defined.</p>
          ) : (
            <ul className="space-y-2">
              {criteria.map((c: Criterion) => (
                <li key={c.id} className="flex items-start gap-2 text-sm">
                  <span className={`mt-0.5 shrink-0 ${c.met ? 'text-green-500' : 'text-gray-300'}`}>
                    {c.met ? '✓' : '○'}
                  </span>
                  <span className={c.met ? 'text-gray-500 line-through' : 'text-gray-700'}>
                    {c.criterion}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
