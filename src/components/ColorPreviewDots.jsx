import React, { useMemo, useState } from 'react';
import { getColorHex, getDisplayImageForColor, parseProductColors } from '../utils/colors';

export function useProductColorImage(product) {
  const colors = useMemo(() => parseProductColors(product?.colors), [product?.colors]);
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const image = getDisplayImageForColor(product, selectedColor);

  return { colors, selectedColor, setSelectedColor, image };
}

function ColorPreviewDots({ colors, selectedColor, onSelect }) {
  if (!colors?.length) return null;

  return (
    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
      {colors.slice(0, 6).map((color) => (
        <button
          key={color}
          type="button"
          title={color}
          aria-label={color}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onSelect(color);
          }}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            padding: 0,
            cursor: 'pointer',
            border: selectedColor === color ? '2px solid #111' : '1px solid #ddd',
            background: getColorHex(color)
          }}
        />
      ))}
    </div>
  );
}

export default ColorPreviewDots;
