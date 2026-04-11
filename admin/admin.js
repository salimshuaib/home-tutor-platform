/**
 * Admin Module — Delhi Private Tutors
 * Handles admin authentication, tutor moderation, and real-time data.
 * 
 * Imported by admin-dashboard.html as an ES module.
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import {
  getFirestore, doc, getDoc, updateDoc, collection, query, where,
  orderBy, onSnapshot, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

/* ━━━ FIREBASE INIT ━━━ */
const app = initializeApp({
  apiKey: "AIzaSyAs8f05aOnxXvsMwtypdr1k_4DhpIIxIbc",
  authDomain: "hometutor-2dbc0.firebaseapp.com",
  projectId: "hometutor-2dbc0",
  storageBucket: "hometutor-2dbc0.firebasestorage.app",
  messagingSenderId: "792391008247",
  appId: "1:792391008247:web:fa9e76a8caa448351d38f2"
});
const auth = getAuth(app);
const db = getFirestore(app);

/* ━━━ STATE ━━━ */
let currentAdmin = null;
let allTutors = [];
let unsubTutors = null;

/* ━━━ DOM HELPERS ━━━ */
function $(id) { return document.getElementById(id); }
function safeText(str) { const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }

function showToast(msg, type = 'success') {
  const toast = $('toast');
  if (!toast) return;
  toast.className = `toast toast-${type} show`;
  toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i> ${safeText(msg)}`;
  if (window.lucide) lucide.createIcons();
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 4000);
}

/* ━━━ ADMIN AUTH GUARD ━━━ */
function initAdminAuth() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../login.html";
      return;
    }

    try {
      console.log("Checking admin for UID:", user.uid);

      const adminRef = doc(db, "admins", user.uid);
      const adminSnap = await getDoc(adminRef);

      if (!adminSnap.exists()) {
        console.warn("Access denied: Not an admin");
        alert("Access denied");
        window.location.href = "../login.html";
        return;
      }

      console.log("Admin verified");
      currentAdmin = user;

      // Hide loader
      const loader = document.getElementById("loader");
      if (loader) {
        loader.style.display = "none";
      }

      // Load dashboard
      loadAdminDashboard(adminSnap.data());

    } catch (error) {
      console.error("Admin check error:", error);

      const loaderMsg = document.getElementById("loader-message");
      if (loaderMsg) {
        loaderMsg.textContent = "Error loading admin session";
      }
    }
  });

  // Logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      signOut(auth).then(() => window.location.href = '../login.html');
    });
  }
}

/**
 * Loads dashboard content after admin verification
 */
function loadAdminDashboard(adminData) {
  // Set admin info in nav
  const name = adminData.name || adminData.email || 'Admin';
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  
  const nameEl = document.getElementById('nav-admin-name');
  const avatarEl = document.getElementById('nav-admin-avatar');
  
  if (nameEl) nameEl.textContent = name.split(' ')[0];
  if (avatarEl) avatarEl.textContent = initials;

  // Start real-time data listener
  startTutorListener();
}

/* ━━━ REAL-TIME TUTOR LISTENER ━━━ */
function startTutorListener() {
  if (unsubTutors) unsubTutors();

  const q = query(collection(db, 'users'), where('role', '==', 'tutor'));

  unsubTutors = onSnapshot(q, (snapshot) => {
    allTutors = [];
    snapshot.forEach(docSnap => {
      allTutors.push({ id: docSnap.id, ...docSnap.data() });
    });

    updateStats();
    renderCurrentSection();
  }, (error) => {
    console.error('Tutor listener error:', error);
    showToast('Failed to load tutors. Please refresh.', 'error');
  });
}

/* ━━━ STATS ━━━ */
function updateStats() {
  const pending = allTutors.filter(t => t.status === 'pending' || !t.status);
  const approved = allTutors.filter(t => t.status === 'approved');
  const rejected = allTutors.filter(t => t.status === 'rejected');

  $('stat-pending').textContent = pending.length;
  $('stat-approved').textContent = approved.length;
  $('stat-rejected').textContent = rejected.length;
  $('stat-total').textContent = allTutors.length;

  // Update badge on pending nav
  const badge = $('pending-badge');
  if (pending.length > 0) {
    badge.textContent = pending.length;
    badge.style.display = 'inline';
  } else {
    badge.style.display = 'none';
  }
}

/* ━━━ RENDER ROUTER ━━━ */
let currentSection = 'overview';

function renderCurrentSection() {
  switch (currentSection) {
    case 'overview': renderOverview(); break;
    case 'pending': renderPending(); break;
    case 'approved': renderApproved(); break;
    case 'rejected': renderRejected(); break;
  }
}

/* ━━━ OVERVIEW ━━━ */
function renderOverview() {
  const pending = allTutors.filter(t => t.status === 'pending' || !t.status);
  const container = $('overview-recent');
  if (!container) return;

  if (pending.length === 0) {
    container.innerHTML = `<div class="empty-state"><i data-lucide="inbox"></i><h3>No pending applications</h3><p>All tutor applications have been reviewed.</p></div>`;
  } else {
    container.innerHTML = `<div class="tutor-grid">${pending.slice(0, 6).map(t => tutorCard(t)).join('')}</div>`;
  }
  if (window.lucide) lucide.createIcons();
}

/* ━━━ PENDING ━━━ */
function renderPending() {
  const pending = allTutors.filter(t => t.status === 'pending' || !t.status);
  const container = $('pending-container');
  if (!container) return;

  if (pending.length === 0) {
    container.innerHTML = `<div class="empty-state"><i data-lucide="check-circle"></i><h3>All clear!</h3><p>No pending tutor applications to review.</p></div>`;
  } else {
    container.innerHTML = `<div class="tutor-grid">${pending.map(t => tutorCard(t)).join('')}</div>`;
  }
  if (window.lucide) lucide.createIcons();
}

/* ━━━ APPROVED ━━━ */
function renderApproved() {
  const approved = allTutors.filter(t => t.status === 'approved');
  const container = $('approved-container');
  if (!container) return;

  if (approved.length === 0) {
    container.innerHTML = `<div class="empty-state"><i data-lucide="users"></i><h3>No approved tutors yet</h3><p>Approve pending tutors to see them here.</p></div>`;
  } else {
    container.innerHTML = `<div class="tutor-list">${approved.map(t => tutorListItem(t, 'approved')).join('')}</div>`;
  }
  if (window.lucide) lucide.createIcons();
}

/* ━━━ REJECTED ━━━ */
function renderRejected() {
  const rejected = allTutors.filter(t => t.status === 'rejected');
  const container = $('rejected-container');
  if (!container) return;

  if (rejected.length === 0) {
    container.innerHTML = `<div class="empty-state"><i data-lucide="user-x"></i><h3>No rejected applications</h3><p>Rejected tutor applications will appear here.</p></div>`;
  } else {
    container.innerHTML = `<div class="tutor-list">${rejected.map(t => tutorListItem(t, 'rejected')).join('')}</div>`;
  }
  if (window.lucide) lucide.createIcons();
}

/* ━━━ CARD TEMPLATES ━━━ */
function tutorCard(t) {
  const name = t.fullName || 'Unknown';
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const subjects = (t.subjects || []).join(', ') || 'Not specified';
  const location = t.area ? `${t.area}, ${t.city || 'Delhi'}` : (t.city || 'Delhi');
  const exp = t.experience ? `${t.experience} yrs exp` : 'N/A';
  const submitted = t.submittedAt ? formatDate(t.submittedAt) : (t.createdAt ? formatDate(t.createdAt) : 'N/A');
  const profileImg = t.profileImageUrl
    ? `<img src="${safeText(t.profileImageUrl)}" alt="Profile" class="tutor-card-avatar-img" style="cursor:pointer;" onclick="window.adminActions.viewImage('${safeText(t.profileImageUrl)}')">`
    : `<span>${initials}</span>`;
  const docLink = t.documentUrl
    ? `<button onclick="window.adminActions.viewDoc('${safeText(t.documentUrl)}')" class="btn btn-outline btn-sm"><i data-lucide="file-text"></i> View Document</button>`
    : `<span class="no-doc"><i data-lucide="file-x"></i> No document</span>`;

  return `
  <div class="tutor-card" data-uid="${t.id}">
    <div class="tutor-card-top">
      <div class="tutor-card-avatar">${profileImg}</div>
      <div class="tutor-card-info">
        <h3>${safeText(name)}</h3>
        <p class="tutor-card-email"><i data-lucide="mail"></i> ${safeText(t.email || '')}</p>
      </div>
    </div>
    <div class="tutor-card-meta">
      <span class="meta-tag"><i data-lucide="book-open"></i> ${safeText(subjects)}</span>
      <span class="meta-tag"><i data-lucide="map-pin"></i> ${safeText(location)}</span>
      <span class="meta-tag"><i data-lucide="briefcase"></i> ${safeText(exp)}</span>
      <span class="meta-tag"><i data-lucide="calendar"></i> Applied: ${safeText(submitted)}</span>
    </div>
    <div class="tutor-card-docs">${docLink}</div>
    <div class="tutor-card-actions" style="display:flex; flex-wrap:wrap; gap:8px;">
      <button class="btn btn-primary btn-sm" onclick="window.adminActions.viewProfile('${t.id}')">
        <i data-lucide="user"></i> View Profile
      </button>
      <button class="btn btn-approve btn-sm" onclick="window.adminActions.approve('${t.id}', this)">
        <i data-lucide="check"></i> Approve
      </button>
      <button class="btn btn-reject btn-sm" onclick="window.adminActions.openRejectModal('${t.id}', '${safeText(name)}')">
        <i data-lucide="x"></i> Reject
      </button>
    </div>
  </div>`;


function tutorListItem(t, type) {
  const name = t.fullName || 'Unknown';
  const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  const subjects = (t.subjects || []).join(', ') || 'Not specified';
  const reviewedDate = t.reviewedAt ? formatDate(t.reviewedAt) : 'N/A';
  const profileImg = t.profileImageUrl
    ? `<img src="${safeText(t.profileImageUrl)}" alt="Profile">`
    : `<span>${initials}</span>`;

  let extra = '';
  if (type === 'rejected' && t.rejectionReason) {
    extra = `<div class="rejection-reason"><i data-lucide="message-circle"></i> <strong>Reason:</strong> ${safeText(t.rejectionReason)}</div>`;
  }

  return `
  <div class="tutor-list-item">
    <div class="tutor-list-avatar">${profileImg}</div>
    <div class="tutor-list-info">
      <h4>${safeText(name)}</h4>
      <p>${safeText(t.email || '')} &bull; ${safeText(subjects)}</p>
      ${extra}
    </div>
    <div class="tutor-list-meta">
      <span class="review-date"><i data-lucide="clock"></i> Reviewed: ${safeText(reviewedDate)}</span>
    </div>
  </div>`;
}

/* ━━━ APPROVE ━━━ */
async function approveTutor(uid, btn) {
  if (!currentAdmin) return;
  const origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Approving...';
  if (window.lucide) lucide.createIcons();

  try {
    await updateDoc(doc(db, 'users', uid), {
      status: 'approved',
      reviewedAt: serverTimestamp(),
      rejectionReason: null
    });
    showToast('Tutor approved successfully!');
  } catch (e) {
    console.error('Approve failed:', e);
    showToast('Failed to approve tutor. ' + e.message, 'error');
    btn.innerHTML = origHTML;
    btn.disabled = false;
    if (window.lucide) lucide.createIcons();
  }
}

/* ━━━ REJECT ━━━ */
let rejectTargetUid = null;

function openRejectModal(uid, name) {
  rejectTargetUid = uid;
  $('reject-tutor-name').textContent = name;
  $('reject-reason').value = '';
  $('reject-modal').classList.add('show');
}

function closeRejectModal() {
  rejectTargetUid = null;
  $('reject-modal').classList.remove('show');
}

async function confirmReject() {
  if (!rejectTargetUid || !currentAdmin) return;
  const reason = $('reject-reason').value.trim();
  if (!reason) {
    showToast('Please provide a rejection reason.', 'error');
    return;
  }

  const btn = $('confirm-reject-btn');
  const origHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i data-lucide="loader" class="spin"></i> Rejecting...';
  if (window.lucide) lucide.createIcons();

  try {
    await updateDoc(doc(db, 'users', rejectTargetUid), {
      status: 'rejected',
      rejectionReason: reason,
      reviewedAt: serverTimestamp()
    });
    showToast('Tutor application rejected.');
    closeRejectModal();
  } catch (e) {
    console.error('Reject failed:', e);
    showToast('Failed to reject tutor. ' + e.message, 'error');
  }

  btn.innerHTML = origHTML;
  btn.disabled = false;
  if (window.lucide) lucide.createIcons();
}

/* ━━━ SECTION NAVIGATION ━━━ */
function switchSection(name) {
  currentSection = name;
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const sec = $('sec-' + name);
  if (sec) sec.classList.add('active');
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.toggle('active', l.dataset.section === name));
  $('sidebar').classList.remove('open');
  $('sidebar-backdrop').classList.remove('open');
  renderCurrentSection();
  if (window.lucide) lucide.createIcons();
}

/* ━━━ UTILITY ━━━ */
function formatDate(ts) {
  if (!ts) return 'N/A';
  let d;
  if (ts.toDate) d = ts.toDate();
  else if (ts.seconds) d = new Date(ts.seconds * 1000);
  else d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* ━━━ EXPORTS ━━━ */
window.adminActions = {
  approve: approveTutor,
  openRejectModal,
  closeRejectModal,
  confirmReject,
  switchSection
};

export { initAdminAuth, switchSection };


/* ━━━ ADMIN ACTIONS (VIEWERS) ━━━ */
document.addEventListener('DOMContentLoaded', () => {
  // Modals closure setup
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.remove('open');
    });
  });

  document.querySelectorAll('.modal').forEach(m => {
    m.addEventListener('click', (e) => {
      if(e.target === m) m.classList.remove('open');
    });
  });
});

window.adminActions.viewImage = function(url) {
  const modal = document.getElementById('image-viewer-modal');
  const img = document.getElementById('image-viewer-img');
  if(modal && img) {
    img.src = url;
    modal.classList.add('open');
  }
};

window.adminActions.viewDoc = function(url) {
  const modal = document.getElementById('doc-viewer-modal');
  const iframe = document.getElementById('doc-viewer-iframe');
  const dl = document.getElementById('doc-viewer-download');
  if(modal && iframe && dl) {
    iframe.src = url;
    dl.href = url;
    modal.classList.add('open');
  }
};

window.adminActions.viewProfile = function(uid) {
  const tutor = allTutors.find(t => t.id === uid);
  if (!tutor) return;
  const modal = document.getElementById('admin-profile-modal');
  const content = document.getElementById('admin-profile-content');
  const actions = document.getElementById('admin-profile-actions');
  if(!modal || !content || !actions) return;

  const subjects = (tutor.subjects || []).join(', ') || 'None';
  const classes = (tutor.classes || []).join(', ') || 'None';
  const modes = (tutor.mode || []).join(', ') || 'None';
  const boards = (tutor.boards || []).join(', ') || 'None';

  content.innerHTML = `
    <div style="display:flex; gap: 15px; margin-bottom: 20px;">
      ${tutor.profileImageUrl ? `<img src="${safeText(tutor.profileImageUrl)}" style="width:100px; height:100px; border-radius:12px; object-fit:cover; cursor:pointer;" onclick="window.adminActions.viewImage('${safeText(tutor.profileImageUrl)}')">` : ''}
      <div>
        <h3 style="font-size:1.4rem; color:var(--navy);">${safeText(tutor.fullName || 'Unknown')}</h3>
        <p style="color:var(--text-mid); font-size: 0.9rem;">${safeText(tutor.email)} &bull; ${safeText(tutor.phone || 'No phone')}</p>
        <p style="color:var(--text-mid); font-size: 0.9rem; margin-top:5px;"><strong>Tagline:</strong> ${safeText(tutor.tagline || '-')}</p>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; background:#f9f9f9; padding:15px; border-radius:12px; margin-bottom:20px;">
      <div><strong>Subjects:</strong> <br><span style="font-size:0.9rem">${safeText(subjects)}</span></div>
      <div><strong>Classes:</strong> <br><span style="font-size:0.9rem">${safeText(classes)}</span></div>
      <div><strong>Boards:</strong> <br><span style="font-size:0.9rem">${safeText(boards)}</span></div>
      <div><strong>Modes:</strong> <br><span style="font-size:0.9rem">${safeText(modes)}</span></div>
      <div><strong>Area/City:</strong> <br><span style="font-size:0.9rem">${safeText(tutor.area || '')}, ${safeText(tutor.city || '')}</span></div>
      <div><strong>Experience:</strong> <br><span style="font-size:0.9rem">${safeText(tutor.experience || 0)} yrs</span></div>
      <div><strong>Monthly Fee:</strong> <br><span style="font-size:0.9rem">₹${safeText(tutor.fee || 0)}</span></div>
    </div>
    <div style="margin-bottom:20px;">
      <strong>Bio:</strong>
      <p style="background:#f9f9f9; padding:10px; border-radius:8px; font-size:0.9rem; margin-top:5px; white-space:pre-wrap;">${safeText(tutor.bio || 'No bio provided.')}</p>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center;">
      ${tutor.documentUrl ? `<button onclick="window.adminActions.viewDoc('${safeText(tutor.documentUrl)}')" class="btn btn-outline"><i data-lucide="file-text"></i> View Certificate</button>` : '<span>No Document</span>'}
    </div>
  `;

  let actionBtns = '';
  if(tutor.status === 'pending' || !tutor.status) {
    actionBtns = `
      <button class="btn btn-approve" onclick="window.adminActions.approve('${uid}', this); document.getElementById('admin-profile-modal').classList.remove('open');">
        <i data-lucide="check"></i> Approve
      </button>
      <button class="btn btn-reject" onclick="window.adminActions.openRejectModal('${uid}', '${safeText(tutor.fullName || '')}'); document.getElementById('admin-profile-modal').classList.remove('open');">
        <i data-lucide="x"></i> Reject
      </button>`;
  } else if(tutor.status === 'approved') {
    actionBtns = `<button class="btn btn-reject" onclick="window.adminActions.openRejectModal('${uid}', '${safeText(tutor.fullName || '')}'); document.getElementById('admin-profile-modal').classList.remove('open');"><i data-lucide="x"></i> Suspend/Reject Tutor</button>`;
  }
  
  actions.innerHTML = actionBtns;
  modal.classList.add('open');
  lucide.createIcons();
};

