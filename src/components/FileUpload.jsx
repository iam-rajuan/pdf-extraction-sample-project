import { useRef, useState } from 'react';
import { formatFileSize } from '../utils/fileValidation';

function FileUpload({ selectedFile, onFileSelect, disabled, errorMessage = '' }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateFromFiles = (files) => {
    const [file] = files || [];
    onFileSelect(file || null);
  };

  const handleInputChange = (event) => {
    updateFromFiles(event.target.files);
    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (disabled) {
      return;
    }

    updateFromFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const openFilePicker = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  return (
    <div className="upload-block">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handleInputChange}
        className="hidden-input"
        disabled={disabled}
      />

      <button
        type="button"
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onClick={openFilePicker}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        disabled={disabled}
      >
        <span className="upload-icon" aria-hidden="true">
          PDF
        </span>
        <span className="upload-title">Drop your PDF here or click to browse</span>
        <span className="upload-subtitle">Only .pdf files are accepted</span>
      </button>

      <div className="file-meta">
        <div className="meta-row">
          <span className="meta-label">Selected file</span>
          <strong>{selectedFile ? selectedFile.name : 'No file selected'}</strong>
        </div>
        <div className="meta-row">
          <span className="meta-label">File size</span>
          <span>{selectedFile ? formatFileSize(selectedFile.size) : 'Not available'}</span>
        </div>
        {errorMessage ? <div className="inline-error">{errorMessage}</div> : null}
      </div>
    </div>
  );
}

export default FileUpload;
