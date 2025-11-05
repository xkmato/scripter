/**
 * Represents a single element in a Fountain screenplay document.
 * 
 * Each element has a type that determines how it should be formatted
 * and a text content. Optional metadata can be attached for additional information.
 */
export interface FountainElement {
  /**
   * The type of screenplay element.
   * 
   * - `scene_heading`: Location and time of day (e.g., "INT. COFFEE SHOP - DAY")
   * - `action`: Narrative description of what happens
   * - `character`: Name of the character speaking (all caps)
   * - `dialogue`: What a character says
   * - `parenthetical`: Stage direction for the character (e.g., "(angrily)")
   * - `transition`: How one scene changes to another (e.g., "CUT TO:")
   * - `page_break`: Explicit page break marker
   * - `note`: Annotation for the script (wrapped in [[brackets]])
   * - `section`: Section heading (for organizing the script)
   * - `synopsis`: Brief description of the scene
   * - `title_page`: Title page content
   */
  type:
    | 'scene_heading'
    | 'action'
    | 'character'
    | 'dialogue'
    | 'parenthetical'
    | 'transition'
    | 'page_break'
    | 'note'
    | 'section'
    | 'synopsis'
    | 'title_page';
  
  /** The text content of the element */
  text: string;
  
  /** Optional metadata associated with the element */
  metadata?: Record<string, unknown>;
}

/**
 * Represents a complete Fountain screenplay document.
 * 
 * This is the structured representation of a screenplay that can be
 * converted to valid Fountain format text.
 */
export interface FountainDocument {
  /** Array of screenplay elements in order */
  elements: FountainElement[];
  
  /**
   * Optional title page information as key-value pairs.
   * 
   * Common keys include: "title", "author", "credit", "source", "draft", "date", "contact"
   */
  titlePage?: Record<string, string>;
  
  /**
   * Optional metadata about the conversion process
   */
  metadata?: {
    /** Title or name of the source PDF */
    convertedFrom: string;
    /** ISO timestamp when the conversion occurred */
    convertedAt: string;
    /** Number of pages in the original PDF */
    pageCount?: number;
  };
}

/**
 * Configuration options for controlling the conversion process.
 * 
 * These options allow fine-tuning how the PDF text is parsed and
 * interpreted as screenplay elements.
 */
export interface ConversionOptions {
  /**
   * Whether to preserve original formatting (indentation, spacing) from the PDF.
   * @default true
   */
  preserveFormatting?: boolean;
  
  /**
   * Whether to automatically detect scene headings.
   * If false, no scene headings will be identified.
   * @default true
   */
  detectSceneHeadings?: boolean;
  
  /**
   * Whether to automatically detect character names.
   * If false, no character names will be identified.
   * @default true
   */
  detectCharacterNames?: boolean;
  
  /**
   * Whether to include metadata about the conversion in the output.
   * @default true
   */
  includeMetadata?: boolean;
  
  /**
   * Whether to use strict parsing mode.
   * In strict mode, additional validation rules are applied to element detection,
   * resulting in fewer false positives but potentially missing some valid elements.
   * @default false
   */
  strictMode?: boolean;
}

/**
 * Result of a PDF to Fountain conversion attempt.
 * 
 * Always check the `success` field first to determine if the conversion succeeded.
 * If successful, the `document` field will contain the converted screenplay.
 * If unsuccessful, the `errors` field will contain error messages.
 */
export interface ConversionResult {
  /** Whether the conversion succeeded */
  success: boolean;
  
  /** The converted Fountain document (only present if success is true) */
  document?: FountainDocument;
  
  /** Array of warnings generated during conversion (non-fatal issues) */
  warnings?: string[];
  
  /** Array of errors encountered during conversion (only present if success is false) */
  errors?: string[];
}