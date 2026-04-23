// ============================================
// api.js — Camada de comunicação com o backend
// Substitui o antigo data.js
// ============================================

const API_URL = 'http://localhost:5000/api';

// ── Token ─────────────────────────────────────────
function getToken()         { return localStorage.getItem('dotica_token'); }
function setToken(t)        { localStorage.setItem('dotica_token', t); }
function removeToken()      { localStorage.removeItem('dotica_token'); }

// ── Fetch genérico ────────────────────────────────
async function req(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res  = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Erro ${res.status}`);
  return data;
}

// ── Auth ──────────────────────────────────────────
const api = {
  login:          (body)         => req('/auth/login', { method:'POST', body: JSON.stringify(body) }),
  getMe:          ()             => req('/auth/me'),
  changePassword: (body)         => req('/auth/change-password', { method:'POST', body: JSON.stringify(body) }),

  // Dashboard
  getDashboard:   ()             => req('/dashboard'),

  // Clientes
  getClients:     (params = {})  => req('/clients?' + new URLSearchParams(params)),
  getClient:      (id)           => req(`/clients/${id}`),
  createClient:   (body)         => req('/clients', { method:'POST', body: JSON.stringify(body) }),
  updateClient:   (id, body)     => req(`/clients/${id}`, { method:'PUT', body: JSON.stringify(body) }),
  deleteClient:   (id)           => req(`/clients/${id}`, { method:'DELETE' }),

  // Agendamentos
  getAppointments:(params = {})  => req('/appointments?' + new URLSearchParams(params)),
  getAppointment: (id)           => req(`/appointments/${id}`),
  createAppointment:(body)       => req('/appointments', { method:'POST', body: JSON.stringify(body) }),
  updateAppointment:(id, body)   => req(`/appointments/${id}`, { method:'PUT', body: JSON.stringify(body) }),
  updateStatus:   (id, body)     => req(`/appointments/${id}/status`, { method:'PATCH', body: JSON.stringify(body) }),
  reschedule:     (id, body)     => req(`/appointments/${id}/reschedule`, { method:'POST', body: JSON.stringify(body) }),
  cancelAppt:     (id)           => req(`/appointments/${id}`, { method:'DELETE' }),
  getAvailability:(params = {})  => req('/appointments/availability?' + new URLSearchParams(params)),

  // Usuários
  getUsers:       ()             => req('/users'),
  createUser:     (body)         => req('/users', { method:'POST', body: JSON.stringify(body) }),
  updateUser:     (id, body)     => req(`/users/${id}`, { method:'PUT', body: JSON.stringify(body) }),
  toggleUser:     (id)           => req(`/users/${id}/toggle`, { method:'PATCH' }),

  // Relatórios
  getReport:      (params = {})  => req('/reports?' + new URLSearchParams(params)),
  getReportCSV:   async (params) => {
    const token = getToken();
    const url   = `${API_URL}/reports?${new URLSearchParams({ ...params, format:'csv' })}`;
    const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Erro ao exportar CSV');
    return res.blob();
  },

  // Configurações
  getSettings:    ()             => req('/settings'),
  updateSettings: (body)         => req('/settings', { method:'PUT', body: JSON.stringify(body) }),
};