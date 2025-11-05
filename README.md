# Scripter

PDF to Fountain Converter - A TypeScript library that converts PDF screenplays to Fountain format with both programmatic API and CLI support.

## Features

- Extract text from PDF screenplays
- Intelligent screenplay element detection
- Fountain format output
- CLI and programmatic API
- Configurable parsing options

## Installation

```bash
npm install scripter
```

## Quick Start

### CLI Usage

```bash
npx scripter convert screenplay.pdf
```

### Programmatic Usage

```typescript
import { convertPDFToFountain } from "scripter";

const result = await convertPDFToFountain("screenplay.pdf");
console.log(result.document);
```

## Development

This project is currently under development. See [TASKS.md](TASKS.md) for the development roadmap.
