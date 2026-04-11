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
  // Loading timeout
  const loaderTimeout = setTimeout(() => {
    const errEl = $('loader-error');
    if (errEl) errEl.style.display = 'block';
  }, 12000);

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.replace('../login.html');
      return;
    }

    try {
      // Check admins collection
      const adminSnap = await getDoc(doc(db, 'admins', user.uid));
      if (!adminSnap.exists() || adminSnap.data().role !== 'admin') {
        // Not an admin — sign out and redirect
        await signOut(auth);
        window.location.replace('../login.html');
        return;
      }

      currentAdmin = user;
      const adminData = adminSnap.data();

      // Set admin info in nav
      const name = adminData.name || adminData.email || 'Admin';
      const initials = name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
      $('nav-admin-name').textContent = name.split(' ')[0];
      $('nav-admin-avatar').textContent = initials;

      // Start real-time listener
      startTutorListener();

      // Hide loader
      clearTimeout(loaderTimeout);
      $('loader').style.opacity = '0';
      setTimeout(() => $('loader').style.display = 'none', 400);

    } catch (e) {
      console.error('Admin auth check failed:', e);
      await signOut(auth);
      window.location.replace('../login.html');
    }
  });

  // Logout
  $('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => window.location.href = '../login.html');
  });
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
    ? `<img src="${safeText(t.profileImageUrl)}" alt="Profile" class="tutor-card-avatar-img">`
    : `<span>${initials}</span>`;
  const docLink = t.documentUrl
    ? `<a href="${safeText(t.documentUrl)}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i data-lucide="file-text"></i> View Document</a>`
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
    <div class="tutor-card-actions">
      <button class="btn btn-approve" onclick="window.adminActions.approve('${t.id}', this)">
        <i data-lucide="check"></i> Approve
      </button>
      <button class="btn btn-reject" onclick="window.adminActions.openRejectModal('${t.id}', '${safeText(name)}')">
        <i data-lucide="x"></i> Reject
      </button>
    </div>
  </div>`;
}

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
