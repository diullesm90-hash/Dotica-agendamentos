// appointments.js — Agendamentos via API
let editingApptId = null, statusTargetId = null, reschedTargetId = null, selectedRating = 0;

async function renderAppointments() {
  showLoading('apptBody', 6);
  document.getElementById('apptEmpty').style.display = 'none';
  try {
    const params = {};
    const search  = document.getElementById('apptSearch').value.trim();
    const fStatus = document.getElementById('apptFilterStatus').value;
    const fType   = document.getElementById('apptFilterType').value;
    const fDate   = document.getElementById('apptFilterDate').value;
    if (fStatus) params.status = fStatus;
    if (fType)   params.type   = fType;
    if (fDate)   params.date   = fDate;

    const { appointments } = await api.getAppointments(params);
    let list = appointments || [];
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(a => clientName(a).toLowerCase().includes(s) || clientPhone(a).includes(s));
    }
    list.sort((a,b) => b.date.localeCompare(a.date) || a.time.localeCompare(b.time));

    document.getElementById('apptEmpty').style.display = list.length ? 'none' : 'block';
    document.getElementById('apptBody').innerHTML = list.map(a => `<tr>
      <td><strong>${fmt(a.date)}</strong> <span style="color:var(--ink3)">${a.time}</span></td>
      <td><strong>${clientName(a)}</strong><div style="font-size:0.73rem;color:var(--ink3)">${clientPhone(a)}</div></td>
      <td><span class="chip">${TYPE_LABELS[a.type]||a.type}</span></td>
      <td>${attendantName(a)}</td>
      <td>${statusBadge(a.status)}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-icon btn-sm" title="Status" onclick="openStatusModal('${a._id}','${a.status}','${clientName(a)}','${TYPE_LABELS[a.type]||a.type}','${fmt(a.date)}','${a.time}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="btn btn-ghost btn-icon btn-sm" title="Remarcar" onclick="openReschedule('${a._id}','${clientName(a)}','${TYPE_LABELS[a.type]||a.type}','${fmt(a.date)}','${a.time}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        </button>
        <button class="btn btn-danger btn-icon btn-sm" title="Cancelar" onclick="doCancelAppt('${a._id}')">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </td>
    </tr>`).join('');
  } catch(e) { toast('Erro ao carregar agendamentos: '+e.message,'err'); }
}

function clearApptFilters(){
  ['apptSearch','apptFilterStatus','apptFilterType','apptFilterDate'].forEach(id=>document.getElementById(id).value='');
  renderAppointments();
}

async function doCancelAppt(id){
  if(!confirm('Cancelar este agendamento?')) return;
  try { await api.cancelAppt(id); toast('Agendamento cancelado.','ok'); renderAppointments(); if(currentPage==='dashboard')renderDashboard(); } catch(e){toast(e.message,'err');}
}

// ── Modal Criar / Editar ──────────────────────────
function openModal(id){
  document.getElementById(id).classList.add('open');
  if(id==='modalAppt'){
    editingApptId=null;
    document.getElementById('modalApptTitle').textContent='Novo Agendamento';
    ['apptClient','apptAttendant','apptType','apptNotes'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('apptDate').value=todayISO();
    document.getElementById('apptTime').value='';
    loadSlots();
  }
}
function closeModal(id){ document.getElementById(id).classList.remove('open'); }

async function loadSlots(){
  const date=document.getElementById('apptDate').value;
  const attendant=document.getElementById('apptAttendant').value;
  const grid=document.getElementById('slotsGrid');
  if(!date){grid.innerHTML='<p style="color:var(--ink3);font-size:0.83rem">Selecione uma data para ver horários.</p>';return;}
  grid.innerHTML='<p style="color:var(--ink3);font-size:0.83rem">Carregando...</p>';
  try{
    const params={date};
    if(attendant) params.attendantId=attendant;
    const {available}=await api.getAvailability(params);
    const selected=document.getElementById('apptTime').value;
    grid.innerHTML=(available||[]).map(s=>`<div class="slot ${s.busy?'busy':''} ${s.time===selected?'chosen':''}" onclick="selectSlot(this,'${s.time}','apptTime')">${s.time}</div>`).join('')
      || '<p style="color:var(--ink3);font-size:0.83rem">Sem atendimento neste dia.</p>';
  }catch(e){grid.innerHTML='<p style="color:var(--ink3);font-size:0.83rem">Erro ao buscar horários.</p>';}
}

function selectSlot(el,time,hiddenId){
  if(el.classList.contains('busy'))return;
  el.closest('.slots-grid').querySelectorAll('.slot').forEach(s=>s.classList.remove('chosen'));
  el.classList.add('chosen');
  document.getElementById(hiddenId).value=time;
}

async function saveAppointment(){
  const clientId   =document.getElementById('apptClient').value;
  const attendantId=document.getElementById('apptAttendant').value;
  const type       =document.getElementById('apptType').value;
  const date       =document.getElementById('apptDate').value;
  const time       =document.getElementById('apptTime').value;
  const notes      =document.getElementById('apptNotes').value;
  if(!clientId||!attendantId||!type||!date||!time){toast('Preencha todos os campos obrigatórios.','err');return;}
  try{
    if(editingApptId){
      await api.updateAppointment(editingApptId,{clientId,attendantId,type,date,time,notes});
      toast('Agendamento atualizado!','ok');
    }else{
      await api.createAppointment({clientId,attendantId,type,date,time,notes});
      toast('Agendamento criado!','ok');
    }
    closeModal('modalAppt');
    if(currentPage==='dashboard')    renderDashboard();
    if(currentPage==='appointments') renderAppointments();
    if(currentPage==='calendar')     { renderCalendar(); renderCalendarDay(calSelectedDate); }
  }catch(e){toast(e.message,'err');}
}

// ── Modal Status ──────────────────────────────────
function openStatusModal(id, currentStatus='agendado', cliName='', typeName='', date='', time=''){
  statusTargetId=id; selectedRating=0;
  document.getElementById('statusPatientInfo').innerHTML=`<strong>${cliName}</strong> · ${typeName} · ${date} ${time}`;
  document.getElementById('statusSelect').value=currentStatus;
  document.getElementById('absenceReason').value='';
  document.getElementById('ratingComment').value='';
  setRating(0); onStatusChange();
  openModal('modalStatus');
}
function onStatusChange(){
  const s=document.getElementById('statusSelect').value;
  document.getElementById('absenceGroup').style.display = s==='falta'?'block':'none';
  document.getElementById('ratingGroup').style.display  = s==='compareceu'?'block':'none';
}
function setRating(v){
  selectedRating=v;
  document.querySelectorAll('#ratingStars .star').forEach(s=>s.classList.toggle('on',parseInt(s.dataset.v)<=v));
}
async function saveStatus(){
  try{
    const body={status:document.getElementById('statusSelect').value};
    const reason=document.getElementById('absenceReason').value;
    const comment=document.getElementById('ratingComment').value;
    if(reason)  body.absenceReason=reason;
    if(selectedRating) body.rating=selectedRating;
    if(comment) body.ratingComment=comment;
    await api.updateStatus(statusTargetId,body);
    toast('Status atualizado!','ok');
    closeModal('modalStatus');
    if(currentPage==='dashboard')    renderDashboard();
    if(currentPage==='appointments') renderAppointments();
    if(currentPage==='calendar')     { renderCalendar(); renderCalendarDay(calSelectedDate); }
  }catch(e){toast(e.message,'err');}
}

// ── Modal Remarcar ────────────────────────────────
function openReschedule(id, cliName='', typeName='', date='', time=''){
  reschedTargetId=id;
  document.getElementById('rescheduleInfo').innerHTML=`<strong>${cliName}</strong> · ${typeName} · Atual: ${date} ${time}`;
  document.getElementById('reschedDate').value='';
  document.getElementById('reschedTime').value='';
  document.getElementById('reschedSlots').innerHTML='<p style="color:var(--ink3);font-size:0.83rem">Selecione a data.</p>';
  openModal('modalReschedule');
}
async function loadReschedSlots(){
  const date=document.getElementById('reschedDate').value;
  const grid=document.getElementById('reschedSlots');
  if(!date){grid.innerHTML='<p style="color:var(--ink3);font-size:0.83rem">Selecione a data.</p>';return;}
  grid.innerHTML='<p style="color:var(--ink3);font-size:0.83rem">Carregando...</p>';
  try{
    const {available}=await api.getAvailability({date});
    grid.innerHTML=(available||[]).map(s=>`<div class="slot ${s.busy?'busy':''}" onclick="selectSlot(this,'${s.time}','reschedTime')">${s.time}</div>`).join('')
      ||'<p style="color:var(--ink3);font-size:0.83rem">Sem atendimento neste dia.</p>';
  }catch(e){grid.innerHTML='<p style="color:var(--ink3);font-size:0.83rem">Erro ao buscar horários.</p>';}
}
async function saveReschedule(){
  const date=document.getElementById('reschedDate').value;
  const time=document.getElementById('reschedTime').value;
  if(!date||!time){toast('Selecione data e horário.','err');return;}
  try{
    await api.reschedule(reschedTargetId,{date,time});
    toast('Agendamento remarcado!','ok');
    closeModal('modalReschedule');
    if(currentPage==='dashboard')    renderDashboard();
    if(currentPage==='appointments') renderAppointments();
    if(currentPage==='calendar')     { renderCalendar(); renderCalendarDay(calSelectedDate); }
  }catch(e){toast(e.message,'err');}
}

document.querySelectorAll('.overlay').forEach(ov=>{
  ov.addEventListener('click',e=>{if(e.target===ov)ov.classList.remove('open');});
});