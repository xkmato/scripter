export interface PDFContent {
  text: string;
  pages: PDFPage[];
  metadata?: Record<string, unknown>;
}

export interface PDFPage {
  pageNumber: number;
  text: string;
  lines: string[];
}