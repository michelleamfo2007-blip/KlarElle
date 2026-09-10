import React, { useMemo, useState } from 'react';
import { getColorHex, getDisplayImageForColor, parseProductColors } from '../utils/colors';

export function useProductColorImage(product) {
  const colors = useMemo(() => parseProductColors(product?.colors), [product?.colors]);
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');
  const image = getDisplayImageForColor(product, selectedColor);

  return { colors, selectedColor, setSelectedColor, image };
}

function ColorPreviewDots({ colors, selectedColor, onSelect }) {
  return (
    <div
      className="color-preview-dots"
      onClick={(event) => event.stopPropagation()}
    >
      {(colors || []).slice(0, 6).map((color) => (
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
          className={selectedColor === color ? 'is-selected' : ''}
          style={{ background: getColorHex(color) }}
        />
      ))}
    </div>
  );
}

export default ColorPreviewDots;
