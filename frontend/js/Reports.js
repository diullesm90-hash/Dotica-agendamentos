// reports.js — Relatórios via API
let reportChart=null;

function initReports(){
  const now=new Date();
  const y=now.getFullYear(),m=String(now.getMonth()+1).padStart(2,'0');
  document.getElementById('repStart').value=`${y}-${m}-01`;
  document.getElementById('repEnd').value=isoDate(now);
}

async function generateReport(){
  const start=document.getElementById('repStart').value;
  const end  =document.getElementById('repEnd').value;
  if(!start||!end){toast('Selecione o período completo.','err');return;}
  try{
    const {summary,appointments}=await api.getReport({startDate:start,endDate:end});
    document.getElementById('reportResult').style.display='block';
    document.getElementById('reportStats').innerHTML=[
      {l:'Total',v:summary.total,c:''},
      {l:'Compareceu',v:summary.present,c:'green'},
      {l:'Faltas',v:summary.absent,c:'crimson'},
      {l:'Cancelados',v:summary.canceled,c:''},
      {l:'Taxa Presença',v:(summary.attendanceRate||0)+'%',c:summary.attendanceRate>=70?'green':'gold'},
    ].map(s=>`<div class="stat"><div class="stat-accent ${s.c}"></div><div class="stat-label">${s.l}</div><div class="stat-val">${s.v}</div></div>`).join('');

    // Gráfico diário
    const days={};
    (appointments||[]).forEach(a=>{
      if(!days[a.date])days[a.date]={present:0,absent:0};
      if(a.status==='compareceu')days[a.date].present++;
      if(a.status==='falta')     days[a.date].absent++;
    });
    const labelsRaw=Object.keys(days).sort();
    const labelsShort=labelsRaw.map(d=>new Date(d+'T12:00:00').toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'}));
    if(reportChart)reportChart.destroy();
    reportChart=new Chart(document.getElementById('chartReport').getContext('2d'),{
      type:'bar',
      data:{labels:labelsShort,datasets:[
        {label:'Compareceu',data:labelsRaw.map(d=>days[d].present),backgroundColor:'rgba(30,122,66,0.75)',borderRadius:4},
        {label:'Falta',     data:labelsRaw.map(d=>days[d].absent), backgroundColor:'rgba(204,26,26,0.75)',borderRadius:4},
      ]},
      options:{responsive:true,plugins:{legend:{labels:{color:'#6b84a8',font:{family:'DM Sans',size:11}}}},scales:{x:{ticks:{color:'#6b84a8',maxTicksLimit:14},grid:{color:'rgba(0,0,0,0.04)'}},y:{ticks:{color:'#6b84a8'},grid:{color:'rgba(0,0,0,0.04)'}}}},
    });

    document.getElementById('reportBody').innerHTML=(appointments||[]).length
      ?(appointments||[]).map(a=>`<tr><td>${fmt(a.date)}</td><td>${a.time}</td><td><strong>${clientName(a)}</strong></td><td>${TYPE_LABELS[a.type]||a.type}</td><td>${attendantName(a)}</td><td>${statusBadge(a.status)}</td></tr>`).join('')
      :`<tr><td colspan="6" style="text-align:center;color:var(--ink3);padding:20px">Nenhum resultado no período.</td></tr>`;
  }catch(e){toast('Erro ao gerar relatório: '+e.message,'err');}
}

async function exportCSV(){
  const start=document.getElementById('repStart').value;
  const end  =document.getElementById('repEnd').value;
  if(!start||!end){toast('Gere o relatório antes de exportar.','err');return;}
  try{
    const blob=await api.getReportCSV({startDate:start,endDate:end});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`relatorio_${start}_${end}.csv`;a.click();
    URL.revokeObjectURL(url);
    toast('CSV exportado!','ok');
  }catch(e){toast('Erro ao exportar: '+e.message,'err');}
}