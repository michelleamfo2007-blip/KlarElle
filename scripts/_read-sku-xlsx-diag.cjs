const fs = require('fs');
const path = require('path');
function loadJSZip() {
  try { return require('jszip'); } catch {}
  const exceljsDir = path.dirname(require.resolve('exceljs/package.json'));
  return require(require.resolve('jszip', { paths: [exceljsDir] }));
}
(async () => {
  const xlsxPath = path.join(__dirname, '..', 'Klarelle_SKU_Master_Updated.xlsx');
  const JSZip = loadJSZip();
  const zip = await JSZip.loadAsync(fs.readFileSync(xlsxPath));

  console.log('=== SHARED STRINGS RAW ===');
  console.log(await zip.file('xl/sharedStrings.xml').async('string'));
  console.log('');

  for (let i = 1; i <= 8; i++) {
    const t = await zip.file('xl/tables/table' + i + '.xml').async('string');
    console.log('=== TABLE' + i + ' ===');
    console.log(t);
    console.log('');
  }

  const sheet1 = await zip.file('xl/worksheets/sheet1.xml').async('string');
  // find first 3 x:row blocks that contain more than 200 chars
  const rowRe = /<x:row\b[\s\S]*?<\/x:row>/g;
  let m;
  let n = 0;
  let printed = 0;
  while ((m = rowRe.exec(sheet1))) {
    n++;
    if (m[0].length > 250 && printed < 6) {
      console.log('=== SHEET1 RAW ROW #' + n + ' len=' + m[0].length + ' ===');
      console.log(m[0].slice(0, 2500));
      console.log('');
      printed++;
    }
  }
  console.log('sheet1 row blocks:', n);

  const sheet2 = await zip.file('xl/worksheets/sheet2.xml').async('string');
  const rowRe2 = /<x:row\b[\s\S]*?<\/x:row>/g;
  printed = 0;
  n = 0;
  while ((m = rowRe2.exec(sheet2))) {
    n++;
    if (m[0].length > 200 && printed < 4) {
      console.log('=== SHEET2 RAW ROW #' + n + ' len=' + m[0].length + ' ===');
      console.log(m[0].slice(0, 2000));
      console.log('');
      printed++;
    }
  }
  console.log('sheet2 row blocks:', n);
})().catch((e) => { console.error(e); process.exit(1); });
