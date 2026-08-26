/* certificados.js
   App logic for the certificate manager page.
   - Uses Firebase (Firestore + Auth) to store participants and completions
   - Organizer (admin) can sign in and perform admin actions (mark activities, batch issuance)
   - Batch issuance creates PDFs per eligible participant and bundles them as a ZIP

   NOTES:
   - Replace firebaseConfig with your project values below
   - Add an admin entry: after creating a user (Authentication), add a document in collection 'admins' with doc id = user's uid
     (or adapt rules to use custom claims)
*/

// =====================
// Firebase config (REPLACE)
// =====================
const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
  // storageBucket, messagingSenderId, appId as available
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Required activities - adjust as needed
const REQUIRED_ACTIVITIES = [
  { id: 'presenca', title: 'Formulário de Presença' },
  { id: 'questionario', title: 'Questionário de Aprendizado' },
  { id: 'avaliacao', title: 'Avaliação de Satisfação' }
];

// Elements
const registerForm = document.getElementById('registerForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const participantsList = document.getElementById('participantsList');
const clearLocalBtn = document.getElementById('clearLocalBtn');
const checkEmailInput = document.getElementById('checkEmail');
const checkBtn = document.getElementById('checkBtn');
const activitiesSection = document.getElementById('activitiesSection');
const activitiesList = document.getElementById('activitiesList');
const certName = document.getElementById('certName');
const certCourse = document.getElementById('certCourse');
const certHours = document.getElementById('certHours');
const certDate = document.getElementById('certDate');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const downloadPngBtn = document.getElementById('downloadPngBtn');
const batchIssueBtn = document.getElementById('batchIssueBtn');

const courseNameInput = document.getElementById('courseName');
const courseHoursInput = document.getElementById('courseHours');
const saveCourseBtn = document.getElementById('saveCourseBtn');

// Auth UI
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const signOutBtn = document.getElementById('signOutBtn');
const adminEmailInput = document.getElementById('adminEmail');
const adminPasswordInput = document.getElementById('adminPassword');
const signedOutUI = document.getElementById('signedOutUI');
const signedInUI = document.getElementById('signedInUI');
const adminEmailLabel = document.getElementById('adminEmailLabel');

// Utilities
function isValidEmail(email){
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i; return re.test(String(email||'').toLowerCase());
}
function escapeHtml(s){ if(!s) return ''; return String(s).replace(/[&<>"'`=\/]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;",'/':'&#x2F;','=':'&#x3D;','`':'&#x60;'})[c]); }
function docIdFromEmail(email){ return encodeURIComponent(email.toLowerCase()); }

// Local course config
const LS_COURSE = 'courseSettings_v1';
function readCourseLocal(){ try{ return JSON.parse(localStorage.getItem(LS_COURSE)||'{}'); }catch(e){return{}} }
function writeCourseLocal(obj){ localStorage.setItem(LS_COURSE, JSON.stringify(obj)); }

// Render participants list using real-time listener
let unsubscribeParticipants = null;
function startParticipantsListener(){
  if(unsubscribeParticipants) unsubscribeParticipants();
  unsubscribeParticipants = db.collection('participants').orderBy('updatedAt','desc').onSnapshot(snapshot=>{
    const participants = [];
    snapshot.forEach(doc=> participants.push({ id: doc.id, ...doc.data() }));
    renderParticipantsList(participants);
  }, err=> console.error('listen error', err));
}

function renderParticipantsList(participants){
  participantsList.innerHTML = '';
  if(!participants || participants.length===0){ participantsList.innerHTML = '<div class="small">Nenhum participante cadastrado.</div>'; return; }
  participants.forEach(p=>{
    const el = document.createElement('div'); el.className='participant';
    el.innerHTML = `<div><div style="font-weight:600;">${escapeHtml(p.name||'')}</div><div class="small">${escapeHtml(p.email||'')}</div></div>`;
    const actions = document.createElement('div'); actions.style.display='flex'; actions.style.gap='8px';
    const verifyBtn = document.createElement('button'); verifyBtn.className='btn btn-ghost'; verifyBtn.textContent='Verificar';
    verifyBtn.addEventListener('click', ()=>{ checkEmailInput.value = p.email; verifyForEmail(p.email); });
    const delBtn = document.createElement('button'); delBtn.className='btn'; delBtn.style.background='#ef4444'; delBtn.style.color='white'; delBtn.textContent='Excluir';
    delBtn.addEventListener('click', async ()=>{ if(!confirm('Excluir participante?')) return; try{ await db.collection('participants').doc(p.id).delete(); alert('Excluído'); }catch(e){console.error(e); alert('Erro');} });
    actions.appendChild(verifyBtn); actions.appendChild(delBtn);
    el.appendChild(actions);
    participantsList.appendChild(el);
  });
}

// Save participant to Firestore (id = encoded email)
async function saveParticipantToFirestore(name, email){
  const id = docIdFromEmail(email);
  const ref = db.collection('participants').doc(id);
  const payload = { name, email, updatedAt: firebase.firestore.FieldValue.serverTimestamp() };
  await ref.set(payload, { merge: true });
}

// Toggle activity for a participant (admin-only action in UI; rules required server-side)
async function toggleActivityForEmail(email, activityId){
  const id = docIdFromEmail(email); const ref = db.collection('participants').doc(id);
  try{
    const doc = await ref.get();
    if(!doc.exists){ alert('Participante não encontrado.'); return; }
    const data = doc.data() || {}; const completions = data.completions || {};
    completions[activityId] = !completions[activityId];
    await ref.update({ completions, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
  }catch(err){ console.error(err); alert('Erro ao atualizar atividade.'); }
}

// Render activities for provided email
async function renderActivitiesForEmail(email){
  activitiesList.innerHTML = '';
  const id = docIdFromEmail(email);
  try{
    const doc = await db.collection('participants').doc(id).get();
    const data = doc.exists ? doc.data() : null; const userComp = data && data.completions ? data.completions : {};
    REQUIRED_ACTIVITIES.forEach(act=>{
      const done = !!userComp[act.id];
      const row = document.createElement('div'); row.className='activity';
      row.innerHTML = `<div style="display:flex; flex-direction:column;"><div style="font-weight:600;">${escapeHtml(act.title)}</div><div class="small">Obrigatória</div></div>`;
      const right = document.createElement('div'); right.style.display='flex'; right.style.gap='8px'; right.style.alignItems='center';
      const status = document.createElement('div'); status.className='small'; status.textContent = done ? 'Concluída' : 'Pendente';
      const btn = document.createElement('button'); btn.className = 'btn ' + (done? 'btn-ghost':'btn-primary'); btn.textContent = done? 'Marcar como Pendente': 'Marcar como Concluída';
      btn.addEventListener('click', async ()=>{ await toggleActivityForEmail(email, act.id); await renderActivitiesForEmail(email); });
      right.appendChild(status); right.appendChild(btn); row.appendChild(right);
      activitiesList.appendChild(row);
    });

    const eligible = REQUIRED_ACTIVITIES.every(a=> !!userComp[a.id]);
    const summary = document.createElement('div'); summary.style.marginTop='12px'; summary.innerHTML = `<div style="font-weight:700; color:${eligible? '#16a34a':'#b91c1c'}">${eligible ? 'Participante apto para emitir certificado.' : 'Participante NÃO apto - atividades pendentes.'}</div>`;
    activitiesList.appendChild(summary);

    // Update certificate preview
    const name = data ? data.name : null; updateCertificatePreview(name);
  }catch(err){ console.error(err); activitiesList.innerHTML = '<div class="small">Erro ao ler participante.</div>'; }
}

function verifyForEmail(email){ activitiesSection.style.display = 'block'; renderActivitiesForEmail(email); }

// isEligible: check completions in Firestore doc
async function isEligible(email){
  const id = docIdFromEmail(email);
  const doc = await db.collection('participants').doc(id).get(); if(!doc.exists) return false; const data = doc.data(); const comp = data.completions || {};
  return REQUIRED_ACTIVITIES.every(a=> !!comp[a.id]);
}

// Certificate preview update
function updateCertificatePreview(name){ const course = readCourseLocal(); certName.textContent = name ? name : '— NOME DO PARTICIPANTE —'; certCourse.innerHTML = name ? `concluiu o curso <strong>${escapeHtml(course.name || '— NOME DO CURSO —')}</strong>` : `concluiu o curso <strong>${escapeHtml(course.name || '— NOME DO CURSO —')}</strong>`; certHours.innerHTML = `Carga horária: <strong>${escapeHtml(course.hours || '— HORAS —')}</strong>`; certDate.textContent = new Date().toLocaleDateString(); }

// Generate PDF for the currently rendered #certificate element
async function generatePdfFromCertificate(filename = 'certificado.pdf'){
  const certificateEl = document.getElementById('certificate');
  const canvas = await html2canvas(certificateEl, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(filename);
}

async function downloadPngFromCertificate(filename = 'certificado.png'){
  const certificateEl = document.getElementById('certificate');
  const canvas = await html2canvas(certificateEl, { scale: 2 });
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a'); link.href = dataUrl; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
}

// Batch issuance: fetch eligible participants and produce a ZIP of PDFs
async function batchIssueAllEligible(){
  // Only admins should call this; UI already hides button for non-admins
  batchIssueBtn.disabled = true; batchIssueBtn.textContent = 'Gerando...';
  try{
    // Build query that ensures completions fields are true for each required activity.
    // Firestore doesn't support querying for dynamic map keys in a single where easily; we compose successive where clauses.
    let query = db.collection('participants');
    REQUIRED_ACTIVITIES.forEach(act => { query = query.where(`completions.${act.id}`, '==', true); });
    const snap = await query.get();
    if(snap.empty){ alert('Nenhum participante elegível encontrado.'); return; }

    const zip = new JSZip();
    const course = readCourseLocal();

    // We'll render the #certificate element for each participant and capture it.
    for(const doc of snap.docs){
      const data = doc.data(); const name = data.name || data.email || 'participante';
      // Update preview
      updateCertificatePreview(name);
      // Wait a tick for DOM update and browser paint
      await new Promise(r=> setTimeout(r, 250));
      const canvas = await html2canvas(document.getElementById('certificate'), { scale: 2 });
      const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
      // Convert canvas to PDF for consistency
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width, canvas.height] });
      const dataUrl = canvas.toDataURL('image/png');
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
      const pdfBlob = pdf.output('blob');
      const fileName = `${(name.replace(/\s+/g,'_'))}_certificado.pdf`;
      zip.file(fileName, pdfBlob);
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(zipBlob); link.download = `certificados_${new Date().toISOString().slice(0,10)}.zip`; document.body.appendChild(link); link.click(); link.remove();
    alert('ZIP gerado e baixado.');
  }catch(err){ console.error(err); alert('Falha ao gerar ZIP: ' + (err.message||err)); }
  finally{ batchIssueBtn.disabled = false; batchIssueBtn.textContent = 'Emitir e Baixar (ZIP) para todos elegíveis'; }
}

// Record issuance (optional) in Firestore
async function recordCertificateIssued(name, email){
  try{ await db.collection('issuedCertificates').add({ name: name||null, email: email||null, course: readCourseLocal().name||null, hours: readCourseLocal().hours||null, issuedAt: firebase.firestore.FieldValue.serverTimestamp() }); }
  catch(e){ console.warn('Falha ao gravar issuance', e); }
}

// Admin check: determine if current user is an admin by checking collection 'admins' for uid doc
async function checkIsAdmin(uid){
  try{ const doc = await db.collection('admins').doc(uid).get(); return doc.exists; }catch(e){ console.error('admin check', e); return false; }
}

// ========== Events & UI wiring ==========
registerForm.addEventListener('submit', async (e)=>{ e.preventDefault(); const name = fullNameInput.value.trim(); const email = (emailInput.value||'').trim().toLowerCase(); if(!name){ alert('Nome é obrigatório'); return; } if(!email){ alert('E-mail é obrigatório'); return; } if(!isValidEmail(email)){ alert('E-mail inválido'); return; } try{ await saveParticipantToFirestore(name, email); fullNameInput.value=''; emailInput.value=''; alert('Participante salvo'); }catch(err){ console.error(err); alert('Erro ao salvar'); } });

checkBtn.addEventListener('click', ()=>{ const email = (checkEmailInput.value||'').trim().toLowerCase(); if(!email){ alert('Digite e-mail'); return; } if(!isValidEmail(email)){ alert('E-mail inválido'); return; } activitiesSection.style.display='block'; renderActivitiesForEmail(email); });

downloadPdfBtn.addEventListener('click', async ()=>{
  const name = certName.textContent; const email = (checkEmailInput.value||'').trim().toLowerCase(); if(email && isValidEmail(email)){ const eligible = await isEligible(email); if(!eligible){ alert('Atividades pendentes.'); return; } }
  downloadPdfBtn.disabled = true; downloadPdfBtn.textContent = 'Gerando...'; try{ const filename = (name && name!=='— NOME DO PARTICIPANTE —') ? name.replace(/\s+/g,'_') + '_cert.pdf' : 'certificado.pdf'; await generatePdfFromCertificate(filename); await recordCertificateIssued(name!=='— NOME DO PARTICIPANTE —' ? name : null, isValidEmail((checkEmailInput.value||'').trim()) ? (checkEmailInput.value||'').trim().toLowerCase() : null); }
  catch(e){ console.error(e); alert('Erro ao gerar PDF'); }
  finally{ downloadPdfBtn.disabled = false; downloadPdfBtn.textContent = 'Gerar e Baixar PDF'; }
});

downloadPngBtn.addEventListener('click', async ()=>{ const email = (checkEmailInput.value||'').trim().toLowerCase(); if(email && isValidEmail(email)){ const eligible = await isEligible(email); if(!eligible){ alert('Atividades pendentes.'); return; } } downloadPngBtn.disabled = true; downloadPngBtn.textContent = 'Gerando...'; try{ await downloadPngFromCertificate(); }catch(e){ console.error(e); alert('Erro ao gerar PNG'); } finally{ downloadPngBtn.disabled = false; downloadPngBtn.textContent = 'Baixar PNG'; } });

batchIssueBtn.addEventListener('click', async ()=>{ if(!confirm('Gerar certificados para todos participantes elegíveis e baixar como ZIP?')) return; await batchIssueAllEligible(); });

// Auth wiring
signInBtn.addEventListener('click', async ()=>{ const email = (adminEmailInput.value||'').trim(); const pass = (adminPasswordInput.value||'').trim(); if(!email||!pass){ alert('Email e senha são necessários'); return; } try{ await auth.signInWithEmailAndPassword(email, pass); }catch(e){ console.error(e); alert('Falha no login: ' + (e.message||e)); } });
signUpBtn.addEventListener('click', async ()=>{ const email = (adminEmailInput.value||'').trim(); const pass = (adminPasswordInput.value||'').trim(); if(!email||!pass){ alert('Email e senha são necessários'); return; } try{ const user = await auth.createUserWithEmailAndPassword(email, pass); alert('Conta criada. Agora adicione o uid na coleção admins para ter permissões de admin. UID: ' + user.user.uid); }catch(e){ console.error(e); alert('Falha ao criar conta: ' + (e.message||e)); } });
signOutBtn.addEventListener('click', async ()=>{ await auth.signOut(); });

// Auth state change listener
let currentIsAdmin = false;
auth.onAuthStateChanged(async user =>{
  if(user){ signedOutUI.style.display='none'; signedInUI.style.display='block'; adminEmailLabel.textContent = user.email; // check admin
    currentIsAdmin = await checkIsAdmin(user.uid);
    batchIssueBtn.style.display = currentIsAdmin ? 'inline-flex' : 'none';
    // allow marking activities only if admin
    // (UI already allows toggling only after login in real usage because toggling writes will be rejected by rules if not admin)
  }else{ signedOutUI.style.display='block'; signedInUI.style.display='none'; adminEmailLabel.textContent=''; currentIsAdmin = false; batchIssueBtn.style.display='none'; }
});

// Course config
saveCourseBtn.addEventListener('click', ()=>{ const name = courseNameInput.value.trim(); const hours = courseHoursInput.value.trim(); if(!name||!hours){ alert('Preencha nome e horas'); return; } writeCourseLocal({ name, hours }); updateCertificatePreview(null); alert('Configuração salva localmente.'); });
clearLocalBtn.addEventListener('click', ()=>{ if(!confirm('Limpar configurações locais?')) return; localStorage.removeItem(LS_COURSE); courseNameInput.value=''; courseHoursInput.value=''; updateCertificatePreview(null); });

// Initialization
(function init(){ const c = readCourseLocal(); courseNameInput.value = c.name || 'Curso Exemplo de Boas Práticas'; courseHoursInput.value = c.hours || '8h'; updateCertificatePreview(null); startParticipantsListener(); })();

/*
 Firestore rules suggestion (deploy in Firebase Console - Firestore rules)
 ---------------------------------------------------------------
 // Development (NOT for production):
 rules_version = '2';
 service cloud.firestore {
   match /databases/{database}/documents {
     match /{document=**} {
       allow read, write: if true; // dev only
     }
   }
 }

 // Recommended for production: require authentication and admins collection
 rules_version = '2';
 service cloud.firestore {
   match /databases/{database}/documents {
     match /participants/{participantId} {
       // Anyone can read participants (optional), but write must be authenticated or via a trusted backend
       allow read: if true;
       allow create: if request.auth != null; // or use more strict validation
       allow update, delete: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
     }
     match /admins/{adminId} {
       allow read: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
       allow write: if false; // manage admins via console or server admin SDK only
     }
     match /issuedCertificates/{doc} {
       allow create: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
       allow read: if request.auth != null && exists(/databases/$(database)/documents/admins/$(request.auth.uid));
     }
   }
 }

 Notes:
 - To grant admin: create a document in collection 'admins' with the user's UID as the document ID.
 - For more secure flow, use Firebase Admin SDK on a trusted server to set custom claims (admin) and check request.auth.token.admin == true in rules.
*/