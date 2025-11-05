import path from 'path';
import { fileURLToPath } from 'url';
import { describe, expect, it } from 'vitest';
import { readPDF } from '../../src/lib/pdf-reader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('PDF Reader', () => {
  it('should throw error for non-existent file', async () => {
    await expect(readPDF('nonexistent.pdf')).rejects.toThrow('PDF file not found');
  });

  it('should throw error for invalid file path', async () => {
    await expect(readPDF('/path/that/does/not/exist.pdf')).rejects.toThrow();
  });

  it('should handle empty path', async () => {
    await expect(readPDF('')).rejects.toThrow();
  });

  // Note: Actual PDF reading tests will be added in Task 4.2 with proper fixtures
  // These basic tests verify error handling works correctly
});
