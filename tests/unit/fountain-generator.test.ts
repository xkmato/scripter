import { describe, it, expect } from 'vitest';
import { generateFountain } from '../../src/lib/fountain-generator.js';
import type { FountainDocument, FountainElement } from '../../src/types/fountain.js';

describe('Fountain Generator', () => {
  describe('Scene Headings', () => {
    it('should format scene headings correctly', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'scene_heading', text: 'INT. COFFEE SHOP - DAY' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('INT. COFFEE SHOP - DAY');
    });

    it('should format EXT scene headings', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'scene_heading', text: 'EXT. PARK - NIGHT' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('EXT. PARK - NIGHT');
    });

    it('should force scene heading with period if prefix is missing', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'scene_heading', text: 'HALLWAY - DAY' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('.HALLWAY - DAY');
    });

    it('should add blank line before scene heading when preceded by other elements', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'action', text: 'Some action.' },
          { type: 'scene_heading', text: 'INT. ROOM - DAY' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/Some action\.\s*\n\s*\nINT\. ROOM - DAY/);
    });
  });

  describe('Character and Dialogue', () => {
    it('should format character names in uppercase', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'character', text: 'John' },
          { type: 'dialogue', text: 'Hello, world!' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toContain('JOHN');
      expect(result).toContain('Hello, world!');
    });

    it('should format character names that are already uppercase', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'character', text: 'JOHN' },
          { type: 'dialogue', text: 'Hello, world!' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toContain('JOHN');
      expect(result).toContain('Hello, world!');
    });

    it('should place dialogue immediately after character name', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'character', text: 'SARAH' },
          { type: 'dialogue', text: "I can't believe it." },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/SARAH\s*\nI can't believe it\./);
    });

    it('should add blank line before character when preceded by action', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'action', text: 'The door opens.' },
          { type: 'character', text: 'MIKE' },
          { type: 'dialogue', text: "I'm here." },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/The door opens\.\s*\n\s*\nMIKE/);
    });
  });

  describe('Parentheticals', () => {
    it('should wrap parentheticals in parentheses', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'character', text: 'ALEX' },
          { type: 'parenthetical', text: 'nervously' },
          { type: 'dialogue', text: 'Is anyone there?' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toContain('(nervously)');
    });

    it('should keep existing parentheses in parentheticals', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'character', text: 'EMMA' },
          { type: 'parenthetical', text: '(whispering)' },
          { type: 'dialogue', text: 'Follow me.' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toContain('(whispering)');
      expect(result).not.toContain('((whispering))');
    });

    it('should place parenthetical between character and dialogue', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'character', text: 'BOB' },
          { type: 'parenthetical', text: 'shouting' },
          { type: 'dialogue', text: 'Get down!' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/BOB\s*\n\(shouting\)\s*\nGet down!/);
    });
  });

  describe('Action Lines', () => {
    it('should format action lines', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'action', text: 'The sun rises over the city.' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('The sun rises over the city.');
    });

    it('should add blank line after scene heading before action', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'scene_heading', text: 'INT. BEDROOM - MORNING' },
          { type: 'action', text: 'A phone rings.' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/INT\. BEDROOM - MORNING\s*\n\s*\nA phone rings\./);
    });

    it('should separate consecutive action lines', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'action', text: 'First action.' },
          { type: 'action', text: 'Second action.' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/First action\.\s*\n\s*\nSecond action\./);
    });
  });

  describe('Transitions', () => {
    it('should format transitions with > prefix', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'transition', text: 'CUT TO:' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('> CUT TO:');
    });

    it('should convert transition text to uppercase', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'transition', text: 'fade to:' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('FADE TO:');
    });

    it('should not add duplicate > prefix', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'transition', text: '> DISSOLVE TO:' }],
      };

      const result = generateFountain(doc);
      const matches = (result.match(/>/g) || []).length;
      expect(matches).toBe(1);
    });

    it('should add blank line before transition', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'action', text: 'The scene fades.' },
          { type: 'transition', text: 'FADE OUT.' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/The scene fades\.\s*\n\s*\n> FADE OUT\./);
    });
  });

  describe('Page Breaks', () => {
    it('should format page breaks as ===', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'page_break', text: '' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('===');
    });

    it('should place page breaks between other elements', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'action', text: 'Action before.' },
          { type: 'page_break', text: '' },
          { type: 'action', text: 'Action after.' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/Action before\.\s*\n\s*\n===\s*\n\s*\nAction after\./);
    });
  });

  describe('Notes', () => {
    it('should wrap notes in double brackets', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'note', text: 'This is a note' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('[[This is a note]]');
    });

    it('should not add duplicate brackets', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'note', text: '[[Already wrapped]]' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('[[Already wrapped]]');
      expect(result).not.toContain('[[[[');
    });
  });

  describe('Sections', () => {
    it('should format sections with # prefix', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'section', text: 'Act One' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('# Act One');
    });

    it('should preserve existing # prefix', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'section', text: '## Scene 1' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('## Scene 1');
      expect(result).not.toContain('# ## Scene 1');
    });
  });

  describe('Synopsis', () => {
    it('should format synopsis with = prefix', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'synopsis', text: 'Our hero begins his journey' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('= Our hero begins his journey');
    });

    it('should preserve existing = prefix', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'synopsis', text: '= A brief summary' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('= A brief summary');
      expect(result).not.toContain('= = A brief summary');
    });
  });

  describe('Title Page', () => {
    it('should format title page at the beginning', () => {
      const doc: FountainDocument = {
        titlePage: {
          title: 'My Screenplay',
          author: 'John Doe',
        },
        elements: [{ type: 'scene_heading', text: 'INT. ROOM - DAY' }],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/Title: My Screenplay\s*\nAuthor: John Doe/);
    });

    it('should capitalize title page keys', () => {
      const doc: FountainDocument = {
        titlePage: {
          title: 'Test',
          credit: 'Written by',
        },
        elements: [],
      };

      const result = generateFountain(doc);
      expect(result).toContain('Title: Test');
      expect(result).toContain('Credit: Written by');
    });

    it('should separate title page from body with blank lines', () => {
      const doc: FountainDocument = {
        titlePage: { title: 'Test' },
        elements: [{ type: 'scene_heading', text: 'INT. ROOM - DAY' }],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/Title: Test\s*\n\s*\nINT\. ROOM - DAY/);
    });
  });

  describe('Metadata', () => {
    it('should format metadata as note at the end', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'action', text: 'Test action.' }],
        metadata: {
          convertedFrom: 'test.pdf',
          convertedAt: '2025-11-05',
        },
      };

      const result = generateFountain(doc);
      expect(result).toContain('[[Converted from PDF: test.pdf');
      expect(result).toContain('Conversion date: 2025-11-05');
    });

    it('should include page count in metadata if present', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'action', text: 'Test action.' }],
        metadata: {
          convertedFrom: 'test.pdf',
          convertedAt: '2025-11-05',
          pageCount: 120,
        },
      };

      const result = generateFountain(doc);
      expect(result).toContain('Original page count: 120');
    });

    it('should place metadata after all elements', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'scene_heading', text: 'INT. ROOM - DAY' },
          { type: 'action', text: 'Final action.' },
        ],
        metadata: {
          convertedFrom: 'test.pdf',
          convertedAt: '2025-11-05',
        },
      };

      const result = generateFountain(doc);
      const metadataIndex = result.indexOf('[[Converted from PDF');
      const actionIndex = result.indexOf('Final action');
      expect(metadataIndex).toBeGreaterThan(actionIndex);
    });
  });

  describe('Complete Documents', () => {
    it('should generate a complete screenplay', () => {
      const doc: FountainDocument = {
        titlePage: {
          title: 'Test Screenplay',
          author: 'Test Author',
        },
        elements: [
          { type: 'scene_heading', text: 'INT. COFFEE SHOP - DAY' },
          { type: 'action', text: 'A barista makes coffee.' },
          { type: 'character', text: 'BARISTA' },
          { type: 'dialogue', text: 'Your coffee is ready.' },
          { type: 'character', text: 'CUSTOMER' },
          { type: 'parenthetical', text: 'smiling' },
          { type: 'dialogue', text: 'Thank you!' },
        ],
      };

      const result = generateFountain(doc);

      // Check all elements are present
      expect(result).toContain('Title: Test Screenplay');
      expect(result).toContain('INT. COFFEE SHOP - DAY');
      expect(result).toContain('A barista makes coffee.');
      expect(result).toContain('BARISTA');
      expect(result).toContain('Your coffee is ready.');
      expect(result).toContain('CUSTOMER');
      expect(result).toContain('(smiling)');
      expect(result).toContain('Thank you!');
    });

    it('should handle empty document', () => {
      const doc: FountainDocument = {
        elements: [],
      };

      const result = generateFountain(doc);
      expect(result).toBe('\n');
    });

    it('should end with single newline', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'action', text: 'The end.' }],
      };

      const result = generateFountain(doc);
      expect(result.endsWith('\n')).toBe(true);
      expect(result.endsWith('\n\n')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle elements with extra whitespace', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'action', text: '  Spaces everywhere  ' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('Spaces everywhere');
      expect(result).not.toContain('  Spaces everywhere  ');
    });

    it('should handle empty text in elements', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'action', text: '' },
          { type: 'action', text: 'Non-empty' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toContain('Non-empty');
    });

    it('should handle special characters in text', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'dialogue', text: "It's a test with \"quotes\" & symbols!" }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('It\'s a test with "quotes" & symbols!');
    });

    it('should handle unknown element types gracefully', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'action', text: 'Normal' } as FountainElement],
      };

      const result = generateFountain(doc);
      expect(result).toContain('Normal');
    });
  });
});
