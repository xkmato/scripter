# Scripter: PDF to Fountain Converter - Development Tasks

## Project Overview

Transform the scripter project into a TypeScript library that converts PDF screenplays to .fountain format, with both programmatic API and CLI support.

---

## Phase 1: Project Setup & Architecture

### Task 1.1: Configure Project Structure

**Priority:** High  
**Estimated Time:** 1-2 hours  
**Dependencies:** None

**Description:**  
Set up the proper directory structure for a TypeScript library with CLI support.

**Implementation Details:**

- Create the following directory structure:
  ```
  src/
    lib/           # Core library code
    cli/           # CLI-specific code
    types/         # TypeScript type definitions
    utils/         # Shared utilities
  tests/
    unit/          # Unit tests
    integration/   # Integration tests
    fixtures/      # Test PDF files and expected outputs
  dist/            # Compiled output (gitignored)
  ```
- Update `.gitignore` to include `dist/`, `*.log`, and `.DS_Store`
- Create a `README.md` with basic project information

**Acceptance Criteria:**

- [x] All directories exist and are properly organized
- [x] `.gitignore` is configured
- [x] Basic README exists with project description

**Status:** Completed ✅

---

### Task 1.2: Update Package Configuration

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** Task 1.1

**Description:**  
Update `package.json` and `tsconfig.json` to support library and CLI functionality.

**Implementation Details:**

- In `package.json`:
  - Add `"type": "module"` for ESM support
  - Set `"main": "./dist/lib/index.js"` for library entry point
  - Set `"types": "./dist/lib/index.d.ts"` for TypeScript types
  - Add `"bin": { "scripter": "./dist/cli/index.js" }` for CLI
  - Add `"exports"` field for proper module resolution:
    ```json
    "exports": {
      ".": {
        "import": "./dist/lib/index.js",
        "types": "./dist/lib/index.d.ts"
      }
    }
    ```
  - Add scripts:
    - `"build": "tsc"`
    - `"dev": "tsc --watch"`
    - `"test": "vitest"`
    - `"test:watch": "vitest --watch"`
    - `"lint": "eslint src --ext .ts"`
    - `"format": "prettier --write \"src/**/*.ts\""`
  - Add `"files": ["dist", "README.md", "LICENSE"]`

- In `tsconfig.json`:
  - Uncomment and set `"rootDir": "./src"`
  - Uncomment and set `"outDir": "./dist"`
  - Add `"lib": ["esnext"]` to compilerOptions
  - Add `"types": ["node"]` to compilerOptions
  - Add `"include": ["src/**/*"]`
  - Add `"exclude": ["node_modules", "dist", "tests"]`

**Acceptance Criteria:**

- [x] Package configuration supports both library and CLI usage
- [x] TypeScript compiles to `dist/` directory
- [x] Module resolution works correctly

**Status:** Completed ✅

---

### Task 1.3: Install Core Dependencies

**Priority:** High  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 1.2

**Description:**  
Install all necessary dependencies for PDF parsing, CLI functionality, and testing.

**Implementation Details:**

- Install production dependencies:
  - `pdf-parse` or `pdfjs-dist` - PDF text extraction
  - `commander` - CLI framework
  - `chalk` - Terminal styling
  - `ora` - Loading spinners for CLI

- Install development dependencies:
  - `vitest` - Testing framework
  - `@vitest/ui` - Test UI
  - `eslint` - Linting
  - `@typescript-eslint/eslint-plugin` - TypeScript ESLint rules
  - `@typescript-eslint/parser` - TypeScript parser for ESLint
  - `prettier` - Code formatting
  - `@types/pdf-parse` - Type definitions (if using pdf-parse)

**Commands:**

```bash
npm install pdf-parse commander chalk ora
npm install -D vitest @vitest/ui eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier @types/pdf-parse
```

**Acceptance Criteria:**

- All dependencies are installed and listed in `package.json`
- No installation errors occur
- Type definitions are available for all packages

**Status:** Completed ✅

---

### Task 1.4: Create ESLint and Prettier Configuration

**Priority:** Medium  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 1.3

**Description:**  
Set up code quality and formatting tools to maintain consistent code style.

**Implementation Details:**

- Create `.eslintrc.json`:

  ```json
  {
    "parser": "@typescript-eslint/parser",
    "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
    "plugins": ["@typescript-eslint"],
    "env": {
      "node": true,
      "es2022": true
    },
    "parserOptions": {
      "ecmaVersion": "latest",
      "sourceType": "module"
    },
    "rules": {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-function-return-type": "warn"
    }
  }
  ```

- Create `.prettierrc.json`:

  ```json
  {
    "semi": true,
    "trailingComma": "es5",
    "singleQuote": true,
    "printWidth": 100,
    "tabWidth": 2
  }
  ```

- Create `.prettierignore`:
  ```
  node_modules
  dist
  coverage
  ```

**Acceptance Criteria:**

- ESLint runs without errors
- Prettier formats code consistently
- Configuration files are committed to repository

**Status:** Completed ✅

## Phase 2: Core Library Implementation

### Task 2.1: Define TypeScript Types and Interfaces

**Priority:** High  
**Estimated Time:** 2 hours  
**Dependencies:** Task 1.2

**Status:** Completed ✅

**Description:**  
Create comprehensive type definitions for the library's data structures and API.

**Implementation Details:**

- Create `src/types/fountain.ts` with Fountain format types:

  ```typescript
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
  ```

- Create `src/types/pdf.ts`:

  ```typescript
  export interface PDFContent {
    text: string;
    pages: PDFPage[];
    metadata?: Record<string, unknown>;
  }

  export interface PDFPage {
    pageNumber: number;
    text: string;
    lines: string[];
  }
  ```

**Acceptance Criteria:**

- All types compile without errors
- Types accurately represent Fountain format specification
- Types are exported from main type definition file

---

### Task 2.2: Implement PDF Reader Module

**Priority:** High  
**Estimated Time:** 3-4 hours  
**Dependencies:** Task 1.3, Task 2.1

**Status:** Completed ✅

**Description:**  
Create a module to extract text content from PDF files while preserving structure.

**Implementation Details:**

- Create `src/lib/pdf-reader.ts`:
  - Export async function `readPDF(filePath: string): Promise<PDFContent>`
  - Use `pdf-parse` library to extract text
  - Parse text into pages and lines
  - Preserve whitespace and indentation where possible
  - Extract PDF metadata (title, author, etc.)
  - Handle errors gracefully (file not found, corrupt PDF, etc.)

- Implementation outline:

  ```typescript
  import fs from 'fs/promises';
  import pdfParse from 'pdf-parse';
  import type { PDFContent, PDFPage } from '../types/pdf.js';

  export async function readPDF(filePath: string): Promise<PDFContent> {
    // Read file buffer
    // Parse with pdf-parse
    // Structure data into PDFContent format
    // Return structured content
  }
  ```

**Edge Cases to Handle:**

- Invalid file paths
- Corrupted PDF files
- Password-protected PDFs (return error)
- Empty PDFs
- Very large PDFs (memory considerations)

**Acceptance Criteria:**

- Function successfully reads PDF files
- Text is extracted with preserved structure
- Errors are thrown with descriptive messages
- Unit tests cover success and error cases

---

### Task 2.3: Implement Fountain Format Generator

**Priority:** High  
**Estimated Time:** 3-4 hours  
**Dependencies:** Task 2.1

**Description:**  
Create a module to convert structured screenplay elements into valid Fountain format text.

**Implementation Details:**

- Create `src/lib/fountain-generator.ts`:
  - Export function `generateFountain(document: FountainDocument): string`
  - Convert FountainElement arrays to properly formatted Fountain text
  - Follow Fountain specification strictly:
    - Scene headings: Start with INT., EXT., or similar
    - Character names: ALL CAPS, centered (blank line before)
    - Dialogue: Follows character name
    - Parentheticals: (in parentheses) between character and dialogue
    - Action: Regular text with blank lines for separation
    - Transitions: Right-aligned, ALL CAPS, ends with TO:
    - Notes: [[Double brackets]]
- Implementation outline:

  ```typescript
  import type { FountainDocument, FountainElement } from '../types/fountain.js';

  export function generateFountain(document: FountainDocument): string {
    let output = '';

    // Add title page if present
    if (document.titlePage) {
      output += formatTitlePage(document.titlePage);
    }

    // Process each element
    for (const element of document.elements) {
      output += formatElement(element);
    }

    return output;
  }

  function formatElement(element: FountainElement): string {
    // Format based on element type
  }
  ```

**Acceptance Criteria:**

- Output conforms to Fountain specification
- All element types are properly formatted
- Generated files can be opened in Fountain-compatible software
- Unit tests verify correct formatting for each element type

---

### Task 2.4: Implement Screenplay Parser

**Priority:** High  
**Estimated Time:** 6-8 hours  
**Dependencies:** Task 2.1, Task 2.2

**Description:**  
Create the core parsing logic to analyze PDF text and identify screenplay elements.

**Implementation Details:**

- Create `src/lib/screenplay-parser.ts`:
  - Export function `parseScreenplay(pdfContent: PDFContent, options: ConversionOptions): FountainDocument`
  - Implement heuristics to identify:
    - **Scene Headings**: Lines starting with INT., EXT., INT./EXT., I/E, followed by period or space
    - **Character Names**: All caps lines (no lowercase), typically centered, not too long
    - **Dialogue**: Text following character name, indented or following pattern
    - **Parentheticals**: Text in parentheses between character and dialogue
    - **Action**: Regular description text between other elements
    - **Transitions**: Right-aligned, ALL CAPS, often ending with TO:
    - **Title Page**: First page content before first scene heading
- Pattern matching considerations:

  ```typescript
  const SCENE_HEADING_REGEX = /^(INT\.?|EXT\.?|INT\.?\/EXT\.?|I\.?\/E\.?)\s+/i;
  const CHARACTER_REGEX = /^[A-Z][A-Z\s]*(?:\s*\([^)]+\))?$/;
  const TRANSITION_REGEX = /^[A-Z\s]+TO:$/;
  const PARENTHETICAL_REGEX = /^\([^)]+\)$/;
  ```

- Context-aware parsing:
  - Track state (expecting dialogue after character name)
  - Use indentation hints when available
  - Look for blank line patterns
  - Confidence scoring for ambiguous cases

**Edge Cases:**

- All-caps action lines (differentiate from character names)
- Scene headings without standard prefixes
- Dual dialogue
- Notes and comments
- Page numbers and headers/footers

**Acceptance Criteria:**

- Parser correctly identifies at least 90% of elements in test PDFs
- Ambiguous cases have sensible defaults
- Configurable via ConversionOptions
- Comprehensive unit tests for each element type
- Integration tests with real screenplay PDFs

---

### Task 2.5: Implement Main Converter Module

**Priority:** High  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 2.2, Task 2.3, Task 2.4

**Description:**  
Create the main API that orchestrates the conversion process from PDF to Fountain.

**Implementation Details:**

- Create `src/lib/converter.ts`:

  ```typescript
  import { readPDF } from './pdf-reader.js';
  import { parseScreenplay } from './screenplay-parser.js';
  import { generateFountain } from './fountain-generator.js';
  import type { ConversionOptions, ConversionResult } from '../types/fountain.js';

  export async function convertPDFToFountain(
    pdfPath: string,
    options: ConversionOptions = {}
  ): Promise<ConversionResult> {
    try {
      // 1. Read PDF
      const pdfContent = await readPDF(pdfPath);

      // 2. Parse screenplay elements
      const document = parseScreenplay(pdfContent, options);

      // 3. Generate Fountain format
      const fountainText = generateFountain(document);

      // 4. Return result with metadata
      return {
        success: true,
        document,
        warnings: [], // Collect warnings during parsing
      };
    } catch (error) {
      return {
        success: false,
        errors: [error.message],
      };
    }
  }
  ```

- Create `src/lib/index.ts` as main library export:
  ```typescript
  export { convertPDFToFountain } from './converter.js';
  export { generateFountain } from './fountain-generator.js';
  export { readPDF } from './pdf-reader.js';
  export { parseScreenplay } from './screenplay-parser.js';
  export * from '../types/fountain.js';
  export * from '../types/pdf.js';
  ```

**Acceptance Criteria:**

- Main API is easy to use with sensible defaults
- Errors are caught and returned in structured format
- Warnings are collected for user feedback
- Library can be imported and used programmatically
- Integration test demonstrates end-to-end conversion

---

### Task 2.6: Add File Writing Utilities

**Priority:** Medium  
**Estimated Time:** 1 hour  
**Dependencies:** Task 2.5

**Description:**  
Create utility functions for writing Fountain content to files.

**Implementation Details:**

- Create `src/utils/file-writer.ts`:

  ```typescript
  import fs from 'fs/promises';
  import path from 'path';

  export async function writeFountainFile(outputPath: string, content: string): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Write file with UTF-8 encoding
    await fs.writeFile(outputPath, content, 'utf-8');
  }

  export function generateOutputPath(inputPath: string, outputDir?: string): string {
    const basename = path.basename(inputPath, path.extname(inputPath));
    const outputName = `${basename}.fountain`;
    return outputDir ? path.join(outputDir, outputName) : outputName;
  }
  ```

**Acceptance Criteria:**

- Files are written with correct encoding
- Output directories are created if needed
- Path generation handles edge cases (no extension, etc.)
- Unit tests verify file writing behavior

---

## Phase 3: CLI Implementation

### Task 3.1: Create CLI Framework

**Priority:** High  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 2.5, Task 2.6

**Description:**  
Implement the command-line interface using Commander.js with a clean user experience.

**Implementation Details:**

- Create `src/cli/index.ts`:

  ```typescript
  #!/usr/bin/env node
  import { Command } from 'commander';
  import { convertCommand } from './commands/convert.js';
  import { version, description } from '../../package.json' assert { type: 'json' };

  const program = new Command();

  program.name('scripter').description(description).version(version);

  program
    .command('convert')
    .description('Convert PDF screenplay to Fountain format')
    .argument('<input>', 'Path to input PDF file')
    .option('-o, --output <path>', 'Output file path (default: same name with .fountain extension)')
    .option('-d, --output-dir <dir>', 'Output directory')
    .option('--no-scene-detection', 'Disable automatic scene heading detection')
    .option('--no-character-detection', 'Disable automatic character name detection')
    .option('--strict', 'Enable strict parsing mode')
    .option('--no-metadata', 'Exclude conversion metadata')
    .action(convertCommand);

  program.parse();
  ```

- Add shebang line for executable usage
- Handle process exit codes appropriately
- Catch and display errors gracefully

**Acceptance Criteria:**

- CLI runs with `npx scripter` or after `npm link`
- Help text is clear and informative
- Version command works
- Options are properly parsed

---

### Task 3.2: Implement Convert Command

**Priority:** High  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 3.1

**Description:**  
Implement the main convert command with progress feedback and error handling.

**Implementation Details:**

- Create `src/cli/commands/convert.ts`:

  ```typescript
  import chalk from 'chalk';
  import ora from 'ora';
  import { convertPDFToFountain } from '../../lib/converter.js';
  import { generateFountain } from '../../lib/fountain-generator.js';
  import { writeFountainFile, generateOutputPath } from '../../utils/file-writer.js';
  import type { ConversionOptions } from '../../types/fountain.js';

  interface ConvertOptions {
    output?: string;
    outputDir?: string;
    sceneDetection: boolean;
    characterDetection: boolean;
    strict: boolean;
    metadata: boolean;
  }

  export async function convertCommand(input: string, options: ConvertOptions): Promise<void> {
    const spinner = ora('Reading PDF...').start();

    try {
      // Build conversion options
      const conversionOptions: ConversionOptions = {
        detectSceneHeadings: options.sceneDetection,
        detectCharacterNames: options.characterDetection,
        strictMode: options.strict,
        includeMetadata: options.metadata,
      };

      // Convert
      spinner.text = 'Converting to Fountain format...';
      const result = await convertPDFToFountain(input, conversionOptions);

      if (!result.success) {
        spinner.fail('Conversion failed');
        console.error(chalk.red('Errors:'));
        result.errors?.forEach((err) => console.error(chalk.red(`  - ${err}`)));
        process.exit(1);
      }

      // Generate output
      spinner.text = 'Generating Fountain file...';
      const fountainText = generateFountain(result.document!);

      // Determine output path
      const outputPath = options.output || generateOutputPath(input, options.outputDir);

      // Write file
      spinner.text = 'Writing file...';
      await writeFountainFile(outputPath, fountainText);

      spinner.succeed(chalk.green(`Converted successfully: ${outputPath}`));

      // Display warnings if any
      if (result.warnings && result.warnings.length > 0) {
        console.log(chalk.yellow('\nWarnings:'));
        result.warnings.forEach((warn) => console.log(chalk.yellow(`  - ${warn}`)));
      }
    } catch (error) {
      spinner.fail('Conversion failed');
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }
  ```

**User Experience Features:**

- Spinner shows progress
- Colored output (success in green, errors in red, warnings in yellow)
- Clear error messages
- Summary of conversion (page count, element counts, etc.)

**Acceptance Criteria:**

- Command converts PDF to Fountain successfully
- Progress is displayed during conversion
- Errors are user-friendly
- Output file is created in expected location
- Exit codes are appropriate (0 for success, 1 for error)

---

### Task 3.3: Add Batch Conversion Support

**Priority:** Low  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 3.2

**Description:**  
Add ability to convert multiple PDF files at once using glob patterns.

**Implementation Details:**

- Install `fast-glob` dependency
- Add batch command to CLI:

  ```typescript
  program
    .command('batch')
    .description('Convert multiple PDF files to Fountain format')
    .argument('<pattern>', 'Glob pattern for PDF files (e.g., "scripts/*.pdf")')
    .option('-o, --output-dir <dir>', 'Output directory (required)', process.cwd())
    .option('--continue-on-error', 'Continue processing if a file fails')
    .action(batchCommand);
  ```

- Create `src/cli/commands/batch.ts`:
  - Find files matching glob pattern
  - Convert each file
  - Display progress (e.g., "Converting 3/10...")
  - Summary report at end (successes, failures, warnings)

**Acceptance Criteria:**

- Multiple files can be converted in one command
- Progress shows current file being processed
- Errors in one file don't stop entire batch (with --continue-on-error)
- Summary report shows overall results

---

## Phase 4: Testing

### Task 4.1: Create Test Fixtures

**Priority:** High  
**Estimated Time:** 2 hours  
**Dependencies:** Task 1.1

**Description:**  
Prepare test PDF files and expected Fountain outputs for automated testing.

**Implementation Details:**

- Create `tests/fixtures/` directory structure:

  ```
  tests/fixtures/
    pdfs/
      simple-scene.pdf        # Single scene
      full-screenplay.pdf     # Complete screenplay
      edge-cases.pdf          # Unusual formatting
      invalid.pdf             # Corrupted file
    expected/
      simple-scene.fountain
      full-screenplay.fountain
      edge-cases.fountain
  ```

- Create small test PDFs programmatically or use public domain screenplays
- Write corresponding expected `.fountain` outputs
- Document what each fixture tests

**Test Coverage:**

- Simple single scene
- Multiple scenes with action and dialogue
- Parentheticals
- Transitions
- Title page
- Edge cases (all-caps action, unusual indentation)
- Invalid/corrupted files

**Acceptance Criteria:**

- At least 5 test PDF files exist
- Expected outputs are accurate
- Fixtures cover common and edge cases
- README in fixtures directory explains each file

---

### Task 4.2: Write Unit Tests for PDF Reader

**Priority:** High  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 2.2, Task 4.1

**Description:**  
Create comprehensive unit tests for the PDF reading functionality.

**Implementation Details:**

- Create `tests/unit/pdf-reader.test.ts`:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { readPDF } from '../../src/lib/pdf-reader.js';
  import path from 'path';

  describe('PDF Reader', () => {
    it('should read a valid PDF file', async () => {
      const pdfPath = path.join(__dirname, '../fixtures/pdfs/simple-scene.pdf');
      const result = await readPDF(pdfPath);

      expect(result.text).toBeDefined();
      expect(result.pages.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent file', async () => {
      await expect(readPDF('nonexistent.pdf')).rejects.toThrow();
    });

    it('should extract text preserving line breaks', async () => {
      // Test that text structure is preserved
    });

    it('should handle empty PDFs', async () => {
      // Test empty PDF handling
    });
  });
  ```

**Test Cases:**

- Valid PDF reading
- File not found error
- Corrupted PDF error
- Empty PDF handling
- Text structure preservation
- Metadata extraction

**Acceptance Criteria:**

- All tests pass
- Code coverage > 80% for pdf-reader module
- Edge cases are tested
- Async operations are properly tested

---

### Task 4.3: Write Unit Tests for Screenplay Parser

**Priority:** High  
**Estimated Time:** 4-5 hours  
**Dependencies:** Task 2.4, Task 4.1

**Description:**  
Create comprehensive unit tests for screenplay parsing logic.

**Implementation Details:**

- Create `tests/unit/screenplay-parser.test.ts`:

  ```typescript
  import { describe, it, expect } from 'vitest';
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

        expect(result.elements[0].type).toBe('scene_heading');
        expect(result.elements[0].text).toBe('INT. COFFEE SHOP - DAY');
      });

      it('should detect EXT. scene headings', () => {
        // Similar test for EXT.
      });

      it('should detect INT./EXT. scene headings', () => {
        // Test combined scene headings
      });
    });

    describe('Character Name Detection', () => {
      it('should detect all-caps character names', () => {
        // Test character detection
      });

      it('should not confuse action with character names', () => {
        // Test that all-caps action isn't misidentified
      });
    });

    describe('Dialogue Detection', () => {
      it('should associate dialogue with preceding character', () => {
        // Test dialogue grouping
      });

      it('should detect parentheticals within dialogue', () => {
        // Test parenthetical handling
      });
    });

    // More test suites for each element type
  });
  ```

**Test Categories:**

- Scene heading detection (all variations)
- Character name detection
- Dialogue and parenthetical detection
- Action line detection
- Transition detection
- Edge cases (ambiguous formatting)
- Configuration options (strict mode, detection toggles)

**Acceptance Criteria:**

- All tests pass
- Code coverage > 85% for parser module
- Each element type has dedicated tests
- Edge cases are thoroughly tested
- Configuration options are tested

---

### Task 4.4: Write Unit Tests for Fountain Generator

**Priority:** High  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 2.3, Task 4.1

**Description:**  
Create unit tests to verify Fountain format output is correct and spec-compliant.

**Implementation Details:**

- Create `tests/unit/fountain-generator.test.ts`:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { generateFountain } from '../../src/lib/fountain-generator.js';
  import type { FountainDocument, FountainElement } from '../../src/types/fountain.js';

  describe('Fountain Generator', () => {
    it('should format scene headings correctly', () => {
      const doc: FountainDocument = {
        elements: [{ type: 'scene_heading', text: 'INT. ROOM - DAY' }],
      };

      const result = generateFountain(doc);
      expect(result).toContain('INT. ROOM - DAY');
    });

    it('should format character and dialogue correctly', () => {
      const doc: FountainDocument = {
        elements: [
          { type: 'character', text: 'JOHN' },
          { type: 'dialogue', text: 'Hello, world!' },
        ],
      };

      const result = generateFountain(doc);
      expect(result).toMatch(/JOHN\s+Hello, world!/);
    });

    it('should include proper spacing between elements', () => {
      // Test blank line insertion
    });

    // More tests for each element type
  });
  ```

**Test Cases:**

- Scene heading formatting
- Character name formatting
- Dialogue formatting
- Parenthetical formatting
- Action formatting
- Transition formatting
- Title page formatting
- Proper spacing and line breaks
- Special characters handling

**Acceptance Criteria:**

- All tests pass
- Code coverage > 85% for generator module
- Output conforms to Fountain specification
- Formatting is verified programmatically

---

### Task 4.5: Write Integration Tests

**Priority:** High  
**Estimated Time:** 3-4 hours  
**Dependencies:** Task 2.5, Task 4.1

**Description:**  
Create end-to-end integration tests that verify the complete conversion pipeline.

**Implementation Details:**

- Create `tests/integration/converter.test.ts`:

  ```typescript
  import { describe, it, expect } from 'vitest';
  import { convertPDFToFountain } from '../../src/lib/converter.js';
  import { generateFountain } from '../../src/lib/fountain-generator.js';
  import fs from 'fs/promises';
  import path from 'path';

  describe('PDF to Fountain Conversion', () => {
    it('should convert a simple screenplay PDF', async () => {
      const pdfPath = path.join(__dirname, '../fixtures/pdfs/simple-scene.pdf');
      const expectedPath = path.join(__dirname, '../fixtures/expected/simple-scene.fountain');

      const result = await convertPDFToFountain(pdfPath);
      expect(result.success).toBe(true);

      const fountainText = generateFountain(result.document!);
      const expected = await fs.readFile(expectedPath, 'utf-8');

      // Compare outputs (may need fuzzy matching for whitespace)
      expect(normalizeWhitespace(fountainText)).toBe(normalizeWhitespace(expected));
    });

    it('should convert a full screenplay with all elements', async () => {
      // Test with more complex screenplay
    });

    it('should handle edge cases gracefully', async () => {
      // Test with edge-cases.pdf
    });

    it('should respect conversion options', async () => {
      // Test that options affect output
    });

    it('should return errors for invalid PDFs', async () => {
      const result = await convertPDFToFountain('invalid.pdf');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
  ```

**Test Scenarios:**

- Simple screenplay conversion
- Complex screenplay with all element types
- Edge cases and unusual formatting
- Configuration options
- Error handling (invalid files)
- Performance (large files)

**Acceptance Criteria:**

- All integration tests pass
- End-to-end conversion is verified
- Test fixtures match expected outputs
- Edge cases are handled correctly
- Performance is acceptable (< 5s for typical screenplay)

---

### Task 4.6: Write CLI Tests

**Priority:** Medium  
**Estimated Time:** 2-3 hours  
**Dependencies:** Task 3.2, Task 4.1

**Description:**  
Create tests for CLI commands to verify user-facing functionality.

**Implementation Details:**

- Create `tests/integration/cli.test.ts`:

  ```typescript
  import { describe, it, expect, beforeEach, afterEach } from 'vitest';
  import { exec } from 'child_process';
  import { promisify } from 'util';
  import fs from 'fs/promises';
  import path from 'path';

  const execAsync = promisify(exec);

  describe('CLI Commands', () => {
    const testOutputDir = path.join(__dirname, '../temp');

    beforeEach(async () => {
      await fs.mkdir(testOutputDir, { recursive: true });
    });

    afterEach(async () => {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    });

    it('should display help text', async () => {
      const { stdout } = await execAsync('node dist/cli/index.js --help');
      expect(stdout).toContain('scripter');
      expect(stdout).toContain('convert');
    });

    it('should display version', async () => {
      const { stdout } = await execAsync('node dist/cli/index.js --version');
      expect(stdout).toMatch(/\d+\.\d+\.\d+/);
    });

    it('should convert PDF via CLI', async () => {
      const inputPath = path.join(__dirname, '../fixtures/pdfs/simple-scene.pdf');
      const outputPath = path.join(testOutputDir, 'output.fountain');

      await execAsync(`node dist/cli/index.js convert "${inputPath}" -o "${outputPath}"`);

      const fileExists = await fs
        .access(outputPath)
        .then(() => true)
        .catch(() => false);
      expect(fileExists).toBe(true);

      const content = await fs.readFile(outputPath, 'utf-8');
      expect(content).toContain('INT.'); // Basic validation
    });

    it('should handle errors gracefully', async () => {
      try {
        await execAsync('node dist/cli/index.js convert nonexistent.pdf');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(error.code).toBe(1);
      }
    });
  });
  ```

**Test Cases:**

- Help command
- Version command
- Convert command (success case)
- Convert with options
- Error handling
- Output path handling

**Acceptance Criteria:**

- CLI tests pass
- Commands produce expected outputs
- Error codes are correct
- Help text is validated

---

### Task 4.7: Set Up Vitest Configuration

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** Task 1.3

**Description:**  
Configure Vitest for optimal testing experience with coverage reporting.

**Implementation Details:**

- Create `vitest.config.ts`:

  ```typescript
  import { defineConfig } from 'vitest/config';

  export default defineConfig({
    test: {
      globals: true,
      environment: 'node',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'dist/', 'tests/', '**/*.test.ts', '**/*.config.ts'],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 75,
          statements: 80,
        },
      },
      include: ['tests/**/*.test.ts'],
    },
  });
  ```

- Update `package.json` scripts:
  ```json
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
  ```

**Acceptance Criteria:**

- Tests run with `npm test`
- Coverage reports are generated
- Coverage thresholds are enforced
- Test UI is accessible

---

## Phase 5: Documentation & Polish

### Task 5.1: Write Comprehensive README

**Priority:** High  
**Estimated Time:** 2-3 hours  
**Dependencies:** All previous tasks

**Description:**  
Create detailed documentation for library users and contributors.

**Implementation Details:**

- Update `README.md` with:
  - Project description and features
  - Installation instructions
  - Quick start guide
  - API documentation
  - CLI usage examples
  - Configuration options
  - Examples (both programmatic and CLI)
  - Limitations and known issues
  - Contributing guidelines
  - License information

**Structure:**

```markdown
# Scripter

Convert PDF screenplays to Fountain format with ease.

## Features

- Extract text from PDF screenplays
- Intelligent screenplay element detection
- Fountain format output
- CLI and programmatic API
- Configurable parsing options

## Installation

\`\`\`bash
npm install scripter
\`\`\`

## Quick Start

### CLI Usage

\`\`\`bash
npx scripter convert screenplay.pdf
npx scripter convert screenplay.pdf -o output.fountain
\`\`\`

### Programmatic Usage

\`\`\`typescript
import { convertPDFToFountain } from 'scripter';

const result = await convertPDFToFountain('screenplay.pdf');
console.log(result.document);
\`\`\`

## API Reference

[Detailed API docs...]

## CLI Reference

[Detailed CLI docs...]

## Configuration Options

[Options documentation...]

## Examples

[More examples...]

## Limitations

[Known limitations...]

## Contributing

[Contributing guidelines...]

## License

ISC
```

**Acceptance Criteria:**

- README is comprehensive and clear
- All features are documented
- Examples are working and tested
- Installation instructions are correct
- API reference is complete

---

### Task 5.2: Add JSDoc Comments

**Priority:** Medium  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 2 tasks

**Description:**  
Add comprehensive JSDoc comments to all public APIs for better IDE support.

**Implementation Details:**

- Add JSDoc to all exported functions, classes, and types
- Include parameter descriptions
- Include return value descriptions
- Include usage examples where helpful
- Document error conditions

**Example:**

````typescript
/**
 * Converts a PDF screenplay file to Fountain format.
 *
 * @param pdfPath - Absolute or relative path to the PDF file
 * @param options - Conversion configuration options
 * @returns A promise that resolves to the conversion result
 *
 * @throws {Error} If the PDF file cannot be read
 * @throws {Error} If the PDF is password-protected
 *
 * @example
 * ```typescript
 * const result = await convertPDFToFountain('screenplay.pdf', {
 *   detectSceneHeadings: true,
 *   strictMode: false,
 * });
 *
 * if (result.success) {
 *   console.log('Converted successfully!');
 * }
 * ```
 */
export async function convertPDFToFountain(
  pdfPath: string,
  options: ConversionOptions = {}
): Promise<ConversionResult> {
  // ...
}
````

**Acceptance Criteria:**

- All public APIs have JSDoc comments
- Comments include examples where appropriate
- IDE autocomplete shows documentation
- TypeScript declarations include docs

---

### Task 5.3: Create Examples Directory

**Priority:** Low  
**Estimated Time:** 1-2 hours  
**Dependencies:** Task 2.5, Task 3.2

**Description:**  
Create example scripts demonstrating various use cases.

**Implementation Details:**

- Create `examples/` directory with:
  - `basic-conversion.ts` - Simple conversion example
  - `custom-options.ts` - Using conversion options
  - `batch-processing.ts` - Converting multiple files
  - `error-handling.ts` - Handling errors gracefully
  - `cli-examples.sh` - CLI usage examples

- Each example should:
  - Be self-contained
  - Include comments explaining what it does
  - Be runnable with `npx tsx examples/filename.ts`

**Acceptance Criteria:**

- Examples directory exists with multiple examples
- Examples are documented and runnable
- Examples cover common use cases
- README links to examples

---

### Task 5.4: Add License File

**Priority:** Medium  
**Estimated Time:** 15 minutes  
**Dependencies:** None

**Description:**  
Add appropriate license file to the project.

**Implementation Details:**

- Create `LICENSE` file with ISC license text (matching package.json)
- Include copyright year and author name
- Update package.json if needed

**Acceptance Criteria:**

- LICENSE file exists in root
- License matches package.json declaration
- Copyright information is correct

---

### Task 5.5: Create CHANGELOG

**Priority:** Low  
**Estimated Time:** 30 minutes  
**Dependencies:** All implementation tasks

**Description:**  
Create a changelog documenting the initial release.

**Implementation Details:**

- Create `CHANGELOG.md` following Keep a Changelog format:

  ```markdown
  # Changelog

  All notable changes to this project will be documented in this file.

  The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
  and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

  ## [0.1.0] - 2025-11-05

  ### Added

  - Initial release
  - PDF to Fountain conversion
  - CLI interface with convert command
  - Automatic scene heading detection
  - Character name detection
  - Dialogue and action parsing
  - Configurable parsing options
  - Comprehensive test suite
  ```

**Acceptance Criteria:**

- CHANGELOG exists
- Format follows standard conventions
- Initial release is documented

---

## Phase 6: Publishing & Distribution

### Task 6.1: Prepare Package for Publishing

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** All Phase 5 tasks

**Description:**  
Finalize package configuration for npm publishing.

**Implementation Details:**

- Ensure `package.json` has:
  - Correct name (check availability on npm)
  - Appropriate version (0.1.0 for initial release)
  - Complete description
  - Keywords for discoverability
  - Repository URL
  - Homepage URL
  - Author information
  - Correct license
  - Files field (only include dist, README, LICENSE)

- Create `.npmignore`:

  ```
  src/
  tests/
  examples/
  .git/
  .gitignore
  tsconfig.json
  vitest.config.ts
  *.test.ts
  .eslintrc.json
  .prettierrc.json
  node_modules/
  ```

- Add `prepublishOnly` script:
  ```json
  "prepublishOnly": "npm run build && npm test"
  ```

**Acceptance Criteria:**

- Package metadata is complete
- Only necessary files are included
- Build and tests run before publishing
- Package name is available on npm (or scoped appropriately)

---

### Task 6.2: Test Package Locally

**Priority:** High  
**Estimated Time:** 1 hour  
**Dependencies:** Task 6.1

**Description:**  
Test the package locally before publishing to ensure everything works.

**Implementation Details:**

- Run `npm pack` to create tarball
- Create test project in separate directory
- Install packed tarball: `npm install ../scripter/scripter-0.1.0.tgz`
- Test:
  - Importing library functions
  - Running CLI commands
  - TypeScript type definitions
  - All documented examples

- Verify:
  - Package size is reasonable
  - No unexpected files included
  - Dependencies are correctly listed

**Acceptance Criteria:**

- Package installs successfully
- Library API works as documented
- CLI commands work as documented
- Type definitions are available
- No missing dependencies

---

### Task 6.3: Create GitHub Repository

**Priority:** Medium  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 5.1

**Description:**  
Set up GitHub repository with proper configuration.

**Implementation Details:**

- Create repository on GitHub
- Add description and topics
- Add README, LICENSE, and other documentation
- Set up branch protection rules
- Add .github directory with:
  - Issue templates
  - Pull request template
  - Contributing guidelines (if not in root)

- Update package.json with repository URLs

**Acceptance Criteria:**

- Repository is created and configured
- Code is pushed to GitHub
- Repository metadata is complete
- URLs in package.json are correct

---

### Task 6.4: Publish to npm

**Priority:** High  
**Estimated Time:** 30 minutes  
**Dependencies:** Task 6.2

**Description:**  
Publish the package to npm registry.

**Implementation Details:**

- Ensure you're logged into npm: `npm login`
- Run final checks:
  - `npm run build`
  - `npm test`
  - `npm pack` (inspect contents)
- Publish: `npm publish`
- Verify on npm website
- Test installation: `npm install scripter`

**Post-publish:**

- Tag release in git: `git tag v0.1.0`
- Push tag: `git push --tags`
- Create GitHub release

**Acceptance Criteria:**

- Package is published to npm
- Package can be installed globally
- Package page on npm looks correct
- Git tag created for release

---

## Phase 7: Continuous Integration (Optional)

### Task 7.1: Set Up GitHub Actions for CI

**Priority:** Low  
**Estimated Time:** 1-2 hours  
**Dependencies:** Task 6.3

**Description:**  
Automate testing and building with GitHub Actions.

**Implementation Details:**

- Create `.github/workflows/ci.yml`:

  ```yaml
  name: CI

  on:
    push:
      branches: [main]
    pull_request:
      branches: [main]

  jobs:
    test:
      runs-on: ubuntu-latest

      strategy:
        matrix:
          node-version: [18.x, 20.x]

      steps:
        - uses: actions/checkout@v3

        - name: Use Node.js ${{ matrix.node-version }}
          uses: actions/setup-node@v3
          with:
            node-version: ${{ matrix.node-version }}
            cache: 'npm'

        - run: npm ci
        - run: npm run build
        - run: npm test
        - run: npm run lint

        - name: Upload coverage
          uses: codecov/codecov-action@v3
          if: matrix.node-version == '20.x'
  ```

**Acceptance Criteria:**

- CI pipeline runs on push and PR
- Tests run on multiple Node versions
- Build succeeds
- Coverage is reported

---

### Task 7.2: Add Automated Release Process

**Priority:** Low  
**Estimated Time:** 1 hour  
**Dependencies:** Task 7.1

**Description:**  
Automate npm publishing on version tags.

**Implementation Details:**

- Create `.github/workflows/release.yml`:

  ```yaml
  name: Release

  on:
    push:
      tags:
        - 'v*'

  jobs:
    publish:
      runs-on: ubuntu-latest

      steps:
        - uses: actions/checkout@v3

        - uses: actions/setup-node@v3
          with:
            node-version: '20.x'
            registry-url: 'https://registry.npmjs.org'

        - run: npm ci
        - run: npm run build
        - run: npm test
        - run: npm publish
          env:
            NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
  ```

- Add NPM_TOKEN to GitHub secrets

**Acceptance Criteria:**

- Release workflow triggers on version tags
- Package is automatically published to npm
- GitHub release is created

---

## Summary

**Total Estimated Time:** 60-80 hours

**Critical Path Tasks (Must Complete):**

1. Project setup (Tasks 1.1-1.3)
2. Core library implementation (Tasks 2.1-2.5)
3. CLI implementation (Tasks 3.1-3.2)
4. Testing (Tasks 4.1-4.5, 4.7)
5. Documentation (Task 5.1)
6. Publishing (Tasks 6.1-6.4)

**Priority Breakdown:**

- High Priority: 28 tasks (core functionality, testing, documentation)
- Medium Priority: 5 tasks (polish and tooling)
- Low Priority: 4 tasks (nice-to-have features)

**Success Criteria:**

- Library can convert PDF screenplays to valid Fountain format
- CLI provides user-friendly interface
- Test coverage > 80%
- Documentation is comprehensive
- Package is published and installable from npm
