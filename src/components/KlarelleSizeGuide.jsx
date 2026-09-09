import React from 'react';
import { cmToDisplay, formatSizeLabel } from '../utils/size';

function DressSketch() {
  return (
    <svg width="88" height="160" viewBox="0 0 88 160" fill="none" aria-hidden="true">
      <circle cx="44" cy="16" r="10" stroke="#111" strokeWidth="1.4" />
      <path d="M28 32C28 32 32 28 44 28C56 28 60 32 60 32L66 48L54 54V148C54 148 50 154 44 154C38 154 34 148 34 148V54L22 48L28 32Z" stroke="#111" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M34 54H54" stroke="#111" strokeWidth="1.2" />
      <path d="M26 40C32 44 56 44 62 40" stroke="#111" strokeWidth="1.1" />
    </svg>
  );
}

function KlarelleSizeGuide({
  rows = [],
  unit = 'in',
  onUnitChange,
  recommendedSize,
  selectedSize
}) {
  const hasLength = rows.some((row) => row.length != null);

  return (
    <div style={{ background: '#f6f1ea', padding: '28px 20px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '11px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#111', marginBottom: '10px' }}>Size Guide</div>
      <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '0.18em', marginBottom: '8px' }}>KlarElle</div>
      <div style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: '#666', marginBottom: '16px' }}>
        All measurements are in {unit === 'in' ? 'inches' : 'centimeters'}
      </div>
      {onUnitChange && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', background: '#eee8df', borderRadius: '16px', overflow: 'hidden' }}>
            <button
              type="button"
              onClick={() => onUnitChange('cm')}
              style={{ padding: '6px 16px', border: 'none', background: unit === 'cm' ? '#111' : 'transparent', color: unit === 'cm' ? '#fff' : '#111', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            >cm</button>
            <button
              type="button"
              onClick={() => onUnitChange('in')}
              style={{ padding: '6px 16px', border: 'none', background: unit === 'in' ? '#111' : 'transparent', color: unit === 'in' ? '#fff' : '#111', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
            >in</button>
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
        <div style={{ flexShrink: 0 }}>
          <DressSketch />
        </div>
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', minWidth: '260px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'center' }}>
            <thead>
              <tr>
                {['Size', 'Bust', 'Waist', 'Hip', ...(hasLength ? ['Length'] : [])].map((heading) => (
                  <th key={heading} style={{ padding: '8px 6px', borderBottom: '1px solid #ddd', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const isBest = recommendedSize && formatSizeLabel(recommendedSize) === row.size;
                const isSelected = selectedSize && formatSizeLabel(selectedSize) === row.size;
                const highlight = isBest || isSelected;
                const color = highlight ? '#b07b1a' : '#111';
                return (
                  <tr key={row.size}>
                    <td style={{ padding: '10px 6px', borderBottom: '1px solid #eee', fontWeight: 700, color }}>{isBest ? '👍 ' : ''}{row.size}</td>
                    <td style={{ padding: '10px 6px', borderBottom: '1px solid #eee', color, fontWeight: highlight ? 700 : 400 }}>{cmToDisplay(row.bust, unit)}</td>
                    <td style={{ padding: '10px 6px', borderBottom: '1px solid #eee', color, fontWeight: highlight ? 700 : 400 }}>{cmToDisplay(row.waist, unit)}</td>
                    <td style={{ padding: '10px 6px', borderBottom: '1px solid #eee', color, fontWeight: highlight ? 700 : 400 }}>{cmToDisplay(row.hip, unit)}</td>
                    {hasLength && (
                      <td style={{ padding: '10px 6px', borderBottom: '1px solid #eee', color, fontWeight: highlight ? 700 : 400 }}>{cmToDisplay(row.length, unit)}</td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default KlarelleSizeGuide;
