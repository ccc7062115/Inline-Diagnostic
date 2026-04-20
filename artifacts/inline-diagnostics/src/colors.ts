import * as vscode from 'vscode';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export const SEVERITY_COLORS: Record<vscode.DiagnosticSeverity, RGB> = {
  [vscode.DiagnosticSeverity.Error]:       { r: 248, g:  81, b:  73 },
  [vscode.DiagnosticSeverity.Warning]:     { r: 229, g: 192, b:  37 },
  [vscode.DiagnosticSeverity.Information]: { r:  88, g: 166, b: 255 },
  [vscode.DiagnosticSeverity.Hint]:        { r: 130, g: 200, b: 130 },
};

export const SEVERITY_ORDER: vscode.DiagnosticSeverity[] = [
  vscode.DiagnosticSeverity.Error,
  vscode.DiagnosticSeverity.Warning,
  vscode.DiagnosticSeverity.Information,
  vscode.DiagnosticSeverity.Hint,
];

export function rgbToHex(rgb: RGB): string {
  return `#${byteToHex(rgb.r)}${byteToHex(rgb.g)}${byteToHex(rgb.b)}`;
}

function byteToHex(n: number): string {
  return n.toString(16).padStart(2, '0');
}

export function blendColors(fg: RGB, bg: RGB, alpha: number): RGB {
  const a = Math.max(0, Math.min(1, alpha));
  return {
    r: Math.round(fg.r * a + bg.r * (1 - a)),
    g: Math.round(fg.g * a + bg.g * (1 - a)),
    b: Math.round(fg.b * a + bg.b * (1 - a)),
  };
}

export function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

export function luminance(rgb: RGB): number {
  const toLinear = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

export function contrastColor(bg: RGB): string {
  return luminance(bg) > 0.35 ? '#111111' : '#ffffff';
}

export function getEditorBackground(): RGB {
  const color = new vscode.ThemeColor('editor.background');
  void color;
  return { r: 30, g: 30, b: 30 };
}

export function rgbToHexWithAlpha(rgb: RGB, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255);
  return `#${byteToHex(rgb.r)}${byteToHex(rgb.g)}${byteToHex(rgb.b)}${byteToHex(a)}`;
}

export function highestSeverity(severities: vscode.DiagnosticSeverity[]): vscode.DiagnosticSeverity {
  for (const s of SEVERITY_ORDER) {
    if (severities.includes(s)) { return s; }
  }
  return vscode.DiagnosticSeverity.Hint;
}
