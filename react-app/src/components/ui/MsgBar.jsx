export default function MsgBar({ type = 'error', message, visible = false }) {
  if (!visible || !message) return null;
  return (
    <div className={`msg-box msg-${type}`} style={{ display: 'block' }}>
      {message}
    </div>
  );
}
