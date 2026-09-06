const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const xlsxPath = path.join(__dirname, '..', 'Klarelle_SKU_Master_Updated.xlsx');

function loadJSZip() {
  try { return require('jszip'); } catch {}
  const exceljsDir = path.dirname(require.resolve('exceljs/package.json'));
  return require(require.resolve('jszip', { paths: [exceljsDir] }));
}

function decodeXml(s) {
  return String(s)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function colLettersToIndex(letters) {
  let n = 0;
  for (let i = 0; i < letters.length; i++) n = n * 26 + (letters.charCodeAt(i) - 64);
  return n;
}

function parseA1Range(ref) {
  const m = /^([A-Z]+)(\d+):([A-Z]+)(\d+)$/.exec(ref || '');
  if (!m) return null;
  return {
    c1: colLettersToIndex(m[1]),
    r1: Number(m[2]),
    c2: colLettersToIndex(m[3]),
    r2: Number(m[4]),
  };
}

function innerText(xml, tag) {
  const re = new RegExp('<(?:\\\\w+:)?' + tag + '\\\\b[^>]*>([\\\\s\\\\S]*?)<\\\\/(?:\\\\w+:)?' + tag + '>', 'i');
  const m = re.exec(xml);
  return m ? decodeXml(m[1]) : null;
}

function parseCellValue(attrs, inner) {
  const t = (/\bt="([^"]+)"/.exec(attrs) || [])[1] || '';
  const vMatch = /<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/.exec(inner);
  const tMatch = /<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/.exec(inner);
  const fMatch = /<(?:\w+:)?f\b[^>]*>([\s\S]*?)<\/(?:\w+:)?f>/.exec(inner);
  if (t === 'inlineStr') return tMatch ? decodeXml(tMatch[1]) : '';
  if (t === 's') return vMatch ? vMatch[1] : null;
  if (t === 'b') return vMatch ? vMatch[1] === '1' : null;
  if (t === 'str' || t === 'e') return vMatch ? decodeXml(vMatch[1]) : (tMatch ? decodeXml(tMatch[1]) : '');
  if (vMatch) {
    const n = Number(vMatch[1]);
    return Number.isNaN(n) ? decodeXml(vMatch[1]) : n;
  }
  if (tMatch) return decodeXml(tMatch[1]);
  if (fMatch) return { formula: decodeXml(fMatch[1]) };
  return null;
}

function parseSheetXml(xml) {
  const rows = new Map();
  let maxCol = 0;
  let maxRow = 0;
  const rowRe = /<(?:\w+:)?row\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?row>/g;
  let rm;
  while ((rm = rowRe.exec(xml))) {
    const rAttr = /\br="(\d+)"/.exec(rm[1] || '');
    const cellRe = /<(?:\w+:)?c\b([^>]*?)\/>|<(?:\w+:)?c\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?c>/g;
    let cm;
    while ((cm = cellRe.exec(rm[2]))) {
      const selfClosing = cm[1] !== undefined && cm[3] === undefined && cm[2] === undefined;
      const attrs = (cm[1] != null && cm[3] == null && !cm[2] ? cm[1] : cm[2]) || '';
      const inner = cm[3] || '';
      const ref = /\br="([A-Z]+)(\d+)"/.exec(attrs);
      if (!ref) continue;
      const col = colLettersToIndex(ref[1]);
      const r = Number(ref[2]);
      const val = selfClosing || (cm[1] != null && cm[3] == null && cm[2] == null)
        ? null
        : parseCellValue(attrs, inner);
      // detect true self-closing via first alt
      const isSelf = cm[1] !== undefined && cm[2] === undefined;
      const finalVal = isSelf ? null : parseCellValue(attrs || cm[1] || '', inner);
      const useAttrs = isSelf ? cm[1] : (cm[2] || cm[1] || '');
      const useRef = /\br="([A-Z]+)(\d+)"/.exec(useAttrs);
      if (!useRef) continue;
      const useCol = colLettersToIndex(useRef[1]);
      const useR = Number(useRef[2]);
      const useVal = isSelf ? null : parseCellValue(useAttrs, inner);
      if (!rows.has(useR)) rows.set(useR, new Map());
      rows.get(useR).set(useCol, useVal);
      if (useCol > maxCol) maxCol = useCol;
      if (useR > maxRow) maxRow = useR;
    }
    if (rAttr) {
      const rn = Number(rAttr[1]);
      if (rn > maxRow) maxRow = rn;
    }
  }
  return { rows, maxCol, maxRow };
}

function rowToObj(rowMap, headers, colStart, colEnd) {
  const obj = {};
  for (let c = colStart; c <= colEnd; c++) {
    const key = headers[c - colStart] != null && headers[c - colStart] !== ''
      ? String(headers[c - colStart])
      : 'COL_' + c;
    obj[key] = rowMap && rowMap.has(c) ? rowMap.get(c) : null;
  }
  return obj;
}

function parseTable(xml) {
  const name = (/\bname="([^"]+)"/.exec(xml) || [])[1] || '';
  const ref = (/\bref="([^"]+)"/.exec(xml) || [])[1] || '';
  const cols = [];
  const colRe = /<(?:\w+:)?tableColumn\b([^>]*?)\/>/g;
  let m;
  while ((m = colRe.exec(xml))) {
    cols.push(decodeXml((/\bname="([^"]+)"/.exec(m[1]) || [])[1] || ''));
  }
  return { name, ref, cols, range: parseA1Range(ref) };
}

(async () => {
  console.log('FILE:', xlsxPath);
  console.log('exists:', fs.existsSync(xlsxPath));
  console.log('bytes:', fs.statSync(xlsxPath).size);
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(xlsxPath);
    console.log('READER: exceljs-native');
  } catch (err) {
    console.log('READER: exceljs-native-failed:', err.message);
    console.log('NOTE: workbook uses x: namespaced OOXML, so exceljs WorkbookXform returns no sheets.');
    console.log('FALLBACK: exceljs-jszip + namespaced OOXML parse');
  }

  const JSZip = loadJSZip();
  const zip = await JSZip.loadAsync(fs.readFileSync(xlsxPath));
  const wbXml = await zip.file('xl/workbook.xml').async('string');

  const sheets = [];
  const sheetRe = /<(?:\w+:)?sheet\b([\s\S]*?)\/>/g;
  let sm;
  while ((sm = sheetRe.exec(wbXml))) {
    const attrs = sm[1];
    sheets.push({
      name: decodeXml((/\bname="([^"]+)"/.exec(attrs) || [])[1] || ''),
      sheetId: (/\bsheetId="([^"]+)"/.exec(attrs) || [])[1] || '',
    });
  }

  console.log('=== WORKSHEET NAMES ===');
  console.log(JSON.stringify(sheets.map((s) => s.name), null, 2));
  console.log('sheet_count:', sheets.length);
  console.log('');

  for (const s of sheets) {
    const sheetPath = 'xl/worksheets/sheet' + s.sheetId + '.xml';
    const tablePath = 'xl/tables/table' + s.sheetId + '.xml';
    const xml = await zip.file(sheetPath).async('string');
    const tableXml = zip.file(tablePath) ? await zip.file(tablePath).async('string') : '';
    const table = tableXml ? parseTable(tableXml) : null;
    const parsed = parseSheetXml(xml);
    const { rows, maxCol, maxRow } = parsed;

    let headerRowNum = table && table.range ? table.range.r1 : 1;
    let colStart = table && table.range ? table.range.c1 : 1;
    let colEnd = table && table.range ? table.range.c2 : maxCol;
    let lastRow = table && table.range ? table.range.r2 : maxRow;
    const tableCols = table ? table.cols : [];
    const headerFromCells = [];
    const headerMap = rows.get(headerRowNum) || new Map();
    for (let c = colStart; c <= colEnd; c++) {
      headerFromCells.push(headerMap.has(c) ? headerMap.get(c) : null);
    }
    const headers = tableCols.length ? tableCols : headerFromCells;

    console.log('============================================================');
    console.log('SHEET:', JSON.stringify(s.name));
    console.log('table:', table ? table.name : null);
    console.log('table_ref:', table ? table.ref : null);
    console.log('rowCount:', maxRow);
    console.log('actualRowCount:', rows.size);
    console.log('columnCount:', maxCol);
    console.log('actualColumnCount:', maxCol);
    console.log('============================================================');
    console.log('COLUMN NAMES EXACT (table):');
    console.log(JSON.stringify(tableCols));
    console.log('COLUMN NAMES EXACT (header row ' + headerRowNum + '):');
    console.log(JSON.stringify(headerFromCells));
    console.log('HEADER ROW:');
    console.log(JSON.stringify(headers));

    console.log('--- PREAMBLE ROWS (before table header) ---');
    for (let r = 1; r < headerRowNum; r++) {
      const obj = rowToObj(rows.get(r), [], 1, maxCol);
      console.log('ROW', r, JSON.stringify(obj));
    }

    const totalDataRows = Math.max(0, lastRow - headerRowNum);
    const printRows = Math.min(80, totalDataRows);
    console.log('TOTAL_DATA_ROWS:', totalDataRows);
    console.log('TOTAL_SHEET_ROWS:', maxRow);
    console.log('PRINTING_DATA_ROWS:', printRows);
    console.log('--- DATA ---');
    for (let i = 0; i < printRows; i++) {
      const r = headerRowNum + 1 + i;
      console.log('ROW', r, JSON.stringify(rowToObj(rows.get(r), headers, colStart, colEnd)));
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
