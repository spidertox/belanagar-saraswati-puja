// Single source of truth for every page's <title>, meta description and
// robots rule. It is used in TWO places:
//   1. src/components/RouteSeo.jsx  - updates the tab title / meta tags when
//      the visitor moves between pages (client side).
//   2. seoPlugin.js (build time)    - writes a real HTML file per page, plus
//      sitemap.xml and robots.txt, so WhatsApp / Google / Facebook crawlers
//      (which often do NOT run JavaScript) see the right title and preview.
//
// Keep this file plain JavaScript with no imports from React or Vite.

export const SITE_NAME = 'बेलानगर सरस्वती पूजा समिति';
export const SITE_NAME_EN = 'Belanagar Saraswati Puja Samiti';
export const DEFAULT_OG_IMAGE = '/og-image.png'; // 1200x630
export const OG_IMAGE_ALT = 'बेलानगर सरस्वती पूजा समिति - माँ सरस्वती की पूजा';

export const PAGES = {
  '/': {
    title: 'बेलानगर सरस्वती पूजा समिति | Belanagar Saraswati Puja 2027',
    description:
      'बेलानगर सरस्वती पूजा समिति की आधिकारिक वेबसाइट: पूजा की तारीख व शुभ मुहूर्त, कार्यक्रम, दान और खर्च का पूरा हिसाब, गैलरी और संपर्क।',
    changefreq: 'weekly',
    priority: '1.0',
  },
  '/about': {
    title: 'हमारे बारे में | बेलानगर सरस्वती पूजा समिति',
    description:
      'जानिए बेलानगर सरस्वती पूजा समिति का उद्देश्य, इतिहास और सामुदायिक सहयोग से होने वाला यह आयोजन, जिसमें हर आयु वर्ग के लोग शामिल होते हैं।',
    changefreq: 'yearly',
    priority: '0.7',
  },
  '/events': {
    title: 'पूजा कार्यक्रम 2027 | बेलानगर सरस्वती पूजा',
    description:
      'सरस्वती पूजा (वसंत पंचमी) 2027 का पूरा कार्यक्रम: तारीख, शुभ मुहूर्त, आरती, प्रसाद, सांस्कृतिक कार्यक्रम और विसर्जन की जानकारी।',
    changefreq: 'weekly',
    priority: '0.9',
  },
  '/donations': {
    title: 'दान विवरण | बेलानगर सरस्वती पूजा समिति',
    description:
      'बेलानगर सरस्वती पूजा में प्राप्त हर दान का सार्वजनिक विवरण: कुल दान, खर्च और शेष राशि। पूर्ण पारदर्शिता के साथ।',
    changefreq: 'daily',
    priority: '0.8',
  },
  '/expenses': {
    title: 'खर्च का विवरण | बेलानगर सरस्वती पूजा समिति',
    description:
      'पूजा आयोजन में हुए हर खर्च का श्रेणीवार सार्वजनिक हिसाब: मूर्ति, सजावट, प्रसाद, भोजन और अन्य। कोई भी कभी भी देख सकता है।',
    changefreq: 'daily',
    priority: '0.8',
  },
  '/gallery': {
    title: 'फोटो गैलरी | बेलानगर सरस्वती पूजा',
    description: 'बेलानगर सरस्वती पूजा की तस्वीरें: मूर्ति स्थापना, पूजा, आरती, सांस्कृतिक कार्यक्रम और विसर्जन के यादगार पल।',
    changefreq: 'weekly',
    priority: '0.6',
  },
  '/committee': {
    title: 'समिति के सदस्य | बेलानगर सरस्वती पूजा समिति',
    description: 'बेलानगर सरस्वती पूजा समिति के सदस्यों और पदाधिकारियों की जानकारी, जो पूजा के हर आयोजन की ज़िम्मेदारी संभालते हैं।',
    changefreq: 'monthly',
    priority: '0.5',
  },
  '/faq': {
    title: 'अक्सर पूछे जाने वाले सवाल (FAQ) | बेलानगर सरस्वती पूजा',
    description:
      'पूजा की तारीख, शुभ मुहूर्त, दान, खर्च के हिसाब और समिति से संपर्क के बारे में सबसे ज़्यादा पूछे जाने वाले सवालों के जवाब।',
    changefreq: 'monthly',
    priority: '0.7',
  },
  '/contact': {
    title: 'संपर्क करें | बेलानगर सरस्वती पूजा समिति',
    description:
      'बेलानगर सरस्वती पूजा समिति से संपर्क करें: संदेश भेजें, WhatsApp ग्रुप से जुड़ें और पूजा स्थल का नक्शा देखें।',
    changefreq: 'monthly',
    priority: '0.7',
  },
  '/privacy-policy': {
    title: 'गोपनीयता नीति (Privacy Policy) | बेलानगर सरस्वती पूजा समिति',
    description:
      'हमारी वेबसाइट कौन-सा डेटा इकट्ठा करती है (Google Analytics, संपर्क फ़ॉर्म) और उसका उपयोग कैसे होता है, इसकी पूरी जानकारी।',
    changefreq: 'yearly',
    priority: '0.3',
  },
  '/thank-you': {
    title: 'धन्यवाद! संदेश मिल गया | बेलानगर सरस्वती पूजा समिति',
    description: 'आपका संदेश बेलानगर सरस्वती पूजा समिति तक पहुँच गया है।',
    noindex: true,
  },
};

PAGES['/signup'] = { title: 'खाता बनाएं | बेलानगर सरस्वती पूजा समिति', description: 'बेलानगर सरस्वती पूजा समिति की वेबसाइट पर अपने असली ईमेल से खाता बनाएं और पूजा से जुड़ी सुविधाओं का उपयोग करें।', noindex: true };
PAGES['/login'] = { title: 'लॉगिन | बेलानगर सरस्वती पूजा समिति', description: 'बेलानगर सरस्वती पूजा समिति की वेबसाइट पर अपने खाते में लॉगिन करें और अपनी प्रोफ़ाइल व जानकारी देखें।', noindex: true };
PAGES['/account'] = { title: 'मेरा खाता | बेलानगर सरस्वती पूजा समिति', description: 'आपका प्रोफ़ाइल।', noindex: true };

// Used for every URL that is not listed above (and for /404.html).
export const NOT_FOUND_PAGE = {
  title: 'पृष्ठ नहीं मिला (404) | बेलानगर सरस्वती पूजा समिति',
  description: 'यह पृष्ठ उपलब्ध नहीं है। होम पेज पर वापस जाएं।',
  noindex: true,
};

export const ADMIN_PAGE = {
  title: 'Admin | बेलानगर सरस्वती पूजा समिति',
  description: 'समिति का प्रबंधन पैनल।',
  noindex: true,
};

export function getPageMeta(pathname) {
  const clean = (pathname || '/').replace(/\/+$/, '') || '/';
  if (clean === '/admin' || clean.startsWith('/admin/')) return ADMIN_PAGE;
  return PAGES[clean] || NOT_FOUND_PAGE;
}

// Public pages that belong in sitemap.xml (everything not noindex).
export const SITEMAP_PATHS = Object.keys(PAGES).filter((p) => !PAGES[p].noindex);
