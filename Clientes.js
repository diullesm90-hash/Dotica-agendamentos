// clients.js — Clientes via API
let editingClientId = null;

async function renderClients(){
  showLoading('clientBody',6);
  document.getElementById('clientEmpty').style.display='none';
  try{
    const search=document.getElementById('clientSearch').value.trim();
    const {clients}=await api.getClients(search?{search}:{});
    document.getElementById('clientEmpty').style.display=clients.length?'none':'block';
    document.getElementById('clientBody').innerHTML=(clients||[]).map(c=>{
      return `<tr>
        <td><div style="display:flex;align-items:center;gap:9px">
          <div class="avatar" style="background:var(--red-l);color:var(--red)">${initials(c.name)}</div>
          <div><strong>${c.name}</strong>${c.notes?`<div style="font-size:0.72rem;color:var(--ink3)">${c.notes}</div>`:''}</div>
        </div></td>
        <td>${c.phone}</td>
        <td style="font-size:0.82rem">${c.email||'—'}</td>
        <td><span class="badge b-teal">—</span></td>
        <td>—</td>
        <td class="td-actions">
          <button class="btn btn-ghost btn-sm" onclick="openClientHistory('${c._id}','${c.name.replace(/'/g,"\\'")}')">Histórico</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editClient('${c._id}')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </td>
      </tr>`;
    }).join('');
  }catch(e){toast('Erro ao carregar clientes: '+e.message,'err');}
}

async function editClient(id){
  editingClientId=id;
  try{
    const {client}=await api.getClient(id);
    document.getElementById('modalClientTitle').textContent='Editar Cliente';
    document.getElementById('cliName').value  = client.name||'';
    document.getElementById('cliPhone').value = client.phone||'';
    document.getElementById('cliEmail').value = client.email||'';
    document.getElementById('cliBirth').value = client.birth||'';
    document.getElementById('cliNotes').value = client.notes||'';
    openModal('modalClient');
  }catch(e){toast(e.message,'err');}
}

async function saveClient(){
  const name =document.getElementById('cliName').value.trim();
  const phone=document.getElementById('cliPhone').value.trim();
  if(!name||!phone){toast('Nome e telefone são obrigatórios.','err');return;}
  const body={name,phone,email:document.getElementById('cliEmail').value,birth:document.getElementById('cliBirth').value,notes:document.getElementById('cliNotes').value};
  try{
    if(editingClientId){ await api.updateClient(editingClientId,body); toast('Cliente atualizado!','ok'); }
    else               { await api.createClient(body);                  toast('Cliente cadastrado!','ok'); }
    editingClientId=null;
    document.getElementById('modalClientTitle').textContent='Novo Cliente';
    ['cliName','cliPhone','cliEmail','cliBirth','cliNotes'].forEach(id=>document.getElementById(id).value='');
    closeModal('modalClient');
    renderClients();
    await populateSelects();
  }catch(e){toast(e.message,'err');}
}

async function openClientHistory(id, name){
  document.getElementById('historyTitle').textContent=`Histórico — ${name}`;
  document.getElementById('historyClientInfo').innerHTML='<div style="color:var(--ink3);font-size:0.83rem">Carregando...</div>';
  openModal('modalClientHistory');
  try{
    const {client,appointments}=await api.getClient(id);
    document.getElementById('historyClientInfo').innerHTML=`<div style="display:flex;gap:18px;flex-wrap:wrap;font-size:0.84rem">
      <span>📞 ${client.phone}</span>
      ${client.email?`<span>✉ ${client.email}</span>`:''}
      ${client.notes?`<span>📝 ${client.notes}</span>`:''}
      <span style="margin-left:auto"><strong>${appointments.length}</strong> consultas</span>
    </div>`;
    document.getElementById('historyBody').innerHTML=(appointments||[]).length
      ? appointments.map(a=>{
          const stars=a.rating?'★'.repeat(a.rating)+'☆'.repeat(5-a.rating):'—';
          return `<tr><td>${fmt(a.date)}</td><td>${a.time}</td><td>${TYPE_LABELS[a.type]||a.type}</td><td>${attendantName(a)}</td><td>${statusBadge(a.status)}</td><td style="color:var(--gold)">${stars}</td></tr>`;
        }).join('')
      : '<tr><td colspan="6" style="text-align:center;color:var(--ink3);padding:20px">Nenhum histórico ainda.</td></tr>';
  }catch(e){document.getElementById('historyClientInfo').innerHTML=`<p style="color:var(--red)">${e.message}</p>`;}
}