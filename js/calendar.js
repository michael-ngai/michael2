window.doTTEdit_1777994103=function(btn,ds,idx){
  var row=btn.closest('.tt-row');if(!row)return;
  var td=row.querySelector('.tt-time');if(!td)return;
  var inp=document.createElement('input');
  inp.type='text';inp.value=td.textContent;
  inp.style.cssText='width:78px;font-size:10px;background:var(--surface2);border:1.5px solid var(--green);border-radius:4px;color:var(--text);padding:2px 4px;';
  inp.onclick=function(e){e.stopPropagation();};
  td.innerHTML='';td.appendChild(inp);inp.focus();inp.select();
  inp.onblur=function(){
    var k='tt_edits_'+ds,ed={};
    try{ed=JSON.parse(localStorage.getItem(k)||'{}');}catch(ex){}
    ed[idx+'_time']=inp.value;
    localStorage.setItem(k,JSON.stringify(ed));
    if(window.renderTT)window.renderTT();
  };
  inp.onkeydown=function(e){if(e.key==='Enter')inp.blur();if(e.key==='Escape'&&window.renderTT)window.renderTT();};
};
// ── CALENDAR ──
var CS={view:'month',month:new Date(),wstart:null,day:new Date(),sel:null};
var ECOL_OLD={'tt':'cd-other',gym:'cd-sports',ball:'cd-sports',fun:'cd-michaels',family:'cd-michaels',bday:'cd-michaels',sick:'cd-sports',appt:'cd-personal',shift:'cd-work'};
var ECOL={
  work:'cd-work',sleep:'cd-sleep',sports:'cd-sports',
  personal:'cd-personal',learning:'cd-learning',meal:'cd-meal',
  michaels:'cd-michaels',travel:'cd-travel',other:'cd-other'
};
var ELBL={
  work:'Work',sleep:'Sleep',sports:'Sports',
  personal:'Personal',learning:'Learning',meal:'Meal / food',
  michaels:"Michael's time",travel:'Travel',home:'Home',other:'Other'
};
var EACC={
  work:'green',sleep:'purple',sports:'amber',
  personal:'blue',learning:'amber',meal:'amber',
  michaels:'pink',travel:'text3',other:'text3'
};
var evtCache=null;

function migrateEvent(e){
  var type=e.type||'other';
  // If already a valid new type, keep it as-is - don't override user's edits
  var validTypes=['work','sleep','sports','personal','learning','meal','michaels','home','travel','other'];
  if(validTypes.indexOf(type)>=0)return type;
  // Only migrate old types (tt, gym, ball, fun, etc)
  var title=(e.title||'').toLowerCase();
  // Travel/home first - catch before 'shift' or 'pcyc' keywords
  if(title.includes('travel')||title.includes('podcast')||title.includes('shower'))return 'home';
  // Sleep
  if(title.includes('sleep')||title.includes('bed'))return 'sleep';
  // Sports - gym, basketball etc
  if(title.includes('gym')||title.includes('basketball')||title.includes('practice')||title.includes('game'))return 'sports';
  // Learning - Claude, Duolingo, AI, Japanese
  if(title.includes('claude')||title.includes('duolingo')||title.includes('japanese')||title.includes('course')||title.includes('learn')||title.includes(' ai '))return 'learning';
  // Work - shift, pprc, pcyc
  if(title.includes('shift')||title.includes('pprc')||title.includes('pcyc'))return 'work';
  // Meal
  if(title.includes('meal')||title.includes('dinner')||title.includes('food')||title.includes('grocery')||title.includes('cook')||title.includes('duolingo'))return 'meal';
  // Michael's time
  if(title.includes('netflix')||title.includes('switch')||title.includes('free')||title.includes('chill')||title.includes('rest')||title.includes('sister')||title.includes('family'))return 'michaels';
  // Personal
  if(title.includes('personal')||title.includes('admin')||title.includes('morning')||title.includes('free morning'))return 'personal';
  // Fall back to stored type mapping
  var typeMap={tt:'work',gym:'sports',ball:'sports',fun:'michaels',family:'michaels',
    bday:'michaels',sick:'sports',appt:'personal',shift:'work',travel:'home',
    sleep:'sleep',work:'work',meal:'meal',personal:'personal',home:'home',
    sports:'sports',learning:'learning',michaels:'michaels',other:'other'};
  return typeMap[type]||'other';
}

function parseStartTime(note){
  if(!note)return 9999;
  note=String(note);
  var m;
  // H:MMam/pm at start
  m=note.match(/^(\d{1,2}):(\d{2})\s*(am|pm)/i);
  if(m){var h=parseInt(m[1]),mn=parseInt(m[2]),ap=m[3].toLowerCase();if(ap==='am'&&h===12)h=0;if(ap==='pm'&&h!==12)h+=12;return h*60+mn;}
  // Ham/pm at start
  m=note.match(/^(\d{1,2})\s*(am|pm)/i);
  if(m){var h=parseInt(m[1]),ap=m[2].toLowerCase();if(ap==='am'&&h===12)h=0;if(ap==='pm'&&h!==12)h+=12;return h*60;}
  // H:MM–H:MMam/pm range - use end to determine if pm
  m=note.match(/^(\d{1,2}):(\d{2})[^a-zA-Z0-9]*(\d{1,2}):\d{2}\s*(am|pm)/i);
  if(m){var sh=parseInt(m[1]),sm=parseInt(m[2]),eh=parseInt(m[3]),ap=m[4].toLowerCase();if(ap==='am'&&eh===12)eh=0;if(ap==='pm'&&eh!==12)eh+=12;if(sh<eh&&ap==='pm'&&sh<12)sh+=12;return sh*60+sm;}
  // Bare H:MM - 1-5 = afternoon assumed
  m=note.match(/^(\d{1,2}):(\d{2})/);
  if(m){var h=parseInt(m[1]),mn=parseInt(m[2]);if(h>=1&&h<=5)h+=12;return h*60+mn;}
  return 9999;
  var _unused=0;
  return h*60+m;
}

var calEditId=null;

function buildCalEditPanel(e,ds){
  var et=e.type||'other';
  var h='<div style="padding:10px 0 6px;border-top:0.5px solid var(--border);margin-top:4px;">';
  h+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Type</div>';
  h+='<select id="cal-edit-type" style="margin-bottom:8px;">';
  var types=[['work','🟢 Work'],['sleep','🟣 Sleep'],['sports','🔴 Sports'],['personal','🔵 Personal'],['learning','🟡 Learning'],['meal','🟠 Meal / food'],['michaels',"🌸 Michael's time"],['home','🏠 Home'],['travel','🔘 Travel'],['other','⚪ Other']];
  types.forEach(function(t){h+='<option value="'+t[0]+'"'+(et===t[0]?' selected':'')+'>'+t[1]+'</option>';});
  h+='</select>';
  h+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Title</div>';
  h+='<input type="text" id="cal-edit-title" value="'+e.title.replace(/"/g,'&quot;')+'" style="margin-bottom:8px;"/>';
  h+='<div style="display:flex;gap:8px;margin-bottom:8px;">';
  h+='<div style="flex:1;"><div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Start</div><select id="cal-edit-start"></select></div>';
  h+='<div style="flex:1;"><div style="font-size:11px;color:var(--text3);margin-bottom:4px;">End</div><select id="cal-edit-end"></select></div>';
  h+='</div>';
  h+='<div style="display:flex;gap:7px;">';
  h+='<button class="btn p" style="flex:1;padding:7px;" data-eid="'+e.id+'" data-ds="'+ds+'" onclick="saveCalEdit(this.dataset.eid,this.dataset.ds)">Save</button>';
  h+='<button class="btn d" style="padding:7px 12px;" data-eid="'+e.id+'" data-ds="'+ds+'" onclick="openCalEdit(this.dataset.eid,this.dataset.ds)">Cancel</button>';
  h+='</div></div>';
  var cn=e.note||'';
  setTimeout(function(){
    var ts=document.getElementById('cal-edit-start');
    var te=document.getElementById('cal-edit-end');
    if(!ts||!te)return;
    var tl=['12:00am','12:15am','12:30am','12:45am'];
    for(var h2=1;h2<=11;h2++){['00','15','30','45'].forEach(function(m){tl.push(h2+':'+m+'am');});}
    tl.push('12:00pm','12:15pm','12:30pm','12:45pm');
    for(var h2=1;h2<=11;h2++){['00','15','30','45'].forEach(function(m){tl.push(h2+':'+m+'pm');});}
    tl.push('11:00pm','11:15pm','11:30pm','11:45pm');
    var parts=cn.split(/[–—\-]/);
    var sv=parts[0]?parts[0].trim():'';
    var ev2=parts[1]?parts[1].trim():'';
    [ts,te].forEach(function(sel,ix){
      var match=ix===0?sv:ev2;
      sel.innerHTML='<option value="">-- time --</option>';
      tl.forEach(function(t){var o=document.createElement('option');o.value=t;o.textContent=t;if(t===match)o.selected=true;sel.appendChild(o);});
    });
  },50);
  return h;
}

window._openCalEdit=function(id,ds){
  calEditId=(calEditId===id)?null:id;
  CS.sel=ds;
  renderSelEvts();
};

window._saveCalEdit=async function(id,ds){
  // Capture all form values immediately
  var typeEl=document.getElementById('cal-edit-type');
  var titleEl=document.getElementById('cal-edit-title');
  var startEl=document.getElementById('cal-edit-start');
  var endEl=document.getElementById('cal-edit-end');
  if(!typeEl||!titleEl){alert('Form not found - please try again');return;}
  var type=typeEl.value;
  var title=titleEl.value.trim();
  var start=startEl?startEl.value:'';
  var end=endEl?endEl.value:'';
  var note=start&&end?start+'–'+end:start?start:end?end:'';
  if(!title){alert('Please enter a title');return;}
  // Close edit panel first
  calEditId=null;
  renderSelEvts();
  // Delete old, add new
  await fbDelDoc('events',id);
  await fbAddDoc('events',{date:ds,type:type,title:title,note:note});
  // Force fresh server fetch
  evtCache=null;
  var freshList=await fbGetCol('events',true);
  freshList=freshList.map(function(e){
    var nt=migrateEvent(e);
    var t=e.title||'';
    if(!t||t==='tt'||t==='other'||t==='undefined')t=ELBL[nt]||nt;
    return Object.assign({},e,{type:nt,title:t});
  });
  // Dedup
  var seen2={};var dupeIds2=[];
  for(var i=freshList.length-1;i>=0;i--){
    var k=(freshList[i].date||'')+'|'+(freshList[i].title||'').toLowerCase();
    if(seen2[k]){dupeIds2.push(freshList[i].id);}else{seen2[k]=true;}
  }
  if(dupeIds2.length>0){
    dupeIds2.forEach(function(did){fbDelDoc('events',did);});
    freshList=freshList.filter(function(e){return dupeIds2.indexOf(e.id)<0;});
  }
  // Sort
  freshList.sort(function(a,b){
    var dc=(a.date||'').localeCompare(b.date||'');
    if(dc!==0)return dc;
    function _ek(note){var t=parseStartTime(note);if(t>=300||t===9999)return t;var em=String(note||"").match(/[-–](d{1,2}):(d{2})s*(am|pm)/i);if(em){var eh=parseInt(em[1]),emn2=parseInt(em[2]),eap=em[3].toLowerCase();if(eap==="am"&&eh===12)eh=0;if(eap==="pm"&&eh!==12)eh+=12;if(eh*60+emn2>=300)return t;}return t+1440;}return _ek(a.note)-_ek(b.note);
  });
  evtCache=freshList;
  CS.sel=ds;
  CS.day=new Date(ds+'T12:00:00');
  renderCal();
  setTimeout(function(){renderSelEvts();},100);
};

async function loadEvts(){
  if(evtCache)return evtCache;
  var list=await fbGetCol('events');
  list=list.map(function(e){
    var newType=migrateEvent(e);
    var title=e.title||'';
    if(!title||title==='tt'||title==='other'||title==='undefined'||title==='work'||title==='sleep')
      title=ELBL[newType]||newType;
    return Object.assign({},e,{type:newType,title:title});
  });
  // Sort by date, then match to timetable order for that day
  function getTTIndex(evt){
    if(!evt.date)return 999;
    var d=new Date(evt.date+'T00:00:00');
    var dow=d.getDay();
    var sch=SCH[dow];
    if(!sch)return 999;
    var title=(evt.title||'').toLowerCase();
    var note=(evt.note||'').toLowerCase();
    // Match by title or note keywords to timetable item index
    for(var i=0;i<sch.items.length;i++){
      var item=sch.items[i];
      var il=item.l.toLowerCase();
      var it=item.t.toLowerCase();
      // Match title to timetable label
      if(title&&il.indexOf(title)>=0)return i;
      if(title&&title.indexOf(il.split(' ')[0])>=0&&il.split(' ')[0].length>3)return i;
      // Match by note time to timetable time
      if(note&&it===note)return i;
      if(note&&it.indexOf(note.split('–')[0].trim())>=0)return i;
    }
    // Fallback: use start time
    var t=parseStartTime(evt.note);
    if(t!==9999){
      if(t>=0&&t<360)return 900+t; // after midnight = near end
      return 500+t/10;
    }
    return 999;
  }
  function logicalSortTime(note){
    var t=parseStartTime(note);
    if(t===9999)return 9999;
    return t;
  }
  list.sort(function(a,b){
    var dateCmp=(a.date||'').localeCompare(b.date||'');
    if(dateCmp!==0)return dateCmp;
    return logicalSortTime(a.note)-logicalSortTime(b.note);
  });
  // Remove duplicates - same date+title, keep newest
  var seen={};var dupeIds=[];
  for(var i=list.length-1;i>=0;i--){
    var key=(list[i].date||'')+'|'+(list[i].title||'').toLowerCase();
    if(seen[key]){dupeIds.push(list[i].id);}
    else{seen[key]=true;}
  }
  if(dupeIds.length>0){
    dupeIds.forEach(function(did){fbDelDoc('events',did);});
    list=list.filter(function(e){return dupeIds.indexOf(e.id)<0;});
  }
  evtCache=list;
  return list;
}

window._switchCal=function(v){
  CS.view=v;
  ['month','week','day'].forEach(function(n){
    document.getElementById('st-'+n).classList.toggle('active',n===v);
    document.getElementById('cv-'+n).classList.toggle('active',n===v);
  });
  renderCal();
};

function renderCal(){
  if(CS.view==='month'){renderMonth();setTimeout(function(){populateCalMonthSelect();},200);}
  else if(CS.view==='week'){renderWeek();setTimeout(function(){populateCalWeekSelect();},200);}
  else{renderDay();setTimeout(function(){populateCalDaySelect();},200);}
}

function getMon(d){var day=d.getDay(),diff=(day===0)?-6:1-day,m=new Date(d);m.setDate(d.getDate()+diff);return m;}
window._chMonth=function(dir){CS.month=new Date(CS.month.getFullYear(),CS.month.getMonth()+dir,1);renderMonth();setTimeout(populateCalMonthSelect,200);};
window._chWeek=function(dir){if(!CS.wstart)CS.wstart=getMon(new Date());CS.wstart.setDate(CS.wstart.getDate()+(dir*7));renderWeek();setTimeout(populateCalWeekSelect,200);};
window._chDay=function(dir){CS.day.setDate(CS.day.getDate()+dir);renderDay();setTimeout(populateCalDaySelect,200);};

async function renderMonth(){
  var m=CS.month,today=new Date();
  var mTitle=document.getElementById('cal-mtitle');if(mTitle)mTitle.textContent=m.toLocaleDateString('en-AU',{month:'long',year:'numeric'});
  var first=new Date(m.getFullYear(),m.getMonth(),1);
  var last=new Date(m.getFullYear(),m.getMonth()+1,0);
  var sdow=first.getDay(),offset=(sdow===0)?6:sdow-1;
  var evts=await loadEvts();
  var total=Math.ceil((offset+last.getDate())/7)*7,grid='';
  for(var i=0;i<total;i++){
    var cd=new Date(first);cd.setDate(1-offset+i);
    var ds=dstr(cd);
    var isT=cd.toDateString()===today.toDateString();
    var isSel=CS.sel===ds,isO=cd.getMonth()!==m.getMonth();
    var de=evts.filter(function(e){return e.date===ds;});
    var cls='calcell'+(isT?' today':'')+(isSel?' sel':'')+(isO?' other':'');
    grid+='<div class="'+cls+'" onclick="selDay(\''+ds+'\')">';
    grid+='<div class="calnum">'+cd.getDate()+'</div>';
    if(de.length>0){
      grid+='<div class="dotrow" style="display:flex;gap:2px;align-items:center;flex-wrap:wrap;">';
      var showDots=de.slice(0,3);
      showDots.forEach(function(e){
        var ec=ECOL[e.type]||ECOL_OLD[e.type]||'cd-other';
        grid+='<div class="cdot '+ec+'" style="width:6px;height:6px;border-radius:50%;flex-shrink:0;"></div>';
      });
      if(de.length>3){
        grid+='<span style="font-size:8px;color:var(--text3);line-height:1;">+'+( de.length-3)+'</span>';
      }
      grid+='</div>';
    }
    grid+='</div>';
  }
  document.getElementById('cal-mgrid').innerHTML=grid;
  renderSelEvts();
}

window._selDay=function(ds){
  CS.sel=ds;
  document.getElementById('ce-date-hidden').value=ds;
  if(window._updateCEDate)window._updateCEDate();
  renderMonth();
};

function getPillStyle(type){
  var s={
    work:'background:var(--gdim);color:var(--green);',
    sleep:'background:rgba(167,139,250,.12);color:#a78bfa;',
    sports:'background:rgba(234,179,8,.12);color:#eab308;',
    personal:'background:var(--bdim);color:var(--blue);',
    learning:'background:var(--adim);color:var(--amber);',
    meal:'background:rgba(249,115,22,.12);color:#f97316;',
    michaels:'background:rgba(212,83,126,.12);color:#ed93b1;',
    home:'background:rgba(148,163,184,.12);color:#94a3b8;',
    travel:'background:rgba(107,114,128,.12);color:#9ca3af;',
    other:'background:var(--surface2);color:var(--text3);'
  };
  return s[type]||s.other;
}

async function renderSelEvts(){
  var el=document.getElementById('cal-selbody');
  if(!CS.sel){el.innerHTML='';return;}
  var ds=CS.sel,evts=await loadEvts();
  var de=evts.filter(function(e){return e.date===ds;});
  var d=new Date(ds+'T00:00:00');
  var lbl=d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long'});
  var html='<div style="font-size:11px;color:var(--text3);font-family:monospace;padding:9px 0 6px;">'+lbl+'</div>';
  if(de.length===0){
    html+='<div style="font-size:12px;color:var(--text3);padding:4px 0 12px;">No events — add below</div>';
  } else {
    var pillColors={
      work:'background:var(--gdim);color:var(--green);',
      sleep:'background:rgba(167,139,250,.12);color:#a78bfa;',
      sports:'background:rgba(234,179,8,.12);color:#eab308;',
      personal:'background:var(--bdim);color:var(--blue);',
      learning:'background:var(--adim);color:var(--amber);',
      meal:'background:rgba(249,115,22,.12);color:#f97316;',
      michaels:'background:rgba(212,83,126,.12);color:#ed93b1;',
      home:'background:rgba(148,163,184,.12);color:#94a3b8;',
      travel:'background:rgba(107,114,128,.12);color:#9ca3af;',
      other:'background:var(--surface2);color:var(--text3);'
    };
    html+='<div class="card" style="margin-bottom:12px;">';
    de.forEach(function(e){
      var etype=e.type||'other';
      var ps=pillColors[etype]||pillColors.other;
      var ecol=ECOL[etype]||'cd-other';
      var elbl=ELBL[etype]||etype;
      var isEditing=(calEditId===e.id);
      // Event row
      html+='<div class="evtrow" style="flex-direction:column;align-items:stretch;gap:4px;">';
      html+='<div style="display:flex;align-items:center;gap:7px;">';
      html+='<div class="cdot '+ecol+'" style="width:8px;height:8px;border-radius:50%;flex-shrink:0;"></div>';
      html+='<span style="'+ps+'padding:2px 7px;border-radius:20px;font-size:10px;font-family:monospace;white-space:nowrap;">'+elbl+'</span>';
      html+='<span style="color:var(--text);font-size:13px;flex:1;">'+e.title+'</span>';
      if(e.note)html+='<span style="color:var(--text3);font-size:11px;font-family:monospace;white-space:nowrap;">'+e.note+'</span>';
      html+='<button class="editbtn" data-eid="'+e.id+'" data-ds="'+ds+'" onclick="openCalEdit(this.dataset.eid,this.dataset.ds)">'+(isEditing?'close':'edit')+'</button>';
      html+='<span class="evtdel" data-eid="'+e.id+'" onclick="delEvt(this.dataset.eid)">&#215;</span>';
      html+='</div>';
      // Inline edit panel
      if(isEditing){
        html+='<div style="padding:10px 0 6px;border-top:0.5px solid var(--border);margin-top:4px;">';
        html+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Type</div>';
        html+='<select id="cal-edit-type" style="margin-bottom:8px;">';
        var types=[['work','🟢 Work'],['sleep','🟣 Sleep'],['sports','🔴 Sports'],['personal','🔵 Personal'],['learning','🟡 Learning'],['meal','🟠 Meal / food'],['michaels',"🌸 Michael's time"],['home','🏠 Home'],['travel','🔘 Travel'],['other','⚪ Other']];
        types.forEach(function(t){html+='<option value="'+t[0]+'"'+(etype===t[0]?' selected':'')+'>'+t[1]+'</option>';});
        html+='</select>';
        html+='<div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Title</div>';
        html+='<input type="text" id="cal-edit-title" value="'+e.title.replace(/"/g,'&quot;')+'" style="margin-bottom:8px;"/>';
        html+='<div style="display:flex;gap:8px;margin-bottom:8px;">';
        html+='<div style="flex:1;"><div style="font-size:11px;color:var(--text3);margin-bottom:4px;">Start time</div><select id="cal-edit-start"></select></div>';
        html+='<div style="flex:1;"><div style="font-size:11px;color:var(--text3);margin-bottom:4px;">End time</div><select id="cal-edit-end"></select></div>';
        html+='</div>';
        html+='<div style="display:flex;gap:7px;">';
        html+='<button class="btn p" style="flex:1;padding:7px;" data-eid="'+e.id+'" data-ds="'+ds+'" onclick="saveCalEdit(this.dataset.eid,this.dataset.ds)">Save</button>';
        html+='<button class="btn d" style="padding:7px 12px;" data-eid="'+e.id+'" data-ds="'+ds+'" onclick="openCalEdit(this.dataset.eid,this.dataset.ds)">Cancel</button>';
        html+='</div></div>';
        // Populate time dropdowns after render
        var currentNote=e.note||'';
        setTimeout(function(){
          var ts=document.getElementById('cal-edit-start');
          var te=document.getElementById('cal-edit-end');
          if(!ts||!te)return;
          var tl=['12:00am','12:15am','12:30am','12:45am'];
          for(var h=1;h<=11;h++){['00','15','30','45'].forEach(function(m){tl.push(h+':'+m+'am');});}
          tl.push('12:00pm','12:15pm','12:30pm','12:45pm');
          for(var h=1;h<=11;h++){['00','15','30','45'].forEach(function(m){tl.push(h+':'+m+'pm');});}
          tl.push('11:00pm','11:15pm','11:30pm','11:45pm');
          var parts=currentNote.split(/[–—\-]/);
          var sv=parts[0]?parts[0].trim():'';
          var ev=parts[1]?parts[1].trim():'';
          [ts,te].forEach(function(sel,idx){
            var match=idx===0?sv:ev;
            sel.innerHTML='<option value="">-- time --</option>';
            tl.forEach(function(t){
              var o=document.createElement('option');
              o.value=t;o.textContent=t;
              if(t===match)o.selected=true;
              sel.appendChild(o);
            });
          });
        },50);
      }
      html+='</div>';
    });
    html+='</div>';
  }
  el.innerHTML=html;
}



async function renderWeek(){
  if(!CS.wstart)CS.wstart=getMon(new Date());
  var ws=CS.wstart,today=new Date(),evts=await loadEvts();
  var we=new Date(ws);we.setDate(ws.getDate()+6);
  var wTitle=document.getElementById('cal-wtitle');if(wTitle)wTitle.textContent=ws.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' – '+we.toLocaleDateString('en-AU',{day:'numeric',month:'short',year:'numeric'});
  var dns=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],html='';
  for(var i=0;i<7;i++){
    var d=new Date(ws);d.setDate(ws.getDate()+i);
    var ds=dstr(d),isT=d.toDateString()===today.toDateString();
    var de=evts.filter(function(e){return e.date===ds;});
    html+='<div class="wcol'+(isT?' today':'')+'"><div class="wcolhdr"><div class="wcolname" style="'+(isT?'color:var(--blue);':'')+'">'+dns[i]+'</div><div class="wcoldate">'+d.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+'</div></div>';
    if(de.length===0){html+='<div class="wnoevt">No events</div>';}
    else{html+='<div class="card" style="margin:4px 0;padding:4px 0;">';de.forEach(function(e){
        var et=e.type||'other';
        var ec=ECOL[et]||'cd-other';
        var el=ELBL[et]||et;
        var ps=getPillStyle(et);
        var isEditing=(calEditId===e.id);
        html+='<div class="evtrow" style="flex-direction:column;align-items:stretch;gap:4px;">';
        html+='<div style="display:flex;align-items:center;gap:7px;">';
        html+='<div class="cdot '+ec+'" style="width:8px;height:8px;border-radius:50%;flex-shrink:0;"></div>';
        html+='<span style="'+ps+'padding:2px 7px;border-radius:20px;font-size:10px;font-family:monospace;white-space:nowrap;">'+el+'</span>';
        html+='<span style="color:var(--text);font-size:13px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+e.title+'</span>';
        if(e.note)html+='<span style="color:var(--text3);font-size:11px;font-family:monospace;white-space:nowrap;">'+e.note+'</span>';
        html+='<button class="editbtn" data-eid="'+e.id+'" data-ds="'+ds+'" onclick="openCalEdit(this.dataset.eid,this.dataset.ds)">'+(isEditing?'close':'edit')+'</button>';
        html+='<span class="evtdel" data-eid="'+e.id+'" onclick="delEvt(this.dataset.eid)">&#215;</span>';
        html+='</div>';
        html+='</div>';
      });}
    html+='</div>';
  }
  document.getElementById('cal-wgrid').innerHTML=html;
}

async function renderDay(){
  var d=CS.day,evts=await loadEvts(),ds=dstr(d);
  var dTitle=document.getElementById('cal-dtitle');if(dTitle)dTitle.textContent=d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  var de=evts.filter(function(e){return e.date===ds;}),html='';
  if(de.length===0){html='<div class="empty" style="padding:24px 0;">No events for this day</div>';}
  else{de.forEach(function(e){
      var et=e.type||'other';
      var ec=ECOL[et]||'cd-other';
      var el=ELBL[et]||et;
      var ps=getPillStyle(et);
      var isEditing=(calEditId===e.id);
      html+='<div class="evtrow" style="flex-direction:column;align-items:stretch;gap:4px;">';
      html+='<div style="display:flex;align-items:center;gap:7px;">';
      html+='<div class="cdot '+ec+'" style="width:8px;height:8px;border-radius:50%;flex-shrink:0;"></div>';
      html+='<span style="'+ps+'padding:2px 7px;border-radius:20px;font-size:10px;font-family:monospace;white-space:nowrap;">'+el+'</span>';
      html+='<span style="color:var(--text);font-size:13px;flex:1;">'+e.title+'</span>';
      if(e.note)html+='<span style="color:var(--text3);font-size:11px;font-family:monospace;white-space:nowrap;">'+e.note+'</span>';
      html+='<button class="editbtn" data-eid="'+e.id+'" data-ds="'+ds+'" onclick="openCalEdit(this.dataset.eid,this.dataset.ds)">'+(isEditing?'close':'edit')+'</button>';
      html+='<span class="evtdel" data-eid="'+e.id+'" onclick="delEvt(this.dataset.eid)">&#215;</span>';
      html+='</div>';
      html+='</div>';
    });}
  document.getElementById('cal-dbody').innerHTML=html;
}

window._addEvt=async function(){
  var date=document.getElementById('ce-date-hidden').value;
  var type=document.getElementById('ce-type').value;
  var title=document.getElementById('ce-title').value.trim();
  var start=document.getElementById('ce-start').value;
  var end=document.getElementById('ce-end').value;
  var noteField=document.getElementById('ce-note-field');
  var noteExtra=noteField?noteField.value.trim():'';
  var timeStr=start&&end?start+'–'+end:start?start:end?end:'';
  var note=timeStr+(noteExtra?(' · '+noteExtra):'');
  var repeat=(document.getElementById('ce-repeat')||{}).value||'none';
  if(!date||!title){alert('Please fill in date and title');return;}

  // Generate recurring dates (up to 12 months ahead)
  var dates=[date];
  if(repeat!=='none'){
    var d=new Date(date+'T00:00:00');
    var maxD=new Date(d);maxD.setFullYear(maxD.getFullYear()+1);
    while(true){
      if(repeat==='weekly') d.setDate(d.getDate()+7);
      else if(repeat==='fortnightly') d.setDate(d.getDate()+14);
      else if(repeat==='monthly') d.setMonth(d.getMonth()+1);
      if(d>maxD) break;
      dates.push(dstr(d));
    }
  }

  // Save all dates — group them with a repeatId so they can be identified
  var repeatId=repeat!=='none'?('r_'+date+'_'+title.replace(/\s/g,'').slice(0,8)):'';
  for(var i=0;i<dates.length;i++){
    var evtData={date:dates[i],type:type,title:title,note:note};
    if(repeatId) evtData.repeatId=repeatId;
    await fbAddDoc('events',evtData);
  }

  evtCache=null;
  document.getElementById('ce-title').value='';
  document.getElementById('ce-start').selectedIndex=0;
  document.getElementById('ce-end').selectedIndex=0;
  if(noteField)noteField.value='';
  var rep=document.getElementById('ce-repeat');
  if(rep)rep.value='none';
  CS.sel=date;
  if(dates.length>1)alert('✓ Created '+dates.length+' recurring events');
  renderCal();
};

window._delEvt=async function(id){
  await fbDelDoc('events',id);
  evtCache=null;renderCal();
};


// ── CALENDAR DROPDOWNS ──
function populateCalMonthSelect(){
  var el=document.getElementById('cal-month-select');
  if(!el)return;
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var curY=CS.month.getFullYear(),curM=CS.month.getMonth();
  el.innerHTML='';
  // Show current year months
  var year=curY;
  months.forEach(function(mn,mi){
    var o=document.createElement('option');
    o.value=year+'-'+mi;
    o.textContent=mn+' '+year;
    if(mi===curM&&year===curY)o.selected=true;
    el.appendChild(o);
  });
}

function populateCalWeekSelect(){
  var el=document.getElementById('cal-week-select');
  if(!el)return;
  el.innerHTML='';
  var year=new Date().getFullYear();
  var jan1=new Date(year,0,1);
  var curMon=CS.wstart?new Date(CS.wstart):getMon(new Date());
  for(var w=1;w<=52;w++){
    var dayOffset=(w-1)*7-(jan1.getDay()||7)+1;
    var wStart=new Date(year,0,1+dayOffset);
    var wEnd=new Date(wStart);wEnd.setDate(wStart.getDate()+6);
    var o=document.createElement('option');
    o.value=dstr(wStart);
    o.textContent='W'+w+' — '+wStart.toLocaleDateString('en-AU',{day:'numeric',month:'short'})+' to '+wEnd.toLocaleDateString('en-AU',{day:'numeric',month:'short'});
    if(dstr(wStart)===dstr(curMon))o.selected=true;
    el.appendChild(o);
  }
}

function populateCalDaySelect(){
  var el=document.getElementById('cal-day-select');
  if(!el)return;
  el.innerHTML='';
  var curDs=dstr(CS.day);
  var today=new Date();
  for(var i=-30;i<=30;i++){
    var d=new Date(today);d.setDate(today.getDate()+i);
    var ds=dstr(d);
    var o=document.createElement('option');
    o.value=ds;
    o.textContent=d.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'});
    if(ds===curDs)o.selected=true;
    el.appendChild(o);
  }
}

window._jumpCalMonth=function(v){
  var p=v.split('-');CS.month=new Date(parseInt(p[0]),parseInt(p[1]),1);renderMonth();setTimeout(populateCalMonthSelect,200);
};
window._jumpCalWeek=function(ds){
  CS.wstart=new Date(ds+'T00:00:00');renderWeek();setTimeout(populateCalWeekSelect,200);
};
window._jumpCalDay=function(ds){
  CS.day=new Date(ds+'T00:00:00');renderDay();setTimeout(populateCalDaySelect,200);
};



// ── TIMETABLE VIEW ──
async function renderTT(){
  var ds=(typeof ttSelectedDate!=="undefined"?ttSelectedDate:null)||logicalToday;
  var d=new Date(ds+'T00:00:00');
  var dow=d.getDay();
  var sch=SCH[dow];
  var evts=await loadEvts();
  var dayEvts=evts.filter(function(e){return e.date===ds;});

  // Title + day note
  var title=document.getElementById('tt-cardtitle');
  if(title) title.textContent=d.toLocaleDateString('en-AU',{weekday:'long',day:'numeric',month:'short'});

  var prog=document.getElementById('tt-prog');
  if(prog) prog.textContent=sch?sch.note:'';

  // Build schedule list - merge SCH items + calendar events
  var list=document.getElementById('tt-list');
  if(!list)return;

  var html='';

  // Show SCH schedule items
  // Load today's timetable ticks from localStorage
  var tickKey='tt_ticks_'+ds;
  var ticks={};
  try{ticks=JSON.parse(localStorage.getItem(tickKey)||'{}');}catch(e){}
  var hiddenKey='tt_hidden_'+ds;
  var hidden={};
  try{hidden=JSON.parse(localStorage.getItem(hiddenKey)||'{}');}catch(e){}
  var editsKey='tt_edits_'+ds;
  var schEdits={};
  try{schEdits=JSON.parse(localStorage.getItem(editsKey)||'{}');}catch(e){}

  if(sch&&sch.items&&sch.items.length>0){
    html+=sch.items.filter(function(_,i){return !hidden[i];}).map(function(item,idx){
      var ps=getPillStyle(item.c);
      var ticked=!!ticks[idx];
      return '<div class="tt-row" style="display:flex;align-items:center;gap:10px;padding:7px 14px;border-bottom:0.5px solid var(--border);cursor:pointer;'+(ticked?'opacity:0.5;':'')+'" onclick="tickTT(\''+ds+'\','+idx+',this)">'+
        '<div class="tt-cb cb'+(ticked?' checked':'')+'" style="flex-shrink:0;width:18px;height:18px;border-radius:50%;border:1.5px solid '+(ticked?'var(--green)':'var(--border2)')+';background:'+(ticked?'var(--green)':'transparent')+';display:flex;align-items:center;justify-content:center;transition:all .15s;">'+
          (ticked?'<svg width="10" height="10" viewBox="0 0 10 10"><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#0e0e0f" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>':'')+
        '</div>'+
        '<div class="tt-time" style="min-width:76px;font-size:10px;color:var(--text3);font-family:\'DM Mono\',monospace;flex-shrink:0;">'+(schEdits[idx+'_time']||item.t)+'</div>'+
        '<div style="flex:1;font-size:13px;'+(ticked?'text-decoration:line-through;color:var(--text3);':'')+'">'+(item.l||'')+(schEdits[idx+'_note']?'<span style="display:block;font-size:10px;color:var(--accent);margin-top:2px;">'+schEdits[idx+'_note']+'</span>':'')+'</div>'+
        '<span style="font-size:9px;padding:2px 6px;border-radius:20px;white-space:nowrap;'+ps+'">'+item.c+'</span>'+
        '<button onclick="event.stopPropagation();editTTTime(\''+ds+'\','+idx+')" class="tt-editbtn" style="font-size:10px;padding:2px 7px;height:auto;border-radius:4px;border:1px solid var(--amber);color:var(--amber);background:transparent;cursor:pointer;margin-right:4px;">edit</button>'+
        '<span class="evtdel" onclick="event.stopPropagation();hideTTItem(\''+ds+'\','+idx+')" title="Hide for today">&#215;</span>'+'<button class="editbtn" onclick="event.stopPropagation();editTTItem(\''+ds+'\',' + idx + ')" style="margin-left:4px;padding:1px 7px;border:1px solid #4caf50;border-radius:4px;background:transparent;color:#4caf50;font-size:10px;cursor:pointer;">edit</button>'+
      '</div>';
    }).join('');
  } else {
    html+='<div class="empty" style="padding:12px;">No schedule for this day</div>';
  }

  // Show any calendar events for this day
  if(dayEvts.length>0){
    html+='<div style="padding:8px 14px 4px;font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.8px;">Calendar events</div>';
    html+=dayEvts.map(function(e,ei){
      var ps=getPillStyle(e.type);
      return '<div style="display:flex;align-items:center;gap:8px;padding:6px 14px;border:1px solid transparent;border-radius:4px;margin:1px 2px;transition:border-color .15s;" onmouseenter="this.style.borderColor=\'var(--green)\'" onmouseleave="this.style.borderColor=\'transparent\'">'+
        '<div style="min-width:60px;font-size:10px;color:var(--text3);font-family:\'DM Mono\',monospace;flex-shrink:0;">'+(e.note||'')+'</div>'+
        '<div style="flex:1;font-size:13px;font-weight:500;">'+e.title+'</div>'+
        '<span style="font-size:9px;padding:2px 6px;border-radius:20px;'+ps+'">'+e.type+'</span>'+
        '<button class="editbtn" onclick="editEvt(\''+e.id+'\')">edit</button>'+
        '<span class="evtdel" onclick="delEvt(\''+e.id+'\')">&#215;</span>'+
      '</div>';
    }).join('');
  }

  list.innerHTML=html;

  // Week reference
  var weekEl=document.getElementById('tt-week');
  if(weekEl){
    var mon=getMon(d);
    var weekDays=[];
    for(var i=0;i<7;i++){var wd=new Date(mon);wd.setDate(mon.getDate()+i);weekDays.push(wd);}
    weekEl.innerHTML=weekDays.map(function(wd){
      var wds=dstr(wd);
      var wdevts=evts.filter(function(e){return e.date===wds;});
      var isToday=wds===logicalToday;
      var isSel=wds===ds;
      var wdow=wd.getDay();
      var wsch=SCH[wdow];
      return '<div style="padding:6px 0;border-bottom:0.5px solid var(--border);cursor:pointer;" onclick="jumpTTDay(\''+wds+'\')">'+
        '<div style="font-size:11px;font-weight:'+(isSel?'700':'500')+';color:'+(isSel?'var(--green)':isToday?'var(--amber)':'var(--text2)')+';">'+
          wd.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short'})+
          (wsch?'<span style="font-size:9px;color:var(--text3);margin-left:6px;">'+wsch.note+'</span>':'')+
        '</div>'+
        (wdevts.length?'<div style="display:flex;gap:3px;margin-top:3px;">'+
          wdevts.slice(0,4).map(function(e){
            var ec=ECOL[e.type]||'cd-other';
            return '<div class="cdot '+ec+'" style="width:5px;height:5px;border-radius:50%;"></div>';
          }).join('')+(wdevts.length>4?'<span style="font-size:8px;color:var(--text3);">+'+(wdevts.length-4)+'</span>':'')+'</div>':'') +
      '</div>';
    }).join('');
  }
}

window._jumpTTDay=function(ds){
  if(typeof ttSelectedDate!=="undefined"){ttSelectedDate=ds;} window.ttSelectedDate=ds;
  if(window.updateTTDateDisplay)window.updateTTDateDisplay();
  var el=document.getElementById('tt-date-hidden');
  if(el)el.value=ds;
  renderTT();
};

window._tickTT=function(ds,idx,row){
  var tickKey='tt_ticks_'+ds;
  var ticks={};
  try{ticks=JSON.parse(localStorage.getItem(tickKey)||'{}');}catch(e){}
  var hiddenKey='tt_hidden_'+ds;
  var hidden={};
  try{hidden=JSON.parse(localStorage.getItem(hiddenKey)||'{}');}catch(e){}
  var editsKey='tt_edits_'+ds;
  var schEdits={};
  try{schEdits=JSON.parse(localStorage.getItem(editsKey)||'{}');}catch(e){}
  ticks[idx]=!ticks[idx];
  localStorage.setItem(tickKey,JSON.stringify(ticks));
  renderTT();
};

window._resetTT=function(){
  var ds=(typeof ttSelectedDate!=='undefined'?ttSelectedDate:null)||logicalToday;
  localStorage.removeItem('tt_ticks_'+ds);
  localStorage.removeItem('tt_hidden_'+ds);
  localStorage.removeItem('tt_edits_'+ds);
  renderTT();
};

window._hideTTItem=function(ds,idx){
  var key='tt_hidden_'+ds;
  var hidden={};
  try{hidden=JSON.parse(localStorage.getItem(key)||'{}');}catch(e){}
  hidden[idx]=true;
  localStorage.setItem(key,JSON.stringify(hidden));
  renderTT();
};

