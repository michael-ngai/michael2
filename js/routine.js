// ── ROUTINE — 4 SUBTABS ──
var DAILY_HABITS  = ['sleep','workout','meal','duolingo','ai','journal','podcast','logdash','nospend'];
var WEEKLY_HABITS = ['mealprep','groceries','sister','housework','anthro','rent'];
var FN_HABITS     = ['pcs','savings','atm','fuel'];
var MO_HABITS     = ['bedsheet','mop','haircut'];

var dailyCache={}, weeklyCache={}, fnCache={}, moCache={}, habitCache={};

// ── Period key helpers ──
function wkKey(ds){
  var d=new Date(ds+'T00:00:00'),day=d.getDay(),diff=day===0?-6:1-day;
  var m=new Date(d); m.setDate(d.getDate()+diff);
  return 'wk_'+dstr(m);
}
function fnKey(ds){
  var base=new Date('2026-04-15T00:00:00'),d=new Date(ds+'T00:00:00');
  var n=Math.floor((d-base)/(14*86400000));
  var s=new Date(base); s.setDate(base.getDate()+n*14);
  return 'fn_'+dstr(s);
}
function moKey(y,m){ return 'mo_'+y+'-'+String(m+1).padStart(2,'0'); }
function weekNum(d){
  var j=new Date(d.getFullYear(),0,1);
  return Math.ceil(((d-j)/86400000+j.getDay()+1)/7);
}

// ── Selected periods ──
var selDate='', selWeek='', selFn='', selMoY=0, selMoM=0;

function initPeriods(){
  selDate = logicalDate(new Date());
  selWeek = wkKey(selDate);
  selFn   = fnKey(selDate);
  var n   = new Date();
  selMoY  = n.getFullYear();
  selMoM  = n.getMonth();
}

// ── Load helpers ──
async function loadP(key, cache){
  if(cache[key]) return cache[key];
  var d = await fbGet('habits', key) || {};
  cache[key] = d;
  return d;
}
async function loadHabits(ds){ return loadP(ds, habitCache); }

// ── CB helper ──
function cbHtml(){ return '<svg class="ck" width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#0e0e0f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'; }
function hrow(id, text, tag, cls){
  return '<div class="hrow" data-id="'+id+'" onclick="togRoutine(this)">'+
    '<div class="cb">'+cbHtml()+'</div>'+
    '<div class="htext">'+text+'</div>'+
    '<span class="tag '+cls+'">'+tag+'</span>'+
    '</div>';
}

// ── Apply ticked state ──
function applyTicks(el, habits, data){
  habits.forEach(function(h){
    var row = el.querySelector('[data-id="'+h+'"]');
    if(!row) return;
    var ticked = !!data[h];
    row.classList.toggle('done', ticked);
    var cb = row.querySelector('.cb');
    if(cb) cb.classList.toggle('checked', ticked);
  });
}

// ── RENDER DAILY ──
async function renderDaily(){
  if(!selDate) initPeriods();
  var data = await loadP(selDate, dailyCache);
  var el = document.getElementById('daily-habits');
  if(!el) return;

  el.innerHTML = [
    hrow('sleep',   'Slept 7.5–8 hours',                        'Sleep',    'tp'),
    hrow('workout', 'Worked out / played basketball',            'Sports',   'ta'),
    hrow('meal',    'Ate home-cooked — no dining out',           'Meal',     'to'),
    hrow('duolingo','Duolingo — at least 1 lesson',              'Learning', 'ta'),
    hrow('ai',      'Used AI for something useful',              'Learning', 'ta'),
    hrow('journal', 'Wrote daily journal entry in English',      'Learning', 'ta'),
    hrow('podcast', 'Listened to English podcast',               'Learning', 'ta'),
    hrow('logdash', 'Logged everything on the dashboard',        'Personal', 'tb'),
    hrow('nospend', 'No unnecessary spending today',             'Personal', 'tb'),
  ].join('');
  applyTicks(el, DAILY_HABITS, data);

  var done = DAILY_HABITS.filter(function(h){ return data[h]; }).length;
  var cnt  = document.getElementById('daily-count');
  if(cnt) cnt.textContent = done+'/'+DAILY_HABITS.length+' done';

  // Date display
  var d  = new Date(selDate+'T00:00:00');
  var dd = String(d.getDate()).padStart(2,'0');
  var mm = String(d.getMonth()+1).padStart(2,'0');
  var di = document.getElementById('daily-date-display');
  if(di) di.value = dd+'/'+mm+'/'+d.getFullYear()+',  '+d.toLocaleDateString('en-AU',{weekday:'long'});
  var dh = document.getElementById('daily-date-hidden');
  if(dh) dh.value = selDate;

  // Quick-note presets
  var qn = document.getElementById('quick-notes');
  if(qn) qn.innerHTML=[
    'Rest day','Ate out once','Busy day','Basketball game',
    'Worked late','Tired','Good day','Travel day'
  ].map(function(t){
    return '<button class="btn" data-note="'+t+'" onclick="appendNote(this.dataset.note)" style="font-size:10px;padding:3px 8px;height:auto;margin:2px;">'+t+'</button>';
  }).join('');

  // Streak
  computeStreak();
}

// ── RENDER WEEKLY ──
async function renderWeekly(){
  if(!selWeek) initPeriods();
  var data = await loadP(selWeek, weeklyCache);
  var el   = document.getElementById('weekly-habits');
  if(!el) return;

  el.innerHTML = [
    hrow('mealprep', 'Meal prep — 3 batches',                              'Meal',     'to'),
    hrow('groceries','Grocery shopping done',                               'Personal', 'tb'),
    hrow('sister',   'Dinner with sister',                                  'Family',   'tp'),
    hrow('housework','Housework — vacuum & clean the toilet',               'Personal', 'tb'),
    hrow('anthro',   'Anthropic Academy — 1 hour',                          'Learning', 'ta'),
    hrow('rent',     'Place $380 rent cash in the drawer on Monday night',  'Personal', 'tb'),
  ].join('');
  applyTicks(el, WEEKLY_HABITS, data);

  var done = WEEKLY_HABITS.filter(function(h){ return data[h]; }).length;
  var pct  = Math.round(done/WEEKLY_HABITS.length*100);
  var cnt  = document.getElementById('weekly-count');
  if(cnt){
    var col=pct===100?'var(--green)':pct>=50?'var(--amber)':'var(--blue)';
    cnt.innerHTML=done+'/'+WEEKLY_HABITS.length+' <span style="color:'+col+';font-size:14px;font-weight:700;">'+pct+'%</span>';
  }

  var wd   = new Date(selWeek.replace('wk_','')+'T00:00:00');
  var we   = new Date(wd); we.setDate(wd.getDate()+6);
  var disp = document.getElementById('weekly-display');
  populateWeekSelect();
  var wdisp=document.getElementById('weekly-display');
  if(wdisp) wdisp.textContent = 'Week '+weekNum(wd)+' — '+
    wd.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' to '+
    we.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
}

// ── RENDER FORTNIGHTLY ──
async function renderFortnightly(){
  if(!selFn) initPeriods();
  var data = await loadP(selFn, fnCache);
  var el   = document.getElementById('fn-habits');
  if(!el) return;

  el.innerHTML = [
    hrow('pcs',    'PCS social post published',                          'Work',     'tg'),
    hrow('savings','Payday savings transferred ($100 + $500 + $400)',    'Personal', 'tb'),
    hrow('atm',    'Withdraw $760 cash from ATM for rent (2 × $380)',    'Personal', 'tb'),
    hrow('fuel',   'Fill up the car at Costco',                          'Personal', 'tb'),
  ].join('');
  applyTicks(el, FN_HABITS, data);

  var done = FN_HABITS.filter(function(h){ return data[h]; }).length;
  var cnt  = document.getElementById('fn-count');
  if(cnt) cnt.textContent = done+'/'+FN_HABITS.length+' done';

  var fs   = new Date(selFn.replace('fn_','')+'T00:00:00');
  var fe   = new Date(fs); fe.setDate(fs.getDate()+13);
  var base = new Date('2026-04-15T00:00:00');
  var fnum = Math.round((fs-base)/(14*86400000))+1;
  var disp = document.getElementById('fn-display');
  populateFnSelect();
  var fndisp=document.getElementById('fn-display');
  if(fndisp) fndisp.textContent = 'Fortnight '+fnum+' — '+
    fs.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' to '+
    fe.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
}

// ── RENDER MONTHLY ──
async function renderMonthly(){
  var mk   = moKey(selMoY, selMoM);
  var data = await loadP(mk, moCache);
  var el   = document.getElementById('mo-habits');
  if(!el) return;

  el.innerHTML = [
    hrow('bedsheet','Change bed sheets and pillowcase', 'Home',     'th'),
    hrow('mop',     'Mop the floor',                    'Home',     'th'),
    hrow('haircut', 'Haircut',                          'Personal', 'tb'),
  ].join('');
  applyTicks(el, MO_HABITS, data);

  var done = MO_HABITS.filter(function(h){ return data[h]; }).length;
  var cnt  = document.getElementById('mo-count');
  if(cnt) cnt.textContent = done+'/'+MO_HABITS.length+' done';

  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var disp = document.getElementById('mo-display');
  populateMoSelect();
  var modisp=document.getElementById('mo-display');
  if(modisp) modisp.textContent = months[selMoM]+' '+selMoY;
}

// ── TOGGLE ──
window._togRoutine = async function(el){
  var id  = el.dataset.id;
  var tab = (document.querySelector('#rtn-subtabs .subtab.active')||{}).dataset||{};
  var t   = tab.tab || 'daily';

  var key, cache, render;
  if(t==='daily')       { key=selDate; cache=dailyCache;  render=renderDaily; }
  else if(t==='weekly') { key=selWeek; cache=weeklyCache; render=renderWeekly; }
  else if(t==='fortnightly'){ key=selFn; cache=fnCache;   render=renderFortnightly; }
  else                  { key=moKey(selMoY,selMoM); cache=moCache; render=renderMonthly; }

  var data = await fbGet('habits', key) || {};
  var wasTicked = !!data[id];
  data[id] = !data[id];
  cache[key] = data;
  await fbSet('habits', key, data);
  // XP
  if(window._addXP){
    window._addXP(data[id]?10:-10, (data[id]?'✓ ':'✗ ')+id);
    if(t==='daily'&&data[id]){
      var doneCount=DAILY_HABITS.filter(function(h){return data[h];}).length;
      if(doneCount===DAILY_HABITS.length) window._addXP(50,'🔥 Full daily routine!');
    }
  }
  render();
};

// ── SWITCH SUBTAB ──
window._switchRtnSub = function(name){
  document.querySelectorAll('#rtn-subtabs .subtab').forEach(function(b){
    b.classList.toggle('active', b.dataset.tab===name);
  });
  ['daily','weekly','fortnightly','monthly'].forEach(function(n){
    var el = document.getElementById('rtn-'+n);
    if(el) el.style.display = n===name ? '' : 'none';
  });
  if(name==='daily')        renderDaily();
  else if(name==='weekly')  renderWeekly();
  else if(name==='fortnightly') renderFortnightly();
  else renderMonthly();
};

// ── NAV ──
window._shiftDailyDate = function(dir){
  var d=new Date(selDate+'T00:00:00'); d.setDate(d.getDate()+dir);
  selDate=dstr(d); renderDaily();
};
window._goDailyToday    = function(){ selDate=logicalDate(new Date()); renderDaily(); };
window._changeDailyDate = function(){
  var v=document.getElementById('daily-date-hidden').value;
  if(v){ selDate=v; renderDaily(); }
};
window._shiftWeek   = function(dir){
  var d=new Date(selWeek.replace('wk_','')+'T00:00:00'); d.setDate(d.getDate()+dir*7);
  selWeek=wkKey(dstr(d)); renderWeekly();
};
window._goThisWeek  = function(){ selWeek=wkKey(logicalDate(new Date())); renderWeekly(); };
window._shiftFn     = function(dir){
  var d=new Date(selFn.replace('fn_','')+'T00:00:00'); d.setDate(d.getDate()+dir*14);
  selFn=fnKey(dstr(d)); renderFortnightly();
};
window._goThisFn    = function(){ selFn=fnKey(logicalDate(new Date())); renderFortnightly(); };
window._shiftMonth  = function(dir){
  selMoM+=dir;
  if(selMoM>11){selMoM=0;selMoY++;}
  if(selMoM<0) {selMoM=11;selMoY--;}
  renderMonthly();
};
window._goThisMonth = function(){ var n=new Date(); selMoY=n.getFullYear(); selMoM=n.getMonth(); renderMonthly(); };

// ── LEGACY (history/streak) ──
window._togH   = window._togRoutine;
window._resetH = async function(){
  dailyCache[selDate]={}; await fbSet('habits',selDate,{}); renderDaily();
};

// ── HISTORY / STREAK (legacy) ──
var DH = DAILY_HABITS;

// ── DROPDOWN POPULATION ──
function populateWeekSelect(){
  var el=document.getElementById('weekly-select');
  if(!el)return;
  el.innerHTML='';
  // Generate W1-W52 for current year
  var year=new Date().getFullYear();
  var jan1=new Date(year,0,1);
  for(var w=1;w<=52;w++){
    var dayOffset=(w-1)*7-(jan1.getDay()||7)+1;
    var wStart=new Date(year,0,1+dayOffset);
    var wEnd=new Date(wStart);wEnd.setDate(wStart.getDate()+6);
    var wk='wk_'+dstr(wStart);
    var lbl='W'+w+' — '+wStart.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' to '+wEnd.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
    var o=document.createElement('option');
    o.value=wk; o.textContent=lbl;
    if(wk===selWeek)o.selected=true;
    el.appendChild(o);
  }
}
function populateFnSelect(){
  var el=document.getElementById('fn-select');
  if(!el)return;
  el.innerHTML='';
  var base=new Date('2026-04-15T00:00:00');
  for(var i=0;i<26;i++){
    var s=new Date(base);s.setDate(base.getDate()+i*14);
    var e=new Date(s);e.setDate(s.getDate()+13);
    var fk='fn_'+dstr(s);
    var lbl='FN'+(i+1)+' — '+s.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' to '+e.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
    var o=document.createElement('option');
    o.value=fk;o.textContent=lbl;
    if(fk===selFn)o.selected=true;
    el.appendChild(o);
  }
}
function populateMoSelect(){
  var el=document.getElementById('mo-select');
  if(!el)return;
  el.innerHTML='';
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var year=new Date().getFullYear();
  months.forEach(function(mn,mi){
    var o=document.createElement('option');
    o.value=mi;o.textContent=mn+' '+year;
    if(mi===selMoM&&year===selMoY)o.selected=true;
    el.appendChild(o);
  });
}

window._jumpToWeek=function(wk){selWeek=wk;renderWeekly();};
window._jumpToFn=function(fk){selFn=fk;renderFortnightly();};
window._jumpToMonth=function(mi){selMoM=parseInt(mi);renderMonthly();};

// ── STREAK COUNTER ──
async function computeStreak(){
  var streak=0;
  var today=logicalDate(new Date());
  // Check last 60 days max
  for(var i=0;i<60;i++){
    var d=new Date(today+'T00:00:00');
    d.setDate(d.getDate()-i);
    var ds=dstr(d);
    var data=habitCache[ds]||await fbGet('habits',ds)||{};
    habitCache[ds]=data;
    var done=DAILY_HABITS.filter(function(h){return data[h];}).length;
    var pct=DAILY_HABITS.length>0?done/DAILY_HABITS.length:0;
    // Skip today if nothing ticked yet
    if(i===0&&done===0) continue;
    if(pct>=0.7) streak++;
    else break;
  }
  var el=document.getElementById('streak-display');
  if(!el) return;
  if(streak===0){
    el.innerHTML='🔥 <span style="color:var(--amber);font-size:15px;font-weight:700;">0</span> <span style="color:var(--text2);font-size:11px;">day streak</span>';
  } else {
    el.innerHTML='🔥 <b style="color:var(--amber);font-size:18px;">'+streak+'</b> <span style="color:var(--text2);font-size:12px;">day streak</span>';
  }
}

window._appendNote=function(txt){
  var el=document.getElementById('daily-note');
  if(!el)return;
  el.value=(el.value?el.value+' · ':'')+txt;
  if(window.saveNote)saveNote();
};
