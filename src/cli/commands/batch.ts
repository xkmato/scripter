/**
 * Batch conversion command for the CLI
 * Handles converting multiple PDF files using glob patterns
 */

import chalk from 'chalk';
import fg from 'fast-glob';
import ora from 'ora';
import { convertPDFToFountain } from '../../lib/converter.js';
import { generateFountain } from '../../lib/fountain-generator.js';
import type { ConversionOptions } from '../../types/fountain.js';
import { generateOutputPath, writeFountainFile } from '../../utils/file-writer.js';

interface BatchOptions {
  outputDir?: string;
  continueOnError: boolean;
  sceneDetection: boolean;
  characterDetection: boolean;
  strict: boolean;
  metadata: boolean;
}

interface BatchResult {
  succeeded: number;
  failed: number;
  files: Array<{
    path: string;
    success: boolean;
    error?: string;
  }>;
}

/**
 * Execute the batch command
 * Finds all files matching the glob pattern and converts them
 *
 * @param pattern - Glob pattern for finding PDF files
 * @param options - Conversion and output options from CLI
 */
export async function batchCommand(pattern: string, options: BatchOptions): Promise<void> {
  let spinner = ora('Finding PDF files...').start();

  try {
    // Find all files matching the glob pattern
    const files = await fg(pattern, {
      onlyFiles: true,
      absolute: true,
    });

    // Filter out any undefined entries
    const validFiles = files.filter((f): f is string => f !== undefined);

    if (validFiles.length === 0) {
      spinner.fail(`No PDF files found matching pattern: ${pattern}`);
      process.exit(1);
    }

    spinner.succeed(`Found ${chalk.cyan(validFiles.length.toString())} PDF files to convert`);
    console.log('');

    // Build conversion options from CLI flags
    const conversionOptions: ConversionOptions = {
      detectSceneHeadings: options.sceneDetection,
      detectCharacterNames: options.characterDetection,
      strictMode: options.strict,
      includeMetadata: options.metadata,
    };

    // Track results
    const results: BatchResult = {
      succeeded: 0,
      failed: 0,
      files: [],
    };

    // Process each file
    for (let i = 0; i < validFiles.length; i++) {
      const filePath = validFiles[i]!;
      const fileNum = i + 1;
      spinner = ora(
        `Converting [${fileNum}/${validFiles.length}] ${chalk.cyan(filePath)}`
      ).start();

      try {
        // Convert PDF to Fountain
        const result = await convertPDFToFountain(filePath, conversionOptions);

        if (!result.success) {
          const errorMsg = result.errors?.join('; ') || 'Unknown error';
          spinner.fail(
            `Failed [${fileNum}/${validFiles.length}] ${chalk.red(filePath)}: ${errorMsg}`
          );

          results.files.push({
            path: filePath,
            success: false,
            error: errorMsg,
          });
          results.failed++;

          if (!options.continueOnError) {
            process.exit(1);
          }
          continue;
        }

        // Generate Fountain format text
        const fountainText = generateFountain(result.document!);

        // Determine output path
        const outputPath = generateOutputPath(filePath, options.outputDir);

        // Write Fountain file to disk
        await writeFountainFile(outputPath, fountainText);

        spinner.succeed(
          `Converted [${fileNum}/${validFiles.length}] ${chalk.green(filePath)} → ${chalk.cyan(outputPath)}`
        );

        results.files.push({
          path: filePath,
          success: true,
        });
        results.succeeded++;

        // Display warnings if any
        if (result.warnings && result.warnings.length > 0) {
          console.log(chalk.yellow(`  ⚠ Warnings for ${filePath}:`));
          result.warnings.forEach((warn) => console.log(chalk.yellow(`    - ${warn}`)));
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        spinner.fail(
          `Error [${fileNum}/${validFiles.length}] ${chalk.red(filePath)}: ${errorMsg}`
        );

        results.files.push({
          path: filePath,
          success: false,
          error: errorMsg,
        });
        results.failed++;

        if (!options.continueOnError) {
          process.exit(1);
        }
      }
    }

    // Display summary
    console.log('');
    console.log(chalk.bold('Batch Conversion Summary:'));
    console.log(chalk.green(`  ✓ Succeeded: ${results.succeeded}`));
    if (results.failed > 0) {
      console.log(chalk.red(`  ✗ Failed: ${results.failed}`));
    }
    console.log(chalk.cyan(`  Total: ${validFiles.length}`));

    // Display failed files if any
    if (results.failed > 0) {
      console.log('');
      console.log(chalk.yellow('Failed files:'));
      results.files
        .filter((f) => !f.success)
        .forEach((f) => {
          console.log(chalk.yellow(`  - ${f.path}`));
          if (f.error) {
            console.log(chalk.yellow(`    ${f.error}`));
          }
        });
    }

    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    spinner.fail('Batch conversion failed');
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(chalk.red(`\n✗ Error: ${errorMessage}`));
    process.exit(1);
  }
}
