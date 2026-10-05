import { BookIcon, SwanIcon, VeenaIcon, LotusIcon, DiyaIcon, PageHeader } from '../components/Decor.jsx';

const sections = [
  {
    icon: LotusIcon,
    hindi: 'पूजा का उद्देश्य',
    body: 'यह आयोजन माँ सरस्वती की आराधना और श्रद्धा के साथ बेलानगर के निवासियों को एक साथ लाने के लिए किया जाता है। पूजा विधिपूर्वक और श्रद्धाभाव से संपन्न की जाती है, जिसमें हर आयु वर्ग के लोग सम्मिलित होते हैं।',
  },
  {
    icon: BookIcon,
    hindi: 'शिक्षा और ज्ञान का महत्व',
    body: 'माँ सरस्वती विद्या, संगीत और कला की देवी हैं। यह पूजा विद्यार्थियों और शिक्षाप्रेमियों के लिए विशेष महत्व रखती है, और ज्ञान के प्रति सम्मान को प्रोत्साहित करती है।',
  },
  {
    icon: SwanIcon,
    hindi: 'युवाओं की भागीदारी',
    body: 'समिति के कार्यों में क्षेत्र के युवाओं की सक्रिय भागीदारी रहती है — आयोजन, सजावट, सांस्कृतिक कार्यक्रम और व्यवस्था में उनका महत्वपूर्ण योगदान होता है।',
  },
  {
    icon: DiyaIcon,
    hindi: 'सामुदायिक सहयोग',
    body: 'यह आयोजन पूरी तरह से बेलानगर के निवासियों के सहयोग और दान से संभव होता है। समिति हर सहयोग के प्रति आभारी है और पूर्ण पारदर्शिता बनाए रखने का प्रयास करती है।',
  },
  {
    icon: VeenaIcon,
    hindi: 'सांस्कृतिक गतिविधियाँ',
    body: 'पूजा के अवसर पर सांस्कृतिक कार्यक्रमों का आयोजन किया जाता है, जिसमें स्थानीय कलाकारों और विद्यार्थियों को अपनी प्रतिभा प्रदर्शित करने का अवसर मिलता है।',
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader hindi="हमारे बारे में" english="About the samiti" />
      <p className="devanagari-body text-center text-navy-700">
        यह वेबसाइट बेलानगर सरस्वती पूजा समिति द्वारा आयोजित सरस्वती पूजा एवं सामुदायिक गतिविधियों का प्रतिनिधित्व करती
        है।
      </p>

      <div className="mt-12 space-y-10">
        {sections.map((s) => (
          <div key={s.hindi} className="flex items-start gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gold-100 text-maroon-700">
              <s.icon className="h-6 w-6" />
            </span>
            <div>
              <h3 className="devanagari text-lg text-maroon-700">{s.hindi}</h3>
              <p className="devanagari-body mt-1.5 text-sm leading-relaxed text-navy-700">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
