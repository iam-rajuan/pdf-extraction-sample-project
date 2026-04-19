const wait = (duration) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });

export async function extractPdfData(file) {
  if (!file) {
    throw new Error('No file provided for extraction.');
  }

  await wait(1500);

  const shouldFail = file.name.toLowerCase().includes('fail');

  if (shouldFail) {
    throw new Error('Extraction failed. Please try again with another PDF file.');
  }

  // Replace this mock response with a real API request later.
  // Example integration point:
  // const formData = new FormData();
  // formData.append('file', file);
  // const response = await fetch('/api/extract', { method: 'POST', body: formData });
  // if (!response.ok) throw new Error('Extraction request failed.');
  // return response.json();
  return {
    documentName: file.name,
    summary: 'This document contains extracted structured information.',
    fields: {
      invoiceNumber: 'INV-1001',
      date: '2026-04-19',
      clientName: 'John Doe',
      totalAmount: '$1200',
    },
    sections: [
      {
        title: 'Items',
        content: [
          { name: 'Service A', amount: '$700' },
          { name: 'Service B', amount: '$500' },
        ],
      },
    ],
  };
}
