import * as vscode from 'vscode';
import { Config } from './config';

export type DiagnosticsByLine = Map<number, vscode.Diagnostic[]>;

export function buildDiagnosticMap(
  document: vscode.TextDocument,
  config: Config
): DiagnosticsByLine {
  const map: DiagnosticsByLine = new Map();
  const allDiags = vscode.languages.getDiagnostics(document.uri);

  for (const diag of allDiags) {
    if (!isSeverityEnabled(diag.severity, config)) { continue; }

    const line = diag.range.start.line;
    if (line < 0 || line >= document.lineCount) { continue; }

    const existing = map.get(line) ?? [];
    existing.push(diag);
    map.set(line, existing);
  }

  return map;
}

function isSeverityEnabled(severity: vscode.DiagnosticSeverity, config: Config): boolean {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error:       return config.showErrors;
    case vscode.DiagnosticSeverity.Warning:     return config.showWarnings;
    case vscode.DiagnosticSeverity.Information: return config.showHints;
    case vscode.DiagnosticSeverity.Hint:        return config.showHints;
  }
}
