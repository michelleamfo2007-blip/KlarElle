import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Setup basic ES module dir structure
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const BASE_URL = 'https://www.klarelle.store';

async function generateSitemap() {
  try {
    console.log("Fetching products for sitemap...");
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, category')
      .eq('visibility', true)
      .eq('status', 'active');

    if (productError) throw productError;

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('name');

    if (catError) throw catError;

    const staticRoutes = [
      '/',
      '/cart',
      '/checkout',
      '/returns',
      '/track-order'
    ];

    const categoryRoutes = categories.map(c => `/category/${c.name.toLowerCase().replace(/\s+/g, '-')}`);
    
    const productRoutes = products.map(p => `/product/${p.id}`);

    const allRoutes = [...staticRoutes, ...categoryRoutes, ...productRoutes];

    const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '/' ? '1.0' : route.includes('/product/') ? '0.8' : '0.6'}</priority>
  </url>`).join('\n')}
</urlset>`;

    const outputPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, sitemapContent, 'utf-8');
    
    console.log(`Successfully generated sitemap.xml with ${allRoutes.length} URLs.`);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
}

generateSitemap();
