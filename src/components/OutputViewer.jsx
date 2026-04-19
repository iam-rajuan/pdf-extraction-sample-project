import { useMemo, useState } from 'react';

function OutputViewer({ data }) {
  const [showRawJson, setShowRawJson] = useState(false);

  const prettyJson = useMemo(() => {
    if (!data) {
      return '';
    }

    return JSON.stringify(data, null, 2);
  }, [data]);

  const handleCopy = async () => {
    if (!prettyJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(prettyJson);
    } catch {
      // Clipboard access can fail in some browsers or local contexts.
    }
  };

  if (!data) {
    return (
      <div className="empty-state">
        <h3>No extracted output yet</h3>
        <p>Upload a PDF and run extraction to see structured results here.</p>
      </div>
    );
  }

  const fieldEntries = Object.entries(data.fields || {});
  const sections = data.sections || [];

  return (
    <div className="output-viewer">
      <div className="output-header">
        <div>
          <span className="meta-label">Document</span>
          <h3>{data.documentName}</h3>
        </div>
        <div className="output-actions">
          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowRawJson((current) => !current)}
          >
            {showRawJson ? 'Hide JSON' : 'View JSON'}
          </button>
          <button type="button" className="ghost-button" onClick={handleCopy}>
            Copy JSON
          </button>
        </div>
      </div>

      <div className="summary-panel">
        <span className="meta-label">Summary</span>
        <p>{data.summary}</p>
      </div>

      {fieldEntries.length ? (
        <section className="content-section">
          <div className="content-section-header">
            <h4>Extracted fields</h4>
          </div>
          <div className="field-grid">
            {fieldEntries.map(([key, value]) => (
              <article key={key} className="field-card">
                <span className="meta-label">{key}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {sections.length ? (
        <section className="content-section">
          <div className="content-section-header">
            <h4>Sections</h4>
          </div>
          <div className="section-list">
            {sections.map((section) => (
              <article key={section.title} className="section-card">
                <h5>{section.title}</h5>
                {Array.isArray(section.content) ? (
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(section.content[0] || {}).map((column) => (
                            <th key={column}>{column}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.content.map((row, index) => (
                          <tr key={`${section.title}-${index}`}>
                            {Object.values(row).map((cell, cellIndex) => (
                              <td key={`${section.title}-${index}-${cellIndex}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>{section.content}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {showRawJson ? (
        <section className="content-section">
          <div className="content-section-header">
            <h4>Raw JSON</h4>
          </div>
          <pre className="json-block">{prettyJson}</pre>
        </section>
      ) : null}
    </div>
  );
}

export default OutputViewer;
