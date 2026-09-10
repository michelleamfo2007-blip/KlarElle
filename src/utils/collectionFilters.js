import { parseProductColors } from './colors';
import { formatSizeLabel, normalizeSizeList } from './size';

const TYPE_VALUES = ['Bodycon', 'A Line', 'A-Line', 'Cami', 'Fitted', 'Shirt', 'Tunic', 'Fit and Flare', 'Gown', 'Maxi Dress', 'Mini Dress', 'Midi Dress'];
const LENGTH_VALUES = ['Maxi', 'Long', 'Midi', 'Mini', 'Knee Length', 'Short'];
const STYLE_VALUES = ['Elegant', 'Sexy', 'Party', 'Party Wear', 'Casual', 'Boho', 'Bohemian', 'Modest', 'Vintage', 'Cute', 'Office Wear', 'Streetwear'];
const PATTERN_VALUES = ['Plain', 'Plants', 'All Over Print', 'Random Print', 'Colorblock', 'Floral', 'Striped', 'Polka Dot', 'Plaid', 'Checkered', 'Animal Print', 'Geometric', 'Abstract', 'Other'];
const OCCASION_VALUES = ['Formal & Evening', 'Wedding', 'Vacation', 'Beach', 'Night Out', 'Stage & Concert', 'Dating', 'Homecoming', 'Daily', 'Holiday', 'Birthday Party', 'Bachelorette Party', 'Home', 'Travel', 'Office', 'Garden', 'Country Concert', 'Tea Party', 'Photoshoot', 'Baby Shower Party', 'Street', 'Airport', 'Brunch', 'Evening', 'Dinner', 'Gala', 'Party'];
const WAIST_VALUES = ['High Waist', 'Natural(Mid Waist)', 'Mid Waist', 'Low Waist'];
const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '2XL', '3XL', '4XL'];

function splitValues(value) {
  if (Array.isArray(value)) return value.flatMap(splitValues);
  if (value == null || value === '') return [];
  return String(value).split(/[;,|/]+/).map((item) => item.trim()).filter(Boolean);
}

function uniqueSorted(values, sortFn) {
  const seen = new Map();
  for (const value of values) {
    const label = String(value || '').trim();
    if (!label) continue;
    const key = label.toLowerCase();
    if (!seen.has(key)) seen.set(key, label);
  }
  const list = [...seen.values()];
  list.sort(sortFn || ((a, b) => a.localeCompare(b)));
  return list;
}

function sizeSort(a, b) {
  const ia = SIZE_ORDER.indexOf(formatSizeLabel(a));
  const ib = SIZE_ORDER.indexOf(formatSizeLabel(b));
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return a.localeCompare(b);
}

function inList(list, value) {
  const key = String(value || '').trim().toLowerCase();
  return list.some((item) => item.toLowerCase() === key);
}

function isMetaTag(tag) {
  return /^(cat:|availability:|coming-soon)/i.test(String(tag || '').trim());
}

function productSizes(product) {
  const fromField = normalizeSizeList(splitValues(product?.sizes));
  const variants = product?.variant_images;
  if (!variants || typeof variants !== 'object') return fromField;
  const fromStock = [];
  Object.values(variants).forEach((entry) => {
    if (!entry || typeof entry !== 'object') return;
    fromStock.push(...Object.keys(entry.stock || {}));
    fromStock.push(...Object.keys(entry.stock_international || {}));
  });
  return [...fromField, ...normalizeSizeList(fromStock)];
}

export function buildCollectionFilterOptions(products = []) {
  const type = [];
  const color = [];
  const size = [];
  const length = [];
  const style = [];
  const pattern = [];
  const occasion = [];
  const waist = [];

  for (const product of products) {
    color.push(...parseProductColors(product.colors));
    size.push(...productSizes(product));
    type.push(...splitValues(product.type || product.silhouette || product.fit));
    length.push(...splitValues(product.dress_length || product.length_label));
    style.push(...splitValues(product.style));
    pattern.push(...splitValues(product.pattern_type));
    occasion.push(...splitValues(product.occasion));
    waist.push(...splitValues(product.waist_line || product.waistline));

    const tags = Array.isArray(product.tags) ? product.tags : splitValues(product.tags);
    for (const tag of tags) {
      if (isMetaTag(tag)) continue;
      if (inList(TYPE_VALUES, tag)) type.push(tag);
      else if (inList(LENGTH_VALUES, tag)) length.push(tag);
      else if (inList(STYLE_VALUES, tag)) style.push(tag);
      else if (inList(PATTERN_VALUES, tag)) pattern.push(tag);
      else if (inList(WAIST_VALUES, tag)) waist.push(tag);
      else if (inList(OCCASION_VALUES, tag)) occasion.push(tag);
    }
  }

  return {
    Type: uniqueSorted(type),
    Color: uniqueSorted(color),
    Size: uniqueSorted(size, sizeSort),
    Length: uniqueSorted(length.filter((value) => !/^\d+(\.\d+)?$/.test(value))),
    Style: uniqueSorted(style),
    PatternType: uniqueSorted(pattern),
    Occasion: uniqueSorted(occasion),
    WaistLine: uniqueSorted(waist)
  };
}

export function productMatchesFilterValue(product, key, selectedOptions) {
  if (!selectedOptions?.length) return true;
  const wanted = selectedOptions.map((item) => String(item).toLowerCase());
  const has = (values) => values.some((value) => wanted.includes(String(value).toLowerCase()));
  const tags = (Array.isArray(product.tags) ? product.tags : splitValues(product.tags))
    .filter((tag) => !isMetaTag(tag));

  if (key === 'Color') return has(parseProductColors(product.colors));
  if (key === 'Size') return has(productSizes(product));
  if (key === 'Style') return has([...splitValues(product.style), ...tags]);
  if (key === 'PatternType') return has([...splitValues(product.pattern_type), ...tags]);
  if (key === 'Type') return has([...splitValues(product.type), ...splitValues(product.silhouette), ...splitValues(product.fit), ...tags]);
  if (key === 'Length') return has([...splitValues(product.dress_length || product.length_label), ...tags]);
  if (key === 'Occasion') return has([...splitValues(product.occasion), ...tags]);
  if (key === 'WaistLine') return has([...splitValues(product.waist_line || product.waistline), ...tags]);

  return has(tags);
}
