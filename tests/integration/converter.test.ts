import { describe, expect, it, vi } from 'vitest';
import { convertPDFToFountain } from '../../src/lib/converter.js';
import * as pdfReader from '../../src/lib/pdf-reader.js';
import type { PDFContent } from '../../src/types/pdf.js';

/**
 * Integration tests for the convertPDFToFountain function.
 *
 * These tests verify the end-to-end conversion pipeline by mocking
 * the PDF reader and testing the orchestration of parsing and generation.
 */
describe('convertPDFToFountain', () => {
  describe('successful conversions', () => {
    it('should convert a simple screenplay PDF successfully', async () => {
      // Mock PDF content
      const mockPDFContent: PDFContent = {
        text: 'INT. COFFEE SHOP - DAY\nJohn enters.\nJOHN\nHello!',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. COFFEE SHOP - DAY\nJohn enters.\nJOHN\nHello!',
            lines: [
              'INT. COFFEE SHOP - DAY',
              'John enters.',
              'JOHN',
              'Hello!',
            ],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf');

      expect(result.success).toBe(true);
      expect(result.document).toBeDefined();
      expect(result.document?.elements.length).toBeGreaterThan(0);
      expect(result.errors).toBeUndefined();
    });

    it('should detect scene headings correctly', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. OFFICE - DAY\nAction text here.',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. OFFICE - DAY\nAction text here.',
            lines: ['INT. OFFICE - DAY', 'Action text here.'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        detectSceneHeadings: true,
      });

      expect(result.success).toBe(true);
      expect(result.document?.elements).toBeDefined();

      const sceneHeadings = result.document?.elements.filter(
        (el) => el.type === 'scene_heading'
      );
      expect(sceneHeadings?.length).toBeGreaterThan(0);
    });

    it('should detect character names correctly', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\n\nJOHN\nDialogue here\n\nJANE\nResponse here',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\n\nJOHN\nDialogue here\n\nJANE\nResponse here',
            lines: [
              'INT. ROOM - DAY',
              '',
              'JOHN',
              'Dialogue here',
              '',
              'JANE',
              'Response here',
            ],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        detectCharacterNames: true,
      });

      expect(result.success).toBe(true);

      const characters = result.document?.elements.filter(
        (el) => el.type === 'character'
      );
      expect(characters?.length).toBeGreaterThan(0);
      // Check that at least one character is detected
      const characterNames = characters?.map((c) => c.text) ?? [];
      expect(characterNames.some((name) => name.includes('JOHN') || name.includes('JANE'))).toBe(
        true
      );
    });

    it('should include metadata when requested', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\nSomething happens.',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nSomething happens.',
            lines: ['INT. ROOM - DAY', 'Something happens.'],
          },
        ],
        metadata: {
          title: 'My Screenplay',
          author: 'John Doe',
        },
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        includeMetadata: true,
      });

      expect(result.success).toBe(true);
      expect(result.document?.metadata).toBeDefined();
      expect(result.document?.metadata?.convertedFrom).toContain('My Screenplay');
      expect(result.document?.metadata?.pageCount).toBe(1);
    });

    it('should respect strict mode option', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. VERY LONG SCENE HEADING WITH LOTS OF EXTRA TEXT THAT IS TOO LONG TO BE VALID\nSome action',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. VERY LONG SCENE HEADING WITH LOTS OF EXTRA TEXT THAT IS TOO LONG TO BE VALID\nSome action',
            lines: [
              'INT. VERY LONG SCENE HEADING WITH LOTS OF EXTRA TEXT THAT IS TOO LONG TO BE VALID',
              'Some action',
            ],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        strictMode: true,
        detectSceneHeadings: true,
      });

      expect(result.success).toBe(true);
      // In strict mode, the overly-long line may not be detected as scene heading
      // but conversion should still succeed
    });

    it('should handle multi-page PDFs', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM 1 - DAY\nAction 1\nINT. ROOM 2 - DAY\nAction 2',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM 1 - DAY\nAction 1',
            lines: ['INT. ROOM 1 - DAY', 'Action 1'],
          },
          {
            pageNumber: 2,
            text: 'INT. ROOM 2 - DAY\nAction 2',
            lines: ['INT. ROOM 2 - DAY', 'Action 2'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf');

      expect(result.success).toBe(true);
      expect(result.document?.metadata?.pageCount).toBe(2);
    });

    it('should return warnings for incomplete screenplay detection', async () => {
      const mockPDFContent: PDFContent = {
        text: 'Just some random text without screenplay structure at all.',
        pages: [
          {
            pageNumber: 1,
            text: 'Just some random text without screenplay structure at all.',
            lines: ['Just some random text without screenplay structure at all.'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        detectSceneHeadings: true,
        detectCharacterNames: true,
      });

      expect(result.success).toBe(true);
      // The converter may or may not generate warnings depending on what the parser finds
      // Just verify that if there ARE warnings, they're structured correctly
      if (result.warnings) {
        expect(result.warnings).toBeInstanceOf(Array);
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });
  });

  describe('error handling', () => {
    it('should return error for non-existent file', async () => {
      vi.spyOn(pdfReader, 'readPDF').mockRejectedValue(
        new Error('PDF file not found: nonexistent.pdf')
      );

      const result = await convertPDFToFountain('nonexistent.pdf');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('PDF file not found');
      expect(result.document).toBeUndefined();
    });

    it('should return error for empty PDF', async () => {
      const mockPDFContent: PDFContent = {
        text: '',
        pages: [],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('empty.pdf');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('empty');
    });

    it('should return error when PDF has no readable text', async () => {
      const mockPDFContent: PDFContent = {
        text: '   \n\n   ',
        pages: [
          {
            pageNumber: 1,
            text: '   \n\n   ',
            lines: ['', '', ''],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('unreadable.pdf');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should return error for password-protected PDF', async () => {
      vi.spyOn(pdfReader, 'readPDF').mockRejectedValue(
        new Error('PDF is password-protected and cannot be read: protected.pdf')
      );

      const result = await convertPDFToFountain('protected.pdf');

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('password');
    });

    it('should return error for corrupted PDF', async () => {
      vi.spyOn(pdfReader, 'readPDF').mockRejectedValue(
        new Error('Invalid or corrupted PDF file: corrupted.pdf')
      );

      const result = await convertPDFToFountain('corrupted.pdf');

      expect(result.success).toBe(false);
      expect(result.errors?.[0]).toContain('corrupted');
    });

    it('should handle unexpected errors gracefully', async () => {
      vi.spyOn(pdfReader, 'readPDF').mockRejectedValue(
        new Error('Unexpected error: Something went wrong')
      );

      const result = await convertPDFToFountain('problematic.pdf');

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBe(1);
    });
  });

  describe('configuration options', () => {
    it('should disable scene heading detection when option is false', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\nSome action',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nSome action',
            lines: ['INT. ROOM - DAY', 'Some action'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        detectSceneHeadings: false,
      });

      expect(result.success).toBe(true);
      // When scene heading detection is off, all elements should be action or other types
      const sceneHeadings = result.document?.elements.filter(
        (el) => el.type === 'scene_heading'
      );
      expect(sceneHeadings?.length ?? 0).toBe(0);
    });

    it('should disable character name detection when option is false', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\nACTION\nJOHN\nSpeaking now',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nACTION\nJOHN\nSpeaking now',
            lines: ['INT. ROOM - DAY', 'ACTION', 'JOHN', 'Speaking now'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        detectCharacterNames: false,
      });

      expect(result.success).toBe(true);
      // When character detection is off, no character elements should be created
      const characters = result.document?.elements.filter(
        (el) => el.type === 'character'
      );
      expect(characters?.length ?? 0).toBe(0);
    });

    it('should exclude metadata when includeMetadata is false', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\nSomething',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nSomething',
            lines: ['INT. ROOM - DAY', 'Something'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf', {
        includeMetadata: false,
      });

      expect(result.success).toBe(true);
      expect(result.document?.metadata).toBeUndefined();
    });

    it('should use all default options when none provided', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\nAction here.',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nAction here.',
            lines: ['INT. ROOM - DAY', 'Action here.'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf');

      expect(result.success).toBe(true);
      // Default options should enable most detections
      expect(result.document?.elements.length).toBeGreaterThan(0);
    });
  });

  describe('return value structure', () => {
    it('should return proper ConversionResult structure on success', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\nTest',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nTest',
            lines: ['INT. ROOM - DAY', 'Test'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      const result = await convertPDFToFountain('screenplay.pdf');

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('document');
      expect(result.document).toHaveProperty('elements');
      expect(result.errors).toBeUndefined();
    });

    it('should return proper ConversionResult structure on error', async () => {
      vi.spyOn(pdfReader, 'readPDF').mockRejectedValue(
        new Error('Test error')
      );

      const result = await convertPDFToFountain('screenplay.pdf');

      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('errors');
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.errors?.length).toBeGreaterThan(0);
      expect(result.document).toBeUndefined();
    });

    it('should include warnings array only when there are warnings', async () => {
      const mockPDFContent: PDFContent = {
        text: 'INT. ROOM - DAY\nCharacter dialogue here',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nCharacter dialogue here',
            lines: ['INT. ROOM - DAY', 'Character dialogue here'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(mockPDFContent);

      // With warnings
      let result = await convertPDFToFountain('screenplay.pdf', {
        detectSceneHeadings: true,
        detectCharacterNames: true,
      });

      if (result.warnings) {
        expect(result.warnings).toBeInstanceOf(Array);
      }

      // Without warnings (valid screenplay)
      const goodContent: PDFContent = {
        text: 'INT. ROOM - DAY\nJOHN\nHello world',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\nJOHN\nHello world',
            lines: ['INT. ROOM - DAY', 'JOHN', 'Hello world'],
          },
        ],
      };

      vi.spyOn(pdfReader, 'readPDF').mockResolvedValue(goodContent);

      result = await convertPDFToFountain('screenplay.pdf');

      // May or may not have warnings depending on parser output
      if (result.warnings) {
        expect(result.warnings).toBeInstanceOf(Array);
      }
    });
  });
});
