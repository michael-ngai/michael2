// ── LOCAL FALLBACK ──
function lGet(k){try{return JSON.parse(localStorage.getItem(k)||'null');}catch(e){return null;}}
function lSet(k,v){localStorage.setItem(k,JSON.stringify(v));}

// ── FIREBASE HELPERS ──
async function fbGet(col,id,force){return window.fbGet?window.fbGet(col,id,force):null;}
async function fbSet(col,id,data){return window.fbSet?window.fbSet(col,id,data):null;}
async function fbGetCol(col,force){return window.fbGetCol?window.fbGetCol(col,force):[];}
async function fbAddDoc(col,data){return window.fbAddDoc?window.fbAddDoc(col,data):null;}
async function fbDelDoc(col,id){return window.fbDelDoc?window.fbDelDoc(col,id):null;}
function lGet(k){return window.lGet?window.lGet(k):null;}
function lSet(k,v){return window.lSet?window.lSet(k,v):null;}


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
  document.getElementById('hdr-date').innerHTML=n.toLocaleDateString('en-AU',{weekday:'long'})+'<br>'+n.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'})+'<br>'+time;
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

