export default function FormSelect({ label, id, value, onChange, options, placeholder, required, error }) {
  return (
    <div className="form-group">
      {label && <label className="form-label" htmlFor={id}>{label}</label>}
      <select
        className={`form-input ${error ? 'form-input-error' : ''}`}
        id={id}
        value={value}
        onChange={onChange}
        required={required}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
            {typeof opt === 'string' ? opt : opt.label}
          </option>
        ))}
      </select>
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}
