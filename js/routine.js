// ── HABITS ──
var habitCache={};

async function loadHabits(dateStr){
  // Fetch daily habits
  var data=await fbGet('habits',dateStr)||{};
  // Merge weekly ticks - stored by week's Monday key
  var wk=weekKey(dateStr);
  var wdata=habitCache['__wk_'+wk];
  if(!wdata){
    wdata=await fbGet('habits',wk)||{};
    habitCache['__wk_'+wk]=wdata;
  }
  // Set weekly habits based on wdata - both true AND false explicitly
  WEEKLY_HABITS.forEach(function(h){
    if(wdata[h])data[h]=true;
    else delete data[h]; // explicitly remove if weekly says false
  });
  habitCache[dateStr]=data;
  return data;
}

window._togH=async function(el){
  var id=el.dataset.id;
  var nowTicked=false;
  if(WEEKLY_HABITS.indexOf(id)>=0){
    var wk=weekKey(selectedDate);
    var wdata=await fbGet('habits',wk)||{};
    wdata[id]=!wdata[id];
    nowTicked=!!wdata[id];
    await fbSet('habits',wk,wdata);
    // Clear all cache and set weekly data directly
    habitCache={};
    habitCache['__wk_'+wk]=wdata;
    // Force re-merge for selectedDate
    delete habitCache[selectedDate];
  } else {
    var data=await loadHabits(selectedDate);
    data[id]=!data[id];
    nowTicked=!!data[id];
    habitCache[selectedDate]=data;
    await fbSet('habits',selectedDate,data);
  }
  renderH();
  renderHistory();
};

window._resetH=async function(){
  habitCache[selectedDate]={};
  await fbSet('habits',selectedDate,{});
  // Also clear weekly habits for this week
  var wk=weekKey(selectedDate);
  await fbSet('habits',wk,{});
  renderH();
};

async function getStreak(){
  var s=0,d=new Date();d.setDate(d.getDate()-1);
  for(var i=0;i<30;i++){
    var ds=dstr(d);
    var data=await loadHabits(ds);
    if(DH.filter(function(h){return data[h];}).length>=Math.floor(DH.length*.7))s++;
    else break;
    d.setDate(d.getDate()-1);
  }return s;
}

async function getWeekScore(){
  var t=0,dn=0,today=new Date();
  for(var i=6;i>=0;i--){
    var d=new Date(today);d.setDate(today.getDate()-i);
    if(d>today)continue;
    var data=await loadHabits(dstr(d));
    DH.forEach(function(h){t++;if(data[h])dn++;});
  }
  return t>0?Math.round(dn/t*100):0;
}

async function renderH(){
  var data=await loadHabits(selectedDate);
  var done=DH.filter(function(h){return data[h];}).length;
  document.getElementById('h-today').textContent=done+'/'+DH.length;
  document.getElementById('h-streak').textContent=await getStreak();
  document.getElementById('h-week').textContent=(await getWeekScore())+'%';
  document.querySelectorAll('.hrow').forEach(function(el){
    var c=!!data[el.dataset.id];
    el.classList.toggle('done',c);
    el.querySelector('.cb').classList.toggle('on',c);
  });
  loadNote(selectedDate);
  var secMap={body:'bc',mind:'mc',money:'nc',weekly:'wkc'};
  ['body','mind','money','weekly'].forEach(function(s){
    var items=document.querySelectorAll('[data-sec="'+s+'"]');
    var dn=Array.from(items).filter(function(el){return !!data[el.dataset.id];}).length;
    var el=document.getElementById(secMap[s]);
    if(el)el.textContent=dn+'/'+items.length;
  });
  var wr=document.getElementById('week-row');var whtml='';
  var today=new Date(),selD=new Date(selectedDate+'T00:00:00');
  // Always anchor week to TODAY, not selectedDate
  var todayDow=today.getDay(),dfm=(todayDow===0)?6:todayDow-1;
  var mon=new Date(today);mon.setDate(today.getDate()-dfm);
  var DF_FULL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  for(var i=0;i<7;i++){
    var d=new Date(mon);d.setDate(mon.getDate()+i);
    var ds2=dstr(d);
    var dd=await loadHabits(ds2);
    var cnt=DH.filter(function(h){return dd[h];}).length;
    var isSel=d.toDateString()===selD.toDateString();
    var isF=d>today;
    var cls='wdot de';
    if(!isF&&cnt===DH.length)cls='wdot df';
    else if(!isF&&cnt>0)cls='wdot dp';
    whtml+='<div class="wday" onclick="jumpToDate(this.dataset.date)" data-date="'+ds2+'" style="cursor:pointer;">'
      +'<div class="wday-n" style="font-size:8px;">'+DF_FULL[d.getDay()]+'</div>'
      +'<div class="'+cls+(isSel?' dt':'')+'">'+( isF?'·':cnt)+'</div>'
      +'</div>';
  }
  wr.innerHTML=whtml;
}

// ── TIMETABLE ──
var ttEditIdx=null;
var ttSelectedDate=todayStr;
var ttCache={};

async function loadTT(dateStr){
  if(ttCache[dateStr])return ttCache[dateStr];
  var data=await fbGet('timetable',dateStr);
  ttCache[dateStr]=data||{};
  return ttCache[dateStr];
}

function buildTimeOpts(selected){
  var labels=['12:00am','12:15am','12:30am','12:45am'];
  for(var h=1;h<=11;h++){['00','15','30','45'].forEach(function(m){labels.push(h+':'+m+'am');});}
  labels.push('12:00pm','12:15pm','12:30pm','12:45pm');
  for(var h=1;h<=11;h++){['00','15','30','45'].forEach(function(m){labels.push(h+':'+m+'pm');});}
  labels.push('11:00pm','11:15pm','11:30pm','11:45pm');
  var html='<option value="">-- pick time --</option>';
  labels.forEach(function(t){html+='<option value="'+t+'"'+(t===selected?' selected':'')+'>'+t+'</option>';});
  return html;
}

function syncTimeField(){
  var start=document.getElementById('tt-estart');
  var end=document.getElementById('tt-eend');
  var field=document.getElementById('tt-etime');
  if(!start||!end||!field)return;
  var s=start.value,e=end.value;
  var existing=field.value||'';
  var parts=existing.split(/[–—]/);
  var existStart=(parts.length>=2)?parts[0].trim():'';
  var existEnd=(parts.length>=2)?parts[1].trim():(parts[0]?parts[0].trim():'');
  var finalStart=s||existStart;
  var finalEnd=e||existEnd;
  if(finalStart&&finalEnd)field.value=finalStart+'–'+finalEnd;
  else if(finalStart)field.value=finalStart;
  else if(finalEnd)field.value=finalEnd;
}
window._syncTimeField=syncTimeField;

function parseTimeIntoDropdowns(timeStr){
  var parts=timeStr.split(/[–—\-]/);
  var start=document.getElementById('tt-estart');
  var end=document.getElementById('tt-eend');
  if(!start||!end)return;
  function setDrop(sel,val){for(var i=0;i<sel.options.length;i++){if(sel.options[i].value.toLowerCase()===val.toLowerCase().trim()){sel.selectedIndex=i;return;}}}
  if(parts.length>=2){setDrop(start,parts[0].trim());setDrop(end,parts[1].trim());}
  else{setDrop(start,timeStr.trim());}
}

window._togTT=async function(idx){
  var data=await loadTT(ttSelectedDate);
  var selTT=new Date(ttSelectedDate+'T00:00:00'),dow=selTT.getDay(),sch=SCH[dow];
  if(!sch)return;
  data[idx]=!data[idx];
  ttCache[ttSelectedDate]=data;
  await fbSet('timetable',ttSelectedDate,data);
  if(data[idx]){
    var ov=data['ov_'+idx]||{};
    var item=sch.items[idx];
    var lbl=ov.l||item.l,tim=ov.t||item.t;
    var evts=await loadEvts();
    var typeMap={sleep:'sleep',work:'work',travel:'travel',gym:'sports',ball:'sports',meal:'meal',personal:'personal',fun:"michaels",family:"michaels"};
    var evtType=typeMap[item.c]||'other';
    var exists=evts.some(function(e){return e.date===ttSelectedDate&&e.title===lbl;});
    if(!exists){await fbAddDoc('events',{date:ttSelectedDate,type:evtType,title:lbl,note:tim});evtCache=null;}
  }
  renderTT();
};

window._openEdit=function(idx){ttEditIdx=(ttEditIdx===idx)?null:idx;renderTT();};

window._saveEdit=async function(){
  if(ttEditIdx===null)return;
  var data=await loadTT(ttSelectedDate);
  var t=document.getElementById('tt-etime').value.trim();
  var l=document.getElementById('tt-elbl').value.trim();
  if(t||l)data['ov_'+ttEditIdx]={t:t,l:l};
  ttCache[ttSelectedDate]=data;
  await fbSet('timetable',ttSelectedDate,data);
  ttEditIdx=null;renderTT();
};

window._clrEdit=async function(){
  if(ttEditIdx===null)return;
  var data=await loadTT(ttSelectedDate);
  delete data['ov_'+ttEditIdx];
  ttCache[todayStr]=data;
  await fbSet('timetable',todayStr,data);
  ttEditIdx=null;renderTT();
};

window._resetTT=async function(){
  ttCache[ttSelectedDate]={};
  await fbSet('timetable',ttSelectedDate,{});
  ttEditIdx=null;renderTT();
};

async function renderTT(){
  var today=new Date(),selTT=new Date(ttSelectedDate+'T00:00:00'),dow=selTT.getDay(),sch=SCH[dow];
  document.getElementById('tt-cardtitle').textContent=DF[dow]+"'s checklist";
  var data=await loadTT(ttSelectedDate);
  var html='';
  if(!sch){
    html='<div class="empty">No schedule for today</div>';
    document.getElementById('tt-prog').textContent='';
  } else {
    var done=sch.items.filter(function(it,i){return data[i];}).length;
    document.getElementById('tt-prog').textContent=done+'/'+sch.items.length;
    sch.items.forEach(function(item,i){
      var checked=!!data[i];
      var ov=data['ov_'+i]||{};
      var dt=ov.t||item.t,dl=ov.l||item.l;
      var isEditing=(ttEditIdx===i);
      html+='<div class="ttrow'+(checked?' ttdone':'')+'">';
      html+='<div class="ttcb'+(checked?' on':'')+'" onclick="togTT('+i+')"><svg class="ck" width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#0e0e0f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>';
      html+='<div class="tttime">'+dt+'</div>';
      html+='<div class="ttlbl" onclick="togTT('+i+')">'+dl+'</div>';
      var psMap={sleep:'background:rgba(167,139,250,.12);color:#a78bfa;',work:'background:var(--gdim);color:var(--green);',travel:'background:rgba(107,114,128,.12);color:#9ca3af;',home:'background:rgba(148,163,184,.12);color:#94a3b8;',gym:'background:rgba(234,179,8,.12);color:#eab308;',ball:'background:rgba(234,179,8,.12);color:#ca8a04;',meal:'background:rgba(249,115,22,.12);color:#f97316;',personal:'background:var(--bdim);color:var(--blue);',fun:'background:rgba(212,83,126,.12);color:#ed93b1;',family:'background:rgba(212,83,126,.12);color:#ed93b1;'};
      var plMap={sleep:'Sleep',work:'Work',travel:'Travel',home:'Home',gym:'Sports',ball:'Sports',meal:'Meal',personal:'Personal',fun:"Michael's time",family:"Michael's time"};
      var ps=psMap[item.c]||'background:var(--surface2);color:var(--text3);';
      var pl=plMap[item.c]||item.c;
      html+='<span class="ttpill" style="'+ps+'">'+pl+'</span>';
      html+='<button class="editbtn" onclick="openEdit('+i+')">'+(isEditing?'close':'edit')+'</button>';
      html+='</div>';
      if(isEditing){
        html+='<div class="editpanel">';
        html+='<div style="font-size:11px;color:var(--text3);font-family:\'DM Mono\',monospace;margin-bottom:7px;">Edit for today only</div>';
        html+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Start time</div>';
        html+='<select id="tt-estart" style="margin-bottom:6px;" onchange="syncTimeField()">'+buildTimeOpts('')+'</select>';
        html+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">End time</div>';
        html+='<select id="tt-eend" style="margin-bottom:6px;" onchange="syncTimeField()">'+buildTimeOpts('')+'</select>';
        html+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Or type manually</div>';
        html+='<input type="text" id="tt-etime" value="'+dt+'" placeholder="e.g. 8:00am–1:15pm" style="margin-bottom:6px;"/>';
        html+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Label</div>';
        html+='<input type="text" id="tt-elbl" value="'+dl+'" placeholder="Label" style="margin-bottom:8px;"/>';
        html+='<div class="brow"><button class="btn p" style="flex:1;padding:7px;" onclick="saveEdit()">Save</button><button class="btn d" style="padding:7px 12px;" onclick="clrEdit()">Reset default</button><button class="btn" style="padding:7px 12px;" onclick="openEdit('+i+')">Cancel</button></div>';
        html+='</div>';
        setTimeout(function(){parseTimeIntoDropdowns(dt);},50);
      }
    });
  }
  document.getElementById('tt-list').innerHTML=html;
  var whtml='',order=[1,2,3,4,5,6,0];
  order.forEach(function(d){
    var s=SCH[d],isT=(d===dow);
    whtml+='<div class="card" style="margin-bottom:8px;'+(isT?'border-color:var(--blue);':'')+'">';
    whtml+='<div class="card-hdr"><div class="card-title" style="'+(isT?'color:var(--blue);':'')+'">'+DF[d]+(isT?' — today':'')+'</div><div class="card-meta">'+s.note+'</div></div>';
    s.items.forEach(function(item){var wps={sleep:'background:rgba(167,139,250,.12);color:#a78bfa;',work:'background:var(--gdim);color:var(--green);',travel:'background:rgba(107,114,128,.12);color:#9ca3af;',home:'background:rgba(148,163,184,.12);color:#94a3b8;',gym:'background:rgba(234,179,8,.12);color:#eab308;',ball:'background:rgba(234,179,8,.12);color:#ca8a04;',meal:'background:rgba(249,115,22,.12);color:#f97316;',personal:'background:var(--bdim);color:var(--blue);',fun:'background:rgba(212,83,126,.12);color:#ed93b1;',family:'background:rgba(30,30,33,.6);color:var(--text2);'}[item.c]||'background:var(--surface2);color:var(--text3);';
      var wpl={sleep:'Sleep',work:'Work',travel:'Travel',home:'Home',gym:'Sports',ball:'Sports',meal:'Meal',personal:'Personal',fun:"Michael's time",family:"Michael's time"}[item.c]||item.c;
      whtml+='<div class="ttrow"><div class="tttime">'+item.t+'</div><div class="ttlbl">'+item.l+'</div><span class="ttpill" style="'+wps+'">'+wpl+'</span></div>';});
    whtml+='</div>';
  });
  document.getElementById('tt-week').innerHTML=whtml;
}

