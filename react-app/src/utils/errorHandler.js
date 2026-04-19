/**
 * Centralized error handler for the platform.
 * Maps Firebase error codes to user-friendly messages.
 */

const FIREBASE_ERROR_MAP = {
  'auth/email-already-in-use': 'This email address is already registered.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/too-many-requests': 'Too many login attempts. Please wait a few minutes.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
  'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
  'permission-denied': 'You do not have permission to perform this action.',
  'unavailable': 'Service temporarily unavailable. Please try again later.',
  'not-found': 'The requested data was not found.',
};

export function handleError(error, context = '') {
  const code = error?.code || '';
  const friendlyMsg = FIREBASE_ERROR_MAP[code] || error?.message || 'An unexpected error occurred.';

  console.error(`[${context}]`, {
    code,
    message: error?.message,
    friendly: friendlyMsg,
    timestamp: new Date().toISOString()
  });

  return friendlyMsg;
}

export function createInlineErrorUI(containerId, message, retryCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:32px 20px;color:#8A7360;">
      <div style="font-size:2rem;margin-bottom:12px;">⚠️</div>
      <p style="margin-bottom:16px;font-size:0.9rem;">${message}</p>
      ${retryCallback ? '<button class="retry-btn" style="padding:8px 20px;background:var(--saffron,#E8751A);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Retry</button>' : ''}
    </div>
  `;

  if (retryCallback) {
    const btn = container.querySelector('.retry-btn');
    if (btn) btn.onclick = retryCallback;
  }
}
