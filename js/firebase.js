import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocFromServer, setDoc, collection, getDocs, getDocsFromServer, deleteDoc, addDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDXjCbGpFCE9yVNLPRj6K35Sv9F5VpINiI",
  authDomain: "michael-dashboard-ce18b.firebaseapp.com",
  projectId: "michael-dashboard-ce18b",
  storageBucket: "michael-dashboard-ce18b.firebasestorage.app",
  messagingSenderId: "609388078138",
  appId: "1:609388078138:web:d0fe0e63a59b79d7d50103"
};

var app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch(e) {
  console.error('Firebase init failed:', e);
}

function setSyncStatus(state){
  var el=document.getElementById('sync-status');
  if(state==='ok'){el.textContent='synced';el.className='sync-status sync-ok';}
  else if(state==='err'){el.textContent='offline — data saved locally';el.className='sync-status sync-err';}
  else{el.textContent='syncing...';el.className='sync-status sync-loading';}
}


// ── Expose Firebase to global scope ──
window.db=db;window.app=app;
window.getDoc=getDoc;window.getDocFromServer=getDocFromServer;window.setDoc=setDoc;window.doc=doc;
window.collection=collection;window.getDocs=getDocs;
window.getDocsFromServer=getDocsFromServer;
window.deleteDoc=deleteDoc;window.addDoc=addDoc;
window.query=query;window.orderBy=orderBy;
window.setSyncStatus=setSyncStatus;
