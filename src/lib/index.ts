/**
 * Scripter: PDF to Fountain Converter Library
 *
 * Main entry point for the scripter library providing both programmatic API
 * and type definitions for converting PDF screenplays to Fountain format.
 *
 * @example
 * ```typescript
 * import { convertPDFToFountain } from 'scripter';
 *
 * const result = await convertPDFToFountain('screenplay.pdf');
 * if (result.success) {
 *   console.log('Conversion successful');
 * }
 * ```
 */

// Main conversion API
export { convertPDFToFountain } from './converter.js';

// Library components
export { generateFountain } from './fountain-generator.js';
export { readPDF } from './pdf-reader.js';
export { parseScreenplay } from './screenplay-parser.js';

// Type definitions
export * from '../types/fountain.js';
export * from '../types/pdf.js';

