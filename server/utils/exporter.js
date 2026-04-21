const XLSX = require('xlsx');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const exportToExcel = (data, fileName) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
};

const exportToCSV = async (data, path) => {
  const csvWriter = createCsvWriter({
    path: path,
    header: Object.keys(data[0] || {}).map(k => ({ id: k, title: k.toUpperCase() }))
  });
  return await csvWriter.writeRecords(data);
};

module.exports = { exportToExcel, exportToCSV };
