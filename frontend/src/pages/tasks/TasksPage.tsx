import { useEffect, useState } from 'react'
import api from '../../lib/axios'
import type { Client, Task, PaginatedResponse } from '../../types'

const statusLabels: Record<string, string> = {
  todo: 'Todo',
  in_progress: 'В работе',
  done: 'Готово',
}

const statusColors: Record<string, string> = {
  todo: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)

  const fetchTasks = () => {
    const params = new URLSearchParams()
    params.set('page', String(page))
    if (status) params.set('status', status)

    api.get<PaginatedResponse<Task>>(`/tasks?${params}`).then((res) => {
      setTasks(res.data.data)
      setLastPage(res.data.meta.last_page)
    })
  }

  useEffect(fetchTasks, [page, status])

  useEffect(() => {
    api.get<PaginatedResponse<Client>>('/clients?per_page=100').then((res) => setClients(res.data.data))
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить задачу?')) return
    await api.delete(`/tasks/${id}`)
    fetchTasks()
  }

  const handleSubmit = async (data: Record<string, string>) => {
    if (editing) {
      await api.put(`/tasks/${editing.id}`, data)
    } else {
      await api.post('/tasks', data)
    }
    setShowForm(false)
    setEditing(null)
    fetchTasks()
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Задачи</h1>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Добавить
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => { setStatus(''); setPage(1) }}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Все
        </button>
        {Object.entries(statusLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setStatus(key); setPage(1) }}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${status === key ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {showForm && (
        <TaskForm
          task={editing}
          clients={clients}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditing(null) }}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-medium text-gray-600">Задача</th>
              <th className="px-4 py-3 font-medium text-gray-600">Клиент</th>
              <th className="px-4 py-3 font-medium text-gray-600">Дедлайн</th>
              <th className="px-4 py-3 font-medium text-gray-600">Статус</th>
              <th className="px-4 py-3 font-medium text-gray-600"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{task.title}</p>
                  {task.description && <p className="text-xs text-gray-500">{task.description}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">{task.client?.name || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{task.due_date || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[task.status] || ''}`}>
                    {statusLabels[task.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => { setEditing(task); setShowForm(true) }} className="text-blue-600 hover:text-blue-800">Изм.</button>
                    <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-800">Уд.</button>
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

function TaskForm({
  task,
  clients,
  onSubmit,
  onCancel,
}: {
  task: Task | null
  clients: Client[]
  onSubmit: (data: Record<string, string>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [dueDate, setDueDate] = useState(task?.due_date || '')
  const [taskStatus, setTaskStatus] = useState(task?.status || 'todo')
  const [clientId, setClientId] = useState(String(task?.client_id || ''))

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold">{task ? 'Редактировать' : 'Новая задача'}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input
          placeholder="Название *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <select
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Без клиента</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={taskStatus}
          onChange={(e) => setTaskStatus(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:col-span-2"
          rows={3}
        />
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onSubmit({ title, description, due_date: dueDate, status: taskStatus, client_id: clientId })}
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
