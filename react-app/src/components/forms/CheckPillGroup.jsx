export default function CheckPillGroup({ label, options, selected = [], onChange, id }) {
  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(s => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="form-group" id={id}>
      {label && <label className="form-label">{label}</label>}
      <div className="pill-group">
        {options.map(opt => (
          <button
            key={opt}
            type="button"
            className={`pill ${selected.includes(opt) ? 'pill-active' : ''}`}
            onClick={() => toggleOption(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
