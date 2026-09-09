import {
  applySeoToHtml,
  buildMerchantFeedXml,
  buildSitemapXml,
  getRequestPath,
  loadSpaShell,
  resolveSeo
} from './_seo.js';

function sendXml(res, xml) {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.status(200).send(xml);
}

function isSitemapRequest(req, pathname) {
  const raw = `${req.url || ''} ${pathname || ''}`;
  return raw.includes('sitemap.xml');
}

function isMerchantFeedRequest(req, pathname) {
  const raw = `${req.url || ''} ${pathname || ''}`;
  return raw.includes('merchant-feed.xml');
}

const GOOGLE_VERIFY_FILES = {
  '/google07666fa51a374f045.html': 'google-site-verification: google07666fa51a374f045.html'
};

export default async function handler(req, res) {
  try {
    const pathname = getRequestPath(req);

    if (GOOGLE_VERIFY_FILES[pathname]) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.setHeader('X-Robots-Tag', 'noindex');
      return res.status(200).send(GOOGLE_VERIFY_FILES[pathname]);
    }

    if (isSitemapRequest(req, pathname)) {
      return sendXml(res, await buildSitemapXml());
    }

    if (isMerchantFeedRequest(req, pathname)) {
      return sendXml(res, await buildMerchantFeedXml());
    }

    const resolved = await resolveSeo(pathname);

    if (resolved.type === 'sitemap') {
      return sendXml(res, await buildSitemapXml());
    }

    if (resolved.type === 'merchant-feed') {
      return sendXml(res, await buildMerchantFeedXml());
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
    if (`${req.url || ''}`.includes('sitemap') || `${req.url || ''}`.includes('merchant-feed')) {
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
