import type { FountainDocument, FountainElement } from '../types/fountain.js';

/**
 * Generates a valid Fountain format string from a FountainDocument.
 *
 * @param document - The structured Fountain document to convert
 * @returns A string containing properly formatted Fountain markup
 *
 * @example
 * ```typescript
 * const doc: FountainDocument = {
 *   elements: [
 *     { type: 'scene_heading', text: 'INT. COFFEE SHOP - DAY' },
 *     { type: 'action', text: 'The room is quiet.' },
 *   ],
 * };
 * const fountain = generateFountain(doc);
 * ```
 */
export function generateFountain(document: FountainDocument): string {
  let output = '';

  // Add title page if present
  if (document.titlePage) {
    output += formatTitlePage(document.titlePage);
    output += '\n\n';
  }

  // Process each element
  for (let i = 0; i < document.elements.length; i++) {
    const element = document.elements[i];
    const prevElement = i > 0 ? document.elements[i - 1] : null;
    
    if (element) {
      output += formatElement(element, prevElement ?? null);
    }
  }

  // Add metadata as a note at the end if present
  if (document.metadata) {
    output += '\n\n';
    output += formatMetadata(document.metadata);
  }

  return output.trim() + '\n';
}

/**
 * Formats the title page section according to Fountain specification.
 * Title page uses key: value format at the beginning of the document.
 *
 * @param titlePage - Key-value pairs for title page information
 * @returns Formatted title page string
 */
function formatTitlePage(titlePage: Record<string, string>): string {
  let output = '';

  for (const [key, value] of Object.entries(titlePage)) {
    // Title page keys should be capitalized
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
    output += `${formattedKey}: ${value}\n`;
  }

  return output;
}

/**
 * Formats a single Fountain element based on its type.
 *
 * @param element - The element to format
 * @param prevElement - The previous element (for context-aware spacing)
 * @returns Formatted string for this element
 */
function formatElement(element: FountainElement, prevElement: FountainElement | null): string {
  let output = '';

  // Add appropriate spacing before element
  output += getSpacingBefore(element, prevElement);

  switch (element.type) {
    case 'scene_heading':
      output += formatSceneHeading(element);
      break;
    case 'action':
      output += formatAction(element);
      break;
    case 'character':
      output += formatCharacter(element);
      break;
    case 'dialogue':
      output += formatDialogue(element);
      break;
    case 'parenthetical':
      output += formatParenthetical(element);
      break;
    case 'transition':
      output += formatTransition(element);
      break;
    case 'page_break':
      output += formatPageBreak();
      break;
    case 'note':
      output += formatNote(element);
      break;
    case 'section':
      output += formatSection(element);
      break;
    case 'synopsis':
      output += formatSynopsis(element);
      break;
    case 'title_page':
      // Title page elements shouldn't appear in the body
      // But if they do, just output as action
      output += formatAction(element);
      break;
    default:
      // Fallback for unknown types
      output += element.text + '\n';
  }

  return output;
}

/**
 * Determines the appropriate spacing before an element.
 *
 * @param element - Current element
 * @param prevElement - Previous element
 * @returns Spacing string (newlines)
 */
function getSpacingBefore(element: FountainElement, prevElement: FountainElement | null): string {
  if (!prevElement) {
    return '';
  }

  const { type } = element;
  const prevType = prevElement.type;

  // Scene headings need blank line before (unless it's the first element)
  if (type === 'scene_heading') {
    return '\n\n';
  }

  // Character names need blank line before (unless after another character/parenthetical/dialogue)
  if (type === 'character') {
    if (prevType === 'dialogue' || prevType === 'parenthetical') {
      return '\n\n';
    }
    if (prevType !== 'character') {
      return '\n\n';
    }
  }

  // Dialogue follows character immediately (single line break)
  if (type === 'dialogue' && prevType === 'character') {
    return '\n';
  }

  // Parenthetical follows dialogue or character immediately
  if (type === 'parenthetical') {
    return '\n';
  }

  // Dialogue after parenthetical
  if (type === 'dialogue' && prevType === 'parenthetical') {
    return '\n';
  }

  // Action needs blank line before (unless after scene heading)
  if (type === 'action') {
    if (prevType === 'scene_heading') {
      return '\n\n';
    }
    if (prevType === 'action') {
      // Consecutive action lines can be single-spaced if they're part of the same paragraph
      // For now, we'll use double spacing as a safe default
      return '\n\n';
    }
    return '\n\n';
  }

  // Transitions need blank line
  if (type === 'transition') {
    return '\n\n';
  }

  // Default: blank line
  return '\n\n';
}

/**
 * Formats a scene heading.
 * Scene headings in Fountain start with INT, EXT, INT./EXT., or I/E
 */
function formatSceneHeading(element: FountainElement): string {
  // Scene headings are written as-is
  // Force them to start with proper prefix if needed
  let text = element.text.trim();
  
  // Check if it already has a scene heading prefix
  const hasPrefix = /^(INT\.?|EXT\.?|INT\.?\/EXT\.?|I\.?\/E\.?)\s/i.test(text);
  
  if (!hasPrefix) {
    // Force it to be recognized as scene heading with leading period
    text = '.' + text;
  }
  
  return text + '\n';
}

/**
 * Formats an action/description line.
 */
function formatAction(element: FountainElement): string {
  return element.text.trim() + '\n';
}

/**
 * Formats a character name.
 * Character names should be in ALL CAPS.
 */
function formatCharacter(element: FountainElement): string {
  let text = element.text.trim();
  
  // Ensure character name is uppercase
  text = text.toUpperCase();
  
  return text + '\n';
}

/**
 * Formats dialogue.
 */
function formatDialogue(element: FountainElement): string {
  return element.text.trim() + '\n';
}

/**
 * Formats a parenthetical.
 * Parentheticals should be wrapped in parentheses.
 */
function formatParenthetical(element: FountainElement): string {
  let text = element.text.trim();
  
  // Ensure it's wrapped in parentheses
  if (!text.startsWith('(')) {
    text = '(' + text;
  }
  if (!text.endsWith(')')) {
    text = text + ')';
  }
  
  return text + '\n';
}

/**
 * Formats a transition.
 * Transitions should be in ALL CAPS and end with TO:
 * They need to be forced with > prefix in Fountain.
 */
function formatTransition(element: FountainElement): string {
  let text = element.text.trim().toUpperCase();
  
  // Force transition with > prefix
  if (!text.startsWith('>')) {
    text = '> ' + text;
  }
  
  return text + '\n';
}

/**
 * Formats a page break.
 * In Fountain, page breaks are represented by ===
 */
function formatPageBreak(): string {
  return '===\n';
}

/**
 * Formats a note.
 * Notes in Fountain are wrapped in [[ ]]
 */
function formatNote(element: FountainElement): string {
  let text = element.text.trim();
  
  // Ensure it's wrapped in double brackets
  if (!text.startsWith('[[')) {
    text = '[[' + text;
  }
  if (!text.endsWith(']]')) {
    text = text + ']]';
  }
  
  return text + '\n';
}

/**
 * Formats a section heading.
 * Sections in Fountain start with # (more # for deeper levels)
 */
function formatSection(element: FountainElement): string {
  let text = element.text.trim();
  
  // Ensure it starts with #
  if (!text.startsWith('#')) {
    text = '# ' + text;
  }
  
  return text + '\n';
}

/**
 * Formats a synopsis.
 * Synopsis lines in Fountain start with =
 */
function formatSynopsis(element: FountainElement): string {
  let text = element.text.trim();
  
  // Ensure it starts with =
  if (!text.startsWith('=')) {
    text = '= ' + text;
  }
  
  return text + '\n';
}

/**
 * Formats document metadata as a note at the end.
 */
function formatMetadata(metadata: {
  convertedFrom: string;
  convertedAt: string;
  pageCount?: number;
}): string {
  let text = '[[Converted from PDF: ' + metadata.convertedFrom;
  text += '\nConversion date: ' + metadata.convertedAt;
  
  if (metadata.pageCount) {
    text += '\nOriginal page count: ' + metadata.pageCount;
  }
  
  text += ']]';
  
  return text + '\n';
}
