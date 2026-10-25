import { describe, it, expect } from 'vitest';
import { escapeCsvField, generateCsv } from '../../src/main/utils/csvExport';

describe('CSV Export & Security (escapeCsvField & generateCsv)', () => {
  it('protects against Excel / Google Sheets formula injection by prefixing dangerous characters with single quote', () => {
    // Cells starting with =, +, -, @, \t, \r must be sanitized
    expect(escapeCsvField('=SUM(A1:A10)')).toBe("'=SUM(A1:A10)");
    expect(escapeCsvField('+12345678')).toBe("'+12345678");
    expect(escapeCsvField('-100')).toBe("'-100");
    expect(escapeCsvField('@cmd')).toBe("'@cmd");
  });

  it('escapes fields containing commas and quotes by wrapping in quotes and doubling internal quotes', () => {
    expect(escapeCsvField('Room, Building A')).toBe('"Room, Building A"');
    expect(escapeCsvField('Smartboard 75"')).toBe('"Smartboard 75"""');
  });

  it('handles null, undefined, numbers, and clean text properly', () => {
    expect(escapeCsvField(null)).toBe('');
    expect(escapeCsvField(undefined)).toBe('');
    expect(escapeCsvField(42)).toBe('42');
    expect(escapeCsvField('LH-101')).toBe('LH-101');
  });

  it('generates well-formatted multiline CSV text with CRLF line breaks', () => {
    const headers = ['Code', 'Name', 'Capacity'];
    const rows = [
      ['LH-101', 'Turing Hall', 120],
      ['CS-LAB', 'Computer Lab, Wing B', 45],
    ];

    const result = generateCsv(headers, rows);
    const lines = result.split('\r\n');

    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe('Code,Name,Capacity');
    expect(lines[1]).toBe('LH-101,Turing Hall,120');
    expect(lines[2]).toBe('CS-LAB,"Computer Lab, Wing B",45');
  });
});
