const PDF_EXTENSION = '.pdf';
const PDF_MIME_TYPES = ['application/pdf', 'application/x-pdf'];

export function validatePdfFile(file) {
  if (!file) {
    return {
      isValid: false,
      message: 'Please select a PDF file before extraction.',
    };
  }

  const fileName = String(file.name || '').trim();
  const fileType = String(file.type || '').toLowerCase();
  const hasPdfExtension = fileName.toLowerCase().endsWith(PDF_EXTENSION);
  const hasPdfMimeType = PDF_MIME_TYPES.includes(fileType);

  if (!fileName) {
    return {
      isValid: false,
      message: 'The selected file is missing a filename. Please choose a PDF again.',
    };
  }

  if (Number(file.size) <= 0) {
    return {
      isValid: false,
      message: 'The selected PDF is empty. Please choose a non-empty file.',
    };
  }

  if (!hasPdfExtension && !hasPdfMimeType) {
    return {
      isValid: false,
      message: 'Only PDF files are supported. Please select a valid .pdf file.',
    };
  }

  return {
    isValid: true,
    message: '',
  };
}

export function formatFileSize(sizeInBytes) {
  const size = Number(sizeInBytes);

  if (!Number.isFinite(size) || size <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let value = size;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const digits = value >= 10 || unitIndex === 0 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[unitIndex]}`;
}

export function formatFileExtension(fileName = '') {
  const lastDotIndex = String(fileName).lastIndexOf('.');

  if (lastDotIndex < 0) {
    return 'Unknown';
  }

  return String(fileName).slice(lastDotIndex).toLowerCase();
}

export function formatFileTypeLabel(file) {
  const mimeType = String(file?.type || '').toLowerCase();

  if (mimeType === 'application/pdf' || mimeType === 'application/x-pdf') {
    return 'PDF';
  }

  return mimeType || 'Unknown';
}
