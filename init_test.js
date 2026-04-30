
setTimeout(function() {
  var el = document.getElementById('output');
  el.textContent += 'window.fbGet: ' + typeof window.fbGet + '\n';
  el.textContent += 'window.fbSet: ' + typeof window.fbSet + '\n';
  el.textContent += 'window.db: ' + typeof window.db + '\n';
  el.textContent += 'setSyncStatus: ' + typeof setSyncStatus + '\n';
  el.textContent += 'dstr: ' + typeof dstr + '\n';
  el.textContent += 'logicalDate: ' + typeof logicalDate + '\n';
  
  // Test fbGet
  if(window.fbGet) {
    window.fbGet('savings','main').then(function(d) {
      el.textContent += 'Firebase read: ' + JSON.stringify(d) + '\n';
      setSyncStatus('ok');
    }).catch(function(e) {
      el.textContent += 'Firebase error: ' + e.message + '\n';
    });
  }
}, 500);
