/**
 * Convert command for the CLI
 * Handles PDF to Fountain format conversion with progress feedback and error handling
 */

import chalk from 'chalk';
import ora from 'ora';
import { convertPDFToFountain } from '../../lib/converter.js';
import { generateFountain } from '../../lib/fountain-generator.js';
import type { ConversionOptions } from '../../types/fountain.js';
import { generateOutputPath, writeFountainFile } from '../../utils/file-writer.js';

interface ConvertOptions {
  output?: string;
  outputDir?: string;
  sceneDetection: boolean;
  characterDetection: boolean;
  strict: boolean;
  metadata: boolean;
}

/**
 * Execute the convert command
 *
 * @param input - Path to the input PDF file
 * @param options - Conversion and output options from CLI
 */
export async function convertCommand(input: string, options: ConvertOptions): Promise<void> {
  const spinner = ora('Reading PDF...').start();

  try {
    // Validate input file path
    if (!input) {
      spinner.fail('Input file path is required');
      process.exit(1);
    }

    // Build conversion options from CLI flags
    const conversionOptions: ConversionOptions = {
      detectSceneHeadings: options.sceneDetection,
      detectCharacterNames: options.characterDetection,
      strictMode: options.strict,
      includeMetadata: options.metadata,
    };

    // Convert PDF to Fountain
    spinner.text = 'Converting to Fountain format...';
    const result = await convertPDFToFountain(input, conversionOptions);

    if (!result.success) {
      spinner.fail('Conversion failed');
      console.error(chalk.red('Errors:'));
      result.errors?.forEach((err) => console.error(chalk.red(`  - ${err}`)));
      process.exit(1);
    }

    // Generate Fountain format text
    spinner.text = 'Generating Fountain file...';
    const fountainText = generateFountain(result.document!);

    // Determine output path
    const outputPath = options.output || generateOutputPath(input, options.outputDir);

    // Write Fountain file to disk
    spinner.text = 'Writing file...';
    await writeFountainFile(outputPath, fountainText);

    spinner.succeed(chalk.green(`✓ Converted successfully: ${outputPath}`));

    // Display warnings if any were generated during parsing
    if (result.warnings && result.warnings.length > 0) {
      console.log(chalk.yellow('\nWarnings:'));
      result.warnings.forEach((warn) => console.log(chalk.yellow(`  ⚠ ${warn}`)));
    }

    // Display conversion statistics if metadata is included
    if (result.document?.metadata) {
      console.log(chalk.blue('\nConversion Info:'));
      if (result.document.metadata.pageCount) {
        console.log(chalk.blue(`  Pages: ${result.document.metadata.pageCount}`));
      }
      console.log(chalk.blue(`  Elements: ${result.document.elements.length}`));
      console.log(chalk.blue(`  Converted: ${result.document.metadata.convertedAt}`));
    }
  } catch (error) {
    spinner.fail('Conversion failed');
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`\n✗ Error: ${errorMessage}`));
    process.exit(1);
  }
}
