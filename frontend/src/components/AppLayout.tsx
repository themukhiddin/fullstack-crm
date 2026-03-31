import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const nav = [
  { to: '/', label: 'Dashboard' },
  { to: '/clients', label: 'Клиенты' },
  { to: '/deals', label: 'Сделки' },
  { to: '/tasks', label: 'Задачи' },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">CRM</h1>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {nav.map(({ to, label }) => {
            const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <Link
                key={to}
                to={to}
                className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-200 px-6 py-4">
          <p className="truncate text-sm text-gray-600">{user?.name}</p>
          <button
            onClick={logout}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
