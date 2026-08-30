import { useEffect, useRef, useState } from 'react';
import AppErrorBoundary from './components/AppErrorBoundary';
import ErrorMessage from './components/ErrorMessage';
import FileUpload from './components/FileUpload';
import Loader from './components/Loader';
import OutputViewer from './components/OutputViewer';
import { extractPdfData } from './services/pdfService';
import { validatePdfFile } from './utils/fileValidation';

const INITIAL_REQUEST_STATE = {
  phase: 'idle',
  result: null,
  error: '',
};

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState('');
  const [requestState, setRequestState] = useState(INITIAL_REQUEST_STATE);
  const requestIdRef = useRef(0);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleFileChange = (file) => {
    setRequestState(INITIAL_REQUEST_STATE);

    if (!file) {
      setSelectedFile(null);
      setValidationError('');
      return;
    }

    const validation = validatePdfFile(file);

    if (!validation.isValid) {
      setSelectedFile(null);
      setValidationError(validation.message);
      return;
    }

    setSelectedFile(file);
    setValidationError('');
  };

  const handleExtract = async () => {
    const validation = validatePdfFile(selectedFile);

    if (!validation.isValid) {
      setValidationError(validation.message);
      return;
    }

    const nextRequestId = requestIdRef.current + 1;
    requestIdRef.current = nextRequestId;

    setValidationError('');
    setRequestState({
      phase: 'loading',
      result: null,
      error: '',
    });

    try {
      const result = await extractPdfData(selectedFile);

      if (!isMountedRef.current || requestIdRef.current !== nextRequestId) {
        return;
      }

      setRequestState({
        phase: 'resolved',
        result,
        error: '',
      });
    } catch (serviceError) {
      if (!isMountedRef.current || requestIdRef.current !== nextRequestId) {
        return;
      }

      setRequestState({
        phase: 'error',
        result: null,
        error: serviceError?.message || 'Unable to extract data from the document.',
      });
    }
  };

  const handleReset = () => {
    requestIdRef.current += 1;
    setSelectedFile(null);
    setValidationError('');
    setRequestState(INITIAL_REQUEST_STATE);
  };

  const isLoading = requestState.phase === 'loading';
  const hasValidFile = Boolean(selectedFile) && !validationError;

  return (
    <main className="app-shell">
      <section className="hero card">
        <span className="eyebrow">PDF Extraction Frontend</span>
        <h1>Upload a PDF and review resilient extraction results</h1>
        <p className="hero-copy">
          This frontend validates PDFs, handles real-world extraction states, and
          renders structured and unstructured output safely even when the API response
          varies.
        </p>
      </section>

      <section className="workspace">
        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Upload document</h2>
              <p>Select a PDF or drag and drop it into the upload area.</p>
            </div>
            {(selectedFile || requestState.result) ? (
              <button type="button" className="ghost-button" onClick={handleReset}>
                Reset
              </button>
            ) : null}
          </div>

          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileChange}
            disabled={isLoading}
            errorMessage={validationError}
          />

          <div className="actions">
            <button
              type="button"
              className="primary-button"
              onClick={handleExtract}
              disabled={!hasValidFile || isLoading}
            >
              {isLoading ? 'Extracting...' : 'Extract Data'}
            </button>
          </div>

          {isLoading ? (
            <Loader message="Uploading the PDF and preparing extraction results..." />
          ) : null}
          {validationError ? <ErrorMessage message={validationError} /> : null}
          {requestState.error ? <ErrorMessage message={requestState.error} /> : null}
        </div>

        <div className="card">
          <div className="section-heading">
            <div>
              <h2>Extraction results</h2>
              <p>Review structured output, extracted text, warnings, and raw JSON.</p>
            </div>
          </div>

          <AppErrorBoundary>
            <OutputViewer
              data={requestState.result}
              isLoading={isLoading}
              onReset={handleReset}
              selectedFile={selectedFile}
            />
          </AppErrorBoundary>
        </div>
      </section>
    </main>
  );
}

export default App;
