// Main library entry point
export { generateFountain } from './fountain-generator.js';
export { readPDF } from './pdf-reader.js';
export * from '../types/fountain.js';
export * from '../types/pdf.js';

export const version = '0.1.0';

// Placeholder for main converter - will be implemented in Task 2.5
export function convertPDFToFountain(_pdfPath: string): Promise<unknown> {
  throw new Error('Not implemented yet');
}
