function setSyncStatus(state){
  var el=document.getElementById('sync-status');
  if(!el)return;
  if(state==='ok'){el.textContent='synced';el.className='sync-status sync-ok';}
  else if(state==='err'){el.textContent='offline';el.className='sync-status sync-err';}
  else{el.textContent='syncing...';el.className='sync-status sync-loading';}
}

// ── LOCAL FALLBACK ──
function lGet(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function lSet(k,v){localStorage.setItem(k,JSON.stringify(v));}

// ── FIREBASE HELPERS ──
async function fbGet(col,id,forceServer){
  try{
    if(!db)return lGet(col+'_'+id);
    var snap=forceServer
      ?await getDocFromServer(doc(db,col,id))
      :await getDoc(doc(db,col,id));
    return snap.exists()?snap.data():null;
  }catch(e){return lGet(col+'_'+id);}
}
async function fbSet(col,id,data){
  try{
    if(!db)throw new Error('no db');
    await setDoc(doc(db,col,id),data);
    lSet(col+'_'+id,data);
    setSyncStatus('ok');
  }catch(e){lSet(col+'_'+id,data);setSyncStatus('err');}
}
async function fbGetCol(col,forceServer){
  try{
    var snap=forceServer
      ?await getDocsFromServer(collection(db,col))
      :await getDocs(collection(db,col));
    var result=[];
    snap.forEach(function(d){result.push({id:d.id,...d.data()});});
    return result;
  }catch(e){return lGet(col+'_list')||[];}
}
async function fbAddDoc(col,data){
  try{
    var ref=await addDoc(collection(db,col),data);
    setSyncStatus('ok');
    return ref.id;
  }catch(e){setSyncStatus('err');return null;}
}
async function fbDelDoc(col,id){
  try{await deleteDoc(doc(db,col,id));setSyncStatus('ok');}
  catch(e){setSyncStatus('err');}
}

// ── CONSTANTS ──
var DS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var DF=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var DH=['sleep','workout','meal','logdash','duolingo','ai','journal','podcast','nospend'];
var AH=['sleep','workout','meal','logdash','duolingo','ai','journal','podcast','nospend','mealprep','pcs','savings','anthro','housework'];

var SCH={
  1:{note:'PPRC + PCYC · gym after',items:[
    {t:'1:00am–8:30am',l:'Sleep',c:'sleep'},{t:'8:30–9:00am',l:'Travel to PPRC · podcast',c:'travel'},
    {t:'9:00am–1:15pm',l:'PPRC shift',c:'work'},{t:'1:15–2:00pm',l:'Travel PPRC→PCYC · podcast',c:'travel'},
    {t:'2:00–10:00pm',l:'PCYC shift · 30min break',c:'work'},{t:'10:00–11:00pm',l:'Gym at PCYC',c:'gym'},
    {t:'11:00–11:40pm',l:'Shower (40min)',c:'travel'},{t:'11:40pm–12:10am',l:'Travel home · podcast',c:'travel'},
    {t:'12:10–12:30am',l:'Switch / Netflix / Duolingo',c:'fun'},{t:'12:30am',l:'Bed',c:'sleep'}]},
  2:{note:'PPRC + PCYC · basketball game night',items:[
    {t:'1:00am–8:30am',l:'Sleep',c:'sleep'},{t:'8:30–9:00am',l:'Travel to PPRC · podcast',c:'travel'},
    {t:'9:00am–1:15pm',l:'PPRC shift',c:'work'},{t:'1:15–2:00pm',l:'Travel PPRC→PCYC · podcast',c:'travel'},
    {t:'2:00–7:50pm',l:'PCYC shift',c:'work'},{t:'7:50–8:50pm',l:'Basketball game',c:'ball'},{t:'10:00–10:40pm',l:'Shower (40min)',c:'travel'},
    {t:'10:40–11:10pm',l:'Travel home · podcast',c:'travel'},{t:'11:10pm–12am',l:'Switch / Netflix / Duolingo',c:'fun'},
    {t:'12:00am',l:'Bed',c:'sleep'}]},
  3:{note:'PCYC 12–8pm · gym after · free morning',items:[
    {t:'1:00am–8:30am',l:'Sleep',c:'sleep'},{t:'8:30–11:30am',l:'Free morning · AI · Japanese',c:'personal'},
    {t:'11:30am–12pm',l:'Travel to PCYC · podcast',c:'travel'},{t:'12:00–8:00pm',l:'PCYC shift · 30min break',c:'work'},
    {t:'8:00–9:00pm',l:'Gym at PCYC',c:'gym'},{t:'9:00–9:40pm',l:'Shower (40min)',c:'travel'},
    {t:'9:40–10:10pm',l:'Travel home · podcast',c:'travel'},{t:'10:10–11:00pm',l:'Dinner · Duolingo',c:'meal'},
    {t:'11:00pm–12am',l:'Switch / Netflix',c:'fun'},{t:'12:00am',l:'Bed',c:'sleep'}]},
  4:{note:'PCYC 1:30–9:30pm · gym after · free morning',items:[
    {t:'1:00am–8:30am',l:'Sleep',c:'sleep'},{t:'8:30am–12:30pm',l:'Free morning · AI · Japanese',c:'personal'},
    {t:'12:30–1:00pm',l:'Travel to PCYC · podcast',c:'travel'},{t:'1:30–9:30pm',l:'PCYC shift · 30min break',c:'work'},
    {t:'9:30–10:30pm',l:'Gym at PCYC',c:'gym'},{t:'10:30–11:10pm',l:'Shower (40min)',c:'travel'},
    {t:'11:10–11:40pm',l:'Travel home · podcast',c:'travel'},{t:'11:40pm–12:30am',l:'Switch / Netflix / Duolingo',c:'fun'},
    {t:'12:30am',l:'Bed',c:'sleep'}]},
  5:{note:'PCYC 1:30–10pm · basketball practice 10pm–1am',items:[
    {t:'1:30am–9:00am',l:'Sleep',c:'sleep'},{t:'9:00am–12:30pm',l:'Free morning · Switch / Netflix',c:'fun'},
    {t:'12:30–1:00pm',l:'Travel to PCYC · podcast',c:'travel'},{t:'1:30–10:00pm',l:'PCYC shift · 30min break',c:'work'},
    {t:'10:00pm–1:00am',l:'Basketball practice — your court',c:'ball'},{t:'1:00–1:40am',l:'Shower (40min)',c:'travel'},
    {t:'1:40–2:10am',l:'Travel home · podcast',c:'travel'},{t:'2:10am',l:'Bed',c:'sleep'}]},
  6:{note:'Sometimes PPRC · groceries · maybe family dinner',items:[
    {t:'2:10am–10:00am',l:'Sleep in — recover from Friday',c:'sleep'},
    {t:'10:00–10:30am',l:'Travel to PPRC · podcast (if rostered)',c:'travel'},
    {t:'7:15am–2:15pm',l:'PPRC shift (if rostered)',c:'work'},
    {t:'2:15–2:45pm',l:'Travel home · podcast',c:'travel'},
    {t:'3:00–4:00pm',l:'Grocery shopping near home',c:'meal'},
    {t:'4:00–5:30pm',l:'Free time · Switch / Netflix',c:'fun'},
    {t:'5:30–6:00pm',l:"PCS social post (every 2 weeks)",c:'personal'},
    {t:'6:00–10:00pm',l:"Dinner with sister's family (if Saturday)",c:'family'},
    {t:'10:30pm',l:'Bed',c:'sleep'}]},
  0:{note:'Full rest day — your day',items:[
    {t:'Morning',l:'Sleep in — no alarm',c:'sleep'},
    {t:'Morning',l:'Meal prep — 2 batches',c:'meal'},
    {t:'Afternoon',l:'AI learning · Japanese · free',c:'personal'},
    {t:'Afternoon',l:'Switch / Netflix — enjoy',c:'fun'},
    {t:'Evening',l:'Family dinner (if Sunday)',c:'family'},
    {t:'Night',l:'Wind down · early bed',c:'sleep'}]}
};

// ── UTILS ──
function dstr(d){return d.getFullYear()+'-'+(d.getMonth()+1).toString().padStart(2,'0')+'-'+d.getDate().toString().padStart(2,'0');}
function fm(n){n=Number(n);return (isNaN(n)?'$0':'$'+Math.round(n).toLocaleString());}
function fmd(n){n=Number(n);return (isNaN(n)?'$0.0':'$'+(Math.round(n*10)/10).toFixed(1));}
var todayStr=dstr(new Date());

function logicalDate(d){
  var hour=d.getHours();
  if(hour<5){var prev=new Date(d);prev.setDate(prev.getDate()-1);return dstr(prev);}
  return dstr(d);
}
var logicalToday=logicalDate(new Date());
var selectedDate=logicalToday;
var ttSelectedDate=logicalToday;
var WEEKLY_HABITS=['mealprep','pcs','savings','anthro','housework'];

var HABIT_CAL_MAP={
  // Daily body
  sleep:    {type:'sleep',    label:'Slept 7.5–8 hours'},
  workout:  {type:'sports',   label:'Worked out / basketball'},
  meal:     {type:'meal',     label:'Ate home-cooked'},
  // Daily mind - all learning
  duolingo: {type:'learning', label:'Duolingo — Japanese'},
  ai:       {type:'learning', label:'Used AI productively'},
  journal:  {type:'learning', label:'Wrote journal in English'},
  podcast:  {type:'learning', label:'Listened to English podcast'},
  // Daily money
  logdash:  {type:'personal', label:'Logged dashboard'},
  nospend:  {type:'personal', label:'No unnecessary spending'},
  // Weekly
  mealprep: {type:'meal',     label:'Sunday meal prep done'},
  pcs:      {type:'work',     label:'PCS social post published'},
  savings:  {type:'personal', label:'Payday savings transferred'},
  anthro:   {type:'learning', label:'Anthropic Academy — 1hr'},
  housework: {type:'personal', label:'House work — laundry & vacuum'}
};

function weekKey(dateStr){
  var d=new Date(dateStr+'T00:00:00');
  var dow=d.getDay(),diff=(dow===0)?-6:1-dow;
  var mon=new Date(d);mon.setDate(d.getDate()+diff);
  return 'wk_'+dstr(mon);
}

// ── HEADER ──
function updHdr(){
  var n=new Date();
  var time=n.toLocaleTimeString('en-AU',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  document.getElementById('hdr-date').innerHTML=n.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})+', '+n.toLocaleDateString('en-AU',{weekday:'long'})+'<br>'+time;
}

// ── TABS ──
window._switchTab=function(name){
  var ns=['todo','calendar','savings'];
  ns.forEach(function(n,i){
    document.querySelectorAll('.tab')[i].classList.toggle('active',n===name);
    document.getElementById('panel-'+n).classList.toggle('active',n===name);
  });
  if(name==='todo'){window._switchTodoSub('routine');}
  if(name==='calendar'){window._switchCalSub('calendar');renderCal();}
  if(name==='savings'){window._switchSavSub('savings');renderSav();renderBudget();}
};


// ── DARK/LIGHT MODE ──
window._toggleTheme=function(){
  var isLight=document.body.classList.toggle('light');
  localStorage.setItem('theme',isLight?'light':'dark');
  var btn=document.getElementById('theme-btn');
  if(btn)btn.textContent=isLight?'☀️':'🌙';
};
(function(){
  if(localStorage.getItem('theme')==='light'){
    document.body.classList.add('light');
    setTimeout(function(){var b=document.getElementById('theme-btn');if(b)b.textContent='☀️';},100);
  }
})();

// ── WEATHER WIDGET ──
(function(){
  var cache=lGet('weather_cache');
  var now=Date.now();
  if(cache&&cache.ts&&(now-cache.ts)<1800000){
    renderWeather(cache);
    return;
  }
  fetch('https://api.open-meteo.com/v1/forecast?latitude=-33.87&longitude=151.21&current=temperature_2m,weathercode&timezone=Australia/Sydney')
    .then(function(r){return r.json();})
    .then(function(d){
      var data={temp:Math.round(d.current.temperature_2m),code:d.current.weathercode,ts:Date.now()};
      lSet('weather_cache',data);
      renderWeather(data);
    }).catch(function(){});
})();

function renderWeather(d){
  var el=document.getElementById('weather-widget');
  if(!el)return;
  var icons={0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'❄️',75:'❄️',80:'🌦️',81:'🌧️',82:'⛈️',95:'⛈️'};
  var icon=icons[d.code]||'🌡️';
  el.innerHTML=icon+' '+d.temp+'°C · Sydney';
}

// ── HOME NOTE ──
window._saveHomeNote=function(){
  var val=document.getElementById('home-note').value;
  lSet('home_note_'+dstr(new Date()),val);
};
(function initHomeNote(){
  setTimeout(function(){
    var today=dstr(new Date());
    var el=document.getElementById('home-note');
    var dateEl=document.getElementById('home-note-date');
    if(el){
      var saved=lGet('home_note_'+today)||'';
      el.value=saved;
    }
    if(dateEl){
      var d=new Date();
      dateEl.textContent=d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'short'});
    }
  },500);
})();

// ── XP SYSTEM ──
var XP_LEVELS=[0,100,250,500,1000,2000,4000,7000,11000,16000,25000];

function xpForLevel(lv){return XP_LEVELS[lv]||XP_LEVELS[XP_LEVELS.length-1];}

function getXPData(){
  return lGet('xp_data')||{xp:0,level:1,log:[]};
}

function saveXPData(d){
  lSet('xp_data',d);
}

function renderXP(){
  var d=getXPData();
  var lv=d.level||1;
  var xp=d.xp||0;
  var thisLvXP=xpForLevel(lv-1);
  var nextLvXP=xpForLevel(lv);
  var pct=nextLvXP>thisLvXP?Math.min(100,Math.round((xp-thisLvXP)/(nextLvXP-thisLvXP)*100)):100;

  var lvEl=document.getElementById('xp-level');
  var fillEl=document.getElementById('xp-fill');
  var lblEl=document.getElementById('xp-label');

  if(lvEl) lvEl.textContent='Lv.'+lv;
  if(fillEl) fillEl.style.width=pct+'%';
  if(lblEl) lblEl.textContent=xp+' XP';
}

window._addXP=function(amount,reason){
  var d=getXPData();
  d.xp=(d.xp||0)+amount;
  if(d.xp<0)d.xp=0;

  // Level up check
  var levelled=false;
  while(d.level<XP_LEVELS.length-1&&d.xp>=xpForLevel(d.level)){
    d.level++;
    levelled=true;
  }

  // Log entry
  d.log=d.log||[];
  d.log.unshift({ts:Date.now(),amount:amount,reason:reason||'',level:d.level});
  if(d.log.length>100)d.log=d.log.slice(0,100);

  saveXPData(d);
  renderXP();

  // Level up flash
  if(levelled){
    var lvEl=document.getElementById('xp-level');
    if(lvEl){
      lvEl.style.color='var(--green)';
      lvEl.textContent='Lv.'+d.level+' ▲';
      setTimeout(function(){lvEl.style.color='var(--text3)';lvEl.textContent='Lv.'+d.level;},2000);
    }
  }
};

// Init XP on load
(function(){setTimeout(renderXP,600);})();
