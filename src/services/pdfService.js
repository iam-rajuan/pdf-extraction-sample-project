import { validatePdfFile } from '../utils/fileValidation';
import { normalizeExtractionResponse } from '../utils/normalizeExtractionResponse';

const REQUEST_TIMEOUT_MS = 15000;

const wait = (duration) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

function buildMockResponse(file) {
  const lowerName = file.name.toLowerCase();

  if (lowerName.includes('contract')) {
    return {
      success: true,
      status: 'success',
      document: {
        name: file.name,
        pages: 8,
        type: 'contract',
        sourceType: 'text_pdf',
      },
      summary: 'This document is a service agreement between two parties.',
      confidence: 0.91,
      structuredData: {
        documentTitle: 'Service Agreement',
        fields: {
          partyA: 'ABC Ltd',
          partyB: 'John Doe',
          effectiveDate: '2026-04-20',
        },
        sections: [
          {
            title: 'Key Terms',
            content: ['Term: 12 months', 'Renewal: Automatic'],
          },
        ],
      },
      warnings: [],
      missingFields: [],
      rawText: 'Service Agreement between ABC Ltd and John Doe.',
      meta: {
        parser: 'mock-parser-v2',
        processedAt: new Date().toISOString(),
      },
    };
  }

  if (lowerName.includes('receipt')) {
    return {
      success: true,
      status: 'partial_success',
      document: {
        name: file.name,
        pages: 1,
        type: 'receipt',
        sourceType: 'scanned_pdf',
      },
      summary: 'Receipt extracted with some low-confidence fields.',
      confidence: 0.67,
      structuredData: {
        fields: {
          merchant: 'Store Name',
          date: '2026-04-19',
          amount: '$42.00',
        },
      },
      warnings: ['Low OCR confidence'],
      missingFields: ['taxId'],
      rawText: 'Store Name receipt total $42.00',
      meta: {
        ocrUsed: true,
        parser: 'mock-parser-v2',
        processedAt: new Date().toISOString(),
      },
    };
  }

  if (lowerName.includes('report')) {
    return {
      success: true,
      status: 'success',
      document: {
        name: file.name,
        pages: 12,
        type: 'report',
        sourceType: 'text_pdf',
      },
      summary: 'Quarterly report with metrics, sections, and appendix data.',
      confidence: 0.89,
      structuredData: {
        documentTitle: 'Quarterly Performance Report',
        fields: {
          quarter: 'Q1 2026',
          author: 'Operations Team',
        },
        overview: {
          highlights: ['Revenue growth 12%', 'Churn improved 3%'],
          metrics: {
            revenue: '$250,000',
            customers: 320,
          },
        },
        sections: [
          {
            title: 'Metrics Table',
            rows: [
              { metric: 'Revenue', value: '$250,000' },
              { metric: 'Customers', value: '320' },
            ],
          },
        ],
      },
      warnings: [],
      missingFields: [],
      rawText: 'Quarterly report text content.',
      meta: {
        parser: 'mock-parser-v2',
        processedAt: new Date().toISOString(),
      },
    };
  }

  if (lowerName.includes('fail')) {
    return {
      success: false,
      status: 'failed',
      message: 'Could not extract usable text from this PDF.',
      rawText: '',
      warnings: ['This file may require OCR'],
      missingFields: [],
      meta: {
        parser: 'mock-parser-v2',
        processedAt: new Date().toISOString(),
      },
    };
  }

  if (lowerName.includes('text-only')) {
    return {
      success: true,
      status: 'partial_success',
      summary: 'Text was extracted, but the parser could not determine structured fields.',
      confidence: 0.52,
      document: {
        name: file.name,
        pages: 2,
        type: 'unknown',
        sourceType: 'scanned_pdf',
      },
      structuredData: null,
      rawText:
        'This is a text-only extraction sample. Structured values were not confidently detected.',
      warnings: ['Structured extraction was limited for this document.'],
      missingFields: ['documentTitle', 'invoiceNumber', 'date'],
      meta: {
        ocrUsed: true,
        parser: 'mock-parser-v2',
        processedAt: new Date().toISOString(),
      },
    };
  }

  if (lowerName.includes('partial')) {
    return {
      success: true,
      document: {
        name: file.name,
        pages: 4,
        type: 'invoice',
        sourceType: 'text_pdf',
      },
      status: 'partial_success',
      confidence: 0.84,
      summary: 'Most key fields were extracted successfully.',
      structuredData: {
        documentTitle: 'Invoice April 2026',
        fields: {
          invoiceNumber: 'INV-1001',
          date: '2026-04-19',
          vendor: 'ABC Services Ltd',
          customer: 'John Doe',
          totalAmount: '$1200',
        },
        sections: [
          {
            title: 'Items',
            type: 'table',
            rows: [
              { description: 'Service A', amount: '$700' },
              { description: 'Service B', amount: '$500' },
            ],
          },
        ],
      },
      rawText:
        'Invoice April 2026. Vendor: ABC Services Ltd. Customer: John Doe. Total: $1200.',
      warnings: ['Low confidence on vendor address'],
      missingFields: ['taxNumber'],
      meta: {
        ocrUsed: false,
        parser: 'mock-parser-v2',
        processedAt: new Date().toISOString(),
      },
    };
  }

  return {
    success: true,
    status: 'success',
    summary: 'Document extracted successfully with dynamic structured content.',
    confidence: 0.93,
    document: {
      name: file.name,
      pages: 3,
      type: lowerName.includes('form') ? 'form' : 'unknown',
      sourceType: 'text_pdf',
    },
    structuredData: {
      documentTitle: file.name.replace(/\.pdf$/i, ''),
      fields: {
        fileName: file.name,
        detectedCategory: lowerName.includes('form') ? 'Form' : 'Generic document',
        extractedAt: new Date().toISOString().slice(0, 10),
      },
      sections: [
        {
          title: 'Detected Content',
          content: ['This is a generic extraction response.', 'Structured data may vary by PDF.'],
        },
        {
          title: 'Attributes',
          fields: {
            hasStructuredFields: true,
            responseMode: 'mock',
          },
        },
      ],
      attributes: {
        uploadName: file.name,
        note: 'Connect VITE_EXTRACT_API_URL to replace mock extraction with your backend.',
      },
    },
    rawText:
      `Extracted text preview for ${file.name}.`,
    warnings: [],
    missingFields: [],
    meta: {
      ocrUsed: false,
      parser: 'mock-parser-v2',
      processedAt: new Date().toISOString(),
    },
  };
}

async function requestExtractionFromApi(file) {
  const apiUrl = import.meta.env.VITE_EXTRACT_API_URL;

  if (!apiUrl) {
    await wait(1200);
    return buildMockResponse(file);
  }

  const formData = new FormData();
  formData.append('file', file);

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort(new Error('Extraction request timed out.'));
  }, REQUEST_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (error) {
    window.clearTimeout(timeoutId);

    if (error?.name === 'AbortError') {
      throw new Error(
        `The extraction API timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. Check the backend and try again.`,
      );
    }

    throw new Error(
      error?.message
        ? `The extraction API request failed: ${error.message}`
        : 'The extraction API request failed. Check the configured API URL and backend availability.',
    );
  }

  window.clearTimeout(timeoutId);

  let payload = {};

  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Extraction request failed.');
  }

  return payload;
}

export async function extractPdfData(file) {
  const validation = validatePdfFile(file);

  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const response = await requestExtractionFromApi(file);
  return normalizeExtractionResponse(response, file);
}
