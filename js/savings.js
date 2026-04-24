// ── SAVINGS ──
var savCache=null;
async function loadSav(){
  if(savCache)return savCache;
  var data=await fbGet('savings','main');
  savCache=Object.assign({emergency:0,deposit:0,invest:0,entries:[]},data||{});
  return savCache;
}
function nextPay(){var b=new Date('2026-04-15'),n=new Date(),d=new Date(b);while(d<=n)d.setDate(d.getDate()+14);return d;}
function mLeft(){var n=new Date(),t=new Date('2028-08-01');return Math.max(0,Math.round((t-n)/(1000*60*60*24*30.44)));}

window._logSav=async function(){
  var a=document.getElementById('sv-acct').value;
  var amt=parseFloat(document.getElementById('sv-in').value);
  var note=document.getElementById('sv-note').value.trim();
  if(!amt||amt<=0){alert('Enter a valid amount');return;}
  var d=await loadSav();
  if(a==='emergency')d.emergency+=amt;
  else if(a==='deposit')d.deposit+=amt;
  else d.invest=(d.invest||0)+amt;
  d.entries.push({date:new Date().toLocaleDateString('en-AU',{day:'numeric',month:'short'}),acct:a,amount:amt,note:note});
  savCache=d;
  await fbSet('savings','main',d);
  document.getElementById('sv-in').value='';document.getElementById('sv-note').value='';
  renderSav();
};

window._clrSav=async function(){
  if(confirm('Reset all savings data?')){savCache={emergency:0,deposit:0,invest:0,entries:[]};await fbSet('savings','main',savCache);renderSav();}
};

async function renderSav(){
  var d=await loadSav(),ml=mLeft(),np=nextPay();var emg=0,dep=0,inv=0;(d.entries||[]).forEach(function(e){var a=e.amount||0;if(e.acct==='emergency')emg+=a;else if(e.acct==='deposit')dep+=a;else inv+=a;});if(!emg)emg=d.emergency||0;if(!dep)dep=d.deposit||0;if(!inv)inv=d.invest||0;var proj=Math.round(dep+ml*500),ef=emg>=6000;
  document.getElementById('sv-emerg').textContent=fm(emg);
  document.getElementById('sv-dep').textContent=fm(dep);
  document.getElementById('sv-invest').textContent=fm(inv);
  document.getElementById('sv-months').textContent=ml;
  document.getElementById('sv-proj').textContent=fm(proj);
  document.getElementById('pay-next').textContent=np.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  document.getElementById('pay-amt').textContent=ef?'$900 → deposit+invest':'$500+$100+$400';
  var ep=Math.min(100,Math.round(emg/6000*100));
  document.getElementById('eb-bar').style.width=ep+'%';document.getElementById('eb-pct').textContent=ep+'%';
  var ebb=document.getElementById('eb-badge');ebb.textContent=ep>=100?'Complete':'In progress';ebb.className='badge '+(ep>=100?'bg':'ba');
  var dp=Math.min(100,Math.round(dep/59000*100));
  document.getElementById('db-bar').style.width=dp+'%';document.getElementById('db-pct').textContent=dp+'%';
  var dbb=document.getElementById('db-badge');dbb.textContent=dp>=100?'Complete':'In progress';dbb.className='badge '+(dp>=100?'bg':'ba');
  var ip=Math.min(100,Math.round(inv/10000*100));
  document.getElementById('ib-bar').style.width=ip+'%';document.getElementById('ib-pct').textContent=ip+'%';
  document.getElementById('sv-cnt').textContent=d.entries.length+' entries';
  var log=document.getElementById('sv-log');
  if(!d.entries||d.entries.length===0){log.innerHTML='<div class="empty">No transfers logged yet</div>';return;}
  log.innerHTML=d.entries.slice().reverse().map(function(e){
    var lbl=e.acct==='emergency'?'Emergency':e.acct==='deposit'?'Deposit':'Investing';
    return '<div class="logrow"><div class="logdate">'+e.date+'</div><div class="logdesc">'+lbl+(e.note?' · '+e.note:'')+'</div><div class="logamt">'+fm(e.amount)+'</div></div>';
  }).join('');
}

// ── EXTRA ──
var exCache=null;
async function loadEx(){
  if(exCache)return exCache;
  var data=await fbGet('extra','main');
  exCache=data||{entries:[]};
  return exCache;
}

window._showOtherField=function(){
  var cat=document.getElementById('ex-cat').value;
  var row=document.getElementById('ex-other-row');
  if(row)row.style.display=(cat==='Other'?'flex':'none');
};

window._logEx=async function(){
  var type=document.getElementById('ex-type')?document.getElementById('ex-type').value:'regular';
  var amt=parseFloat(document.getElementById('ex-amt').value);
  var note=document.getElementById('ex-note').value.trim();
  if(!amt||amt<=0){alert('Enter a valid amount');return;}
  var d=await loadEx();
  if(!d.entries)d.entries=[];
  var date=window.logicalDate?window.logicalDate(new Date()):new Date().toISOString().slice(0,10);
  d.entries.push({date:date,type:type,amount:amt,note:note});
  savCache=null;
  await fbSet('savings','main',d);
  savCache=d;
  document.getElementById('ex-amt').value='';
  document.getElementById('ex-note').value='';
  renderEx();
};

window._clrEx=async function(){
  if(confirm('Clear all extra expense history?')){exCache={entries:[]};await fbSet('extra','main',exCache);renderEx();}
};

async function renderEx(){
  var d=await loadEx(),now=new Date();
  var entries=d.entries||[];
  var curMo=entries.filter(function(x){try{var dd=new Date(x.date);return dd.getMonth()===now.getMonth()&&dd.getFullYear()===now.getFullYear();}catch(e){return false;}});
  var totMo=curMo.reduce(function(s,x){return s+(x.amount||0);},0);
  document.getElementById('ex-tot').textContent=fm(totMo)+' this month';
  // Split by type
  var reg=entries.filter(function(x){return x.type==='regular'||!x.type;});
  var unn=entries.filter(function(x){return x.type==='unnecessary';});
  function makeRows(arr,elId,cntId,accent){accent=accent||'var(--blue)';
    var el=document.getElementById(elId);
    var cnt=document.getElementById(cntId);
    if(!el)return;
    if(cnt)cnt.textContent=arr.length+' entries';
    if(arr.length===0){el.innerHTML='<div class="empty" style="padding:8px 0;">None yet</div>';return;}
    // arr items have original indices in entries array
    el.innerHTML=arr.map(function(x){
      var idx=entries.indexOf(x);
      return '<div class="logrow" style="border-left:2px solid '+accent+';">'+
        '<div style="flex:1;min-width:0;">'+
          '<div class="logdate" style="font-size:10px;margin-bottom:2px;">'+x.date+'</div>'+
          '<div class="logdesc">'+x.cat+(x.note?' · '+x.note:'')+'</div>'+
        '</div>'+
        '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">'+
          '<span class="logamt r" style="color:'+accent+';">-'+fmd(x.amount)+'</span>'+
          '<button class="editbtn" onclick="editEx('+idx+')">edit</button>'+
          '<span class="evtdel" onclick="delEx('+idx+')">&#215;</span>'+
        '</div>'+
      '</div>';
    }).reverse().join('');
  }
  makeRows(reg,'ex-reg-log','ex-reg-cnt','var(--blue)');
  makeRows(unn,'ex-unn-log','ex-unn-cnt','var(--red)');
  // Summary
  var sumEl=document.getElementById('ex-summary');
  if(sumEl){
    var regMo=curMo.filter(function(x){return x.type==='regular'||!x.type;});
    var unnMo=curMo.filter(function(x){return x.type==='unnecessary';});
    var regTot=regMo.reduce(function(s,x){return s+(x.amount||0);},0);
    var unnTot=unnMo.reduce(function(s,x){return s+(x.amount||0);},0);
    var pct=totMo>0?Math.round(unnTot/totMo*100):0;
    sumEl.innerHTML=
      '<div style="display:flex;gap:10px;margin-bottom:10px;">'+
        '<div class="stat" style="flex:1;"><div class="stat-lbl">Regular</div><div class="stat-val" style="color:var(--blue);">'+fm(regTot)+'</div></div>'+
        '<div class="stat" style="flex:1;"><div class="stat-lbl">Unnecessary</div><div class="stat-val" style="color:var(--red);">'+fm(unnTot)+'</div></div>'+
        '<div class="stat" style="flex:1;"><div class="stat-lbl">Total</div><div class="stat-val">'+fm(totMo)+'</div></div>'+
      '</div>'+
      '<div style="margin-bottom:6px;font-size:11px;color:var(--text3);">Unnecessary spending</div>'+
      '<div style="background:var(--surface2);border-radius:4px;height:8px;overflow:hidden;">'+
        '<div style="width:'+pct+'%;height:100%;background:var(--red);border-radius:4px;transition:width .3s;"></div>'+
      '</div>'+
      '<div style="font-size:11px;color:var(--text3);margin-top:4px;">'+pct+'% of total this month</div>';
  }
}

window._delEx=async function(idx){
  var d=await loadEx();
  if(!d.entries||idx<0||idx>=d.entries.length)return;
  d.entries.splice(idx,1);
  savCache=null;
  await fbSet('extra','main',d);
  savCache=d;
  renderEx();
};

window._editEx=async function(idx){
  var d=await loadEx();
  if(!d.entries||idx<0||idx>=d.entries.length)return;
  var x=d.entries[idx];
  var typeEl=document.getElementById('ex-type');
  var amtEl=document.getElementById('ex-amt');
  var noteEl=document.getElementById('ex-note');
  if(typeEl)typeEl.value=x.type||'regular';
  if(amtEl)amtEl.value=x.amount;
  if(noteEl)noteEl.value=x.note||'';
  var btn=document.querySelector('#sv-view-expenses .brow .btn.p');
  if(btn){btn.textContent='Update';btn.setAttribute('onclick','updateEx('+idx+')');}
  var form=document.querySelector('#sv-view-expenses .card');
  if(form)form.scrollIntoView({behavior:'smooth'});
};

window._updateEx=async function(idx){
  var type=document.getElementById('ex-type')?document.getElementById('ex-type').value:'regular';
  var amt=parseFloat(document.getElementById('ex-amt').value);
  var note=document.getElementById('ex-note').value.trim();
  if(!amt||amt<=0){alert('Enter a valid amount');return;}
  var d=await loadEx();
  if(!d.entries||idx<0||idx>=d.entries.length)return;
  d.entries[idx]={date:d.entries[idx].date,type:type,amount:amt,note:note};
  savCache=null;
  await fbSet('savings','main',d);
  savCache=d;
  var btn=document.querySelector('#sv-view-expenses .brow .btn.p');
  if(btn){btn.textContent='Log expense';btn.onclick=function(){logEx();};}
  document.getElementById('ex-amt').value='';
  document.getElementById('ex-note').value='';
  renderEx();
};
  exCache=d;
  await fbSet('extra','main',d);
  var btn=document.querySelector('#sv-view-expenses .brow .btn.p');
  if(btn){btn.textContent='Log expense';btn.setAttribute('onclick','logEx()');}
  document.getElementById('ex-amt').value='';
  document.getElementById('ex-note').value='';
  renderEx();
};

window._switchTodoSub=function(name){
  document.getElementById('td-view-todo').style.display=name==='todo'?'':'none';
  document.getElementById('td-view-routine').style.display=name==='routine'?'':'none';
  document.getElementById('td-sub-todo').classList.toggle('active',name==='todo');
  document.getElementById('td-sub-routine').classList.toggle('active',name==='routine');
  if(name==='routine'){renderH();renderHistory();}
  if(name==='todo')renderTodo();
};

window._switchCalSub=function(name){
  document.getElementById('cl-view-calendar').style.display=name==='calendar'?'':'none';
  document.getElementById('cl-view-timetable').style.display=name==='timetable'?'':'none';
  document.getElementById('cl-sub-calendar').classList.toggle('active',name==='calendar');
  document.getElementById('cl-sub-timetable').classList.toggle('active',name==='timetable');
  if(name==='timetable')renderTT();
  if(name==='calendar')renderCal();
};

window._switchSavSub=function(name){
  document.getElementById('sv-view-savings').style.display=name==='savings'?'':'none';
  document.getElementById('sv-view-expenses').style.display=name==='expenses'?'':'none';
  document.getElementById('sv-view-budget').style.display=name==='budget'?'':'none';
  document.getElementById('sv-sub-savings').classList.toggle('active',name==='savings');
  document.getElementById('sv-sub-expenses').classList.toggle('active',name==='expenses');
  document.getElementById('sv-sub-budget').classList.toggle('active',name==='budget');
  if(name==='budget')renderBudget();
  if(name==='expenses'){renderEx();}
};

