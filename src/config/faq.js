// FAQ content. Every answer below only states things that are already
// true on the site (see festivalConfig.js). If you add a question, do not
// guess a fact - leave the question out until you have the real answer.
//
// This list feeds BOTH the visible FAQ section and the FAQPage structured
// data that Google reads (see src/components/Faq.jsx and seoPlugin.js).
import { festivalConfig } from './festivalConfig.js';

const rows = festivalConfig.pujaDetails.rows;
const rowValue = (label) => (rows.find((r) => r.label === label) || {}).value || '';

export const faqItems = [
  {
    q: 'सरस्वती पूजा 2027 कब है?',
    a: `सरस्वती पूजा (वसंत पंचमी) ${rowValue('दिनांक')} को है। ${rowValue('हिन्दू तिथि')}।`,
  },
  {
    q: 'पूजा का शुभ मुहूर्त क्या है?',
    a: `पूजा का शुभ मुहूर्त ${rowValue('पूजा का शुभ मुहूर्त')} है। मध्याह्न क्षण ${rowValue('मध्याह्न क्षण')} पर है।`,
  },
  {
    q: 'पूजा में कौन-कौन से कार्यक्रम होते हैं?',
    a: `इस वर्ष के आयोजन में ${festivalConfig.highlights
      .map((h) => h.titleHindi)
      .join(', ')} शामिल हैं। पूरी जानकारी "पूजा कार्यक्रम" पेज पर देखें।`,
  },
  ...(festivalConfig.donation && festivalConfig.donation.upiId
    ? [
        {
          q: 'ऑनलाइन दान कैसे करें?',
          a: '"दान विवरण" पेज पर दिए QR कोड को किसी भी UPI ऐप (PhonePe, Google Pay, Paytm, BHIM) से स्कैन करें, या UPI ID कॉपी करके भुगतान करें। पैसा सीधे समिति के बैंक खाते में जाता है। भुगतान के बाद अपना नाम और राशि समिति को बताएं ताकि दान-सूची में जुड़ सके।',
        },
      ]
    : []),
  {
    q: 'दान और खर्च का हिसाब कहाँ देख सकते हैं?',
    a: 'हर दान और हर खर्च का विवरण वेबसाइट के "दान विवरण" और "खर्च का विवरण" पेज पर सार्वजनिक है। वहाँ कुल दान, कुल खर्च और शेष राशि भी दिखती है। कोई भी, कभी भी इसे देख सकता है।',
  },
  {
    q: 'क्या दानदाता का नाम सबको दिखता है?',
    a: 'दान की सूची सार्वजनिक है, लेकिन अगर कोई दानदाता गुप्त रहना चाहे तो उसका दान "Anonymous" के रूप में दिखाया जाता है। इसके लिए समिति से संपर्क करें।',
  },
  {
    q: 'समिति से कैसे जुड़ें या संपर्क करें?',
    a: 'आप "संपर्क करें" पेज के फ़ॉर्म से संदेश भेज सकते हैं, या समिति के WhatsApp ग्रुप से जुड़ने का अनुरोध भेज सकते हैं। ग्रुप एडमिन की मंज़ूरी के बाद आप शामिल हो जाएंगे।',
  },
  {
    q: 'क्या इस वेबसाइट पर मेरी जानकारी सुरक्षित है?',
    a: 'संपर्क फ़ॉर्म में आप जो जानकारी भरते हैं वह सिर्फ़ समिति तक पहुँचती है। Google Analytics तभी चालू होता है जब आप सहमति देते हैं। विस्तार से जानकारी "गोपनीयता नीति" पेज पर है।',
  },
];
