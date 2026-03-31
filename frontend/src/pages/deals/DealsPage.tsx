import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import type { Client, Deal, PaginatedResponse } from '../../types'

const stages = ['new', 'negotiation', 'won', 'lost'] as const

const stageLabels: Record<string, string> = {
  new: 'Новые',
  negotiation: 'Переговоры',
  won: 'Выиграны',
  lost: 'Проиграны',
}

const stageColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  negotiation: 'bg-yellow-100 text-yellow-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [stage, setStage] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)

  const fetchDeals = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (stage) params.set('stage', stage)

    api.get<PaginatedResponse<Deal>>(`/deals?${params}`).then((res) => {
      setDeals(res.data.data)
      setLastPage(res.data.meta.last_page)
    })
  }

  useEffect(fetchDeals, [page, stage])

  useEffect(() => {
    api.get<PaginatedResponse<Client>>('/clients?per_page=100').then((res) => setClients(res.data.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить сделку?')) return
    await api.delete(`/deals/${id}`)
    fetchDeals()
  }

  const handleSubmit = async (data: Record<string, string>) => {
    if (editing) {
      await api.put(`/deals/${editing.id}`, data)
    } else {
      await api.post('/deals', data)
    }
    setShowForm(false)
    setEditing(null)
    fetchDeals()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Сделки</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Добавить
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setStage(''); setPage(1) }}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!stage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Все
        </button>
        {stages.map((s) => (
          <button
            key={s}
            onClick={() => { setStage(s); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${stage === s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {stageLabels[s]}
          </button>
        ))}
      </div>

      {showForm && (
        <DealForm
          deal={editing}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Название</th>
              <th className="px-4 py-3 font-medium text-gray-600">Клиент</th>
              <th className="px-4 py-3 font-medium text-gray-600">Сумма</th>
              <th className="px-4 py-3 font-medium text-gray-600">Стадия</th>
              <th className="px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{deal.title}</td>
                <td className="px-4 py-3 text-gray-600">{deal.client?.name}</td>
                <td className="px-4 py-3 text-gray-900">{Number(deal.amount).toLocaleString()} руб.</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${stageColors[deal.stage] || ''}`}>
                    {stageLabels[deal.stage]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(deal); setShowForm(true) }} className="text-blue-600 hover:text-blue-800">Изм.</button>
                    <button onClick={() => handleDelete(deal.id)} className="text-red-600 hover:text-red-800">Уд.</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {lastPage > 1 && (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: lastPage }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPage(i + 1)}
              className={`rounded px-3 py-1 text-sm ${page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DealForm({
  deal,
  clients,
  onSubmit,
  onCancel,
}: {
  deal: Deal | null
  clients: Client[]
  onSubmit: (data: Record<string, string>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(deal?.title || '')
  const [amount, setAmount] = useState(deal?.amount || '0')
  const [dealStage, setDealStage] = useState(deal?.stage || 'new')
  const [clientId, setClientId] = useState(String(deal?.client_id || ''))

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{deal ? 'Редактировать' : 'Новая сделка'}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          placeholder="Название *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Выберите клиента *</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={dealStage}
          onChange={(e) => setDealStage(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {stages.map((s) => (
            <option key={s} value={s}>{stageLabels[s]}</option>
          ))}
        </select>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onSubmit({ title, amount, stage: dealStage, client_id: clientId })}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Сохранить
        </button>
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Отмена
        </button>
      </div>
    </div>
  )
}
