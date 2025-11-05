export interface FountainElement {
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
  text: string;
  metadata?: Record<string, unknown>;
}

export interface FountainDocument {
  elements: FountainElement[];
  titlePage?: Record<string, string>;
  metadata?: {
    convertedFrom: string;
    convertedAt: string;
    pageCount?: number;
  };
}

export interface ConversionOptions {
  preserveFormatting?: boolean;
  detectSceneHeadings?: boolean;
  detectCharacterNames?: boolean;
  includeMetadata?: boolean;
  strictMode?: boolean;
}

export interface ConversionResult {
  success: boolean;
  document?: FountainDocument;
  warnings?: string[];
  errors?: string[];
}