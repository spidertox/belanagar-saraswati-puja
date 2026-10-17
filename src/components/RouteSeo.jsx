import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageMeta, DEFAULT_OG_IMAGE, OG_IMAGE_ALT } from '../config/seo.js';

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Keeps <title>, meta description, canonical, Open Graph and robots in sync
// with the current page while the visitor clicks around (client side).
// The first load is served by the pre-rendered HTML from seoPlugin.js.
export default function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = getPageMeta(pathname);
    const origin = window.location.origin;
    const clean = pathname.replace(/\/+$/, '') || '/';
    const url = origin + (clean === '/' ? '/' : clean);

    document.title = meta.title;
    upsertMeta('name', 'description', meta.description);
    upsertMeta('name', 'robots', meta.noindex ? 'noindex, nofollow' : 'index, follow');
    upsertLink('canonical', url);

    upsertMeta('property', 'og:title', meta.title);
    upsertMeta('property', 'og:description', meta.description);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', origin + DEFAULT_OG_IMAGE);
    upsertMeta('property', 'og:image:alt', OG_IMAGE_ALT);
    upsertMeta('name', 'twitter:title', meta.title);
    upsertMeta('name', 'twitter:description', meta.description);
    upsertMeta('name', 'twitter:image', origin + DEFAULT_OG_IMAGE);
  }, [pathname]);

  return null;
}
