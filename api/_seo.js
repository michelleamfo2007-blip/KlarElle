import { createClient } from '@supabase/supabase-js';
import { COLLECTION_ALIASES, getCollectionBySlug, STORE_COLLECTIONS } from '../src/data/collections.js';
import { getSitePage } from '../src/data/sitePages.js';
import {
  absoluteUrl,
  buildProductJsonLd,
  DEFAULT_SHARE_IMAGE,
  pageDescription,
  SITE_URL
} from '../src/utils/seo.js';
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  buildOrganizationJsonLd,
  formatDocumentTitle,
  getCollectionSeo,
  getStaticPageMeta,
  HOME_DESCRIPTION,
  INDEXABLE_POLICY_PATHS,
  isNoindexPath,
  normalizePath,
  PERMANENT_REDIRECTS
} from '../src/utils/seoPages.js';
import { isComingSoon, isPublishedOnStorefront, matchesCollection } from '../src/utils/storefront.js';

const NOT_FOUND = {
  status: 404,
  noindex: true,
  title: 'Page not found | KlarElle',
  description: 'This KlarElle page could not be found.',
  canonical: `${SITE_URL}/404`
};

let spaShellPromise = null;
let catalogCache = { at: 0, products: [] };

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export function getRequestPath(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.klarelle.store';
  const url = new URL(req.url, `https://${host}`);
  const fromQuery = url.searchParams.get('__path');
  if (fromQuery) return normalizePath(fromQuery);
  const forwarded = req.headers['x-forwarded-uri'] || req.headers['x-invoke-path'] || '';
  if (forwarded && !String(forwarded).startsWith('/api/')) {
    return normalizePath(String(forwarded).split('?')[0]);
  }
  return '/';
}

async function loadPublishedProducts() {
  if (Date.now() - catalogCache.at < 60_000) return catalogCache.products;
  const supabase = getSupabase();
  if (!supabase) return catalogCache.products;
  const { data } = await supabase
    .from('products')
    .select('id, name, description, image_url, price, sku, stock, stock_international, coming_soon, visibility, status, category, categories, tags, colors, material, composition, updated_at, created_at')
    .eq('visibility', true)
    .eq('status', 'active');
  catalogCache = { at: Date.now(), products: data || [] };
  return catalogCache.products;
}

function jsonLdTags(blocks) {
  return (Array.isArray(blocks) ? blocks : [blocks])
    .filter(Boolean)
    .map((block) => `<script type="application/ld+json">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`)
    .join('\n    ');
}

export function applySeoToHtml(html, seo) {
  const title = escapeHtml(formatDocumentTitle(seo.title));
  const description = escapeHtml(seo.description || HOME_DESCRIPTION);
  const canonical = escapeHtml(seo.canonical || SITE_URL);
  const image = escapeHtml(seo.image || DEFAULT_SHARE_IMAGE);
  const type = seo.type === 'product' ? 'product' : 'website';
  const robots = seo.noindex ? 'noindex, follow' : 'index, follow';

  let next = html;
  next = next.replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`);
  next = next.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  next = next.replace(/<link rel="canonical" href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  next = next.replace(/<meta property="og:title" content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  next = next.replace(/<meta property="og:description" content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  next = next.replace(/<meta property="og:url" content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  next = next.replace(/<meta property="og:type" content="[^"]*"\s*\/?>/i, `<meta property="og:type" content="${type}" />`);
  next = next.replace(/<meta property="og:image" content="[^"]*"\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
  next = next.replace(/<meta property="og:image:alt" content="[^"]*"\s*\/?>/i, `<meta property="og:image:alt" content="${title}" />`);
  next = next.replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  next = next.replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
  next = next.replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);

  if (!/<meta name="robots"/i.test(next)) {
    next = next.replace('</title>', `</title>\n    <meta name="robots" content="${robots}" />`);
  } else {
    next = next.replace(/<meta name="robots" content="[^"]*"\s*\/?>/i, `<meta name="robots" content="${robots}" />`);
  }

  next = next.replace(/<script id="klarelle-jsonld"[^>]*>[\s\S]*?<\/script>/i, '');
  if (seo.jsonLd) {
    next = next.replace('</head>', `    ${jsonLdTags(seo.jsonLd)}\n  </head>`);
  }
  return next;
}

export async function loadSpaShell(req) {
  if (spaShellPromise) return spaShellPromise;
  spaShellPromise = (async () => {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.klarelle.store';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const response = await fetch(`${proto}://${host}/spa-shell.html`);
    if (!response.ok) throw new Error(`Could not load spa-shell.html (${response.status})`);
    return response.text();
  })().catch((error) => {
    spaShellPromise = null;
    throw error;
  });
  return spaShellPromise;
}

function knownCollection(slug) {
  return slug === 'all' || slug === 'collections' || Boolean(getCollectionBySlug(slug)) || Boolean(COLLECTION_ALIASES[slug]);
}

export async function resolveSeo(pathname) {
  const path = normalizePath(pathname);

  if (path === '/sitemap.xml') {
    return { type: 'sitemap' };
  }

  if (PERMANENT_REDIRECTS[path]) {
    return { status: 301, redirect: `${SITE_URL}${PERMANENT_REDIRECTS[path]}` };
  }

  if (isNoindexPath(path)) {
    return {
      status: 200,
      noindex: true,
      title: formatDocumentTitle(path.replace(/^\//, '') || 'KlarElle'),
      description: HOME_DESCRIPTION,
      canonical: `${SITE_URL}${path}`,
      image: DEFAULT_SHARE_IMAGE,
      type: 'website'
    };
  }

  const staticMeta = getStaticPageMeta(path);
  if (staticMeta) {
    const jsonLd = [path === '/' ? buildOrganizationJsonLd() : null];
    if (path === '/page/faq') jsonLd.push(buildFaqJsonLd(getSitePage('faq')?.body));
    return {
      status: 200,
      ...staticMeta,
      canonical: `${SITE_URL}${path}`,
      image: DEFAULT_SHARE_IMAGE,
      type: 'website',
      jsonLd
    };
  }

  if (path.startsWith('/page/')) {
    const slug = path.slice('/page/'.length);
    const page = getSitePage(slug);
    if (!page) return { ...NOT_FOUND, canonical: `${SITE_URL}${path}` };
    return {
      status: 200,
      title: formatDocumentTitle(page.title),
      description: pageDescription(page.body, `${page.title} — KlarElle.`),
      canonical: `${SITE_URL}${page.path}`,
      image: DEFAULT_SHARE_IMAGE,
      type: 'website'
    };
  }

  if (path.startsWith('/category/')) {
    const slug = path.slice('/category/'.length);
    if (!knownCollection(slug)) return { ...NOT_FOUND, canonical: `${SITE_URL}${path}` };
    const products = await loadPublishedProducts();
    const listed = products.filter((product) => isPublishedOnStorefront(product) && !isComingSoon(product) && matchesCollection(product, slug));
    const seo = getCollectionSeo(slug);
    const empty = listed.length === 0;
    return {
      status: 200,
      noindex: empty,
      title: seo.title,
      description: seo.description,
      canonical: `${SITE_URL}${path}`,
      image: listed[0]?.image_url ? absoluteUrl(listed[0].image_url) : DEFAULT_SHARE_IMAGE,
      type: 'website',
      jsonLd: [
        buildBreadcrumbJsonLd([
          { name: 'Home', url: `${SITE_URL}/` },
          { name: seo.heading, url: `${SITE_URL}${path}` }
        ])
      ]
    };
  }

  if (path.startsWith('/product/')) {
    const id = path.slice('/product/'.length);
    const products = await loadPublishedProducts();
    const product = products.find((item) => item.id === id);
    if (!product || !isPublishedOnStorefront(product)) {
      return { ...NOT_FOUND, canonical: `${SITE_URL}${path}` };
    }
    const image = absoluteUrl(product.image_url);
    const soldOut = (Number(product.stock) || 0) + (Number(product.stock_international) || 0) <= 0;
    const collectionSlug = Array.isArray(product.categories) ? product.categories[0] : product.category;
    return {
      status: 200,
      title: formatDocumentTitle(product.name),
      description: pageDescription(product.description, `${product.name} from KlarElle.`),
      canonical: `${SITE_URL}/product/${product.id}`,
      image: image || DEFAULT_SHARE_IMAGE,
      type: 'product',
      jsonLd: [
        buildProductJsonLd(product, {
          url: `${SITE_URL}/product/${product.id}`,
          image,
          soldOut,
          comingSoon: isComingSoon(product)
        }),
        buildBreadcrumbJsonLd([
          { name: 'Home', url: `${SITE_URL}/` },
          collectionSlug ? { name: String(collectionSlug).replace(/-/g, ' '), url: `${SITE_URL}/category/${collectionSlug}` } : null,
          { name: product.name, url: `${SITE_URL}/product/${product.id}` }
        ].filter(Boolean))
      ]
    };
  }

  return { ...NOT_FOUND, canonical: `${SITE_URL}${path}` };
}

function xmlEscape(value) {
  return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function isCleanSitemapUrl(loc) {
  try {
    const path = new URL(loc).pathname;
    return !path.includes('&') && !/%26/i.test(path);
  } catch {
    return false;
  }
}

export async function buildSitemapXml() {
  const products = (await loadPublishedProducts()).filter((product) => isPublishedOnStorefront(product) && !isComingSoon(product));
  const now = new Date().toISOString();
  const categorySlugs = [
    ...STORE_COLLECTIONS.map((collection) => collection.slug),
    ...Object.keys(COLLECTION_ALIASES),
    'all'
  ];
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: now, priority: '1.0' },
    ...INDEXABLE_POLICY_PATHS.map((path) => ({ loc: `${SITE_URL}${path}`, lastmod: now, priority: '0.7' }))
  ];

  for (const slug of [...new Set(categorySlugs)]) {
    if (String(slug).includes('&')) continue;
    const matchSlug = COLLECTION_ALIASES[slug] || slug;
    const listed = products.filter((product) => matchesCollection(product, matchSlug));
    if (!listed.length && slug !== 'new-in' && slug !== 'all') continue;
    const latest = listed.reduce((max, product) => {
      const stamp = product.updated_at || product.created_at;
      return stamp && stamp > max ? stamp : max;
    }, now);
    urls.push({
      loc: `${SITE_URL}/category/${slug}`,
      lastmod: latest,
      priority: slug === 'new-in' ? '0.8' : '0.7'
    });
  }

  for (const product of products) {
    urls.push({
      loc: `${SITE_URL}/product/${product.id}`,
      lastmod: product.updated_at || product.created_at || now,
      priority: '0.8'
    });
  }

  const safeUrls = urls.filter((url) => isCleanSitemapUrl(url.loc));

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${safeUrls.map((url) => `  <url>
    <loc>${xmlEscape(url.loc)}</loc>
    <lastmod>${String(url.lastmod).slice(0, 10)}</lastmod>
    <changefreq>${url.loc === `${SITE_URL}/` ? 'daily' : 'weekly'}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}
