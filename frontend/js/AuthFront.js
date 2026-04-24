// auth.js — Login e logout via API
let currentUser = null;

function initials(name) {
  if (!name) return '';

  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const errEl = document.getElementById('loginErr');
  errEl.style.display = 'none';

  try {
    const { token, user } = await api.login({ email, password: pass });
    setToken(token);
    currentUser = user;

    document.getElementById('sbName').textContent = user.name;
    document.getElementById('sbRole').textContent = user.role === 'admin' ? 'Administrador' : 'Atendente';
    document.getElementById('sbAv').textContent   = initials(user.name);

    const isAdmin = user.role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
    document.getElementById('adminSect').style.display = isAdmin ? '' : 'none';

    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appShell').style.display  = 'flex';

    await populateSelects();
    nav(document.querySelector('[data-page=dashboard]'));
  } catch(err) {
    errEl.textContent = err.message || 'Erro ao fazer login.';
    errEl.style.display = 'block';
  }
}

function doLogout() {
  removeToken();
  currentUser = null;
  document.getElementById('appShell').style.display  = 'none';
  document.getElementById('loginPage').style.display = 'flex';
}

// Restaurar sessão se já tiver token salvo
async function restoreSession() {
  const token = getToken();
  if (!token) return;

  try {
    const user = await api.getMe();
    currentUser = user;

    document.getElementById('sbName').textContent = user.name;
    document.getElementById('sbRole').textContent = user.role === 'admin' ? 'Administrador' : 'Atendente';
    document.getElementById('sbAv').textContent   = initials(user.name);

    const isAdmin = user.role === 'admin';
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = isAdmin ? '' : 'none');
    document.getElementById('adminSect').style.display = isAdmin ? '' : 'none';

    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appShell').style.display  = 'flex';

    await populateSelects();
    nav(document.querySelector('[data-page=dashboard]'));
  } catch {
    removeToken();
  }
}

document.getElementById('loginPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});

// Ao carregar a página tenta restaurar sessão
window.addEventListener('DOMContentLoaded', restoreSession);