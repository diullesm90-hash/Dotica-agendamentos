// calendar.js — Calendário via API
let calYear, calMonth, calSelectedDate;
let calAppts = [];

async function initCalendar(){
  const now=new Date();
  calYear  = calYear  ?? now.getFullYear();
  calMonth = calMonth ?? now.getMonth();
  calSelectedDate = calSelectedDate || todayISO();
  await loadCalendarMonth();
  renderCalendar();
  renderCalendarDay(calSelectedDate);
}

async function loadCalendarMonth(){
  const firstDay = new Date(calYear, calMonth, 1).toISOString().split('T')[0];
  const lastDay  = new Date(calYear, calMonth + 1, 0).toISOString().split('T')[0];

  try{
    const {appointments}=await api.getAppointments({startDate:firstDay,endDate:lastDay});
    calAppts=appointments||[];
  }catch(e){ calAppts=[]; }
}

function renderCalendar(){
  document.getElementById('calMonthLabel').textContent=`${MONTHS_PT[calMonth]} ${calYear}`;
  document.getElementById('calHeader').innerHTML=DAYS_PT.map(d=>`<div class="cal-head">${d}</div>`).join('');

  const first=new Date(calYear,calMonth,1);
  const startDow=first.getDay();
  const daysInMon=new Date(calYear,calMonth+1,0).getDate();
  const daysInPrev=new Date(calYear,calMonth,0).getDate();
  const todayStr=todayISO();

  const cells=[];

  for(let i=startDow-1;i>=0;i--){
    const m = calMonth === 0 ? 11 : calMonth - 1;
    const y = calMonth === 0 ? calYear - 1 : calYear;
    cells.push({day:daysInPrev-i,month:m,year:y,other:true});
  }

  for(let d=1;d<=daysInMon;d++){
    cells.push({day:d,month:calMonth,year:calYear,other:false});
  }

  for(let d=1;cells.length<42;d++){
    const m = calMonth === 11 ? 0 : calMonth + 1;
    const y = calMonth === 11 ? calYear + 1 : calYear;
    cells.push({day:d,month:m,year:y,other:true});
  }

  const evtColors={agendado:'',confirmado:'teal',compareceu:'teal',falta:'',remarcado:'gold'};

  document.getElementById('calBody').innerHTML=cells.map(c=>{
    const ds=`${c.year}-${String(c.month+1).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`;
    const dayAppts=!c.other?calAppts.filter(a=>a.date===ds&&a.status!=='cancelado'):[];
    
    const evtsHtml=dayAppts.slice(0,3).map(a=>
      `<div class="cal-evt ${evtColors[a.status]||''}">
        ${a.time} ${clientName(a).split(' ')[0]}
      </div>`
    ).join('')+(dayAppts.length>3?`<div class="cal-evt more">+${dayAppts.length-3} mais</div>`:'');

    const classes=['cal-cell',c.other?'other':'',ds===todayStr?'today':'',ds===calSelectedDate?'selected':'']
      .filter(Boolean).join(' ');

    return `<div class="${classes}" ${c.other?'':` onclick="selectCalDay('${ds}')"`}>
      <div class="cal-day">${c.day}</div>
      ${evtsHtml}
    </div>`;
  }).join('');
}

async function selectCalDay(ds){
  calSelectedDate=ds;
  renderCalendar();
  renderCalendarDay(ds);
}

async function renderCalendarDay(ds){
  if(!ds)return;

  document.getElementById('calDayTitle').textContent =
    new Date(ds+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'});

  showLoading('calDayBody',5);

  try{
    const {appointments}=await api.getAppointments({date:ds});
    const appts=(appointments||[]).sort((a,b)=>a.time.localeCompare(b.time));

    document.getElementById('calDayBody').innerHTML = appts.length
      ? appts.map(a=>`<tr>
          <td><strong>${a.time}</strong></td>
          <td><strong>${clientName(a)}</strong></td>
          <td>${TYPE_LABELS[a.type]||a.type}</td>
          <td>${statusBadge(a.status)}</td>
          <td class="td-actions">
            <button class="btn btn-ghost btn-sm" onclick="openStatusModal('${a._id}')">Status</button>
            <button class="btn btn-ghost btn-sm" onclick="openReschedule('${a._id}')">Remarcar</button>
          </td>
        </tr>`).join('')
      : `<tr><td colspan="5" style="text-align:center;padding:20px">Nenhum agendamento neste dia.</td></tr>`;
  }catch(e){
    toast('Erro ao carregar dia: '+e.message,'err');
  }
}