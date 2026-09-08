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
        <div
          className="color-preview-dots"
          style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', position: 'relative', zIndex: 3 }}
          onClick={(event) => event.stopPropagation()}
        >
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
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
                border: selectedColor === color ? '2px solid #111' : '1px solid #ddd',
                background: getColorHex(color)
              }}
            />
          ))}
        </div>
      );
}

export default ColorPreviewDots;
