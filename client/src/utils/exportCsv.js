/**
 * Export tabular data array to CSV file and trigger download
 */
export function exportToCSV(filename, columns, data) {
  if (!data || !data.length) {
    alert("No data available to export");
    return;
  }

  // Header row
  const header = columns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(",");

  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      let val = typeof col.key === "function" ? col.key(item) : item[col.key];
      if (val === null || val === undefined) val = "";
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(",");
  });

  const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].join("\r\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
