import * as vscode from 'vscode';
import {
  RGB,
  SEVERITY_COLORS,
  rgbToHex,
  rgbToHexWithAlpha,
  blendColors,
  contrastColor,
  highestSeverity,
} from './colors';
import { Config } from './config';

interface LineDecoration {
  severity: vscode.DiagnosticSeverity;
  message: string;
  rgb: RGB;
}

export class DecorationManager implements vscode.Disposable {
  private decorationTypes: vscode.TextEditorDecorationType[] = [];

  dispose(): void {
    this.clearAll();
  }

  clearAll(): void {
    for (const dt of this.decorationTypes) {
      dt.dispose();
    }
    this.decorationTypes = [];
  }

  applyDecorations(
    editor: vscode.TextEditor,
    diagnosticsByLine: Map<number, vscode.Diagnostic[]>,
    cursorLine: number,
    config: Config,
    editorBg: RGB
  ): void {
    this.clearAll();

    if (!config.enable || diagnosticsByLine.size === 0) {
      return;
    }

    const inlinePills: vscode.DecorationOptions[] = [];
    const highlights: Array<{ range: vscode.Range; severity: vscode.DiagnosticSeverity }> = [];
    const glyphDots: Array<{ range: vscode.Range; severity: vscode.DiagnosticSeverity }> = [];

    for (const [line, diags] of diagnosticsByLine) {
      const filtered = diags.filter(d => this.isSeverityEnabled(d.severity, config));
      if (filtered.length === 0) { continue; }

      const severities = filtered.map(d => d.severity);
      const topSeverity = highestSeverity(severities);
      const topDiag = filtered.find(d => d.severity === topSeverity)!;
      const rgb = SEVERITY_COLORS[topSeverity];
      const lineDecoration: LineDecoration = {
        severity: topSeverity,
        message: topDiag.message,
        rgb,
      };

      const lineRange = editor.document.lineAt(line).range;
      const endPos = lineRange.end;
      const pillRange = new vscode.Range(endPos, endPos);

      const isOnCursorLine = line === cursorLine;

      inlinePills.push({
        range: pillRange,
        renderOptions: this.buildPillRenderOptions(lineDecoration, isOnCursorLine, config, editorBg),
      });

      for (const diag of filtered) {
        if (diag.range && diag.range.start.line === line) {
          highlights.push({ range: diag.range, severity: diag.severity });
        }
      }

      if (config.showGlyphMarginDot) {
        glyphDots.push({ range: lineRange, severity: topSeverity });
      }
    }

    this.applyPills(editor, inlinePills);

    const highlightsBySeverity = this.groupBySeverity(highlights);
    for (const [severity, ranges] of highlightsBySeverity) {
      this.applyHighlights(editor, ranges, SEVERITY_COLORS[severity], config, editorBg);
    }

    if (config.showGlyphMarginDot) {
      const dotsBySeverity = this.groupBySeverity(glyphDots);
      for (const [severity, ranges] of dotsBySeverity) {
        this.applyGlyphDots(editor, ranges, SEVERITY_COLORS[severity], config);
      }
    }
  }

  private isSeverityEnabled(severity: vscode.DiagnosticSeverity, config: Config): boolean {
    switch (severity) {
      case vscode.DiagnosticSeverity.Error:       return config.showErrors;
      case vscode.DiagnosticSeverity.Warning:     return config.showWarnings;
      case vscode.DiagnosticSeverity.Information: return config.showHints;
      case vscode.DiagnosticSeverity.Hint:        return config.showHints;
    }
  }

  private buildPillRenderOptions(
    dec: LineDecoration,
    isOnCursorLine: boolean,
    config: Config,
    editorBg: RGB
  ): vscode.DecorationInstanceRenderOptions {
    const opacity = config.pillOpacity;
    const blended = opacity < 0.01
      ? editorBg
      : blendColors(dec.rgb, editorBg, opacity);

    const bgHex = rgbToHex(blended);
    const textColor = contrastColor(blended);
    const borderColor = rgbToHexWithAlpha(dec.rgb, 0.6);

    let pillContent: string;
    if (isOnCursorLine) {
      const truncated = this.truncate(dec.message, config.maxMessageLength);
      pillContent = ` → ${truncated} `;
    } else {
      const dots = this.buildDots(dec.severity, dec.rgb);
      pillContent = ` → ${dots} `;
    }

    return {
      after: {
        contentText: pillContent,
        color: textColor,
        backgroundColor: bgHex,
        border: `1px solid ${borderColor}`,
        margin: '0 0 0 8px',
        fontStyle: 'normal',
        fontWeight: '400',
      },
    };
  }

  private buildDots(severity: vscode.DiagnosticSeverity, rgb: RGB): string {
    const hex = rgbToHex(rgb);
    void hex;
    switch (severity) {
      case vscode.DiagnosticSeverity.Error:       return '●';
      case vscode.DiagnosticSeverity.Warning:     return '●';
      case vscode.DiagnosticSeverity.Information: return '●';
      case vscode.DiagnosticSeverity.Hint:        return '●';
    }
  }

  private truncate(msg: string, maxLen: number): string {
    const clean = msg.replace(/\r?\n/g, ' ').trim();
    if (clean.length <= maxLen) { return clean; }
    return clean.substring(0, maxLen - 3) + '...';
  }

  private applyPills(
    editor: vscode.TextEditor,
    options: vscode.DecorationOptions[]
  ): void {
    const dt = vscode.window.createTextEditorDecorationType({});
    this.decorationTypes.push(dt);
    editor.setDecorations(dt, options);
  }

  private applyHighlights(
    editor: vscode.TextEditor,
    ranges: vscode.Range[],
    rgb: RGB,
    config: Config,
    editorBg: RGB
  ): void {
    const blended = blendColors(rgb, editorBg, config.highlightIntensity);
    const bgHex = rgbToHex(blended);

    const dt = vscode.window.createTextEditorDecorationType({
      backgroundColor: bgHex,
      isWholeLine: false,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    });
    this.decorationTypes.push(dt);
    editor.setDecorations(dt, ranges);
  }

  private applyGlyphDots(
    editor: vscode.TextEditor,
    ranges: vscode.Range[],
    rgb: RGB,
    config: Config
  ): void {
    const hex = rgbToHexWithAlpha(rgb, config.glyphMarginDotOpacity);
    const dt = vscode.window.createTextEditorDecorationType({
      gutterIconPath: this.createDotSvgUri(hex),
      gutterIconSize: '60%',
    });
    this.decorationTypes.push(dt);
    editor.setDecorations(dt, ranges);
  }

  private createDotSvgUri(color: string): vscode.Uri {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" fill="${color}"/></svg>`;
    const encoded = encodeURIComponent(svg);
    return vscode.Uri.parse(`data:image/svg+xml;utf8,${encoded}`);
  }

  private groupBySeverity<T extends { range: vscode.Range; severity: vscode.DiagnosticSeverity }>(
    items: T[]
  ): Map<vscode.DiagnosticSeverity, vscode.Range[]> {
    const map = new Map<vscode.DiagnosticSeverity, vscode.Range[]>();
    for (const item of items) {
      const existing = map.get(item.severity) ?? [];
      existing.push(item.range);
      map.set(item.severity, existing);
    }
    return map;
  }
}
