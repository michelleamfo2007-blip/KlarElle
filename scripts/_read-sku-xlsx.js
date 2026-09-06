const ExcelJS = require('exceljs');
const path = require('path');

const xlsxPath = path.join(__dirname, '..', 'Klarelle_SKU_Master_Updated.xlsx');

function cellValue(cell) {
  if (!cell || cell.value === null || cell.value === undefined) return null;
  const v = cell.value;
  if (typeof v === 'object') {
    if (v.text) return v.text;
    if (v.richText) return v.richText.map((r) => r.text).join('');
    if (v.result !== undefined) return v.result;
    if (v.hyperlink) return v.text || v.hyperlink;
    if (v instanceof Date) return v.toISOString();
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return v;
}

(async () => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(xlsxPath);

  const names = workbook.worksheets.map((ws) => ws.name);
  console.log('=== WORKSHEET NAMES ===');
  console.log(JSON.stringify(names, null, 2));
  console.log('sheet_count:', names.length);
  console.log('');

  for (const ws of workbook.worksheets) {
    console.log('============================================================');
    console.log('SHEET:', JSON.stringify(ws.name));
    console.log('rowCount:', ws.rowCount);
    console.log('actualRowCount:', ws.actualRowCount);
    console.log('columnCount:', ws.columnCount);
    console.log('actualColumnCount:', ws.actualColumnCount);
    console.log('============================================================');

    const headerRow = ws.getRow(1);
    const colCount = Math.max(ws.actualColumnCount || 0, ws.columnCount || 0, headerRow.cellCount || 0);
    const headers = [];
    for (let c = 1; c <= colCount; c++) {
      headers.push(cellValue(headerRow.getCell(c)));
    }
    console.log('COLUMN NAMES EXACT:');
    console.log(JSON.stringify(headers));
    console.log('HEADER ROW:');
    console.log(JSON.stringify(headers));

    const totalDataRows = Math.max(0, (ws.actualRowCount || ws.rowCount || 1) - 1);
    const printRows = Math.min(80, totalDataRows);
    console.log('TOTAL_DATA_ROWS:', totalDataRows);
    console.log('PRINTING_DATA_ROWS:', printRows);
    console.log('--- DATA ---');

    for (let r = 2; r <= printRows + 1; r++) {
      const row = ws.getRow(r);
      const obj = {};
      const arr = [];
      for (let c = 1; c <= colCount; c++) {
        const key = headers[c - 1] != null && headers[c - 1] !== '' ? String(headers[c - 1]) : 'COL_' + c;
        const val = cellValue(row.getCell(c));
        obj[key] = val;
        arr.push(val);
      }
      console.log('ROW', r, JSON.stringify(obj));
    }

    if (totalDataRows > 80) {
      console.log('... truncated; remaining_data_rows:', totalDataRows - 80);
    }
    console.log('');
  }
})().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});
