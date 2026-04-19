export default function StatusBanner({ status, rejectionReason, onDismiss }) {
  if (!status || status === 'approved') return null;

  const config = {
    pending: {
      icon: '⏳',
      title: 'Profile Under Review',
      message: 'Your profile has been submitted and is currently being reviewed by our team. You will be notified once it is approved.',
      className: 'status-banner-pending'
    },
    rejected: {
      icon: '❌',
      title: 'Profile Needs Changes',
      message: rejectionReason || 'Your profile application was not approved. Please update your profile and resubmit.',
      className: 'status-banner-rejected'
    }
  };

  const c = config[status];
  if (!c) return null;

  return (
    <div className={`status-banner ${c.className}`}>
      <div className="status-banner-icon">{c.icon}</div>
      <div className="status-banner-content">
        <div className="status-banner-title">{c.title}</div>
        <div className="status-banner-msg">{c.message}</div>
      </div>
      {onDismiss && (
        <button className="status-banner-close" onClick={onDismiss}>✕</button>
      )}
    </div>
  );
}
