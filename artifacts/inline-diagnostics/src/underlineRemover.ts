import * as vscode from 'vscode';

let squigglyOverrideTypes: vscode.TextEditorDecorationType[] = [];

export function suppressDefaultUnderlines(editor: vscode.TextEditor): void {
  for (const dt of squigglyOverrideTypes) {
    dt.dispose();
  }
  squigglyOverrideTypes = [];
}

export function disposeUnderlineOverrides(): void {
  for (const dt of squigglyOverrideTypes) {
    dt.dispose();
  }
  squigglyOverrideTypes = [];
}
