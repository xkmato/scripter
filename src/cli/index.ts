#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { convertCommand } from './commands/convert.js';

// Get the directory of the current file for reading package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const program = new Command();

program
  .name('scripter')
  .description(packageJson.description)
  .version(packageJson.version);

program
  .command('convert <input>')
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
