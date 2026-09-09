import { createClient } from '@supabase/supabase-js';
import { absoluteUrl, buildProductJsonLd, pageDescription } from '../src/utils/seo.js';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  const id = req.query.id;
  const pageUrl = `https://www.klarelle.store/product/${id || ''}`;
  let title = 'KlarElle';
  let description = 'KlarElle — curated fashion chosen for quality, fit, and the feminine silhouette.';
  let image = '';
  let jsonLd = null;

  try {
    if (id && process.env.VITE_SUPABASE_URL && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
      );
      const { data } = await supabase
        .from('products')
        .select('id, name, description, image_url, price, sku, stock, stock_international, coming_soon')
        .eq('id', id)
        .maybeSingle();
      if (data?.name) {
        title = `${data.name} | KlarElle`;
        description = pageDescription(data.description, description);
        image = absoluteUrl(data.image_url);
        const soldOut = (Number(data.stock) || 0) + (Number(data.stock_international) || 0) <= 0;
        jsonLd = buildProductJsonLd(data, {
          url: pageUrl,
          image,
          soldOut,
          comingSoon: Boolean(data.coming_soon)
        });
      }
    }
  } catch (error) {
    console.error('product-share lookup failed', error);
  }

  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image);
  const safeUrl = escapeHtml(pageUrl);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="KlarElle" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeUrl}" />
    ${safeImage ? `<meta property="og:image" content="${safeImage}" />
    <meta property="og:image:alt" content="${safeTitle}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    ${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}
    ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
  </head>
  <body>
    <p>${safeTitle}</p>
  </body>
</html>`);
}
