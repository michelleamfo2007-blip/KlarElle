import { cloudinaryUrl, imageSrcSet, productImageAlt } from '../utils/media';

function ProductImage({
  src,
  alt,
  product,
  extras,
  className,
  style,
  sizes = '(max-width: 700px) 50vw, 320px',
  widths = [400, 800, 1200],
  lazy = true,
  priority = false
}) {
  const label = alt || productImageAlt(product, extras);
  if (!src) return null;

  return (
    <img
      src={cloudinaryUrl(src, { width: priority ? 900 : 600 }) || src}
      srcSet={imageSrcSet(src, widths)}
      sizes={sizes}
      alt={label}
      className={className}
      style={style}
      loading={priority ? 'eager' : lazy ? 'lazy' : 'eager'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}

export default ProductImage;
