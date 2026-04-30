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
  var cnt  = document.getElementById('weekly-count');
  if(cnt) cnt.textContent = done+'/'+WEEKLY_HABITS.length+' done';

  var wd   = new Date(selWeek.replace('wk_','')+'T00:00:00');
  var we   = new Date(wd); we.setDate(wd.getDate()+6);
  var disp = document.getElementById('weekly-display');
  if(disp) disp.textContent = 'Week '+weekNum(wd)+' — '+
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
  if(disp) disp.textContent = 'Fortnight '+fnum+' — '+
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
  if(disp) disp.textContent = months[selMoM]+' '+selMoY;
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
  data[id] = !data[id];
  cache[key] = data;
  await fbSet('habits', key, data);
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
