// ── BUDGET ──
function renderBudget(){
  function logo(domain){return '<img src="https://www.google.com/s2/favicons?domain='+domain+'&sz=32" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;margin-right:5px;border-radius:3px;" />';}
  var rows=[
    {label:logo('realestate.com.au')+'Rent',w:380,fn:760,m:1647,y:19760},
    {label:logo('costco.com.au')+'Fuel — Costco (500km/2 weeks)',w:40,fn:80,m:173,y:2080},
    {label:logo('honda.com')+'Car (insurance / rego / service)',w:48,fn:96,m:208,y:2500},
    {label:logo('humanservices.gov.au')+'Personal insurance',w:16.63,fn:33.26,m:72,y:864},
    {label:logo('amaysim.com.au')+'Phone — Amaysim',w:7.50,fn:15,m:33,y:390},
    {label:logo('anthropic.com')+'Claude Pro',w:7.85,fn:15.69,m:34,y:408},
    {label:logo('icloud.com')+'iCloud',w:3.46,fn:6.92,m:15,y:180},
    {label:logo('netflix.com')+'Netflix',w:2.31,fn:4.62,m:10,y:120},
    {label:logo('amazon.com.au')+'Amazon Prime',w:2.31,fn:4.62,m:10,y:120},
    {label:logo('woolworths.com.au')+'Groceries',w:100,fn:200,m:433,y:5200},
    {label:'✂️ Haircut',w:8.08,fn:16.15,m:35,y:420},
  ];
  var income={w:1250,fn:2500,m:5000,y:60000};
  var totalW=rows.reduce(function(s,r){return s+r.w;},0);
  var totalFn=rows.reduce(function(s,r){return s+r.fn;},0);
  var totalM=rows.reduce(function(s,r){return s+r.m;},0);
  var totalY=rows.reduce(function(s,r){return s+r.y;},0);
  var savW=500,savFn=1000,savM=2167,savY=26000;
  var bufW=income.w-totalW-savW;
  var bufFn=income.fn-totalFn-savFn;
  var bufM=income.m-totalM-savM;
  var bufY=income.y-totalY-savY;
  function fc(n){return '$'+Math.round(n*100)/100;}
  function pct(n){return (n/income.fn*100).toFixed(1)+'%';}
  function row(label,w,fn,m,y,bold,color){
    var s=bold?'font-weight:500;':'';
    var c=color?'color:'+color+';':'color:var(--text2);';
    var bc=bold?'border-top:0.5px solid var(--border2);border-bottom:0.5px solid var(--border);':'border-bottom:0.5px solid var(--border);';
    var mono='font-family:monospace;';
    var td='padding:8px 10px;text-align:right;'+mono;
    return '<tr class="budrow" style="'+bc+'"><td style="padding:8px 12px;'+s+c+'">'+label+'</td>'+
      '<td style="'+td+s+c+'">'+fc(w)+'</td>'+
      '<td style="'+td+s+c+'">'+fc(fn)+'</td>'+
      '<td style="'+td+s+c+'">'+fc(m)+'</td>'+
      '<td style="'+td+s+c+'">'+fc(y)+'</td>'+
      '<td style="'+td+s+c+'">'+pct(fn)+'</td>'+
      '</tr>';
  }
  function rowSub(label,w,fn,m,y,color){
    var c=color?'color:'+color+';opacity:0.7;':'color:var(--text3);';
    var mono='font-family:monospace;';
    var td='padding:5px 10px;text-align:right;'+mono;
    return '<tr class="budrow" style="border-bottom:0.5px solid var(--border);"><td style="padding:5px 12px;font-size:11px;'+c+'">'+label+'</td>'+
      '<td style="'+td+'font-size:11px;'+c+'">'+fc(w)+'</td>'+
      '<td style="'+td+'font-size:11px;'+c+'">'+fc(fn)+'</td>'+
      '<td style="'+td+'font-size:11px;'+c+'">'+fc(m)+'</td>'+
      '<td style="'+td+'font-size:11px;'+c+'">'+fc(y)+'</td>'+
      '<td style="'+td+'font-size:11px;'+c+'">'+pct(fn)+'</td>'+
      '</tr>';
  }
  var html='';
  html+=row(logo('pcycnsw.org.au')+'Income — PCYC',income.w,income.fn,income.m,income.y,true,'var(--green)');
  rows.forEach(function(r){html+=row(r.label,r.w,r.fn,r.m,r.y,false,null);});
  html+=row('Total expenses',totalW,totalFn,totalM,totalY,true,'var(--red)');
  html+=rowSub(logo('commbank.com.au')+'CommBank — Emergency fund',50,100,217,2600,'var(--amber)');
  html+=rowSub(logo('ubank.com.au')+'Ubank — Property deposit',250,500,1083,13000,'var(--green)');
  html+=rowSub(logo('wise.com')+'Wise → Investing (HK)',200,400,867,10400,'var(--blue)');
  html+=row('Total Savings',savW,savFn,savM,savY,true,'var(--blue)');
  html+=row('Buffer left',bufW,bufFn,bufM,bufY,true,'var(--amber)');
  document.getElementById('budget-body').innerHTML=html;
  var bsEl=document.getElementById('bud-stats');if(bsEl){function sc(l,v,col){return '<div class="card" style="margin:0;"><div style="padding:10px 14px;"><div class="stat-lbl">'+l+'</div><div class="stat-val" style="color:'+col+';">'+fc(v)+'</div></div></div>';}bsEl.innerHTML=sc('Monthly expenses',totalM,'var(--red)')+sc('Monthly income',income.m,'var(--green)')+sc('Monthly savings',savM,'var(--blue)')+sc('Buffer',bufM,'var(--amber)');}
}

function updateDateDisplay(){
  var d=new Date(selectedDate+'T00:00:00');
  var dayName=d.toLocaleDateString('en-AU',{weekday:'long'});
  var dd=String(d.getDate()).padStart(2,'0');
  var mm=String(d.getMonth()+1).padStart(2,'0');
  var yyyy=d.getFullYear();
  var el=document.getElementById('habit-date-display');
  if(el){if(el.tagName==='INPUT')el.value=dd+'/'+mm+'/'+yyyy+',  '+dayName;else el.textContent=dd+'/'+mm+'/'+yyyy+',  '+dayName;}
}
function updateTTDateDisplay(){
  var d=new Date(ttSelectedDate+'T00:00:00');
  var dayName=d.toLocaleDateString('en-AU',{weekday:'long'});
  var dd=String(d.getDate()).padStart(2,'0');
  var mm=String(d.getMonth()+1).padStart(2,'0');
  var yyyy=d.getFullYear();
  var el=document.getElementById('tt-date-display');
  if(el){if(el.tagName==='INPUT')el.value=dd+'/'+mm+'/'+yyyy+',  '+dayName;else el.textContent=dd+'/'+mm+'/'+yyyy+',  '+dayName;}
}
window._shiftDate=function(dir){
  var d=new Date(selectedDate+'T00:00:00');
  d.setDate(d.getDate()+dir);
  selectedDate=dstr(d);
  document.getElementById('habit-date-hidden').value=selectedDate;
  updateDateDisplay();
  renderH();
};
window._changeHabitDate=function(){
  selectedDate=document.getElementById('habit-date-hidden').value||todayStr;
  updateDateDisplay();
  renderH();
};
window._goToday=function(){
  selectedDate=logicalToday;
  document.getElementById('habit-date-hidden').value=logicalToday;
  updateDateDisplay();
  renderH();
};
window._jumpToDate=function(ds){
  selectedDate=ds;
  document.getElementById('habit-date-hidden').value=ds;
  updateDateDisplay();
  renderH();
};
window._shiftTTDate=function(dir){
  var d=new Date(ttSelectedDate+'T00:00:00');
  d.setDate(d.getDate()+dir);
  ttSelectedDate=dstr(d);
  document.getElementById('tt-date-hidden').value=ttSelectedDate;
  updateTTDateDisplay();
  renderTT();
};
window._changeTTDate=function(){
  ttSelectedDate=document.getElementById('tt-date-hidden').value||todayStr;
  updateTTDateDisplay();
  renderTT();
};
window._goTTToday=function(){
  ttSelectedDate=logicalToday;
  document.getElementById('tt-date-hidden').value=logicalToday;
  updateTTDateDisplay();
  renderTT();
};
window._updateCEDate=function(){
  var date=document.getElementById('ce-date-hidden').value;
  if(!date)return;
  var d=new Date(date+'T00:00:00');
  var dayName=d.toLocaleDateString('en-AU',{weekday:'long'});
  var dd=String(d.getDate()).padStart(2,'0');
  var mm=String(d.getMonth()+1).padStart(2,'0');
  var yyyy=d.getFullYear();
  var el=document.getElementById('ce-date-display');
  if(el)el.value=dayName+' '+dd+'/'+mm+'/'+yyyy;
  CS.sel=date;
};

// ── TODO ──
var todoCache=null;

async function loadTodo(){
  if(todoCache)return todoCache;
  var data=await fbGet('todo','main');
  todoCache=data||{pending:[],done:[]};
  if(!todoCache.pending)todoCache.pending=[];
  if(!todoCache.done)todoCache.done=[];
  return todoCache;
}

window._addTodo=async function(){
  var input=document.getElementById('todo-input');
  var text=input.value.trim();
  if(!text)return;
  var d=await loadTodo();
  d.pending.unshift({id:Date.now().toString(),text:text,created:new Date().toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})});
  todoCache=d;
  await fbSet('todo','main',d);
  input.value='';
  renderTodo();
};

window._tickTodo=async function(id){
  var d=await loadTodo();
  var idx=d.pending.findIndex(function(t){return t.id===id;});
  if(idx<0)return;
  var task=d.pending.splice(idx,1)[0];
  task.completed=new Date().toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'short',year:'numeric'});
  d.done.unshift(task);
  todoCache=d;
  await fbSet('todo','main',d);
  renderTodo();
};

window._deleteTodo=async function(id,from){
  var d=await loadTodo();
  if(from==='pending')d.pending=d.pending.filter(function(t){return t.id!==id;});
  else d.done=d.done.filter(function(t){return t.id!==id;});
  todoCache=d;
  await fbSet('todo','main',d);
  renderTodo();
};

async function renderTodo(){
  var d=await loadTodo();

  // Pending
  var pl=document.getElementById('todo-pending-list');
  var pc=document.getElementById('todo-pending-count');
  if(pc)pc.textContent=d.pending.length+' task'+(d.pending.length===1?'':'s');
  if(pl){
    if(d.pending.length===0){
      pl.innerHTML='<div class="empty">No tasks — add one above</div>';
    } else {
      pl.innerHTML=d.pending.map(function(t){
        return '<div class="hrow" style="align-items:flex-start;gap:11px;">'
          +'<div class="cb" data-id="'+t.id+'" onclick="tickTodo(this.dataset.id)" style="cursor:pointer;margin-top:1px;flex-shrink:0;"><svg class="ck" width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#0e0e0f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
          +'<div style="flex:1;">'
          +'<div style="font-size:13px;color:var(--text);line-height:1.5;">'+t.text+'</div>'
          +'<div style="font-size:11px;color:var(--text3);font-family:monospace;margin-top:2px;">Added '+t.created+'</div>'
          +'</div>'
          +'<button class="editbtn" data-id="'+t.id+'" onclick="editTodo(this.dataset.id)">edit</button>'
          +'<span class="evtdel" data-id="'+t.id+'" data-from="pending" onclick="deleteTodo(this.dataset.id,this.dataset.from)">&#215;</span>'
          +'</div>';
      }).join('');
    }
  }

  // Done
  var dl=document.getElementById('todo-done-list');
  var dc=document.getElementById('todo-done-count');
  if(dc)dc.textContent=d.done.length+' completed';
  if(dl){
    if(d.done.length===0){
      dl.innerHTML='<div class="empty">Nothing completed yet</div>';
    } else {
      dl.innerHTML=d.done.map(function(t){
        return '<div class="logrow" style="align-items:flex-start;flex-direction:column;gap:3px;padding:10px 14px;">'
          +'<div style="display:flex;align-items:center;gap:8px;width:100%;">'
          +'<div style="width:16px;height:16px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;flex-shrink:0;">'
          +'<svg width="8" height="8" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#0e0e0f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
          +'<div style="flex:1;font-size:13px;color:var(--text2);text-decoration:line-through;">'+t.text+'</div>'
          +'<span class="evtdel" data-id="'+t.id+'" data-from="done" onclick="deleteTodo(this.dataset.id,this.dataset.from)">&#215;</span>'
          +'</div>'
          +'<div style="font-size:11px;color:var(--green);font-family:monospace;padding-left:24px;">✓ Done '+t.completed+'</div>'
          +'</div>';
      }).join('');
    }
  }
}

// ── DAILY NOTE ──
var noteTimer=null;
window._saveNote=function(){
  clearTimeout(noteTimer);
  noteTimer=setTimeout(async function(){
    var val=document.getElementById('daily-note').value;
    await fbSet('notes',selectedDate,{text:val});
  },600);
};

async function loadNote(dateStr){
  var data=await fbGet('notes',dateStr);
  var el=document.getElementById('daily-note');
  if(el)el.value=(data&&data.text)?data.text:'';
}

// ── HISTORY ──
async function renderHistory(){
  var today=new Date();
  var rows=[];
  // Check last 30 days
  for(var i=0;i<30;i++){
    var d=new Date(today);
    d.setDate(today.getDate()-i);
    var ds=dstr(d);
    var data=await loadHabits(ds);
    var done=DH.filter(function(h){return data[h];}).length;
    var total=DH.length;
    rows.push({d:d,ds:ds,done:done,total:total});
  }
  // Summary stats
  var perfectDays=rows.filter(function(r){return r.done===r.total;}).length;
  var activeDays=rows.filter(function(r){return r.done>0;}).length;
  var el=document.getElementById('hist-summary');
  if(el)el.textContent=perfectDays+' Perfect · '+activeDays+' Active (last 30d)';
  // Render list
  var list=document.getElementById('hist-list');
  if(!list)return;
  var html=rows.filter(function(r){return r.done>0;}).map(function(r){
    var isToday=r.d.toDateString()===today.toDateString();
    var isPerfect=r.done===r.total;
    var pct=Math.round(r.done/r.total*100);
    var dayLabel=isToday?'Today':r.d.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});
    var colour=isPerfect?'var(--green)':pct>=50?'var(--amber)':'var(--text3)';
    var badge=isPerfect?'<span class="badge bg" style="font-size:10px;">Perfect</span>':'';
    return '<div class="logrow" style="gap:8px;">'
      +'<div style="min-width:110px;font-size:12px;color:var(--text2);">'+dayLabel+'</div>'
      +'<div style="flex:1;">'
      +'<div style="height:5px;background:var(--surface2);border-radius:3px;overflow:hidden;">'
      +'<div style="height:100%;width:'+pct+'%;background:'+colour+';border-radius:3px;"></div>'
      +'</div></div>'
      +'<div style="font-size:12px;font-family:monospace;color:'+colour+';min-width:32px;text-align:right;">'+r.done+'/'+r.total+'</div>'
      +badge
      +'</div>';
  }).join('');
  list.innerHTML=html||'<div class="empty">No habit data yet</div>';
}

window._editTodo=async function(id){
  var d=await loadTodo();
  var task=d.pending.find(function(t){return t.id===id;});
  if(!task)return;
  var inp=document.getElementById('todo-input');
  if(!inp)return;
  inp.value=task.text;
  inp.focus();
  var btn=document.querySelector('#td-view-todo .brow .btn.p');
  if(btn){btn.textContent='Update';btn.onclick=function(){window._updateTodo(id);};}
  inp.scrollIntoView({behavior:'smooth'});
};

window._updateTodo=async function(id){
  var inp=document.getElementById('todo-input');
  var text=inp?inp.value.trim():'';
  if(!text)return;
  var d=await loadTodo();
  var task=d.pending.find(function(t){return t.id===id;});
  if(!task)return;
  task.text=text;
  await fbSet('todos','main',d);
  inp.value='';
  var btn=document.querySelector('#td-view-todo .brow .btn.p');
  if(btn){btn.textContent='Add task';btn.onclick=function(){addTodo();};}
  renderTodo();
};
