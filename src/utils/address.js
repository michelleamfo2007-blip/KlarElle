export function parseShippingAddress(value) {
  if (!value) return null;

  if (typeof value === 'object') {
    return {
      street: value.street || value.line_1 || '',
      line2: value.line2 || value.line_2 || value.apartment || '',
      city: value.city || '',
      state: value.state || value.region || '',
      zip: value.zip || value.postal_code || value.postcode || '',
      country: value.country || value.location || ''
    };
  }

  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object') {
      return parseShippingAddress(parsed);
    }
  } catch {
    // Treat as a plain comma-separated address
  }

  const parts = String(value).split(',').map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 4) {
    const country = parts[parts.length - 1];
    const hasZip = parts.length >= 5;
    return {
      street: parts[0],
      line2: '',
      city: parts[1],
      state: hasZip ? parts[2] : parts[2],
      zip: hasZip ? parts[3] : '',
      country
    };
  }

  return {
    street: String(value),
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: ''
  };
}

export function formatShippingAddress(value) {
  const address = parseShippingAddress(value);
  if (!address) return '';
  return [
    address.street,
    address.line2,
    address.city,
    [address.state, address.zip].filter(Boolean).join(' '),
    address.country
  ].filter(Boolean).join(', ');
}
