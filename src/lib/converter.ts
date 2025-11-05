import type { ConversionOptions, ConversionResult } from '../types/fountain.js';
import { generateFountain } from './fountain-generator.js';
import { readPDF } from './pdf-reader.js';
import { parseScreenplay } from './screenplay-parser.js';

/**
 * Converts a PDF screenplay file to Fountain format.
 *
 * This is the main entry point for the conversion process. It orchestrates three steps:
 * 1. Read and parse the PDF file to extract text content
 * 2. Analyze the extracted text to identify screenplay elements
 * 3. Generate properly formatted Fountain markup
 *
 * @param pdfPath - Absolute or relative path to the PDF file
 * @param options - Conversion configuration options for controlling parsing behavior
 * @returns A promise that resolves to a ConversionResult with the converted document
 *
 * @throws {Error} May be caught internally and returned in the result's errors array
 *
 * @example
 * ```typescript
 * const result = await convertPDFToFountain('screenplay.pdf', {
 *   detectSceneHeadings: true,
 *   strictMode: false,
 * });
 *
 * if (result.success) {
 *   console.log('Conversion successful!');
 *   console.log(result.document?.elements.length + ' elements parsed');
 *
 *   if (result.warnings?.length) {
 *     console.warn('Warnings:', result.warnings);
 *   }
 * } else {
 *   console.error('Conversion failed:', result.errors);
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Convert with strict parsing
 * const result = await convertPDFToFountain('screenplay.pdf', {
 *   detectSceneHeadings: true,
 *   detectCharacterNames: true,
 *   strictMode: true,
 *   includeMetadata: true,
 * });
 * ```
 */
export async function convertPDFToFountain(
  pdfPath: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  const warnings: string[] = [];

  try {
    // Step 1: Read PDF file
    const pdfContent = await readPDF(pdfPath);

    // Validate that we extracted some content
    if (!pdfContent.text || pdfContent.text.trim().length === 0) {
      return {
        success: false,
        errors: ['PDF file appears to be empty or contains no readable text'],
      };
    }

    if (pdfContent.pages.length === 0) {
      return {
        success: false,
        errors: ['PDF file has no pages'],
      };
    }

    // Step 2: Parse screenplay elements
    const document = parseScreenplay(pdfContent, options);

    // Validate that we parsed some elements
    if (document.elements.length === 0) {
      warnings.push('No screenplay elements were detected in the PDF');
    }

    // Count elements by type for metadata
    const elementCounts = countElementsByType(document.elements);

    // Add parsing statistics to warnings if helpful
    if (elementCounts.scene_heading === 0 && (options.detectSceneHeadings ?? true)) {
      warnings.push('No scene headings detected. The PDF may not be a screenplay.');
    }

    if (elementCounts.character === 0 && (options.detectCharacterNames ?? true)) {
      warnings.push('No character names detected. The PDF may not be a screenplay.');
    }

    if (elementCounts.dialogue === 0) {
      warnings.push('No dialogue detected. This may be an action-heavy screenplay or not a screenplay at all.');
    }

    // Step 3: Generate Fountain format (validates that parsing was successful)
    generateFountain(document);

    // Return successful result
    const result: ConversionResult = {
      success: true,
      document,
    };

    if (warnings.length > 0) {
      result.warnings = warnings;
    }

    return result;
  } catch (error) {
    // Handle errors gracefully
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error during conversion';

    const result: ConversionResult = {
      success: false,
      errors: [errorMessage],
    };

    return result;
  }
}

/**
 * Counts screenplay elements by type for statistics.
 *
 * @param elements - Array of screenplay elements
 * @returns Object with counts for each element type
 */
function countElementsByType(
  elements: Array<{ type: string }>
): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const element of elements) {
    counts[element.type] = (counts[element.type] ?? 0) + 1;
  }

  return counts;
}
