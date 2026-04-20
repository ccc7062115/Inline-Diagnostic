import * as vscode from 'vscode';
import { RGB, hexToRgb } from './colors';

const FALLBACK_DARK: RGB  = { r: 30,  g: 30,  b: 30  };
const FALLBACK_LIGHT: RGB = { r: 255, g: 255, b: 255 };

export function resolveEditorBackground(): RGB {
  try {
    const kind = vscode.window.activeColorTheme.kind;
    const isDark = kind === vscode.ColorThemeKind.Dark || kind === vscode.ColorThemeKind.HighContrast;

    const colors = (vscode.workspace.getConfiguration('workbench') as any)
      .get('colorCustomizations') as Record<string, string> | undefined;

    const editorBgOverride = colors?.['editor.background'];
    if (editorBgOverride && /^#[0-9A-Fa-f]{3,8}$/.test(editorBgOverride)) {
      return hexToRgb(editorBgOverride);
    }

    return isDark ? FALLBACK_DARK : FALLBACK_LIGHT;
  } catch {
    return FALLBACK_DARK;
  }
}
