// Build-time SEO for a single-page app. Runs after `vite build` and writes into dist/:
//
//   sitemap.xml        every public page (from src/config/seo.js)
//   robots.txt         which crawlers may crawl what + the sitemap location
//   <page>/index.html  one real HTML file per page, with that page's own
//                      <title>, meta description, canonical and Open Graph tags,
//                      so WhatsApp / Facebook / Google previews are correct
//                      (those crawlers usually do not run JavaScript)
//   404.html           same app shell, marked noindex; Vercel serves it with a
//                      real HTTP 404 status for unknown URLs
//
// The site address comes from SITE_URL (e.g. https://belanagar-puja.in).
// On Vercel it falls back to the automatic VERCEL_PROJECT_PRODUCTION_URL.
import fs from 'node:fs';
import path from 'node:path';
import { PAGES, NOT_FOUND_PAGE, SITEMAP_PATHS, DEFAULT_OG_IMAGE, OG_IMAGE_ALT, SITE_NAME } from './src/config/seo.js';
import { faqItems } from './src/config/faq.js';

const START = '<!--seo:start-->';
const END = '<!--seo:end-->';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function resolveSiteUrl(env = process.env) {
  let url = (env.SITE_URL || '').trim();
  if (!url && env.VERCEL_PROJECT_PRODUCTION_URL) url = `https://${env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (!url && env.VERCEL_URL) url = `https://${env.VERCEL_URL}`;
  if (!url) return { url: 'https://example.com', guessed: true };
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return { url: url.replace(/\/+$/, ''), guessed: false };
}

function jsonLdFor(pathname, site) {
  const blocks = [];
  if (pathname === '/') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${site}/`,
      logo: `${site}/icon-512.png`,
    });
    blocks.push({ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${site}/`, inLanguage: 'hi' });
  }
  if (pathname === '/faq') {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  return blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b).replace(/</g, '\\u003c')}</script>`).join('\n    ');
}

export function headFor(pathname, meta, site) {
  const canonical = pathname === '/' ? `${site}/` : `${site}${pathname}`;
  const image = `${site}${DEFAULT_OG_IMAGE}`;
  const lines = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<meta name="robots" content="${meta.noindex ? 'noindex, nofollow' : 'index, follow'}" />`,
    pathname === '/404' ? '' : `<link rel="canonical" href="${esc(canonical)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${esc(SITE_NAME)}" />`,
    `<meta property="og:locale" content="hi_IN" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(OG_IMAGE_ALT)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    jsonLdFor(pathname, site),
  ].filter(Boolean);
  return `${START}\n    ${lines.join('\n    ')}\n    ${END}`;
}

export function injectHead(html, pathname, meta, site) {
  const block = headFor(pathname, meta, site);
  if (html.includes(START) && html.includes(END)) {
    return html.slice(0, html.indexOf(START)) + block + html.slice(html.indexOf(END) + END.length);
  }
  return html.replace('</head>', `    ${block}\n  </head>`);
}

export function buildSitemap(site, today = new Date().toISOString().slice(0, 10)) {
  const urls = SITEMAP_PATHS.map((p) => {
    const m = PAGES[p];
    return `  <url>
    <loc>${esc(p === '/' ? `${site}/` : `${site}${p}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${m.changefreq}</changefreq>
    <priority>${m.priority}</priority>
  </url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function buildRobots(site) {
  return `# robots.txt for ${site}
# Everyone may crawl the public site. The admin panel and the API are not for search engines.
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

# Search engines may read pages; AI model-training crawlers are not welcome.
User-agent: GPTBot
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: Google-Extended
Disallow: /

Sitemap: ${site}/sitemap.xml
`;
}

export default function seoPlugin() {
  let outDir = 'dist';
  let root = process.cwd();
  return {
    name: 'bsp-seo',
    apply: 'build',
    configResolved(cfg) {
      outDir = path.resolve(cfg.root, cfg.build.outDir);
      root = cfg.root;
    },
    closeBundle() {
      const { url: site, guessed } = resolveSiteUrl();
      if (guessed) {
        console.warn(
          '\n[seo] SITE_URL is not set, so sitemap.xml / canonical / og:image use https://example.com.\n' +
            '      Set SITE_URL=https://your-real-domain (Vercel > Settings > Environment Variables) and redeploy.\n'
        );
      }
      const shellPath = path.join(outDir, 'index.html');
      if (!fs.existsSync(shellPath)) return;
      const shell = fs.readFileSync(shellPath, 'utf8');

      const write = (rel, content) => {
        const file = path.join(outDir, rel);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
      };

      for (const [p, meta] of Object.entries(PAGES)) {
        const html = injectHead(shell, p, meta, site);
        write(p === '/' ? 'index.html' : `${p.slice(1)}/index.html`, html);
      }
      write('404.html', injectHead(shell, '/404', NOT_FOUND_PAGE, site));
      write('sitemap.xml', buildSitemap(site));
      write('robots.txt', buildRobots(site));
      void root;
    },
  };
}
