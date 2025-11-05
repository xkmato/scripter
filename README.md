# Scripter

PDF to Fountain Converter - A TypeScript library that converts PDF screenplays to Fountain format with both programmatic API and CLI support.

## Features

- 🎬 Extract text from PDF screenplays
- 🧠 Intelligent screenplay element detection
- 📝 Generate valid Fountain format output
- 💻 Both CLI and programmatic API
- ⚙️ Highly configurable parsing options
- 🔍 Support for scene headings, character names, dialogue, parentheticals, transitions, and more
- 📦 Zero dependencies for core library
- 🛡️ Full TypeScript support with type definitions

## Installation

### npm

```bash
npm install scripter
```

### Global CLI

```bash
npm install -g scripter
```

Then use the `scripter` command directly:

```bash
scripter convert screenplay.pdf
```

## Quick Start

### CLI Usage

Basic conversion:

```bash
npx scripter convert screenplay.pdf
```

Convert with custom output path:

```bash
npx scripter convert screenplay.pdf -o output.fountain
```

Convert to specific directory:

```bash
npx scripter convert screenplay.pdf -d ./output
```

Batch convert multiple files:

```bash
npx scripter batch "scripts/*.pdf" -d ./converted
```

### Programmatic Usage

```typescript
import { convertPDFToFountain } from 'scripter';

const result = await convertPDFToFountain('screenplay.pdf');

if (result.success) {
  console.log('Conversion successful!');
  console.log(result.document);
} else {
  console.error('Conversion failed:', result.errors);
}
```

## API Reference

### Main Functions

#### `convertPDFToFountain(pdfPath, options?): Promise<ConversionResult>`

Converts a PDF screenplay file to Fountain format.

**Parameters:**

- `pdfPath` (string): Path to the PDF file to convert
- `options` (ConversionOptions, optional): Configuration options for parsing

**Returns:** Promise resolving to `ConversionResult`

**Example:**

```typescript
const result = await convertPDFToFountain('screenplay.pdf', {
  detectSceneHeadings: true,
  detectCharacterNames: true,
  includeMetadata: true,
  strictMode: false,
});

if (result.success) {
  const fountainText = generateFountain(result.document!);
  console.log(fountainText);
} else {
  console.error('Errors:', result.errors);
  console.warn('Warnings:', result.warnings);
}
```

#### `generateFountain(document): string`

Converts a FountainDocument object to formatted Fountain text.

**Parameters:**

- `document` (FountainDocument): The document to format

**Returns:** String containing Fountain-formatted screenplay

**Example:**

```typescript
import { generateFountain } from 'scripter';

const fountainText = generateFountain(document);
console.log(fountainText);
```

#### `readPDF(filePath): Promise<PDFContent>`

Extracts text content from a PDF file while preserving structure.

**Parameters:**

- `filePath` (string): Path to the PDF file

**Returns:** Promise resolving to `PDFContent`

**Example:**

```typescript
import { readPDF } from 'scripter';

const pdfContent = await readPDF('screenplay.pdf');
console.log(`Extracted ${pdfContent.pages.length} pages`);
```

#### `parseScreenplay(pdfContent, options?): FountainDocument`

Parses PDF content and identifies screenplay elements.

**Parameters:**

- `pdfContent` (PDFContent): Extracted PDF content
- `options` (ConversionOptions, optional): Parsing configuration

**Returns:** `FountainDocument` with identified elements

**Example:**

```typescript
import { readPDF, parseScreenplay } from 'scripter';

const pdfContent = await readPDF('screenplay.pdf');
const document = parseScreenplay(pdfContent, { strictMode: true });
console.log(document.elements.length);
```

### Types

#### `ConversionOptions`

```typescript
interface ConversionOptions {
  preserveFormatting?: boolean; // Maintain original PDF formatting (default: false)
  detectSceneHeadings?: boolean; // Auto-detect scene headings (default: true)
  detectCharacterNames?: boolean; // Auto-detect character names (default: true)
  includeMetadata?: boolean; // Include conversion metadata (default: true)
  strictMode?: boolean; // Strict Fountain format compliance (default: false)
}
```

#### `ConversionResult`

```typescript
interface ConversionResult {
  success: boolean; // Whether conversion succeeded
  document?: FountainDocument; // Converted document (if successful)
  warnings?: string[]; // Non-fatal issues encountered
  errors?: string[]; // Fatal errors encountered
}
```

#### `FountainDocument`

```typescript
interface FountainDocument {
  elements: FountainElement[]; // Screenplay elements
  titlePage?: Record<string, string>; // Title page metadata
  metadata?: {
    convertedFrom: string; // Source file
    convertedAt: string; // Conversion timestamp
    pageCount?: number; // Original page count
  };
}
```

#### `FountainElement`

```typescript
interface FountainElement {
  type:
    | 'scene_heading' // INT./EXT. headings
    | 'action' // Description/action lines
    | 'character' // Character names
    | 'dialogue' // Dialogue text
    | 'parenthetical' // (parenthetical text)
    | 'transition' // Transitions (TO:)
    | 'page_break' // Page breaks
    | 'note' // [[notes]]
    | 'section' // # Sections
    | 'synopsis' // = Synopsis
    | 'title_page'; // Title page info
  text: string; // Element content
  metadata?: Record<string, unknown>; // Additional data
}
```

## CLI Reference

### Commands

#### `convert [options] <input>`

Convert a single PDF file to Fountain format.

**Arguments:**

- `input` - Path to input PDF file (required)

**Options:**

- `-o, --output <path>` - Output file path (default: same name with .fountain extension)
- `-d, --output-dir <dir>` - Output directory for converted file
- `--no-scene-detection` - Disable automatic scene heading detection
- `--no-character-detection` - Disable automatic character name detection
- `--strict` - Enable strict Fountain format compliance mode
- `--no-metadata` - Exclude conversion metadata from output
- `-h, --help` - Display help information

**Examples:**

```bash
# Convert with default settings
scripter convert screenplay.pdf

# Specify custom output path
scripter convert screenplay.pdf -o my-screenplay.fountain

# Convert to specific directory
scripter convert screenplay.pdf -d ./screenplays

# Strict mode with no metadata
scripter convert screenplay.pdf --strict --no-metadata

# Disable character detection
scripter convert screenplay.pdf --no-character-detection
```

#### `batch [options] <pattern>`

Convert multiple PDF files matching a glob pattern.

**Arguments:**

- `pattern` - Glob pattern for PDF files (e.g., "scripts/\*.pdf")

**Options:**

- `-d, --output-dir <dir>` - Output directory (required)
- `--continue-on-error` - Continue processing if a file fails
- `--no-scene-detection` - Disable scene heading detection
- `--no-character-detection` - Disable character name detection
- `--strict` - Enable strict mode
- `--no-metadata` - Exclude metadata
- `-h, --help` - Display help information

**Examples:**

```bash
# Convert all PDFs in a directory
scripter batch "scripts/*.pdf" -d ./converted

# Convert with error resilience
scripter batch "**/*.pdf" -d ./output --continue-on-error

# Convert with strict mode
scripter batch "screenplays/**/*.pdf" -d ./fountains --strict
```

## Configuration Options

### Scene Heading Detection

By default, Scripter automatically detects scene headings (INT., EXT., etc.). You can disable this:

```typescript
const result = await convertPDFToFountain('screenplay.pdf', {
  detectSceneHeadings: false,
});
```

### Character Name Detection

Scripter intelligently identifies character names (all-caps lines). Disable if needed:

```typescript
const result = await convertPDFToFountain('screenplay.pdf', {
  detectCharacterNames: false,
});
```

### Strict Mode

Enable stricter Fountain format compliance:

```typescript
const result = await convertPDFToFountain('screenplay.pdf', {
  strictMode: true,
});
```

### Metadata

Include/exclude conversion metadata in output:

```typescript
const result = await convertPDFToFountain('screenplay.pdf', {
  includeMetadata: false,
});
```

## Examples

### Example 1: Simple Conversion

```typescript
import { convertPDFToFountain, generateFountain } from 'scripter';
import fs from 'fs/promises';

async function convertScreenplay() {
  const result = await convertPDFToFountain('my-screenplay.pdf');

  if (result.success) {
    const fountainText = generateFountain(result.document!);
    await fs.writeFile('my-screenplay.fountain', fountainText, 'utf-8');
    console.log('✓ Conversion complete!');
  } else {
    console.error('✗ Conversion failed:', result.errors);
  }
}

convertScreenplay();
```

### Example 2: Batch Processing

```typescript
import { convertPDFToFountain, generateFountain } from 'scripter';
import glob from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';

async function batchConvert(pattern: string, outputDir: string) {
  const files = await glob(pattern);
  let success = 0;
  let failed = 0;

  for (const file of files) {
    try {
      const result = await convertPDFToFountain(file);
      if (result.success) {
        const fountainText = generateFountain(result.document!);
        const outputPath = path.join(outputDir, path.basename(file, '.pdf') + '.fountain');
        await fs.writeFile(outputPath, fountainText, 'utf-8');
        console.log(`✓ ${file}`);
        success++;
      } else {
        console.error(`✗ ${file}:`, result.errors);
        failed++;
      }
    } catch (error) {
      console.error(`✗ ${file}:`, error.message);
      failed++;
    }
  }

  console.log(`\nCompleted: ${success} succeeded, ${failed} failed`);
}

batchConvert('screenplays/**/*.pdf', './converted');
```

### Example 3: Custom Error Handling

```typescript
import { convertPDFToFountain, generateFountain } from 'scripter';

async function convertWithErrorHandling() {
  try {
    const result = await convertPDFToFountain('screenplay.pdf', {
      strictMode: true,
      includeMetadata: true,
    });

    if (!result.success) {
      console.error('Conversion errors:');
      result.errors?.forEach((err) => {
        console.error(`  - ${err}`);
      });

      if (result.warnings && result.warnings.length > 0) {
        console.warn('Warnings:');
        result.warnings.forEach((warn) => {
          console.warn(`  - ${warn}`);
        });
      }

      return;
    }

    const fountainText = generateFountain(result.document!);
    console.log(fountainText);
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

convertWithErrorHandling();
```

## Fountain Format

Scripter produces output conforming to the [Fountain specification](https://fountain.io). Key elements include:

- **Scene Headings**: `INT. ROOM - DAY`
- **Action**: Regular description text
- **Character Names**: ALL CAPS on their own line
- **Dialogue**: Text following character name
- **Parentheticals**: `(action description)`
- **Transitions**: `CUT TO:` or similar
- **Notes**: `[[This is a note]]`
- **Emphasis**: `*bold*`, `_italic_`, `***bold italic***`

## Limitations and Known Issues

### Current Limitations

- **PDF-Specific Challenges**: Complex PDF layouts (multi-column, floating elements) may not be parsed accurately
- **Optical Character Recognition**: Does not perform OCR; scanned/image-based PDFs cannot be converted
- **Formatting Preservation**: Original PDF formatting (fonts, colors, positioning) is not preserved
- **Dual Dialogue**: Dual dialogue (two characters speaking side-by-side) has limited support
- **Encrypted PDFs**: Password-protected PDFs will be rejected with an error

### Recommendations

- **Input Quality**: Best results with PDFs created from digital screenplays (not scanned)
- **Review Output**: Always review generated Fountain files for accuracy
- **Test Options**: Experiment with conversion options for your specific PDFs
- **Feedback**: Report issues with specific PDFs to help improve detection heuristics

## Troubleshooting

### Issue: "Invalid PDF file" error

**Solution**: Ensure the PDF is valid and not corrupted. Try opening it in a PDF reader first.

### Issue: Scene headings not detected correctly

**Solution**: Try disabling character detection or enabling strict mode:

```typescript
const result = await convertPDFToFountain('screenplay.pdf', {
  detectCharacterNames: false,
  strictMode: true,
});
```

### Issue: Character names detected as action

**Solution**: Enable strict mode or provide manual corrections to the output.

### Issue: Output has warnings

**Solution**: Review warnings and verify the output matches expectations. Warnings do not prevent conversion.

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

### Setup for Development

```bash
# Clone the repository
git clone https://github.com/yourusername/scripter.git
cd scripter

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Format code
npm run format

# Run linter
npm run lint
```

### Running Examples

```bash
# Build first
npm run build

# Run programmatic examples
npx tsx examples/basic-conversion.ts

# Run CLI examples
bash examples/cli-examples.sh
```

## Development Status

This project is actively maintained. See [TASKS.md](TASKS.md) for the development roadmap and current progress.

## License

ISC - See [LICENSE](LICENSE) file for details

## Support

- 📖 [Documentation](README.md)
- 🐛 [Report Issues](https://github.com/yourusername/scripter/issues)
- 💬 [Discussions](https://github.com/yourusername/scripter/discussions)

## Author

Kenneth Matovu

## Related Resources

- [Fountain Specification](https://fountain.io)
- [Screenplay Format Standards](https://www.screenwriting.io)
- [PDF.js Library](https://mozilla.github.io/pdf.js/)

---

**Happy screenwriting! 🎬**
