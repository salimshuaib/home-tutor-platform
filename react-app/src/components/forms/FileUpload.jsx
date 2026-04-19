import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

export default function FileUpload({ label, accept, maxSizeMB = 5, onFileSelect, currentUrl, id }) {
  const [preview, setPreview] = useState(currentUrl || null);
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be under ${maxSizeMB}MB`);
      return;
    }

    // Validate type
    const allowed = accept ? accept.split(',').map(t => t.trim()) : [];
    if (allowed.length > 0) {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      const mimeMatch = allowed.some(a => file.type.match(a) || a === ext);
      if (!mimeMatch) {
        setError(`Accepted formats: ${accept}`);
        return;
      }
    }

    setFileName(file.name);

    // Preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    onFileSelect(file);
  };

  return (
    <div className="form-group" id={id}>
      {label && <label className="form-label">{label}</label>}
      <div
        className="file-upload-zone"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="file-upload-preview" />
        ) : (
          <div className="file-upload-placeholder">
            <Upload size={24} />
            <span>{fileName || 'Click to upload'}</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
      </div>
      {error && <span className="form-error-text">{error}</span>}
    </div>
  );
}
