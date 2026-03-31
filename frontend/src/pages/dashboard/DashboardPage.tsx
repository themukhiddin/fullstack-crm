import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import type { DashboardStats } from '../../types'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    api.get('/dashboard').then((res) => setStats(res.data))
  }, [])

  if (!stats) {
    return <div className="text-gray-500">Загрузка...</div>
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Клиенты" value={stats.clients_count} />
        <StatCard label="Сделки" value={stats.deals_count} />
        <StatCard label="Сумма сделок" value={`${stats.deals_total.toLocaleString()} руб.`} />
        <StatCard label="Выиграно" value={`${stats.deals_won.toLocaleString()} руб.`} color="text-green-600" />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Задачи (todo)" value={stats.tasks_todo} />
        <StatCard label="Задачи (в работе)" value={stats.tasks_in_progress} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Последние клиенты</h2>
          <div className="space-y-3">
            {stats.recent_clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-xs text-gray-500">{client.company}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColor(client.status)}`}>
                  {client.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Последние сделки</h2>
          <div className="space-y-3">
            {stats.recent_deals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{deal.title}</p>
                  <p className="text-xs text-gray-500">{deal.client?.name}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {Number(deal.amount).toLocaleString()} руб.
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color || 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

function statusColor(status: string) {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'lead': return 'bg-blue-100 text-blue-700'
    case 'inactive': return 'bg-gray-100 text-gray-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}
