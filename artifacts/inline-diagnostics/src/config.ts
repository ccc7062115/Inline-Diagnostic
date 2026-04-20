import * as vscode from 'vscode';

export interface Config {
  enable: boolean;
  showErrors: boolean;
  showWarnings: boolean;
  showHints: boolean;
  pillOpacity: number;
  showGlyphMarginDot: boolean;
  glyphMarginDotOpacity: number;
  highlightIntensity: number;
  maxMessageLength: number;
}

export function getConfig(): Config {
  const cfg = vscode.workspace.getConfiguration('inlineDiagnostics');
  return {
    enable: cfg.get<boolean>('enable', true),
    showErrors: cfg.get<boolean>('showErrors', true),
    showWarnings: cfg.get<boolean>('showWarnings', true),
    showHints: cfg.get<boolean>('showHints', true),
    pillOpacity: cfg.get<number>('pillOpacity', 0.85),
    showGlyphMarginDot: cfg.get<boolean>('showGlyphMarginDot', true),
    glyphMarginDotOpacity: cfg.get<number>('glyphMarginDotOpacity', 1.0),
    highlightIntensity: cfg.get<number>('highlightIntensity', 0.15),
    maxMessageLength: cfg.get<number>('maxMessageLength', 30),
  };
}
