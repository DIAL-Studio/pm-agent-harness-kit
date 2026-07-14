import React, { useState } from 'react'
import { Overview } from './components/Overview'
import { Initiatives } from './components/Initiatives'
import { InitiativeDetail } from './components/InitiativeDetail'
import { StatusBadge } from './components/StatusBadge'

type View = { name: 'overview' } | { name: 'initiatives' } | { name: 'detail'; id: number }

export function App() {
  const [view, setView] = useState<View>({ name: 'overview' })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setView({ name: 'overview' })} className="font-bold text-lg text-gray-900 hover:text-gray-600 cursor-pointer">
              pm-agent-harness-kit
            </button>
            <nav className="flex gap-4 text-sm">
              <button onClick={() => setView({ name: 'overview' })} className={`cursor-pointer ${view.name === 'overview' ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>
                Overview
              </button>
              <button onClick={() => setView({ name: 'initiatives' })} className={`cursor-pointer ${view.name === 'initiatives' ? 'text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-900'}`}>
                Initiatives
              </button>
            </nav>
          </div>
          <span className="text-xs text-gray-400">v1.9.0</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {view.name === 'overview' && <Overview onNavigate={(id) => setView({ name: 'detail', id })} />}
        {view.name === 'initiatives' && <Initiatives onNavigate={(id) => setView({ name: 'detail', id })} />}
        {view.name === 'detail' && <InitiativeDetail id={view.id} onBack={() => setView({ name: 'initiatives' })} />}
      </main>
    </div>
  )
}
