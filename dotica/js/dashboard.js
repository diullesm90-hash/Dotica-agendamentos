// dashboard.js — Dashboard via API
let weekChart = null;

async function renderDashboard() {
  try {
    showLoading('todayBody', 6);
    const data = await api.getDashboard();
    const { today, week, month, typeStats, totalClients } = data;
    const { stats, appointments } = today;

    document.getElementById('ds-total').textContent   = stats.total;
    document.getElementById('ds-present').textContent = stats.compareceu;
    document.getElementById('ds-absent').textContent  = stats.falta;
    document.getElementById('ds-rate').textContent    = (stats.attendanceRate || 0) + '%';
    document.getElementById('ds-clients').textContent = totalClients;
    document.getElementById('ds-month').textContent   = month.total;

    // Gráfico semanal
    if (weekChart) weekChart.destroy();
    weekChart = new Chart(document.getElementById('chartWeek').getContext('2d'), {
      type: 'bar',
      data: {
        labels: week.map(d => d.label),
        datasets: [
          { label:'Compareceu', data: week.map(d=>d.compareceu), backgroundColor:'rgba(30,122,66,0.75)', borderRadius:4 },
          { label:'Falta',      data: week.map(d=>d.falta),      backgroundColor:'rgba(204,26,26,0.75)', borderRadius:4 },
          { label:'Total',      data: week.map(d=>d.total),      backgroundColor:'rgba(26,58,110,0.20)', borderRadius:4 },
        ],
      },
      options:{ responsive:true, plugins:{ legend:{ labels:{ color:'#6b84a8', font:{ family:'DM Sans', size:11 } } } }, scales:{ x:{ ticks:{ color:'#6b84a8' }, grid:{ color:'rgba(0,0,0,0.04)' } }, y:{ ticks:{ color:'#6b84a8' }, grid:{ color:'rgba(0,0,0,0.04)' } } } },
    });

    // Breakdown por tipo
    const colors = ['var(--red)','var(--blue)','var(--gold)','var(--green)','var(--crimson)'];
    const total  = month.total || 1;
    document.getElementById('typeBreakdown').innerHTML =
      (typeStats||[]).map(({_id, count}, i) => {
        const pct = Math.round(count/total*100);
        return `<div style="margin-bottom:12px">
          <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px">
            <span style="color:var(--ink2)">${TYPE_LABELS[_id]||_id}</span>
            <span style="color:var(--ink3)">${count} (${pct}%)</span>
          </div>
          <div class="prog"><div class="prog-fill" style="width:${pct}%;background:${colors[i%colors.length]}"></div></div>
        </div>`;
      }).join('') || '<p style="color:var(--ink3);font-size:0.83rem">Sem dados este mês.</p>';

    // Tabela de hoje
    const tbody = document.getElementById('todayBody');
    if (!appointments.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--ink3);padding:28px">Nenhum agendamento hoje.</td></tr>`;
      return;
    }
    tbody.innerHTML = appointments.map(a => {
      const canUpdate = ['agendado','confirmado'].includes(a.status);
      return `<tr>
        <td><strong>${a.time}</strong></td>
        <td><strong>${clientName(a)}</strong><div style="font-size:0.73rem;color:var(--ink3)">${clientPhone(a)}</div></td>
        <td>${TYPE_LABELS[a.type]||a.type}</td>
        <td>${attendantName(a)}</td>
        <td>${statusBadge(a.status)}</td>
        <td class="td-actions">
          ${canUpdate ? `<button class="btn btn-ghost btn-sm" onclick="openStatusModal('${a._id}')">Atualizar</button>` : ''}
          <button class="btn btn-ghost btn-sm" onclick="openReschedule('${a._id}')">Remarcar</button>
        </td>
      </tr>`;
    }).join('');
  } catch(e) {
    toast('Erro ao carregar dashboard: ' + e.message, 'err');
  }
}
