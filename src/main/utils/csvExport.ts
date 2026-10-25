import { dialog, BrowserWindow } from 'electron';
import fs from 'fs/promises';

/**
 * Escapes a field according to RFC 4180 and protects against formula injection.
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }

  let str = String(val);

  // Prevent Spreadsheet Formula Injection (CSV Injection)
  // If the cell begins with =, +, -, @, \t, or \r, prefix with a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // If the string contains comma, quote, or newline, wrap in quotes and escape quotes
  if (/[",\n\r]/.test(str)) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export function generateCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const headerLine = headers.map(escapeCsvField).join(',');
  const rowLines = rows.map((r) => r.map(escapeCsvField).join(','));
  return [headerLine, ...rowLines].join('\r\n');
}

export async function promptAndSaveCsv(
  defaultFilename: string,
  csvContent: string,
  parentWindow?: BrowserWindow
): Promise<{ saved: boolean; filePath?: string }> {
  const win = parentWindow || BrowserWindow.getFocusedWindow() || undefined;
  const options = {
    title: 'Export CSV',
    defaultPath: defaultFilename,
    filters: [{ name: 'CSV Files', extensions: ['csv'] }],
  };
  const result = win ? await dialog.showSaveDialog(win, options) : await dialog.showSaveDialog(options);

  if (result.canceled || !result.filePath) {
    return { saved: false };
  }

  await fs.writeFile(result.filePath, csvContent, 'utf8');
  return { saved: true, filePath: result.filePath };
}
