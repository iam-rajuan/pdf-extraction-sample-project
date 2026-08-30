function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export function formatLabel(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

export function formatConfidence(value) {
  if (typeof value !== 'number') {
    return 'Unavailable';
  }

  return `${Math.round(value * 100)}%`;
}

export function getRecordEntries(record) {
  return Object.entries(record || {}).filter(([, value]) => value !== undefined);
}

function truncateText(text, maxLength = 220) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();

  if (!normalized) {
    return '';
  }

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

export function getTableColumns(rows) {
  const columns = new Set();

  rows.forEach((row) => {
    if (isPlainObject(row)) {
      Object.keys(row).forEach((key) => columns.add(key));
    }
  });

  return Array.from(columns);
}

export function isRenderableTable(rows) {
  return (
    Array.isArray(rows) &&
    rows.length > 0 &&
    rows.every((row) => isPlainObject(row)) &&
    getTableColumns(rows).length > 0
  );
}

export function getDisplaySummary(data) {
  const fieldEntries = getRecordEntries(data?.structuredData?.fields);
  const primaryFields = fieldEntries.slice(0, 4);
  const documentTitle = data?.structuredData?.documentTitle || data?.document?.name || '';
  const documentType = data?.document?.type || 'unknown';
  const providedSummary = String(data?.summary || '').trim();
  const rawText = String(data?.rawText || '').trim();

  const fieldSummary = primaryFields.length
    ? primaryFields
        .map(([key, value]) => `${formatLabel(key)}: ${renderPrimitiveValue(value)}`)
        .join(', ')
    : '';

  const sectionTitles = Array.isArray(data?.structuredData?.sections)
    ? data.structuredData.sections
        .map((section) => section?.title)
        .filter(Boolean)
        .slice(0, 3)
        .join(', ')
    : '';

  let derivedSummary = providedSummary;

  if (!derivedSummary) {
    const summaryParts = [];

    if (documentTitle) {
      summaryParts.push(documentTitle);
    }

    if (documentType && documentType !== 'unknown') {
      summaryParts.push(`Detected as a ${formatLabel(documentType).toLowerCase()}.`);
    }

    if (fieldSummary) {
      summaryParts.push(`Key extracted details: ${fieldSummary}.`);
    }

    if (sectionTitles) {
      summaryParts.push(`Structured sections include ${sectionTitles}.`);
    }

    if (!summaryParts.length && rawText) {
      summaryParts.push(truncateText(rawText));
    }

    derivedSummary = summaryParts.join(' ').trim();
  }

  if (!derivedSummary && rawText) {
    derivedSummary = truncateText(rawText);
  }

  if (!derivedSummary) {
    derivedSummary = 'No summary could be derived from the extraction response.';
  }

  return {
    title: documentTitle || 'Untitled extracted document',
    type: documentType,
    summaryText: derivedSummary,
    confidence: formatConfidence(data?.confidence),
    warningsCount: Array.isArray(data?.warnings) ? data.warnings.length : 0,
    missingFieldsCount: Array.isArray(data?.missingFields) ? data.missingFields.length : 0,
    primaryFields,
  };
}

export function getStructuredDetailGroups(data) {
  const structured = data?.structuredData || {};

  return Object.entries(structured).filter(
    ([key, value]) =>
      !['documentTitle', 'fields', 'sections'].includes(key) &&
      value !== undefined &&
      value !== null &&
      value !== '',
  );
}

export function renderPrimitiveValue(value) {
  if (value === null || value === undefined || value === '') {
    return 'Not available';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
}

export function isObjectValue(value) {
  return isPlainObject(value);
}
