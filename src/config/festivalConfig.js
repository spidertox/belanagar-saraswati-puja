// Central configuration for the site. Edit values here rather than
// scattering festival details across components/pages.
//
// Anything left blank/empty is intentional: the UI shows a graceful
// fallback instead of inventing information (see each page for details).
export const festivalConfig = {
  nameHindi: 'बेलानगर सरस्वती पूजा समिति',
  nameEnglish: 'Belanagar Saraswati Puja Samiti',
  shortNameHindi: 'बेलानगर पूजा समिति',
  festivalYear: 2027,

  // ISO date-time with offset, e.g. '2026-01-23T09:00:00+05:30'.
  // Leave blank to hide the countdown rather than show a wrong date.
  pujaDateTime: '2027-02-11T07:03:00+05:30', // start of the shubh muhurat

  // Card shown on the Home and Programme pages. Edit the title/rows each
  // year; the card simply renders whatever is listed here.
  pujaDetails: {
    title: 'सरस्वती पूजा (वसंत पंचमी) 2027',
    rows: [
      { label: 'दिनांक', value: 'गुरुवार, 11 फरवरी 2027' },
      { label: 'हिन्दू तिथि', value: 'माघ मास, शुक्ल पक्ष, पंचमी तिथि' },
      {
        label: 'पूजा का शुभ मुहूर्त',
        value: 'सुबह 07:03 AM से दोपहर 12:36 PM तक',
        note: 'अवधि: 05 घंटे 32 मिनट',
        highlight: true,
      },
      { label: 'मध्याह्न क्षण', value: 'दोपहर 12:36 PM' },
      { label: 'पंचमी तिथि प्रारम्भ', value: '11 फरवरी 2027 को सुबह 03:04 AM' },
      { label: 'पंचमी तिथि समाप्त', value: '12 फरवरी 2027 को सुबह 03:18 AM' },
    ],
  },

  // Logo (a file in /public) used in the navbar, hero and footer.
  logoSrc: '/logo.png',
  logoWidth: 464,
  logoHeight: 516,

  location: 'Belanagar',
  address: '',

  // Set from the committee's GPS reading: 26°07'57"N 86°40'32"E
  coordinates: { lat: 26.1325, lng: 86.675556 },

  contact: {
    phone: '',
    email: '',
  },

  social: {
    facebook: '',
    instagram: '',
    youtube: '',
  },

  // Committee WhatsApp group. Tapping the QR code or the button opens the
  // group's invite page in WhatsApp. If you ever use "Reset link" inside
  // WhatsApp, the old link and QR stop working: paste the new link here and
  // replace public/whatsapp-group-qr.png with the new QR image.
  whatsapp: {
    groupName: 'बेला नगर सरस्वती पूजा समिति (BN-SPC)',
    inviteUrl: 'https://chat.whatsapp.com/Imum2f2S9vOJ3wXFsXy2F9',
    qrSrc: '/whatsapp-group-qr.png',
    qrSize: 524,
    joinNote: 'जुड़ने का अनुरोध भेजने के बाद ग्रुप एडमिन की मंज़ूरी से आप शामिल होंगे।',
  },

  // Shown as cards on the home page. `icon` is one of: kalash, aarti, laddu, music,
  // waves (the drawings live in src/components/Icons.jsx).
  highlights: [
    { id: 'puja', icon: 'kalash', titleHindi: 'पूजा', description: 'विधिपूर्वक सरस्वती पूजा एवं अंजलि' },
    { id: 'aarti', icon: 'aarti', titleHindi: 'आरती', description: 'प्रातः एवं संध्या आरती' },
    { id: 'prasad', icon: 'laddu', titleHindi: 'प्रसाद', description: 'सभी श्रद्धालुओं के लिए प्रसाद वितरण' },
    { id: 'cultural', icon: 'music', titleHindi: 'सांस्कृतिक कार्यक्रम', description: 'गायन, नृत्य एवं सांस्कृतिक प्रस्तुतियाँ' },
    { id: 'visarjan', icon: 'waves', titleHindi: 'विसर्जन', description: 'मूर्ति विसर्जन शोभायात्रा' },
  ],

  developerCredit: 'KRISHNA',
};
