export default function FormTextarea({ label, id, value, onChange, placeholder, required, rows = 4, error }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <textarea
        className={`form-input ${error ? 'form-input-error' : ''}`}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}
