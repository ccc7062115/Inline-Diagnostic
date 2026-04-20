import * as vscode from 'vscode';
import { getConfig } from './config';
import { buildDiagnosticMap } from './diagnosticListener';
import { DecorationManager } from './decorationManager';
import { resolveEditorBackground } from './editorBackground';

let decorationManager: DecorationManager | undefined;
let updateScheduled = false;
let lastUpdateTimer: ReturnType<typeof setTimeout> | undefined;

export function activate(context: vscode.ExtensionContext): void {
  decorationManager = new DecorationManager();

  const scheduleUpdate = () => {
    if (updateScheduled) { return; }
    updateScheduled = true;

    if (lastUpdateTimer !== undefined) {
      clearTimeout(lastUpdateTimer);
    }

    lastUpdateTimer = setTimeout(() => {
      updateScheduled = false;
      lastUpdateTimer = undefined;
      updateActiveEditor();
    }, 16);
  };

  const updateActiveEditor = () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor || !decorationManager) { return; }

    const config = getConfig();
    if (!config.enable) {
      decorationManager.clearAll();
      return;
    }

    const editorBg = resolveEditorBackground();
    const diagMap = buildDiagnosticMap(editor.document, config);

    const cursorLine = editor.selection.active.line;

    decorationManager.applyDecorations(editor, diagMap, cursorLine, config, editorBg);
  };

  const onDiagnosticsChange = vscode.languages.onDidChangeDiagnostics((e) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) { return; }
    const affected = e.uris.some(uri => uri.toString() === editor.document.uri.toString());
    if (affected) { scheduleUpdate(); }
  });

  const onEditorChange = vscode.window.onDidChangeActiveTextEditor(() => {
    scheduleUpdate();
  });

  const onSelectionChange = vscode.window.onDidChangeTextEditorSelection((e) => {
    if (e.textEditor === vscode.window.activeTextEditor) {
      scheduleUpdate();
    }
  });

  const onDocumentChange = vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document === vscode.window.activeTextEditor?.document) {
      scheduleUpdate();
    }
  });

  const onConfigChange = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('inlineDiagnostics')) {
      scheduleUpdate();
    }
  });

  const onThemeChange = vscode.window.onDidChangeActiveColorTheme(() => {
    scheduleUpdate();
  });

  context.subscriptions.push(
    decorationManager,
    onDiagnosticsChange,
    onEditorChange,
    onSelectionChange,
    onDocumentChange,
    onConfigChange,
    onThemeChange,
  );

  updateActiveEditor();
}

export function deactivate(): void {
  if (lastUpdateTimer !== undefined) {
    clearTimeout(lastUpdateTimer);
  }
  decorationManager?.clearAll();
}
