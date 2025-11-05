import fs from 'fs/promises';
import path from 'path';

/**
 * Writes Fountain content to a file.
 *
 * @param outputPath - Path where the file should be written
 * @param content - The Fountain format content to write
 * @throws {Error} If the file cannot be written (permission denied, invalid path, etc.)
 *
 * @example
 * ```typescript
 * await writeFountainFile('./output/screenplay.fountain', fountainContent);
 * ```
 */
export async function writeFountainFile(outputPath: string, content: string): Promise<void> {
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  await fs.mkdir(dir, { recursive: true });

  // Write file with UTF-8 encoding
  await fs.writeFile(outputPath, content, 'utf-8');
}

/**
 * Generates an output file path based on an input PDF path.
 *
 * Converts a PDF filename to a .fountain filename, optionally placing it in
 * a specific output directory.
 *
 * @param inputPath - Path to the input PDF file
 * @param outputDir - Optional output directory. If not provided, uses current working directory
 * @returns The generated output path with .fountain extension
 *
 * @example
 * ```typescript
 * // Returns 'screenplay.fountain'
 * generateOutputPath('screenplay.pdf');
 *
 * // Returns 'output/screenplay.fountain'
 * generateOutputPath('screenplay.pdf', 'output');
 *
 * // Returns 'output/my-script.fountain'
 * generateOutputPath('/path/to/my-script.pdf', 'output');
 * ```
 */
export function generateOutputPath(inputPath: string, outputDir?: string): string {
  const basename = path.basename(inputPath, path.extname(inputPath));
  const outputName = `${basename}.fountain`;
  return outputDir ? path.join(outputDir, outputName) : outputName;
}
