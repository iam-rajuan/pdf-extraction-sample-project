import { useState } from 'react';
import ErrorMessage from './components/ErrorMessage';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import OutputViewer from './components/OutputViewer';
import { extractPdfData } from './services/pdfService';

const ACCEPTED_FILE_TYPE = 'application/pdf';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const resetFeedback = () => {
    setError('');
    setIsSuccess(false);
  };

  const handleFileChange = (file) => {
    resetFeedback();
    setResult(null);

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== ACCEPTED_FILE_TYPE && !file.name.toLowerCase().endsWith('.pdf')) {
      setSelectedFile(null);
      setError('Only PDF files are supported. Please select a valid .pdf file.');
      return;
    }

    setSelectedFile(file);
  };

  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file before extraction.');
      return;
    }

    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      const response = await extractPdfData(selectedFile);
      setResult(response);
      setIsSuccess(true);
    } catch (serviceError) {
      setResult(null);
      setError(serviceError.message || 'Unable to extract data from the document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError('');
    setIsSuccess(false);
    setIsLoading(false);
  };

  return (
    <main className="app-shell">
      <section className="hero card">
        <span className="eyebrow">PDF Extraction MVP</span>
        <h1>Extract structured data from PDF files</h1>
        <p className="hero-copy">
          Upload a PDF, trigger a mock extraction request, and review the structured
          response in a clear output panel. This frontend is intentionally minimal and
          ready to connect to a real backend later.
        </p>
      </section>

      <section className="workspace">
        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Upload document</h2>
              <p>Select a PDF or drag and drop it into the upload area.</p>
            </div>
            {selectedFile ? (
              <button type="button" className="ghost-button" onClick={handleReset}>
                Clear
              </button>
            ) : null}
          </div>

          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileChange}
            disabled={isLoading}
          />

          <div className="actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleExtract}
              disabled={!selectedFile || isLoading}
            >
              {isLoading ? 'Extracting...' : 'Extract Data'}
            </button>
          </div>

          {isLoading ? <Loader message="Processing document and extracting structured data..." /> : null}
          {error ? <ErrorMessage message={error} /> : null}
          {isSuccess && !isLoading ? (
            <div className="status-banner success-banner">
              Extraction completed successfully.
            </div>
          ) : null}
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Structured output</h2>
              <p>Review the extracted fields, sections, and raw JSON response.</p>
            </div>
          </div>

          <OutputViewer data={result} />
        </div>
      </section>
    </main>
  );
}

export default App;
