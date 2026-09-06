import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const xlsxPath = path.join(__dirname, '..', 'Klarelle_SKU_Master_Updated.xlsx');
const outPath = path.join(__dirname, '..', 'src', 'data', 'skuMaster.js');

function loadJSZip() {
  try { return require('jszip'); } catch {
    const exceljsDir = path.dirname(require.resolve('exceljs/package.json'));
    return require(require.resolve('jszip', { paths: [exceljsDir] }));
  }
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
  return { c1: colLettersToIndex(m[1]), r1: Number(m[2]), c2: colLettersToIndex(m[3]), r2: Number(m[4]) };
}

function parseCellValue(attrs, inner) {
  const t = (/\bt="([^"]+)"/.exec(attrs) || [])[1] || '';
  const vMatch = /<(?:\w+:)?v\b[^>]*>([\s\S]*?)<\/(?:\w+:)?v>/.exec(inner);
  const tMatch = /<(?:\w+:)?t\b[^>]*>([\s\S]*?)<\/(?:\w+:)?t>/.exec(inner);
  if (t === 'inlineStr') return tMatch ? decodeXml(tMatch[1]) : '';
  if (t === 's') return vMatch ? vMatch[1] : null;
  if (t === 'b') return vMatch ? vMatch[1] === '1' : null;
  if (t === 'str' || t === 'e') return vMatch ? decodeXml(vMatch[1]) : (tMatch ? decodeXml(tMatch[1]) : '');
  if (vMatch) {
    const n = Number(vMatch[1]);
    return Number.isNaN(n) ? decodeXml(vMatch[1]) : n;
  }
  if (tMatch) return decodeXml(tMatch[1]);
  return null;
}

function parseSheetXml(xml) {
  const rows = new Map();
  const rowRe = /<(?:\w+:)?row\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?row>/g;
  let rm;
  while ((rm = rowRe.exec(xml))) {
    const cellRe = /<(?:\w+:)?c\b([^>]*?)\/>|<(?:\w+:)?c\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?c>/g;
    let cm;
    while ((cm = cellRe.exec(rm[2]))) {
      const isSelf = cm[1] !== undefined && cm[2] === undefined;
      const useAttrs = isSelf ? cm[1] : (cm[2] || cm[1] || '');
      const inner = cm[3] || '';
      const useRef = /\br="([A-Z]+)(\d+)"/.exec(useAttrs);
      if (!useRef) continue;
      const useCol = colLettersToIndex(useRef[1]);
      const useR = Number(useRef[2]);
      const useVal = isSelf ? null : parseCellValue(useAttrs, inner);
      if (!rows.has(useR)) rows.set(useR, new Map());
      rows.get(useR).set(useCol, useVal);
    }
  }
  return rows;
}

function parseTable(xml) {
  const name = (/\bname="([^"]+)"/.exec(xml) || [])[1] || '';
  const ref = (/\bref="([^"]+)"/.exec(xml) || [])[1] || '';
  const cols = [];
  const colRe = /<(?:\w+:)?tableColumn\b([^>]*?)\/>/g;
  let m;
  while ((m = colRe.exec(xml))) cols.push(decodeXml((/\bname="([^"]+)"/.exec(m[1]) || [])[1] || ''));
  return { name, ref, cols, range: parseA1Range(ref) };
}

function rowToObj(rowMap, headers, colStart, colEnd) {
  const obj = {};
  for (let c = colStart; c <= colEnd; c++) {
    const key = headers[c - colStart] != null && headers[c - colStart] !== ''
      ? String(headers[c - colStart])
      : `COL_${c}`;
    obj[key] = rowMap && rowMap.has(c) ? rowMap.get(c) : null;
  }
  return obj;
}

function text(value) {
  if (value == null) return '';
  return String(value).trim();
}

function productIdFromUrl(url) {
  const match = String(url || '').match(/\/product\/([0-9a-f-]{36})/i);
  return match ? match[1] : '';
}

function normalizeName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const JSZip = loadJSZip();
const zip = await JSZip.loadAsync(fs.readFileSync(xlsxPath));
const wbXml = await zip.file('xl/workbook.xml').async('string');
const sheets = [];
const sheetRe = /<(?:\w+:)?sheet\b([\s\S]*?)\/>/g;
let sm;
while ((sm = sheetRe.exec(wbXml))) {
  sheets.push({
    name: decodeXml((/\bname="([^"]+)"/.exec(sm[1]) || [])[1] || ''),
    sheetId: (/\bsheetId="([^"]+)"/.exec(sm[1]) || [])[1] || ''
  });
}

async function readSheet(name) {
  const sheet = sheets.find((item) => item.name === name);
  if (!sheet) throw new Error(`Missing sheet: ${name}`);
  const xml = await zip.file(`xl/worksheets/sheet${sheet.sheetId}.xml`).async('string');
  const tableXml = zip.file(`xl/tables/table${sheet.sheetId}.xml`)
    ? await zip.file(`xl/tables/table${sheet.sheetId}.xml`).async('string')
    : '';
  const table = tableXml ? parseTable(tableXml) : null;
  const rows = parseSheetXml(xml);
  const headerRowNum = table?.range?.r1 || 1;
  const colStart = table?.range?.c1 || 1;
  const colEnd = table?.range?.c2 || 1;
  const lastRow = table?.range?.r2 || headerRowNum;
  const headers = table?.cols?.length ? table.cols : [];
  const data = [];
  for (let r = headerRowNum + 1; r <= lastRow; r++) {
    data.push(rowToObj(rows.get(r), headers, colStart, colEnd));
  }
  return data;
}

const [skuRows, styleRows, prefixRows, colorRows] = await Promise.all([
  readSheet('SKU Master'),
  readSheet('Style Register'),
  readSheet('Code Guide'),
  readSheet('Color Codes')
]);

const prefixes = {};
for (const row of prefixRows) {
  const productType = text(row['Product Type']);
  const prefix = text(row.Prefix);
  if (!productType || !prefix) continue;
  prefixes[productType] = {
    prefix,
    firstCode: text(row['First Code']),
    nextUnused: text(row['Next Unused']),
    exampleSku: text(row['Example SKU'])
  };
}

const colorCodes = {};
for (const row of colorRows) {
  const name = text(row['Official Color']);
  const code = text(row['Color Code']);
  if (!name || !code) continue;
  colorCodes[normalizeName(name)] = code;
}

const stylesById = {};
const stylesByName = {};
const usedStyleCodes = [];

for (const row of styleRows) {
  const styleCode = text(row['Style Code']);
  const name = text(row['Published Style Name']);
  if (!styleCode || !name) continue;
  const productId = productIdFromUrl(row['Product URL']);
  const entry = {
    styleCode,
    name,
    productType: text(row['Product Type']) || 'Dress',
    productId,
    colors: text(row['Published Colors']),
    sizes: text(row['Published Sizes']),
    fulfillment: text(row['Fulfillment Source'])
  };
  usedStyleCodes.push(styleCode);
  if (productId) stylesById[productId] = entry;
  stylesByName[normalizeName(name)] = entry;
}

const variants = [];
const variantLookup = {};

for (const row of skuRows) {
  const styleCode = text(row['Style Code']);
  const color = text(row.Color);
  const size = text(row.Size);
  const sku = text(row['Final SKU']);
  if (!styleCode || !color || !size || !sku) continue;
  const productId = productIdFromUrl(row['Product URL']);
  const entry = {
    sku,
    existingSku: text(row['Existing SKU']) || sku,
    styleCode,
    name: text(row['Published Style Name']),
    productId,
    color,
    colorCode: text(row['Color Code']),
    size,
    bin: text(row['Bin Location']),
    barcode: text(row['Barcode Value']) || sku
  };
  variants.push(entry);
  variantLookup[`${styleCode}|${normalizeName(color)}|${size.toUpperCase()}`] = entry;
  if (productId) {
    variantLookup[`${productId}|${normalizeName(color)}|${size.toUpperCase()}`] = entry;
  }
}

const output = `// Generated from Klarelle_SKU_Master_Updated.xlsx. Re-run scripts/generate-sku-master.js after spreadsheet updates.
export const prefixes = ${JSON.stringify(prefixes, null, 2)};

export const colorCodes = ${JSON.stringify(colorCodes, null, 2)};

export const usedStyleCodes = ${JSON.stringify(usedStyleCodes)};

export const stylesById = ${JSON.stringify(stylesById, null, 2)};

export const stylesByName = ${JSON.stringify(stylesByName, null, 2)};

export const variantLookup = ${JSON.stringify(variantLookup, null, 2)};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, output);
console.log(`Wrote ${outPath}`);
console.log(`styles: ${usedStyleCodes.length}, colors: ${Object.keys(colorCodes).length}, variants: ${variants.length}`);
