import { useQuery } from '@tanstack/react-query'
import { fetchInitiatives, type Initiative } from '../api/client'
import { StatusBadge } from './StatusBadge'

export function Initiatives({ onNavigate }: { onNavigate: (id: number) => void }) {
  const { data, isLoading } = useQuery<Initiative[]>({
    queryKey: ['initiatives'],
    queryFn: () => fetchInitiatives(),
    refetchInterval: 3000,
  })

  if (isLoading) return <div className="text-gray-400 text-sm animate-pulse">Loading...</div>

  const items = data || []

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Initiatives</h1>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No initiatives. Run <code className="bg-gray-100 px-1 rounded">pm-ahk initiative add</code>.</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left">
                <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="px-4 py-3 font-medium text-gray-500 hidden sm:table-cell">Pipeline</th>
                <th className="px-4 py-3 font-medium text-gray-500 hidden md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {items.map((init) => (
                <tr key={init.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => onNavigate(init.id)}>
                  <td className="px-4 py-3"><StatusBadge status={init.status} /></td>
                  <td className="px-4 py-3">
                    <button onClick={(e) => { e.preventDefault(); onNavigate(init.id) }} className="text-blue-600 hover:underline font-medium">
                      {init.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{init.status}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{init.updated_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
