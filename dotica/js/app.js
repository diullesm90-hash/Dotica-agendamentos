// ============================================
// app.js — Controlador de navegação principal
// ============================================

let currentPage = 'dashboard';

const PAGE_META = {
  dashboard:    { title: 'Dashboard',       sub: 'Visão geral dos atendimentos' },
  calendar:     { title: 'Calendário',      sub: 'Visualização mensal dos agendamentos' },
  appointments: { title: 'Agendamentos',    sub: 'Lista completa de agendamentos' },
  clients:      { title: 'Clientes',        sub: 'Gerenciamento de clientes' },
  reports:      { title: 'Relatórios',      sub: 'Análise e exportação por período' },
  users:        { title: 'Usuários',        sub: 'Gerenciamento de usuários' },
  settings:     { title: 'Configurações',   sub: 'Configurações do sistema' },
};

function nav(el) {
  const page = el.dataset.page;

  // Atualiza nav items
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');

  // Mostra/oculta seções
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec-' + page).classList.add('active');

  // Atualiza topbar
  const meta = PAGE_META[page] || {};
  document.getElementById('pageTitle').textContent    = meta.title || '';
  document.getElementById('pageSubtitle').textContent = meta.sub   || '';

  currentPage = page;

  // Inicializa a página correspondente
  if (page === 'dashboard')    renderDashboard();
  if (page === 'calendar')     initCalendar();
  if (page === 'appointments') renderAppointments();
  if (page === 'clients')      renderClients();
  if (page === 'reports')      initReports();
  if (page === 'users')        renderUsers();
  if (page === 'settings')     renderSettings();
}
