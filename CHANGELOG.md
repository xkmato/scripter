# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-11-05

### Added

- Initial release
- PDF to Fountain format conversion functionality
- CLI interface with `convert` command for single file conversion
- Batch conversion support with glob pattern matching
- Automatic scene heading detection (INT., EXT., INT./EXT., I/E variations)
- Character name detection with all-caps recognition
- Dialogue and parenthetical parsing
- Action line and transition detection
- Title page extraction and formatting
- Configurable parsing options via `ConversionOptions` interface
- Progress indicators and colored output in CLI
- Comprehensive error handling with descriptive messages
- TypeScript library API for programmatic usage
- Full test suite with unit and integration tests
- PDF reading module with text extraction and page parsing
- Screenplay parser with context-aware element identification
- Fountain format generator with spec-compliant output
- File writing utilities for output handling
- JSDoc documentation for all public APIs
- ESLint configuration for code quality
- Prettier configuration for consistent formatting
- Vitest configuration with coverage reporting
- Example scripts demonstrating common use cases

### Documentation

- Comprehensive README with installation and usage instructions
- API reference for library functions
- CLI command reference
- Configuration options documentation
- Contributing guidelines
- ISC License

### Testing

- Unit tests for PDF reader module
- Unit tests for screenplay parser
- Unit tests for Fountain generator
- Integration tests for end-to-end conversion
- CLI command tests
- Test fixtures with sample PDFs and expected outputs
- Test coverage > 80% across all modules

[Unreleased]: https://github.com/your-username/scripter/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/your-username/scripter/releases/tag/v0.1.0
