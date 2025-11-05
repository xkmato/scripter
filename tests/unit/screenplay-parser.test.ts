import { describe, expect, it } from 'vitest';
import { parseScreenplay } from '../../src/lib/screenplay-parser.js';
import type { PDFContent } from '../../src/types/pdf.js';

describe('Screenplay Parser', () => {
  describe('Scene Heading Detection', () => {
    it('should detect INT. scene headings', () => {
      const content: PDFContent = {
        text: 'INT. COFFEE SHOP - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. COFFEE SHOP - DAY',
            lines: ['INT. COFFEE SHOP - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].text).toBe('INT. COFFEE SHOP - DAY');
    });

    it('should detect EXT. scene headings', () => {
      const content: PDFContent = {
        text: 'EXT. PARK - NIGHT',
        pages: [
          {
            pageNumber: 1,
            text: 'EXT. PARK - NIGHT',
            lines: ['EXT. PARK - NIGHT'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].text).toBe('EXT. PARK - NIGHT');
    });

    it('should detect INT./EXT. scene headings', () => {
      const content: PDFContent = {
        text: 'INT./EXT. CAR - MOVING - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'INT./EXT. CAR - MOVING - DAY',
            lines: ['INT./EXT. CAR - MOVING - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[0].text).toBe('INT./EXT. CAR - MOVING - DAY');
    });

    it('should detect I/E scene headings', () => {
      const content: PDFContent = {
        text: 'I/E BUILDING - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'I/E BUILDING - DAY',
            lines: ['I/E BUILDING - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('scene_heading');
    });

    it('should detect EST. scene headings', () => {
      const content: PDFContent = {
        text: 'EST. CITY SKYLINE - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'EST. CITY SKYLINE - DAY',
            lines: ['EST. CITY SKYLINE - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('scene_heading');
    });

    it('should detect scene headings without strict mode', () => {
      const content: PDFContent = {
        text: 'INT ROOM',
        pages: [
          {
            pageNumber: 1,
            text: 'INT ROOM',
            lines: ['INT ROOM'],
          },
        ],
      };
      const result = parseScreenplay(content, { strictMode: false });

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('scene_heading');
    });

    it('should respect detectSceneHeadings option', () => {
      const content: PDFContent = {
        text: 'INT. COFFEE SHOP - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. COFFEE SHOP - DAY',
            lines: ['INT. COFFEE SHOP - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, { detectSceneHeadings: false });

      // Should be treated as action instead
      expect(result.elements[0].type).toBe('action');
    });
  });

  describe('Character Name Detection', () => {
    it('should detect all-caps character names', () => {
      const content: PDFContent = {
        text: 'JOHN\nHello there.',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN\nHello there.',
            lines: ['JOHN', 'Hello there.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(2);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].text).toBe('JOHN');
      expect(result.elements[1].type).toBe('dialogue');
      expect(result.elements[1].text).toBe('Hello there.');
    });

    it('should detect character names with extensions', () => {
      const content: PDFContent = {
        text: 'JOHN (V.O.)\nHello there.',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN (V.O.)\nHello there.',
            lines: ['JOHN (V.O.)', 'Hello there.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(2);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].text).toBe('JOHN (V.O.)');
    });

    it('should detect character names with spaces', () => {
      const content: PDFContent = {
        text: 'MARY JANE\nHow are you?',
        pages: [
          {
            pageNumber: 1,
            text: 'MARY JANE\nHow are you?',
            lines: ['MARY JANE', 'How are you?'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(2);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].text).toBe('MARY JANE');
    });

    it('should not confuse all-caps action with character names', () => {
      const content: PDFContent = {
        text: 'FADE IN',
        pages: [
          {
            pageNumber: 1,
            text: 'FADE IN',
            lines: ['FADE IN'],
          },
        ],
      };
      const result = parseScreenplay(content, { strictMode: true });

      // Should not be detected as character
      expect(result.elements[0].type).not.toBe('character');
    });

    it('should respect detectCharacterNames option', () => {
      const content: PDFContent = {
        text: 'JOHN\nHello there.',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN\nHello there.',
            lines: ['JOHN', 'Hello there.'],
          },
        ],
      };
      const result = parseScreenplay(content, { detectCharacterNames: false });

      // Should not detect character names
      expect(result.elements.every((e) => e.type !== 'character')).toBe(true);
    });

    it('should detect character names after scene headings', () => {
      const content: PDFContent = {
        text: 'INT. ROOM - DAY\n\nJOHN\nHello.',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\n\nJOHN\nHello.',
            lines: ['INT. ROOM - DAY', '', 'JOHN', 'Hello.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(3);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[1].type).toBe('character');
      expect(result.elements[2].type).toBe('dialogue');
    });
  });

  describe('Dialogue Detection', () => {
    it('should associate dialogue with preceding character', () => {
      const content: PDFContent = {
        text: 'JOHN\nHello, world!\nHow are you?',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN\nHello, world!\nHow are you?',
            lines: ['JOHN', 'Hello, world!', 'How are you?'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(3);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].text).toBe('JOHN');
      expect(result.elements[1].type).toBe('dialogue');
      expect(result.elements[1].text).toBe('Hello, world!');
      expect(result.elements[2].type).toBe('dialogue');
      expect(result.elements[2].text).toBe('How are you?');
    });

    it('should detect parentheticals within dialogue', () => {
      const content: PDFContent = {
        text: 'JOHN\n(smiling)\nHello there.',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN\n(smiling)\nHello there.',
            lines: ['JOHN', '(smiling)', 'Hello there.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(3);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[1].type).toBe('parenthetical');
      expect(result.elements[1].text).toBe('(smiling)');
      expect(result.elements[2].type).toBe('dialogue');
      expect(result.elements[2].text).toBe('Hello there.');
    });

    it('should handle multi-line dialogue', () => {
      const content: PDFContent = {
        text: 'JOHN\nThis is a long speech.\nIt continues here.\nAnd here too.',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN\nThis is a long speech.\nIt continues here.\nAnd here too.',
            lines: ['JOHN', 'This is a long speech.', 'It continues here.', 'And here too.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(4);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[1].type).toBe('dialogue');
      expect(result.elements[2].type).toBe('dialogue');
      expect(result.elements[3].type).toBe('dialogue');
    });

    it('should end dialogue on blank line', () => {
      const content: PDFContent = {
        text: 'JOHN\nHello.\n\nHe walks away.',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN\nHello.\n\nHe walks away.',
            lines: ['JOHN', 'Hello.', '', 'He walks away.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(3);
      expect(result.elements[0].type).toBe('character');
      expect(result.elements[1].type).toBe('dialogue');
      expect(result.elements[2].type).toBe('action');
    });
  });

  describe('Action Detection', () => {
    it('should detect action lines', () => {
      const content: PDFContent = {
        text: 'John walks into the room.',
        pages: [
          {
            pageNumber: 1,
            text: 'John walks into the room.',
            lines: ['John walks into the room.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('action');
      expect(result.elements[0].text).toBe('John walks into the room.');
    });

    it('should detect multiple action lines', () => {
      const content: PDFContent = {
        text: 'John walks into the room.\nHe looks around.',
        pages: [
          {
            pageNumber: 1,
            text: 'John walks into the room.\nHe looks around.',
            lines: ['John walks into the room.', 'He looks around.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(2);
      expect(result.elements[0].type).toBe('action');
      expect(result.elements[1].type).toBe('action');
    });

    it('should handle action between scenes', () => {
      const content: PDFContent = {
        text: 'INT. ROOM - DAY\n\nJohn enters.\n\nEXT. STREET - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY\n\nJohn enters.\n\nEXT. STREET - DAY',
            lines: ['INT. ROOM - DAY', '', 'John enters.', '', 'EXT. STREET - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(3);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[1].type).toBe('action');
      expect(result.elements[2].type).toBe('scene_heading');
    });
  });

  describe('Transition Detection', () => {
    it('should detect CUT TO: transitions', () => {
      const content: PDFContent = {
        text: 'CUT TO:',
        pages: [
          {
            pageNumber: 1,
            text: 'CUT TO:',
            lines: ['CUT TO:'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('transition');
      expect(result.elements[0].text).toBe('CUT TO:');
    });

    it('should detect FADE IN: transitions', () => {
      const content: PDFContent = {
        text: 'FADE IN:',
        pages: [
          {
            pageNumber: 1,
            text: 'FADE IN:',
            lines: ['FADE IN:'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('transition');
    });

    it('should detect FADE OUT: transitions', () => {
      const content: PDFContent = {
        text: 'FADE OUT:',
        pages: [
          {
            pageNumber: 1,
            text: 'FADE OUT:',
            lines: ['FADE OUT:'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('transition');
    });

    it('should detect DISSOLVE TO: transitions', () => {
      const content: PDFContent = {
        text: 'DISSOLVE TO:',
        pages: [
          {
            pageNumber: 1,
            text: 'DISSOLVE TO:',
            lines: ['DISSOLVE TO:'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('transition');
    });

    it('should not confuse character names with transitions', () => {
      const content: PDFContent = {
        text: 'JOHN\nI need to go.',
        pages: [
          {
            pageNumber: 1,
            text: 'JOHN\nI need to go.',
            lines: ['JOHN', 'I need to go.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements[0].type).toBe('character');
      expect(result.elements[0].type).not.toBe('transition');
    });
  });

  describe('Note Detection', () => {
    it('should detect notes in double brackets', () => {
      const content: PDFContent = {
        text: '[[This is a note]]',
        pages: [
          {
            pageNumber: 1,
            text: '[[This is a note]]',
            lines: ['[[This is a note]]'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('note');
      expect(result.elements[0].text).toBe('[[This is a note]]');
    });

    it('should detect notes with complex content', () => {
      const content: PDFContent = {
        text: '[[TODO: Fix this scene]]',
        pages: [
          {
            pageNumber: 1,
            text: '[[TODO: Fix this scene]]',
            lines: ['[[TODO: Fix this scene]]'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(1);
      expect(result.elements[0].type).toBe('note');
    });
  });

  describe('Page Break Detection', () => {
    it('should detect page breaks', () => {
      const content: PDFContent = {
        text: 'Page 1\n\fPage 2',
        pages: [
          {
            pageNumber: 1,
            text: 'Page 1',
            lines: ['Page 1'],
          },
          {
            pageNumber: 2,
            text: 'Page 2',
            lines: ['Page 2'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      // Should have page break between elements
      const pageBreaks = result.elements.filter((e) => e.type === 'page_break');
      expect(pageBreaks.length).toBeGreaterThan(0);
    });
  });

  describe('Title Page Detection', () => {
    it('should detect title page before first scene', () => {
      const content: PDFContent = {
        text: 'My Screenplay\nBy John Doe\n\nINT. ROOM - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'My Screenplay\nBy John Doe\n\nINT. ROOM - DAY',
            lines: ['My Screenplay', 'By John Doe', '', 'INT. ROOM - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.titlePage).toBeDefined();
      expect(result.titlePage?.title).toContain('My Screenplay');
    });

    it('should not have title page if starting with scene', () => {
      const content: PDFContent = {
        text: 'INT. ROOM - DAY',
        pages: [
          {
            pageNumber: 1,
            text: 'INT. ROOM - DAY',
            lines: ['INT. ROOM - DAY'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.titlePage).toBeUndefined();
    });
  });

  describe('Metadata', () => {
    it('should include metadata when option is enabled', () => {
      const content: PDFContent = {
        text: 'Test',
        pages: [
          {
            pageNumber: 1,
            text: 'Test',
            lines: ['Test'],
          },
        ],
      };
      const result = parseScreenplay(content, { includeMetadata: true });

      expect(result.metadata).toBeDefined();
      expect(result.metadata?.convertedAt).toBeDefined();
      expect(result.metadata?.pageCount).toBe(1);
    });

    it('should not include metadata when option is disabled', () => {
      const content: PDFContent = {
        text: 'Test',
        pages: [
          {
            pageNumber: 1,
            text: 'Test',
            lines: ['Test'],
          },
        ],
      };
      const result = parseScreenplay(content, { includeMetadata: false });

      expect(result.metadata).toBeUndefined();
    });
  });

  describe('Complex Screenplay Parsing', () => {
    it('should parse a complete scene with all elements', () => {
      const content: PDFContent = {
        text: `INT. COFFEE SHOP - DAY

John enters and looks around.

JOHN
(to himself)
Where is everyone?

He walks to the counter.

BARISTA
Can I help you?

JOHN
Coffee, please.

CUT TO:`,
        pages: [
          {
            pageNumber: 1,
            text: `INT. COFFEE SHOP - DAY

John enters and looks around.

JOHN
(to himself)
Where is everyone?

He walks to the counter.

BARISTA
Can I help you?

JOHN
Coffee, please.

CUT TO:`,
            lines: [
              'INT. COFFEE SHOP - DAY',
              '',
              'John enters and looks around.',
              '',
              'JOHN',
              '(to himself)',
              'Where is everyone?',
              '',
              'He walks to the counter.',
              '',
              'BARISTA',
              'Can I help you?',
              '',
              'JOHN',
              'Coffee, please.',
              '',
              'CUT TO:',
            ],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      // Verify structure
      const types = result.elements.map((e) => e.type);
      expect(types).toContain('scene_heading');
      expect(types).toContain('action');
      expect(types).toContain('character');
      expect(types).toContain('dialogue');
      expect(types).toContain('parenthetical');
      expect(types).toContain('transition');
    });

    it('should handle multiple scenes', () => {
      const content: PDFContent = {
        text: `INT. ROOM ONE - DAY

Action in room one.

EXT. STREET - NIGHT

Action on street.

INT. ROOM TWO - DAY

Action in room two.`,
        pages: [
          {
            pageNumber: 1,
            text: `INT. ROOM ONE - DAY

Action in room one.

EXT. STREET - NIGHT

Action on street.

INT. ROOM TWO - DAY

Action in room two.`,
            lines: [
              'INT. ROOM ONE - DAY',
              '',
              'Action in room one.',
              '',
              'EXT. STREET - NIGHT',
              '',
              'Action on street.',
              '',
              'INT. ROOM TWO - DAY',
              '',
              'Action in room two.',
            ],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      const sceneHeadings = result.elements.filter((e) => e.type === 'scene_heading');
      expect(sceneHeadings).toHaveLength(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      const content: PDFContent = {
        text: '',
        pages: [
          {
            pageNumber: 1,
            text: '',
            lines: [],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      expect(result.elements).toHaveLength(0);
    });

    it('should skip page numbers', () => {
      const content: PDFContent = {
        text: '1.\nINT. ROOM - DAY\n2.\nAction here.',
        pages: [
          {
            pageNumber: 1,
            text: '1.\nINT. ROOM - DAY\n2.\nAction here.',
            lines: ['1.', 'INT. ROOM - DAY', '2.', 'Action here.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      // Should not include page numbers as elements
      const texts = result.elements.map((e) => e.text);
      expect(texts).not.toContain('1.');
      expect(texts).not.toContain('2.');
    });

    it('should handle lines with only whitespace', () => {
      const content: PDFContent = {
        text: '   \nINT. ROOM - DAY\n   \nAction.',
        pages: [
          {
            pageNumber: 1,
            text: '   \nINT. ROOM - DAY\n   \nAction.',
            lines: ['   ', 'INT. ROOM - DAY', '   ', 'Action.'],
          },
        ],
      };
      const result = parseScreenplay(content, {});

      // Should skip whitespace-only lines
      expect(result.elements).toHaveLength(2);
      expect(result.elements[0].type).toBe('scene_heading');
      expect(result.elements[1].type).toBe('action');
    });
  });
});
