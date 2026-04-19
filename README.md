# PDF Data Extraction MVP

A minimal React + Vite frontend for validating a PDF data extraction workflow. Users can upload a PDF, trigger a mock extraction request, and review structured output in a clean interface.

## Tech Stack

- React
- Vite
- JavaScript
- Basic CSS

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Build

```bash
npm run build
```

## What This MVP Includes

- PDF-only upload validation
- Drag and drop upload area
- Selected file display
- Loading, success, and error states
- Structured output viewer for fields and sections
- Optional raw JSON view and copy action
- Mock async extraction service

## Where To Connect A Real Backend

Update [src/services/pdfService.js](./src/services/pdfService.js) and replace the mock `extractPdfData` implementation with a real API request.

Suggested integration point:

```js
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/extract', {
  method: 'POST',
  body: formData,
});

if (!response.ok) {
  throw new Error('Extraction request failed.');
}

return response.json();
```

## Notes

- The mock service simulates network latency with a short delay.
- If the uploaded filename contains `fail`, the mock service throws an error to help test the error state.
