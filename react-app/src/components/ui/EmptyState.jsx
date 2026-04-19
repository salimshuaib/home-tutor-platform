export default function EmptyState({ icon = '📭', title, message }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      {title && <div className="empty-title">{title}</div>}
      {message && <div className="empty-msg">{message}</div>}
    </div>
  );
}
