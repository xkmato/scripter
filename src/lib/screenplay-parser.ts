import type { ConversionOptions, FountainDocument, FountainElement } from '../types/fountain.js';
import type { PDFContent } from '../types/pdf.js';

// Regular expressions for element detection
const SCENE_HEADING_REGEX = /^(INT\.?|EXT\.?|INT\.?\/EXT\.?|I\.?\/E\.?|EST\.?|INT\.?\s+\/\s+EXT\.?|EXT\.?\s+\/\s+INT\.?)\s+/i;
const CHARACTER_REGEX = /^[A-Z][A-Z\s\-'0-9().]*$/;
const TRANSITION_REGEX = /^([A-Z\s]+TO:|FADE (IN|OUT|TO BLACK|TO WHITE):|CUT TO:|DISSOLVE TO:|MATCH CUT TO:)$/;
const PARENTHETICAL_REGEX = /^\([^)]+\)$/;
const NOTE_REGEX = /^\[\[.*\]\]$/;

// Common transition keywords
const TRANSITION_KEYWORDS = [
  'TO:',
  'FADE IN:',
  'FADE OUT:',
  'FADE TO BLACK:',
  'FADE TO WHITE:',
  'CUT TO:',
  'DISSOLVE TO:',
  'MATCH CUT TO:',
  'SMASH CUT TO:',
  'JUMP CUT TO:',
];

/**
 * Parser state for context-aware parsing
 */
interface ParserState {
  currentElementType: string | null;
  lastCharacterName: string | null;
  expectingDialogue: boolean;
  inTitlePage: boolean;
  titlePageLines: string[];
  sceneCount: number;
  warnings: string[];
}

/**
 * Parses screenplay content from PDF and converts it to a structured Fountain document.
 *
 * Uses heuristics to identify screenplay elements including scene headings, character names,
 * dialogue, action, transitions, and more.
 *
 * @param pdfContent - The extracted PDF content with pages and lines
 * @param options - Conversion options to control parsing behavior
 * @returns A structured Fountain document with identified elements
 *
 * @example
 * ```typescript
 * const pdfContent = await readPDF('screenplay.pdf');
 * const document = parseScreenplay(pdfContent, {
 *   detectSceneHeadings: true,
 *   detectCharacterNames: true,
 *   strictMode: false,
 * });
 * ```
 */
export function parseScreenplay(
  pdfContent: PDFContent,
  options: ConversionOptions = {}
): FountainDocument {
  // Set default options
  const opts = {
    detectSceneHeadings: options.detectSceneHeadings ?? true,
    detectCharacterNames: options.detectCharacterNames ?? true,
    includeMetadata: options.includeMetadata ?? true,
    strictMode: options.strictMode ?? false,
    preserveFormatting: options.preserveFormatting ?? true,
  };

  const state: ParserState = {
    currentElementType: null,
    lastCharacterName: null,
    expectingDialogue: false,
    inTitlePage: true, // Start in title page mode - will exit when we find a scene heading
    titlePageLines: [],
    sceneCount: 0,
    warnings: [],
  };

  const elements: FountainElement[] = [];

  // Process all lines from all pages
  const allLines: string[] = [];
  for (const page of pdfContent.pages) {
    allLines.push(...page.lines);
    // Add page break marker (except for last page)
    if (page.pageNumber < pdfContent.pages.length) {
      allLines.push('___PAGE_BREAK___');
    }
  }

  // Parse lines
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i] ?? '';
    const trimmedLine = line.trim();

    // Handle page breaks
    if (line === '___PAGE_BREAK___') {
      elements.push({
        type: 'page_break',
        text: '',
      });
      continue;
    }

    // Skip empty lines but track them for context
    if (!trimmedLine) {
      // If in title page mode, collect blank lines too (they affect dialogue state)
      if (state.inTitlePage) {
        state.titlePageLines.push('');
      }
      // Empty lines can signal the end of dialogue or action
      if (state.expectingDialogue) {
        state.expectingDialogue = false;
        state.lastCharacterName = null;
      }
      continue;
    }

    // Skip page numbers (common patterns)
    if (isPageNumber(trimmedLine)) {
      continue;
    }

    // Detect notes
    if (NOTE_REGEX.test(trimmedLine)) {
      elements.push({
        type: 'note',
        text: trimmedLine,
      });
      continue;
    }

    // Title page detection - collect lines before first scene heading
    if (state.inTitlePage) {
      // Check if this is a scene heading (if we're detecting them)
      if (opts.detectSceneHeadings && isSceneHeading(trimmedLine, opts.strictMode)) {
        // Found first scene - exit title page mode and process the scene
        state.inTitlePage = false;
        state.sceneCount++;
        // Don't continue - fall through to process scene heading below
      } else if (!opts.detectSceneHeadings) {
        // Not detecting scenes, so no title page collection
        state.inTitlePage = false;
        // Fall through to process line normally
      } else if (state.titlePageLines.length >= 15) {
        // Too many lines without a scene - probably not a title page
        // Process all accumulated lines as action
        for (const titleLine of state.titlePageLines) {
          elements.push({
            type: 'action',
            text: titleLine,
          });
        }
        state.titlePageLines = [];
        state.inTitlePage = false;
        // Fall through to process current line
      } else {
        // Still collecting potential title page content
        state.titlePageLines.push(trimmedLine);
        continue;
      }
    }

    // Scene heading detection
    if (opts.detectSceneHeadings && isSceneHeading(trimmedLine, opts.strictMode)) {
      elements.push({
        type: 'scene_heading',
        text: trimmedLine,
      });
      state.sceneCount++;
      state.expectingDialogue = false;
      state.currentElementType = 'scene_heading';
      continue;
    }

    // Transition detection
    if (isTransition(trimmedLine, opts.strictMode)) {
      elements.push({
        type: 'transition',
        text: trimmedLine,
      });
      state.expectingDialogue = false;
      state.currentElementType = 'transition';
      continue;
    }

    // Parenthetical detection (if we're expecting dialogue)
    if (state.expectingDialogue && PARENTHETICAL_REGEX.test(trimmedLine)) {
      elements.push({
        type: 'parenthetical',
        text: trimmedLine,
      });
      // Still expecting dialogue after parenthetical
      continue;
    }

    // Character name detection
    if (opts.detectCharacterNames && isCharacterName(trimmedLine, state, opts.strictMode)) {
      // Extract character name (remove any extensions like (V.O.) or (O.S.))
      const cleanName = trimmedLine.replace(/\s*\([^)]+\)\s*$/, '').trim();

      elements.push({
        type: 'character',
        text: trimmedLine,
      });
      state.lastCharacterName = cleanName;
      state.expectingDialogue = true;
      state.currentElementType = 'character';
      continue;
    }

    // Dialogue detection (follows character name)
    if (state.expectingDialogue) {
      elements.push({
        type: 'dialogue',
        text: trimmedLine,
      });
      state.currentElementType = 'dialogue';
      // Continue expecting dialogue (multi-line)
      continue;
    }

    // Default to action
    elements.push({
      type: 'action',
      text: trimmedLine,
    });
    state.currentElementType = 'action';
  }

  // If still in title page mode after processing all lines, it means we never found
  // a scene heading. Re-parse the collected lines as regular screenplay elements.
  if (state.inTitlePage && state.titlePageLines.length > 0 && state.sceneCount === 0) {
    // Reset state for re-parsing
    const reparsedState: ParserState = {
      currentElementType: null,
      lastCharacterName: null,
      expectingDialogue: false,
      inTitlePage: false,
      titlePageLines: [],
      sceneCount: 0,
      warnings: [],
    };
    
    // Re-parse each collected line
    for (const titleLine of state.titlePageLines) {
      const trimmedLine = titleLine.trim();
      
      // Skip blank lines but track them for context
      if (!trimmedLine) {
        if (reparsedState.expectingDialogue) {
          reparsedState.expectingDialogue = false;
          reparsedState.lastCharacterName = null;
        }
        continue;
      }
      
      // Parenthetical detection (if we're expecting dialogue)
      if (reparsedState.expectingDialogue && PARENTHETICAL_REGEX.test(trimmedLine)) {
        elements.push({
          type: 'parenthetical',
          text: trimmedLine,
        });
        // Still expecting dialogue after parenthetical
        continue;
      }
      
      // Character name detection
      if (opts.detectCharacterNames && isCharacterName(trimmedLine, reparsedState, opts.strictMode)) {
        elements.push({
          type: 'character',
          text: trimmedLine,
        });
        reparsedState.lastCharacterName = trimmedLine.replace(/\s*\([^)]+\)\s*$/, '').trim();
        reparsedState.expectingDialogue = true;
        reparsedState.currentElementType = 'character';
      }
      // Dialogue detection (follows character name)
      else if (reparsedState.expectingDialogue) {
        elements.push({
          type: 'dialogue',
          text: trimmedLine,
        });
        reparsedState.currentElementType = 'dialogue';
      }
      // Transition detection
      else if (isTransition(trimmedLine, opts.strictMode)) {
        elements.push({
          type: 'transition',
          text: trimmedLine,
        });
        reparsedState.expectingDialogue = false;
        reparsedState.currentElementType = 'transition';
      }
      // Default to action
      else {
        elements.push({
          type: 'action',
          text: trimmedLine,
        });
        reparsedState.expectingDialogue = false;
        reparsedState.currentElementType = 'action';
      }
    }
    state.titlePageLines = [];
  }

  // Build the document
  const document: FountainDocument = {
    elements,
  };

  // Add title page if we collected any (and found scenes, meaning it was a real title page)
  if (state.titlePageLines.length > 0 && state.sceneCount > 0) {
    document.titlePage = parseTitlePage(state.titlePageLines);
  }

  // Add metadata if requested
  if (opts.includeMetadata) {
    document.metadata = {
      convertedFrom: pdfContent.metadata?.title as string || 'PDF Screenplay',
      convertedAt: new Date().toISOString(),
      pageCount: pdfContent.pages.length,
    };
  }

  return document;
}

/**
 * Determines if a line is a scene heading.
 * 
 * Scene headings in screenplays start with INT., EXT., INT./EXT., or I/E
 * followed by a location and time of day.
 *
 * @param line - The line to test
 * @param strictMode - If true, applies additional validation rules
 * @returns True if the line appears to be a scene heading
 *
 * @example
 * ```typescript
 * isSceneHeading('INT. COFFEE SHOP - DAY', false) // true
 * isSceneHeading('EXT. PARK - NIGHT', false)      // true
 * isSceneHeading('This is just action', false)    // false
 * ```
 */
function isSceneHeading(line: string, strictMode: boolean): boolean {
  // Must start with a scene prefix
  const hasPrefix = SCENE_HEADING_REGEX.test(line);
  if (!hasPrefix) {
    return false;
  }

  // In strict mode, additional validation
  if (strictMode) {
    // Should not be too long (most scene headings are under 60 chars)
    if (line.length > 80) {
      return false;
    }

    // Should not end with punctuation other than period
    const lastChar = line[line.length - 1];
    if (lastChar && /[,;:!?]/.test(lastChar)) {
      return false;
    }
  }

  return true;
}

/**
 * Determines if a line is a character name.
 * 
 * Character names in screenplays are typically in ALL CAPS, relatively short,
 * and appear before dialogue. This function uses both pattern matching and context.
 *
 * @param line - The line to test
 * @param state - Current parser state for context-aware detection
 * @param strictMode - If true, applies additional validation rules
 * @returns True if the line appears to be a character name
 *
 * @example
 * ```typescript
 * isCharacterName('JOHN', state, false)           // true
 * isCharacterName('JANE (V.O.)', state, false)    // true
 * isCharacterName('John walked into the room', state, false) // false
 * ```
 */
function isCharacterName(line: string, state: ParserState, strictMode: boolean): boolean {
  // Must be all uppercase (with possible spaces, hyphens, apostrophes, numbers)
  if (!CHARACTER_REGEX.test(line)) {
    return false;
  }

  // Must not be a transition
  if (TRANSITION_REGEX.test(line)) {
    return false;
  }

  // Should not look like a scene heading (even if scene heading detection is disabled)
  if (SCENE_HEADING_REGEX.test(line)) {
    return false;
  }

  // Length constraints
  if (line.length < 2) {
    return false;
  }

  // In strict mode, apply more constraints
  if (strictMode) {
    // Should not be too long (character names are typically short)
    if (line.length > 40) {
      return false;
    }

    // Should not be immediately after another character (no blank line)
    if (state.currentElementType === 'character') {
      return false;
    }

    // Should not be a common all-caps action word
    const commonActionWords = [
      'FADE IN',
      'FADE OUT',
      'THE END',
      'CONTINUED',
      'BACK TO',
      'LATER',
      'MEANWHILE',
    ];
    if (commonActionWords.includes(line)) {
      return false;
    }
  }

  // Context-based validation
  // If we just had a scene heading, this is likely a character name
  if (state.currentElementType === 'scene_heading') {
    return true;
  }

  // If we just had action, this could be a character name
  if (state.currentElementType === 'action') {
    return true;
  }

  // Default to true if all checks pass
  return true;
}

/**
 * Determines if a line is a transition.
 * 
 * Transitions in screenplays are typically uppercase, all on one line, and often
 * end with "TO:" (e.g., "CUT TO:", "DISSOLVE TO:", "FADE TO BLACK:").
 *
 * @param line - The line to test
 * @param strictMode - If true, applies stricter validation rules
 * @returns True if the line appears to be a transition
 *
 * @example
 * ```typescript
 * isTransition('CUT TO:', false)              // true
 * isTransition('FADE TO BLACK:', false)       // true
 * isTransition('DISSOLVE TO:', false)         // true
 * isTransition('John walked to the door', false) // false
 * ```
 */
function isTransition(line: string, strictMode: boolean): boolean {
  // Check against known transition patterns
  if (TRANSITION_REGEX.test(line)) {
    return true;
  }

  // In non-strict mode, check if it matches transition keywords
  if (!strictMode) {
    const upperLine = line.toUpperCase();
    for (const keyword of TRANSITION_KEYWORDS) {
      if (upperLine === keyword || upperLine.endsWith(keyword)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Determines if a line is a page number.
 * 
 * Page numbers can appear in various formats in screenplays such as:
 * - Simple number: "1", "25"
 * - Numbered format: "1.", "(1)", "[1]"
 * - Page notation: "Page 1 of 100"
 *
 * @param line - The line to test
 * @returns True if the line appears to be a page number
 *
 * @example
 * ```typescript
 * isPageNumber('1')              // true
 * isPageNumber('42.')            // true
 * isPageNumber('Page 5 of 120')  // true
 * isPageNumber('INT. ROOM')      // false
 * ```
 */
function isPageNumber(line: string): boolean {
  // Check if line is just a number (possibly with dots)
  if (/^\d+\.?$/.test(line)) {
    return true;
  }

  // Check for page X of Y pattern
  if (/^(page\s+)?\d+(\s+of\s+\d+)?$/i.test(line)) {
    return true;
  }

  // Check for numbered patterns at line start/end
  if (/^(\d+\.|\(\d+\)|\[\d+\])$/.test(line)) {
    return true;
  }

  return false;
}

/**
 * Parses title page lines into key-value pairs.
 * 
 * Extracts common screenplay title page fields such as title, author, credit,
 * source, draft, date, and contact information from a collection of lines.
 *
 * @param lines - Array of lines from the title page
 * @returns Object with title page fields and their values
 *
 * @example
 * ```typescript
 * const titlePage = parseTitlePage([
 *   'My Script',
 *   'Title: My Script',
 *   'Author: John Doe',
 *   'Draft: First Draft',
 * ]);
 * console.log(titlePage.title);  // 'My Script'
 * console.log(titlePage.author); // 'John Doe'
 * ```
 */
function parseTitlePage(lines: string[]): Record<string, string> {
  const titlePage: Record<string, string> = {};

  // Common title page fields
  const fields = ['title', 'author', 'credit', 'source', 'draft', 'date', 'contact'];

  let currentField: string | null = null;
  let currentValue: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if this line is a field name
    let isFieldName = false;
    for (const field of fields) {
      if (lowerLine.startsWith(field) && lowerLine.includes(':')) {
        // Save previous field
        if (currentField && currentValue.length > 0) {
          titlePage[currentField] = currentValue.join(' ').trim();
        }

        // Start new field
        currentField = field;
        currentValue = [line.substring(line.indexOf(':') + 1).trim()];
        isFieldName = true;
        break;
      }
    }

    // If not a field name, add to current value
    if (!isFieldName && currentField) {
      currentValue.push(line);
    } else if (!isFieldName && !currentField) {
      // First lines without field names are likely the title
      if (!titlePage.title) {
        titlePage.title = line;
      } else {
        titlePage.title += ' ' + line;
      }
    }
  }

  // Save last field
  if (currentField && currentValue.length > 0) {
    titlePage[currentField] = currentValue.join(' ').trim();
  }

  return titlePage;
}
