# Inline Diagnostics

A Visual Studio Code extension that replaces default diagnostic visuals with a modern, animated inline UI system.

## Features

- **Inline pill indicators** — right-aligned pills appear at the end of each diagnostic line
- **Context-aware display** — when cursor is on the line, the pill shows the message; otherwise it shows a colored dot
- **Background highlights** — replaces squiggly underlines with soft background tints over affected text ranges
- **Glyph margin dots** — colored dots in the left margin for quick scanning
- **Severity-aware colors** — Error (red), Warning (yellow), Info/Hint (blue/green)
- **Smooth color blending** — no true CSS transparency; colors are blended against the editor background
- **Zero layout disruption** — no text shifts, no line height changes, pure decoration API

## Configuration

| Setting | Default | Description |
|---|---|---|
| `inlineDiagnostics.enable` | `true` | Enable/disable the extension |
| `inlineDiagnostics.showErrors` | `true` | Show error diagnostics |
| `inlineDiagnostics.showWarnings` | `true` | Show warning diagnostics |
| `inlineDiagnostics.showHints` | `true` | Show hint/info diagnostics |
| `inlineDiagnostics.pillOpacity` | `0.85` | Pill background opacity (0–1) |
| `inlineDiagnostics.showGlyphMarginDot` | `true` | Show glyph margin dot |
| `inlineDiagnostics.glyphMarginDotOpacity` | `1.0` | Glyph dot opacity |
| `inlineDiagnostics.highlightIntensity` | `0.15` | Background highlight intensity (0–1) |
| `inlineDiagnostics.maxMessageLength` | `30` | Max chars shown in pill before truncation |

## Installing

### From `.vsix` file

```bash
cd artifacts/inline-diagnostics
npm install
npm run package
```

Then install in VS Code:
- Open Command Palette → "Extensions: Install from VSIX..."
- Select the generated `.vsix` file

### Development

```bash
cd artifacts/inline-diagnostics
npm install
npm run compile
```

Then open the folder in VS Code and press `F5` to launch an Extension Development Host.

## How It Works

1. Subscribes to `vscode.languages.onDidChangeDiagnostics` for real-time updates
2. Groups diagnostics by line, finding the highest severity per line
3. Renders `after`-content decorations as inline pills without touching document content
4. Background highlights are applied using `backgroundColor` decorations
5. Glyph margin dots use inline SVG data URIs for maximum compatibility
6. All colors are blended against the editor background to simulate transparency without requiring CSS `opacity`

## Compatibility

Works with all diagnostic sources:
- Built-in VS Code diagnostics (TypeScript, JSON, etc.)
- Language servers (Rust Analyzer, Pylance, clangd, etc.)
- Third-party linting extensions (ESLint, Stylelint, etc.)
