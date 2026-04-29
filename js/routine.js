// ── ROUTINE CONSTANTS ──
var ROUTINE_DAILY = ['sleep','workout','meal','duolingo','ai','journal','podcast','logdash','nospend'];
var ROUTINE_WEEKLY = ['mealprep','groceries','sister','housework','anthro','rent'];
var ROUTINE_FORTNIGHTLY = ['pcs','savings','atm','fuel'];
var ROUTINE_MONTHLY = ['bedsheet','mop','haircut'];

// Firebase key helpers
function wkKey(d){var dt=new Date(d+'T00:00:00'),day=dt.getDay(),diff=(day===0)?-6:1-day;var m=new Date(dt);m.setDate(dt.getDate()+diff);return 'wk_'+dstr(m);}
function fnKey(d){var base=new Date('2026-04-15T00:00:00'),dt=new Date(d+'T00:00:00');var diff=Math.floor((dt-base)/(14*86400000));var start=new Date(base);start.setDate(base.getDate()+diff*14);return 'fn_'+dstr(start);}
function moKey(y,m){return 'mo_'+y+'-'+String(m+1).padStart(2,'0');}

// ── HABIT CACHE ──
var habitCache={};
var dailyCache={};
var weeklyCache={};
var fnCache={};
var moCache={};

async function loadDailyHabits(dateStr){
  if(dailyCache[dateStr])return dailyCache[dateStr];
  var data=await fbGet('habits',dateStr,true)||{};
  dailyCache[dateStr]=data;
  return data;
}
async function loadWeeklyHabits(wk){
  if(weeklyCache[wk])return weeklyCache[wk];
  var data=await fbGet('habits',wk,true)||{};
  weeklyCache[wk]=data;
  return data;
}
async function loadFnHabits(fk){
  if(fnCache[fk])return fnCache[fk];
  var data=await fbGet('habits',fk,true)||{};
  fnCache[fk]=data;
  return data;
}
async function loadMoHabits(mk){
  if(moCache[mk])return moCache[mk];
  var data=await fbGet('habits',mk,true)||{};
  moCache[mk]=data;
  return data;
}

// Legacy loadHabits for history/streak
async function loadHabits(dateStr){
  var data=await fbGet('habits',dateStr,true)||{};
  habitCache[dateStr]=data;
  return data;
}

// ── SELECTED PERIODS ──
var selDate='';
var selWeek='';
var selFn='';
var selMo={y:new Date().getFullYear(),m:new Date().getMonth()};

function initRoutineState(){
  selDate=logicalDate(new Date());
  selWeek=wkKey(selDate);
  selFn=fnKey(selDate);
  selMo={y:new Date().getFullYear(),m:new Date().getMonth()};
}

// ── CB HELPER ──
function cbSvg(){return '<svg class="ck" width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#0e0e0f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';}
function hrow(id,text,tag,tagClass){return '<div class="hrow" data-id="'+id+'" onclick="togRoutine(this)"><div class="cb">'+cbSvg()+'</div><div class="htext">'+text+'</div><span class="tag '+tagClass+'">'+tag+'</span></div>';}

// ── RENDER DAILY ──
async function renderDaily(){
  var data=await loadDailyHabits(selDate);
  var el=document.getElementById('daily-habits');
  if(!el)return;
  var done=ROUTINE_DAILY.filter(function(h){return data[h];}).length;
  var pct=ROUTINE_DAILY.length>0?Math.round(done/ROUTINE_DAILY.length*100):0;
  var cnt=document.getElementById('daily-count');
  if(cnt)cnt.textContent=done+'/'+ROUTINE_DAILY.length+' done';

  var rows=[
    hrow('sleep','Slept 7.5–8 hours','Sleep','tp'),
    hrow('workout','Worked out / played basketball','Sports','ta'),
    hrow('meal','Ate home-cooked — no dining out','Meal','to'),
    hrow('duolingo','Duolingo — at least 1 lesson','Learning','ta'),
    hrow('ai','Used AI for something useful','Learning','ta'),
    hrow('journal','Wrote daily journal entry in English','Learning','ta'),
    hrow('podcast','Listened to English podcast','Learning','ta'),
    hrow('logdash','Logged everything on the dashboard','Personal','tb'),
    hrow('nospend','No unnecessary spending today','Personal','tb'),
  ];
  el.innerHTML=rows.join('');
  ROUTINE_DAILY.forEach(function(h){
    var row=el.querySelector('[data-id="'+h+'"]');
    if(row){row.classList.toggle('done',!!data[h]);if(data[h])row.querySelector('.cb').classList.add('checked');}
  });

  // Update date display
  var d=new Date(selDate+'T00:00:00');
  var dd=String(d.getDate()).padStart(2,'0');
  var mm=String(d.getMonth()+1).padStart(2,'0');
  var disp=document.getElementById('daily-date-display');
  if(disp)disp.value=dd+'/'+mm+'/'+d.getFullYear()+',  '+d.toLocaleDateString('en-AU',{weekday:'long'});
  var hidden=document.getElementById('daily-date-hidden');
  if(hidden)hidden.value=selDate;
}

// ── RENDER WEEKLY ──
async function renderWeekly(){
  var data=await loadWeeklyHabits(selWeek);
  var el=document.getElementById('weekly-habits');
  if(!el)return;
  var done=ROUTINE_WEEKLY.filter(function(h){return data[h];}).length;
  var cnt=document.getElementById('weekly-count');
  if(cnt)cnt.textContent=done+'/'+ROUTINE_WEEKLY.length+' done';

  var rows=[
    hrow('mealprep','Meal prep — 3 batches','Meal','to'),
    hrow('groceries','Grocery shopping done','Personal','tb'),
    hrow('sister','Dinner with sister','Family','tp'),
    hrow('housework','Housework — vacuum & clean the toilet','Personal','tb'),
    hrow('anthro','Anthropic Academy — 1 hour','Learning','ta'),
    hrow('rent','Place $380 rent cash in the drawer on Monday night','Personal','tb'),
  ];
  el.innerHTML=rows.join('');
  ROUTINE_WEEKLY.forEach(function(h){
    var row=el.querySelector('[data-id="'+h+'"]');
    if(row){row.classList.toggle('done',!!data[h]);if(data[h])row.querySelector('.cb').classList.add('checked');}
  });

  // Update week display
  var wdate=new Date(selWeek.replace('wk_','')+'T00:00:00');
  var wend=new Date(wdate);wend.setDate(wdate.getDate()+6);
  var wnum=getWeekNumber(wdate);
  var disp=document.getElementById('weekly-display');
  if(disp)disp.textContent='Week '+wnum+' — '+wdate.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' to '+wend.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
}

// ── RENDER FORTNIGHTLY ──
async function renderFortnightly(){
  var fk=selFn;
  var data=await loadFnHabits(fk);
  var el=document.getElementById('fn-habits');
  if(!el)return;
  var done=ROUTINE_FORTNIGHTLY.filter(function(h){return data[h];}).length;
  var cnt=document.getElementById('fn-count');
  if(cnt)cnt.textContent=done+'/'+ROUTINE_FORTNIGHTLY.length+' done';

  var rows=[
    hrow('pcs','PCS social post published','Work','tg'),
    hrow('savings','Payday savings transferred ($100 + $500 + $400)','Personal','tb'),
    hrow('atm','Withdraw $380 × 2 = $760 cash from ATM for rent','Personal','tb'),
    hrow('fuel','Fill up the car at Costco','Personal','tb'),
  ];
  el.innerHTML=rows.join('');
  ROUTINE_FORTNIGHTLY.forEach(function(h){
    var row=el.querySelector('[data-id="'+h+'"]');
    if(row){row.classList.toggle('done',!!data[h]);if(data[h])row.querySelector('.cb').classList.add('checked');}
  });

  // Update fortnightly display
  var base=new Date('2026-04-15T00:00:00');
  var fstart=new Date(fk.replace('fn_','')+'T00:00:00');
  var fend=new Date(fstart);fend.setDate(fstart.getDate()+13);
  var diff=Math.round((fstart-base)/(14*86400000));
  var fnum=diff+1;
  var disp=document.getElementById('fn-display');
  if(disp)disp.textContent='Fortnight '+fnum+' — '+fstart.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' to '+fend.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
}

// ── RENDER MONTHLY ──
async function renderMonthly(){
  var mk=moKey(selMo.y,selMo.m);
  var data=await loadMoHabits(mk);
  var el=document.getElementById('mo-habits');
  if(!el)return;
  var done=ROUTINE_MONTHLY.filter(function(h){return data[h];}).length;
  var cnt=document.getElementById('mo-count');
  if(cnt)cnt.textContent=done+'/'+ROUTINE_MONTHLY.length+' done';

  var rows=[
    hrow('bedsheet','Change bed sheets and pillowcase','Home','th'),
    hrow('mop','Mop the floor','Home','th'),
    hrow('haircut','Haircut','Personal','tb'),
  ];
  el.innerHTML=rows.join('');
  ROUTINE_MONTHLY.forEach(function(h){
    var row=el.querySelector('[data-id="'+h+'"]');
    if(row){row.classList.toggle('done',!!data[h]);if(data[h])row.querySelector('.cb').classList.add('checked');}
  });

  // Update month display
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var disp=document.getElementById('mo-display');
  if(disp)disp.textContent=months[selMo.m]+' '+selMo.y;
}

// ── TOGGLE ──
window._togRoutine=async function(el){
  var id=el.dataset.id;
  var subtab=document.querySelector('#rtn-subtabs .subtab.active');
  var tab=subtab?subtab.dataset.tab:'daily';

  if(tab==='daily'){
    var data=await loadDailyHabits(selDate);
    data[id]=!data[id];
    dailyCache[selDate]=data;
    await fbSet('habits',selDate,data);
    renderDaily();
  } else if(tab==='weekly'){
    var data=await loadWeeklyHabits(selWeek);
    data[id]=!data[id];
    weeklyCache[selWeek]=null;
    await fbSet('habits',selWeek,data);
    weeklyCache[selWeek]=data;
    renderWeekly();
  } else if(tab==='fortnightly'){
    var data=await loadFnHabits(selFn);
    data[id]=!data[id];
    fnCache[selFn]=null;
    await fbSet('habits',selFn,data);
    fnCache[selFn]=data;
    renderFortnightly();
  } else if(tab==='monthly'){
    var mk=moKey(selMo.y,selMo.m);
    var data=await loadMoHabits(mk);
    data[id]=!data[id];
    moCache[mk]=null;
    await fbSet('habits',mk,data);
    moCache[mk]=data;
    renderMonthly();
  }
};

// ── SWITCH ROUTINE SUBTAB ──
window._switchRtnSub=function(name){
  document.querySelectorAll('#rtn-subtabs .subtab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===name);});
  document.getElementById('rtn-daily').style.display=name==='daily'?'':'none';
  document.getElementById('rtn-weekly').style.display=name==='weekly'?'':'none';
  document.getElementById('rtn-fn').style.display=name==='fortnightly'?'':'none';
  document.getElementById('rtn-mo').style.display=name==='monthly'?'':'none';
  if(name==='daily')renderDaily();
  else if(name==='weekly')renderWeekly();
  else if(name==='fortnightly')renderFortnightly();
  else if(name==='monthly')renderMonthly();
};

// ── DATE NAVIGATION ──
window._shiftDailyDate=function(dir){
  var d=new Date(selDate+'T00:00:00');d.setDate(d.getDate()+dir);
  selDate=dstr(d);renderDaily();
};
window._goDailyToday=function(){selDate=logicalDate(new Date());renderDaily();};
window._changeDailyDate=function(){
  var v=document.getElementById('daily-date-hidden').value;
  if(v)selDate=v;renderDaily();
};

window._shiftWeek=function(dir){
  var d=new Date(selWeek.replace('wk_','')+'T00:00:00');d.setDate(d.getDate()+dir*7);
  selWeek=wkKey(dstr(d));renderWeekly();
};
window._goThisWeek=function(){selWeek=wkKey(logicalDate(new Date()));renderWeekly();};

window._shiftFn=function(dir){
  var d=new Date(selFn.replace('fn_','')+'T00:00:00');d.setDate(d.getDate()+dir*14);
  selFn=fnKey(dstr(d));renderFortnightly();
};
window._goThisFn=function(){selFn=fnKey(logicalDate(new Date()));renderFortnightly();};

window._shiftMonth=function(dir){
  selMo.m+=dir;
  if(selMo.m>11){selMo.m=0;selMo.y++;}
  if(selMo.m<0){selMo.m=11;selMo.y--;}
  renderMonthly();
};
window._goThisMonth=function(){var n=new Date();selMo={y:n.getFullYear(),m:n.getMonth()};renderMonthly();};

// ── WEEK NUMBER HELPER ──
function getWeekNumber(d){
  var j1=new Date(d.getFullYear(),0,1);
  return Math.ceil(((d-j1)/86400000+j1.getDay()+1)/7);
}

// ── LEGACY COMPAT (for history/streak) ──
window._togH=window._togRoutine;
window._resetH=async function(){
  dailyCache[selDate]=null;
  await fbSet('habits',selDate,{});
  renderDaily();
};
