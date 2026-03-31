export interface User {
  id: number
  name: string
  email: string
}

export interface Client {
  id: number
  name: string
  email: string | null
  phone: string | null
  company: string | null
  status: 'lead' | 'active' | 'inactive'
  notes: string | null
  deals_count?: number
  tasks_count?: number
  created_at: string
  updated_at: string
}

export interface Deal {
  id: number
  title: string
  amount: string
  stage: 'new' | 'negotiation' | 'won' | 'lost'
  closed_at: string | null
  client_id: number
  client?: Client
  tasks_count?: number
  created_at: string
  updated_at: string
}

export interface Task {
  id: number
  title: string
  description: string | null
  due_date: string | null
  status: 'todo' | 'in_progress' | 'done'
  client_id: number | null
  deal_id: number | null
  client?: Client
  deal?: Deal
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  clients_count: number
  deals_count: number
  deals_total: number
  deals_won: number
  tasks_todo: number
  tasks_in_progress: number
  recent_clients: Client[]
  recent_deals: Deal[]
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
