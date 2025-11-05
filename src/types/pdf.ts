/**
 * Represents the complete content extracted from a PDF file.
 * 
 * This is the structured format that contains all text and page information
 * extracted from a PDF, ready for further processing and parsing.
 */
export interface PDFContent {
  /** The complete text content of the entire PDF */
  text: string;
  
  /** Array of individual pages with their content */
  pages: PDFPage[];
  
  /**
   * Optional metadata extracted from the PDF.
   * 
   * May contain PDF properties such as title, author, subject, creation date, etc.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Represents a single page extracted from a PDF file.
 * 
 * Contains the page number, full text content, and the text broken down into lines
 * for easier line-by-line processing.
 */
export interface PDFPage {
  /** The page number (1-indexed) */
  pageNumber: number;
  
  /** The complete text content of this page */
  text: string;
  
  /** The text content split into individual lines, with trailing whitespace trimmed */
  lines: string[];
}