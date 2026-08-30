import { useEffect, useMemo, useState } from 'react';
import {
  formatConfidence,
  formatLabel,
  getDisplaySummary,
  getRecordEntries,
  getStructuredDetailGroups,
  getTableColumns,
  isObjectValue,
  isRenderableTable,
  renderPrimitiveValue,
} from '../utils/displayHelpers';
import StatusBadge from './StatusBadge';

function RenderNode({ label, value, depth = 0 }) {
  if (value === null || value === undefined || value === '') {
    return (
      <div className="detail-node">
        {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
        <div className="muted-value">Not available</div>
      </div>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return (
        <div className="detail-node">
          {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
          <div className="muted-value">No items</div>
        </div>
      );
    }

    if (isRenderableTable(value)) {
      const columns = getTableColumns(value);

      return (
        <div className="detail-node">
          {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column}>{formatLabel(column)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {value.map((row, rowIndex) => (
                  <tr key={`${label || 'row'}-${rowIndex}`}>
                    {columns.map((column) => (
                      <td key={`${column}-${rowIndex}`}>{renderPrimitiveValue(row?.[column])}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const primitiveList = value.every((item) => !Array.isArray(item) && !isObjectValue(item));

    if (primitiveList) {
      return (
        <div className="detail-node">
          {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
          <ul className="value-list">
            {value.map((item, index) => (
              <li key={`${label || 'item'}-${index}`}>{renderPrimitiveValue(item)}</li>
            ))}
          </ul>
        </div>
      );
    }

    return (
      <div className="detail-node">
        {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
        <div className="detail-stack">
          {value.map((item, index) => (
            <div key={`${label || 'group'}-${index}`} className="detail-group nested-group">
              <RenderNode label={`${label || 'Item'} ${index + 1}`} value={item} depth={depth + 1} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isObjectValue(value)) {
    const entries = getRecordEntries(value);

    if (!entries.length) {
      return (
        <div className="detail-node">
          {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
          <div className="muted-value">No details</div>
        </div>
      );
    }

    return (
      <div className="detail-node">
        {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
        <div className={`detail-group ${depth > 0 ? 'nested-group' : ''}`}>
          {entries.map(([entryKey, entryValue]) => (
            <RenderNode
              key={entryKey}
              label={entryKey}
              value={entryValue}
              depth={depth + 1}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="detail-node">
      {label ? <span className="meta-label">{formatLabel(label)}</span> : null}
      <div className="field-value">{renderPrimitiveValue(value)}</div>
    </div>
  );
}

function SummaryPanel({ data }) {
  const summary = getDisplaySummary(data);

  return (
    <section className="content-section">
      <div className="content-section-header">
        <h4>Extracted content summary</h4>
      </div>
      <div className="summary-panel summary-grid">
        <div>
          <span className="meta-label">Title</span>
          <p>{summary.title}</p>
        </div>
        <div>
          <span className="meta-label">Detected type</span>
          <p>{formatLabel(summary.type)}</p>
        </div>
        <div>
          <span className="meta-label">Confidence</span>
          <p>{summary.confidence}</p>
        </div>
        <div>
          <span className="meta-label">Warnings</span>
          <p>{summary.warningsCount}</p>
        </div>
        <div>
          <span className="meta-label">Missing fields</span>
          <p>{summary.missingFieldsCount}</p>
        </div>
        <div>
          <span className="meta-label">Status</span>
          <p>{formatLabel(data.status)}</p>
        </div>
      </div>
      <div className="summary-panel">
        <span className="meta-label">Actual summary</span>
        <p>{summary.summaryText}</p>
      </div>
      {summary.primaryFields.length ? (
        <div className="field-grid compact-grid">
          {summary.primaryFields.map(([key, value]) => (
            <article key={key} className="field-card">
              <span className="meta-label">{formatLabel(key)}</span>
              <strong>{renderPrimitiveValue(value)}</strong>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function WarningQualityPanel({ data }) {
  const warnings = Array.isArray(data?.warnings) ? data.warnings : [];
  const missingFields = Array.isArray(data?.missingFields) ? data.missingFields : [];

  if (!warnings.length && !missingFields.length && !data?.message) {
    return null;
  }

  return (
    <section className="content-section">
      <div className="content-section-header">
        <h4>Warnings and quality</h4>
      </div>
      <div className="summary-panel quality-panel">
        <div>
          <span className="meta-label">Message</span>
          <p>{data.message || 'No issues reported.'}</p>
        </div>
        <div>
          <span className="meta-label">Confidence</span>
          <p>{formatConfidence(data.confidence)}</p>
        </div>
      </div>
      {warnings.length ? (
        <div className="chip-list">
          {warnings.map((warning, index) => (
            <span key={`${warning}-${index}`} className="info-chip warning-chip">
              {warning}
            </span>
          ))}
        </div>
      ) : null}
      {missingFields.length ? (
        <div className="chip-list">
          {missingFields.map((field, index) => (
            <span key={`${field}-${index}`} className="info-chip missing-chip">
              {formatLabel(field)}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function StructuredDetailsPanel({ data }) {
  const fieldEntries = getRecordEntries(data?.structuredData?.fields);
  const sections = Array.isArray(data?.structuredData?.sections) ? data.structuredData.sections : [];
  const extraGroups = getStructuredDetailGroups(data);

  if (!fieldEntries.length && !sections.length && !extraGroups.length) {
    return (
      <div className="empty-panel">
        Structured details are not available for this extraction result.
      </div>
    );
  }

  return (
    <>
      {fieldEntries.length ? (
        <section className="content-section">
          <div className="content-section-header">
            <h4>Extracted fields</h4>
          </div>
          <div className="field-grid">
            {fieldEntries.map(([key, value]) => (
              <article key={key} className="field-card">
                <span className="meta-label">{formatLabel(key)}</span>
                <div className="field-value">
                  <RenderNode value={value} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {sections.length ? (
        <section className="content-section">
          <div className="content-section-header">
            <h4>Structured sections</h4>
          </div>
          <div className="section-list">
            {sections.map((section, index) => (
              <article key={`${section.title}-${index}`} className="section-card">
                <div className="section-card-header">
                  <h5>{section.title}</h5>
                  <span className="section-type">{formatLabel(section.type)}</span>
                </div>
                <RenderNode value={section.content} />
                {Object.keys(section.fields || {}).length ? (
                  <RenderNode label="Fields" value={section.fields} />
                ) : null}
                {Array.isArray(section.rows) && section.rows.length ? (
                  <RenderNode label="Rows" value={section.rows} />
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {extraGroups.length ? (
        <section className="content-section">
          <div className="content-section-header">
            <h4>Additional structured details</h4>
          </div>
          <div className="detail-stack">
            {extraGroups.map(([key, value]) => (
              <RenderNode key={key} label={key} value={value} />
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

function OutputViewer({ data, isLoading, onReset, selectedFile }) {
  const [activeTab, setActiveTab] = useState('structured');
  const [copyState, setCopyState] = useState('idle');

  useEffect(() => {
    setActiveTab('structured');
    setCopyState('idle');
  }, [data, selectedFile]);

  const prettyJson = useMemo(() => {
    if (!data) {
      return '';
    }

    return JSON.stringify(data.raw, null, 2);
  }, [data]);

  const handleCopy = async () => {
    if (!prettyJson) {
      return;
    }

    try {
      await navigator.clipboard.writeText(prettyJson);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 1600);
    }
  };

  if (!data) {
    return (
      <div className="empty-state">
        <h3>{isLoading ? 'Preparing extraction results' : 'No extracted output yet'}</h3>
        <p>
          {isLoading
            ? 'Your PDF is being processed. Results will appear here automatically.'
            : 'Upload a PDF and run extraction to review dynamic summary, structured details, text, and raw JSON.'}
        </p>
      </div>
    );
  }

  return (
    <div className="output-viewer">
      <div className="output-header">
        <div>
          <span className="meta-label">Extraction result</span>
          <div className="title-row">
            <h3>{data.structuredData?.documentTitle || data.document?.name || 'Untitled PDF'}</h3>
            <StatusBadge status={data.status} />
          </div>
          <p className="output-summary">{data.summary || data.message}</p>
        </div>

        <div className="output-actions">
          <button type="button" className="ghost-button" onClick={handleCopy}>
            {copyState === 'copied'
              ? 'Copied'
              : copyState === 'failed'
                ? 'Copy failed'
                : 'Copy JSON'}
          </button>
          <button type="button" className="ghost-button" onClick={onReset}>
            Reset
          </button>
        </div>
      </div>

      <WarningQualityPanel data={data} />

      <div className="tab-row" role="tablist" aria-label="Extraction result tabs">
        {[
          ['structured', 'Structured'],
          ['text', 'Extracted Text'],
          ['json', 'Raw JSON'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`tab-button ${activeTab === value ? 'active' : ''}`}
            onClick={() => setActiveTab(value)}
            role="tab"
            aria-selected={activeTab === value}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'structured' ? (
        <>
          <SummaryPanel data={data} />
          <StructuredDetailsPanel data={data} />
          {Object.keys(data.meta || {}).length ? (
            <section className="content-section">
              <div className="content-section-header">
                <h4>Metadata</h4>
              </div>
              <RenderNode value={data.meta} />
            </section>
          ) : null}
        </>
      ) : null}

      {activeTab === 'text' ? (
        <section className="content-section">
          <div className="content-section-header">
            <h4>Extracted text</h4>
          </div>
          {data.rawText ? (
            <pre className="text-block">{data.rawText}</pre>
          ) : (
            <div className="empty-panel">No extracted text was returned.</div>
          )}
        </section>
      ) : null}

      {activeTab === 'json' ? (
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
