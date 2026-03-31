import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import type { Client, PaginatedResponse } from '../../types'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

  const fetchClients = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (search) params.set('search', search)
    if (status) params.set('status', status)

    api.get<PaginatedResponse<Client>>(`/clients?${params}`).then((res) => {
      setClients(res.data.data)
      setLastPage(res.data.meta.last_page)
    })
  }

  useEffect(fetchClients, [page, search, status])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить клиента?')) return
    await api.delete(`/clients/${id}`)
    fetchClients()
  }

  const handleSubmit = async (data: Record<string, string>) => {
    if (editing) {
      await api.put(`/clients/${editing.id}`, data)
    } else {
      await api.post('/clients', data)
    }
    setShowForm(false)
    setEditing(null)
    fetchClients()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Клиенты</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Добавить
        </button>
      </div>

      <div className="mb-4 flex gap-3">
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Все статусы</option>
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {showForm && (
        <ClientForm
          client={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Имя</th>
              <th className="px-4 py-3 font-medium text-gray-600">Компания</th>
              <th className="px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="px-4 py-3 font-medium text-gray-600">Телефон</th>
              <th className="px-4 py-3 font-medium text-gray-600">Статус</th>
              <th className="px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                <td className="px-4 py-3 text-gray-600">{client.company}</td>
                <td className="px-4 py-3 text-gray-600">{client.email}</td>
                <td className="px-4 py-3 text-gray-600">{client.phone}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(client); setShowForm(true) }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Изм.
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Уд.
                    </button>
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
              className={`rounded px-3 py-1 text-sm ${
                page === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    lead: 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-600',
  }
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${colors[status] || ''}`}>
      {status}
    </span>
  )
}

function ClientForm({
  client,
  onSubmit,
  onCancel,
}: {
  client: Client | null
  onSubmit: (data: Record<string, string>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(client?.name || '')
  const [email, setEmail] = useState(client?.email || '')
  const [phone, setPhone] = useState(client?.phone || '')
  const [company, setCompany] = useState(client?.company || '')
  const [status, setStatus] = useState(client?.status || 'lead')

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{client ? 'Редактировать' : 'Новый клиент'}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          placeholder="Имя *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          placeholder="Компания"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="lead">Lead</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onSubmit({ name, email, phone, company, status })}
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
