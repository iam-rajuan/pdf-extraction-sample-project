import { formatFileExtension, formatFileSize, formatFileTypeLabel } from '../utils/fileValidation';

function FileInfoPanel({ file, extractionResult, isLoading }) {
  const status = isLoading
    ? 'Processing'
    : extractionResult?.status
      ? extractionResult.status.replace(/_/g, ' ')
      : file
        ? 'Ready'
        : 'Waiting for upload';

  const details = [
    ['File name', file?.name || 'No file selected'],
    ['Extension', file ? formatFileExtension(file.name) : 'Not available'],
    ['File type', file ? formatFileTypeLabel(file) : 'Not available'],
    ['File size', file ? formatFileSize(file.size) : 'Not available'],
    ['Upload status', status],
    ['Processed time', extractionResult?.meta?.processedAt || 'Not available'],
    ['Page count', extractionResult?.document?.pages ?? 'Not available'],
    ['Detected document type', extractionResult?.document?.type || 'Unknown'],
    ['Source type', extractionResult?.document?.sourceType || 'Unknown'],
  ];

  return (
    <section className="content-section">
      <div className="content-section-header">
        <h4>Uploaded PDF details</h4>
      </div>
      <div className="field-grid">
        {details.map(([label, value]) => (
          <article key={label} className="field-card">
            <span className="meta-label">{label}</span>
            <strong>{String(value)}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FileInfoPanel;
