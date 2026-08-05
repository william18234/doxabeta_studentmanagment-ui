/**
 * Converts a list of objects into a CSV string and triggers browser download.
 * Supports custom field mapping, date formatting, and comma escaping.
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  data: T[],
  columnMapping?: Record<keyof T | string, string>
) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Determine keys to include
  const firstRow = data[0];
  const keys = Object.keys(firstRow).filter(
    key => typeof firstRow[key] !== 'object' || firstRow[key] === null
  );

  // Header row
  const headers = keys.map(key => {
    if (columnMapping && columnMapping[key]) {
      return `"${columnMapping[key].replace(/"/g, '""')}"`;
    }
    // Convert camelCase to Capital Words
    const formatted = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase());
    return `"${formatted.replace(/"/g, '""')}"`;
  });

  const rows: string[] = [headers.join(',')];

  // Data rows
  data.forEach(item => {
    const row = keys.map(key => {
      const val = item[key];
      if (val === undefined || val === null) {
        return '""';
      }
      const strVal = String(val).replace(/"/g, '""');
      return `"${strVal}"`;
    });
    rows.push(row.join(','));
  });

  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = filename.endsWith('.csv') ? filename : `${filename}-${dateStr}.csv`;
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
