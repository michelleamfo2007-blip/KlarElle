import {
  applySeoToHtml,
  buildSitemapXml,
  getRequestPath,
  loadSpaShell,
  resolveSeo
} from './_seo.js';

export default async function handler(req, res) {
  try {
    const pathname = getRequestPath(req);
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
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(500).send('<!doctype html><title>KlarElle</title><p>KlarElle is temporarily unavailable.</p>');
  }
}
