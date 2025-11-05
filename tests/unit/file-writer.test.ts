import fs from 'fs/promises';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { generateOutputPath, writeFountainFile } from '../../src/utils/file-writer.js';

describe('File Writer', () => {
  const testDir = path.join(__dirname, '../temp');

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('writeFountainFile', () => {
    it('should write content to a file', async () => {
      const outputPath = path.join(testDir, 'test.fountain');
      const content = 'INT. COFFEE SHOP - DAY\n\nJohn enters.';

      await writeFountainFile(outputPath, content);

      const written = await fs.readFile(outputPath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should create directories if they do not exist', async () => {
      const outputPath = path.join(testDir, 'nested', 'deep', 'dir', 'test.fountain');
      const content = 'Test content';

      await writeFountainFile(outputPath, content);

      const written = await fs.readFile(outputPath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should write with UTF-8 encoding', async () => {
      const outputPath = path.join(testDir, 'utf8.fountain');
      const content = 'Character: José García\nDialogue: "¡Hola!"';

      await writeFountainFile(outputPath, content);

      const written = await fs.readFile(outputPath, 'utf-8');
      expect(written).toBe(content);
    });

    it('should overwrite existing files', async () => {
      const outputPath = path.join(testDir, 'overwrite.fountain');
      const originalContent = 'Original content';
      const newContent = 'New content';

      // Write original
      await writeFountainFile(outputPath, originalContent);
      let written = await fs.readFile(outputPath, 'utf-8');
      expect(written).toBe(originalContent);

      // Overwrite
      await writeFountainFile(outputPath, newContent);
      written = await fs.readFile(outputPath, 'utf-8');
      expect(written).toBe(newContent);
    });

    it('should handle empty content', async () => {
      const outputPath = path.join(testDir, 'empty.fountain');
      const content = '';

      await writeFountainFile(outputPath, content);

      const written = await fs.readFile(outputPath, 'utf-8');
      expect(written).toBe('');
    });

    it('should handle large content', async () => {
      const outputPath = path.join(testDir, 'large.fountain');
      const content = 'A'.repeat(1000000); // 1MB of content

      await writeFountainFile(outputPath, content);

      const written = await fs.readFile(outputPath, 'utf-8');
      expect(written).toBe(content);
      expect(written.length).toBe(1000000);
    });
  });

  describe('generateOutputPath', () => {
    it('should convert PDF to fountain filename', () => {
      const result = generateOutputPath('screenplay.pdf');
      expect(result).toBe('screenplay.fountain');
    });

    it('should handle files with multiple dots', () => {
      const result = generateOutputPath('my.screenplay.pdf');
      expect(result).toBe('my.screenplay.fountain');
    });

    it('should handle paths with directories', () => {
      const result = generateOutputPath('/path/to/screenplay.pdf');
      expect(result).toBe('screenplay.fountain');
    });

    it('should place file in output directory when provided', () => {
      const result = generateOutputPath('screenplay.pdf', 'output');
      expect(result).toBe(path.join('output', 'screenplay.fountain'));
    });

    it('should place file in nested output directory', () => {
      const result = generateOutputPath('screenplay.pdf', 'path/to/output');
      expect(result).toBe(path.join('path/to/output', 'screenplay.fountain'));
    });

    it('should handle full paths with output directory', () => {
      const result = generateOutputPath('/home/user/screenplay.pdf', 'converted');
      expect(result).toBe(path.join('converted', 'screenplay.fountain'));
    });

    it('should handle files without extension', () => {
      const result = generateOutputPath('screenplay', 'output');
      expect(result).toBe(path.join('output', 'screenplay.fountain'));
    });

    it('should handle relative paths', () => {
      const result = generateOutputPath('./relative/screenplay.pdf');
      expect(result).toBe('screenplay.fountain');
    });

    it('should use absolute output directory correctly', () => {
      const outputDir = path.join(__dirname, 'out');
      const result = generateOutputPath('screenplay.pdf', outputDir);
      expect(result).toBe(path.join(outputDir, 'screenplay.fountain'));
    });
  });
});
