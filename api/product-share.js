import {
  applySeoToHtml,
  buildSitemapXml,
  getRequestPath,
  loadSpaShell,
  resolveSeo
} from './_seo.js';

function isSitemapRequest(req, pathname) {
  const raw = `${req.url || ''} ${pathname || ''}`;
  return raw.includes('sitemap.xml');
}

export default async function handler(req, res) {
  try {
    const pathname = getRequestPath(req);

    if (isSitemapRequest(req, pathname)) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).send(await buildSitemapXml());
    }

    const resolved = await resolveSeo(pathname);

    if (resolved.type === 'sitemap') {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).send(await buildSitemapXml());
    }

    if (resolved.status === 301 && resolved.redirect) {
      res.setHeader('Location', resolved.redirect);
      return res.status(301).end();
    }

    const html = applySeoToHtml(await loadSpaShell(req), resolved);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', resolved.status === 404 ? 'no-store' : 'public, max-age=60');
    if (resolved.noindex) res.setHeader('X-Robots-Tag', 'noindex, follow');
    return res.status(resolved.status || 200).send(html);
  } catch (error) {
    console.error('seo document failed', error);
    if (`${req.url || ''}`.includes('sitemap')) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8');
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://www.klarelle.store/</loc></url>
</urlset>
`);
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<!doctype html><title>KlarElle</title><p>KlarElle is temporarily unavailable.</p>');
  }
}
