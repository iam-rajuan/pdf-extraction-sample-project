const ALLOWED_STATUSES = new Set(['success', 'partial_success', 'failed']);

function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function ensureObject(value) {
  return isPlainObject(value) ? value : {};
}

function ensureString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function ensureArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item) => item !== undefined && item !== null);
}

function normalizeConfidence(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed > 1 && parsed <= 100) {
    return parsed / 100;
  }

  if (parsed < 0) {
    return 0;
  }

  if (parsed > 1) {
    return 1;
  }

  return parsed;
}

function normalizeFields(value) {
  if (isPlainObject(value)) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.reduce((accumulator, item, index) => {
      if (isPlainObject(item)) {
        const key = item.key || item.name || `field_${index + 1}`;
        accumulator[key] = item.value ?? item.text ?? item;
      }
      return accumulator;
    }, {});
  }

  return {};
}

function inferSectionType(section) {
  if (Array.isArray(section.rows) && section.rows.length > 0) {
    return 'table';
  }

  if (Array.isArray(section.content)) {
    return typeof section.content[0] === 'object' ? 'list' : 'text_list';
  }

  if (isPlainObject(section.content) || isPlainObject(section.fields)) {
    return 'object';
  }

  return ensureString(section.type, 'text');
}

function normalizeSection(section, index) {
  if (!isPlainObject(section)) {
    return null;
  }

  const rows = ensureArray(section.rows);
  const content = section.content ?? section.value ?? section.text ?? null;

  return {
    title: ensureString(section.title, `Section ${index + 1}`),
    type: inferSectionType(section),
    rows,
    content,
    fields: normalizeFields(section.fields),
    meta: ensureObject(section.meta),
  };
}

function normalizeStatus(rawStatus, success, warnings, missingFields, structuredData, rawText) {
  if (ALLOWED_STATUSES.has(rawStatus)) {
    return rawStatus;
  }

  if (success === false) {
    return 'failed';
  }

  const hasStructuredContent =
    Object.keys(structuredData.fields).length > 0 || structuredData.sections.length > 0;

  if ((warnings.length > 0 || missingFields.length > 0) && (hasStructuredContent || rawText)) {
    return 'partial_success';
  }

  return 'success';
}

export function normalizeExtractionResponse(response, file) {
  const payload = ensureObject(response);
  const documentPayload = ensureObject(payload.document);
  const structuredSource =
    payload.structuredData === null ? null : ensureObject(payload.structuredData);
  const legacyFields = payload.fields ?? payload.data?.fields;
  const legacySections = payload.sections ?? payload.data?.sections;

  const structuredData = {
    documentTitle: ensureString(
      structuredSource?.documentTitle,
      ensureString(payload.documentTitle),
    ),
    fields: normalizeFields(structuredSource?.fields ?? legacyFields),
    sections: ensureArray(structuredSource?.sections ?? legacySections)
      .map(normalizeSection)
      .filter(Boolean),
  };

  const warnings = ensureArray(payload.warnings).map((item) => String(item));
  const missingFields = ensureArray(payload.missingFields).map((item) => String(item));
  const rawText = ensureString(
    payload.rawText,
    ensureString(payload.text, ensureString(payload.extractedText)),
  );
  const success =
    typeof payload.success === 'boolean' ? payload.success : payload.status !== 'failed';
  const status = normalizeStatus(
    payload.status,
    success,
    warnings,
    missingFields,
    structuredData,
    rawText,
  );
  const message = ensureString(
    payload.message,
    status === 'failed'
      ? 'Extraction failed for this document.'
      : 'Extraction completed successfully.',
  );
  const normalizedMeta = ensureObject(payload.meta ?? payload.metadata);

  return {
    success: success && status !== 'failed',
    status,
    message,
    summary: ensureString(payload.summary, message),
    confidence: normalizeConfidence(payload.confidence),
    document: {
      name: ensureString(documentPayload.name, ensureString(payload.documentName, file?.name || '')),
      pages:
        Number.isFinite(Number(documentPayload.pages)) && Number(documentPayload.pages) > 0
          ? Number(documentPayload.pages)
          : null,
      type: ensureString(documentPayload.type),
      sourceType: ensureString(documentPayload.sourceType),
      size: Number.isFinite(Number(file?.size)) ? Number(file.size) : null,
    },
    structuredData,
    rawText,
    warnings,
    missingFields,
    meta: normalizedMeta,
    uploadedFile: {
      name: ensureString(file?.name),
      size: Number.isFinite(Number(file?.size)) ? Number(file.size) : null,
      type: ensureString(file?.type),
    },
    processedAt: ensureString(normalizedMeta.processedAt),
    raw: payload,
  };
}
