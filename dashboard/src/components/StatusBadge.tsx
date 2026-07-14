const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-600',
  discovery: 'bg-blue-100 text-blue-700',
  strategy: 'bg-purple-100 text-purple-700',
  spec: 'bg-yellow-100 text-yellow-700',
  review: 'bg-orange-100 text-orange-700',
  approved: 'bg-green-100 text-green-700',
  blocked: 'bg-red-100 text-red-700',
  done: 'bg-emerald-100 text-emerald-700',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}
