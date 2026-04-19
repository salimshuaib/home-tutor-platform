/**
 * Error Handling Utility — Delhi Private Tutors
 * Provides standardized error handling for Firebase operations and UI rendering.
 */

export function handleError(error, context = '') {
  console.error(`[Error] ${context}:`, error);

  const errorString = (typeof error === 'string') ? error : (error.message || 'Unknown error occurred.');

  // Check for common Firebase errors
  if (errorString.includes('permission-denied')) {
    return 'Permission denied. Please check your access rights.';
  } else if (errorString.includes('offline') || errorString.includes('network')) {
    return 'Network error. Please check your connection and try again.';
  } else if (errorString.includes('quota')) {
    return 'Quota exceeded. Please try again later.';
  }
  
  return errorString;
}

export function createInlineErrorUI(containerId, message, retryCallback = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const errorBox = document.createElement('div');
  errorBox.className = 'inline-error-ui';
  errorBox.style.cssText = 'padding: 1.5rem; text-align: center; background: #FEF2F2; border: 1px solid rgba(198, 40, 40, 0.15); border-radius: 12px; margin: 1rem 0;';

  const icon = `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 0.5rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

  let htmlString = `${icon}
    <div style="font-weight: 600; color: #C62828; margin-bottom: 0.25rem;">Something went wrong</div>
    <div style="font-size: 0.85rem; color: #555; margin-bottom: 1rem;">${message}</div>`;
  
  errorBox.innerHTML = htmlString;
  
  if (retryCallback) {
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Try Again';
    retryBtn.style.cssText = 'background: #C62828; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 0.8rem;';
    retryBtn.addEventListener('click', () => {
      container.innerHTML = '';
      retryCallback();
    });
    errorBox.appendChild(retryBtn);
  }

  container.innerHTML = ''; // clear current content
  container.appendChild(errorBox);
  return errorBox;
}
