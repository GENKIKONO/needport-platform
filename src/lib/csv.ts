// RFC4180 compliant CSV generation
export function toCsv<T>(rows: T[], headers: Array<{key: keyof T, label: string}>): string {
  // Generate header row
  const headerRow = headers.map(h => escapeCsvField(h.label)).join(',');
  
  // Generate data rows
  const dataRows = rows.map(row => 
    headers.map(h => escapeCsvField(String(row[h.key]))).join(',')
  );
  
  // Combine with BOM for Excel compatibility
  const bom = '\uFEFF';
  return bom + [headerRow, ...dataRows].join('\n');
}

function escapeCsvField(field: string): string {
  // If field contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
