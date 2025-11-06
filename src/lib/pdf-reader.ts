import fs from 'fs/promises';
import { PDFParse } from 'pdf-parse';
import type { PDFContent, PDFPage } from '../types/pdf.js';

/**
 * Reads and parses a PDF file, extracting text content while preserving structure.
 *
 * @param filePath - Absolute or relative path to the PDF file
 * @returns A promise that resolves to structured PDF content
 *
 * @throws {Error} If the file cannot be read or is not a valid PDF
 * @throws {Error} If the PDF is password-protected
 * @throws {Error} If the file path does not exist
 *
 * @example
 * ```typescript
 * const content = await readPDF('screenplay.pdf');
 * console.log(`Extracted ${content.pages.length} pages`);
 * console.log(content.text);
 * ```
 */
export async function readPDF(filePath: string): Promise<PDFContent> {
  let parser: PDFParse | undefined;

  try {
    // Read the PDF file as a buffer
    const dataBuffer = await fs.readFile(filePath);

    // Create parser with the buffer
    parser = new PDFParse({ data: dataBuffer });

    // Get text content
    const textResult = await parser.getText();

    // Get document info
    const infoResult = await parser.getInfo();

    // Extract metadata
    const metadata: Record<string, unknown> = {};
    if (infoResult.info) {
      const info = infoResult.info;
      if (info.Title) metadata.title = info.Title;
      if (info.Author) metadata.author = info.Author;
      if (info.Subject) metadata.subject = info.Subject;
      if (info.Creator) metadata.creator = info.Creator;
      if (info.Producer) metadata.producer = info.Producer;
      if (info.CreationDate) metadata.creationDate = info.CreationDate;
      if (info.ModDate) metadata.modificationDate = info.ModDate;
    }

    // Structure the text into pages
    const pages = parsePages(textResult.text, textResult.total);

    const result: PDFContent = {
      text: textResult.text,
      pages,
    };

    if (Object.keys(metadata).length > 0) {
      result.metadata = metadata;
    }

    return result;
  } catch (error) {
    // Enhance error messages for common issues
    if (error instanceof Error) {
      if (error.message.includes('ENOENT')) {
        throw new Error(`PDF file not found: ${filePath}`);
      }
      if (error.message.includes('password') || error.message.includes('Password')) {
        throw new Error(`PDF is password-protected and cannot be read: ${filePath}`);
      }
      if (error.message.includes('Invalid PDF')) {
        throw new Error(`Invalid or corrupted PDF file: ${filePath}`);
      }
      // Re-throw with more context
      throw new Error(`Failed to read PDF file: ${error.message}`);
    }
    throw error;
  } finally {
    // Always clean up
    if (parser) {
      await parser.destroy();
    }
  }
}

/**
 * Parses the PDF text into structured pages with line information.
 *
 * @param text - Full text from pdf-parse
 * @param _totalPages - Total number of pages (unused but kept for potential future use)
 * @returns Array of structured PDF pages
 */
function parsePages(text: string, _totalPages: number): PDFPage[] {
  const pages: PDFPage[] = [];

  // pdf-parse v2 provides full text but not per-page text directly
  // We'll split by form feed characters which typically indicate page breaks
  const pageTexts = text.split('\f');

  for (let i = 0; i < pageTexts.length; i++) {
    const pageText = pageTexts[i];

    // Skip undefined or empty pages
    if (!pageText || !pageText.trim()) {
      continue;
    }

    // Split into lines while preserving empty lines for structure
    const lines = pageText.split('\n').map((line: string) => line.trimEnd());

    pages.push({
      pageNumber: i + 1,
      text: pageText,
      lines,
    });
  }

  // If no form feed characters were found, treat the entire document as one page
  if (pages.length === 0 && text.trim()) {
    const lines = text.split('\n').map((line: string) => line.trimEnd());
    pages.push({
      pageNumber: 1,
      text: text,
      lines,
    });
  }

  return pages;
}
