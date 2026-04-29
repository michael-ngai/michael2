// ── INIT ──
updHdr();
setSyncStatus('loading');
renderBudget();
document.getElementById('tt-date-hidden').value=logicalToday;
updateTTDateDisplay();
var timeLabels=['12:00am','12:15am','12:30am','12:45am'];
for(var h=1;h<=11;h++){['00','15','30','45'].forEach(function(m){timeLabels.push(h+':'+m+'am');});}
timeLabels.push('12:00pm','12:15pm','12:30pm','12:45pm');
for(var h=1;h<=11;h++){['00','15','30','45'].forEach(function(m){timeLabels.push(h+':'+m+'pm');});}
timeLabels.push('11:00pm','11:15pm','11:30pm','11:45pm');
['ce-start','ce-end'].forEach(function(id){
  var sel=document.getElementById(id);
  if(!sel)return;
  timeLabels.forEach(function(t){var o=document.createElement('option');o.value=t;o.textContent=t;sel.appendChild(o);});
});
document.getElementById('ce-date-hidden').value=todayStr;
if(window._updateCEDate)window._updateCEDate();
if(window.initRoutineState)initRoutineState();
renderTodo();
renderHistory();
Promise.all([renderDaily(),renderSav(),renderEx()]).then(function(){
  setSyncStatus('ok');
}).catch(function(){
  setSyncStatus('err');
});
setInterval(updHdr,1000);
