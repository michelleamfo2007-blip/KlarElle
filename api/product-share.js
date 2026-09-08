import { createClient } from '@supabase/supabase-js';

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function absoluteUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://www.klarelle.store${url.startsWith('/') ? url : `/${url}`}`;
}

export default async function handler(req, res) {
  const id = req.query.id;
  const pageUrl = `https://www.klarelle.store/product/${id || ''}`;
  let title = 'KLARELLE';
  let description = 'KLARELLE - Premium Fashion and Apparel. Shop the latest collections of dresses, tops, and more.';
  let image = '';

  try {
    if (id && process.env.VITE_SUPABASE_URL && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
      );
      const { data } = await supabase
        .from('products')
        .select('name, description, image_url')
        .eq('id', id)
        .maybeSingle();
      if (data?.name) {
        title = `${data.name} | KLARELLE`;
        description = (data.description || description).replace(/\s+/g, ' ').slice(0, 160);
        image = absoluteUrl(data.image_url);
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
    <meta property="og:site_name" content="KLARELLE" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:url" content="${safeUrl}" />
    ${safeImage ? `<meta property="og:image" content="${safeImage}" />
    <meta property="og:image:alt" content="${safeTitle}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    ${safeImage ? `<meta name="twitter:image" content="${safeImage}" />` : ''}
  </head>
  <body>
    <p>${safeTitle}</p>
  </body>
</html>`);
}
