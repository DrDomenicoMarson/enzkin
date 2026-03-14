import type { Measurement } from '../types/enzyme';

/**
 * Build a CSV string from measurements.
 */
export function buildCsv(
  measurements: Measurement[],
  entryId: string,
  fieldSep: string,
  decimalSep: string
): string {
  const fmt = (n: number): string => {
    const s = n.toPrecision(6);
    return decimalSep === '.' ? s : s.replace('.', decimalSep);
  };

  const headers = [
    'unknown_code',
    'measurement_index',
    'substrate_mM',
    'rate_umol_per_min',
    'warning',
  ].join(fieldSep);

  const rows = measurements.map(m =>
    [
      entryId,
      m.index,
      fmt(m.substrate),
      fmt(m.rate),
      m.warning ?? '',
    ].join(fieldSep)
  );

  return [headers, ...rows].join('\n');
}

/**
 * Trigger a browser download of a text file.
 */
export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
