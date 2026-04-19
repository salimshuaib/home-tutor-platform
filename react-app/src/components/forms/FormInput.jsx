export default function FormInput({ label, id, type = 'text', value, onChange, placeholder, required, error, ...rest }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <input
        className={`form-input ${error ? 'form-input-error' : ''}`}
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        {...rest}
      />
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}
