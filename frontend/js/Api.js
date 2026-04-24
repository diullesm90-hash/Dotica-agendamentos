// ============================================
// api.js — Camada de comunicação com o backend
// Substitui o antigo data.js
// ============================================

const API_URL = '/api'; // URL do backend (ajuste conforme necessário)
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
  login:          (body)         => req('/Auth/login', { method:'POST', body: JSON.stringify(body) }),
  getMe:          ()             => req('/Auth/me'),
  changePassword: (body)         => req('/Auth/change-password', { method:'POST', body: JSON.stringify(body) }),

  // Dashboard
  getDashboard:   ()             => req('/Dashboard'),

  // Clientes
  getClients:     (params = {})  => req('/Clients?' + new URLSearchParams(params)),
  getClient:      (id)           => req(`/Clients/${id}`),
  createClient:   (body)         => req('/Clients', { method:'POST', body: JSON.stringify(body) }),
  updateClient:   (id, body)     => req(`/Clients/${id}`, { method:'PUT', body: JSON.stringify(body) }),
  deleteClient:   (id)           => req(`/Clients/${id}`, { method:'DELETE' }),

  // Agendamentos
  getAppointments:(params = {})  => req('/Appointments?' + new URLSearchParams(params)),
  getAppointment: (id)           => req(`/Appointments/${id}`),
  createAppointment:(body)       => req('/Appointments', { method:'POST', body: JSON.stringify(body) }),
  updateAppointment:(id, body)   => req(`/Appointments/${id}`, { method:'PUT', body: JSON.stringify(body) }),
  updateStatus:   (id, body)     => req(`/Appointments/${id}/status`, { method:'PATCH', body: JSON.stringify(body) }),
  reschedule:     (id, body)     => req(`/Appointments/${id}/reschedule`, { method:'POST', body: JSON.stringify(body) }),
  cancelAppt:     (id)           => req(`/Appointments/${id}`, { method:'DELETE' }),
  getAvailability:(params = {})  => req('/Appointments/availability?' + new URLSearchParams(params)),

  // Usuários
  getUsers:       ()             => req('/Users'),
  createUser:     (body)         => req('/Users', { method:'POST', body: JSON.stringify(body) }),
  updateUser:     (id, body)     => req(`/Users/${id}`, { method:'PUT', body: JSON.stringify(body) }),
  toggleUser:     (id)           => req(`/Users/${id}/toggle`, { method:'PATCH' }),

  // Relatórios
  getReport:      (params = {})  => req('/Reports?' + new URLSearchParams(params)),
  getReportCSV:   async (params) => {
    const token = getToken();
    const url   = `${API_URL}/Reports?${new URLSearchParams({ ...params, format:'csv' })}`;
    const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Erro ao exportar CSV');
    return res.blob();
  },

  // Configurações
  getSettings:    ()             => req('/Settings'),
  updateSettings: (body)         => req('/Settings', { method:'PUT', body: JSON.stringify(body) }),
};
