// users.js — Usuários via API
async function renderUsers(){
  showLoading('userBody',7);
  try{
    const users=await api.getUsers();
    document.getElementById('userBody').innerHTML=(users||[]).map(u=>`<tr>
      <td><div style="display:flex;align-items:center;gap:9px"><div class="avatar" style="background:var(--blue-l);color:var(--blue)">${initials(u.name)}</div><strong>${u.name}</strong></div></td>
      <td style="font-size:0.82rem">${u.email}</td>
      <td>${u.role==='admin'?'<span class="badge b-accent">Admin</span>':'<span class="badge b-teal">Atendente</span>'}</td>
      <td>${u.unit||'Principal'}</td>
      <td style="font-size:0.81rem;color:var(--ink3)">${u.lastLogin?new Date(u.lastLogin).toLocaleDateString('pt-BR'):'—'}</td>
      <td>${u.isActive?'<span class="badge b-green">Ativo</span>':'<span class="badge b-gray">Inativo</span>'}</td>
      <td class="td-actions"><button class="btn btn-ghost btn-sm" onclick="doToggleUser('${u._id}')">${u.isActive?'Desativar':'Ativar'}</button></td>
    </tr>`).join('');
  }catch(e){toast('Erro ao carregar usuários: '+e.message,'err');}
}

async function saveUser(){
  const name =document.getElementById('userName').value.trim();
  const email=document.getElementById('userEmail').value.trim();
  const pass =document.getElementById('userPass').value;
  const role =document.getElementById('userRole').value;
  const unit =document.getElementById('userUnit').value.trim()||'Principal';
  if(!name||!email||!pass){toast('Preencha todos os campos.','err');return;}
  if(pass.length<6){toast('Senha deve ter pelo menos 6 caracteres.','err');return;}
  try{
    await api.createUser({name,email,password:pass,role,unit});
    toast('Usuário criado!','ok');
    closeModal('modalUser');
    ['userName','userEmail','userPass'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('userUnit').value='Principal';
    renderUsers();
    await populateSelects();
  }catch(e){toast(e.message,'err');}
}

async function doToggleUser(id){
  if(currentUser&&currentUser._id===id){toast('Não é possível desativar seu próprio usuário.','err');return;}
  try{
    await api.toggleUser(id);
    toast('Usuário atualizado.','ok');
    renderUsers();
  }catch(e){toast(e.message,'err');}
}
