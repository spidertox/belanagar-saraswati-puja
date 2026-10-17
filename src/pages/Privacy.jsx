import { Link } from 'react-router-dom';
import { PageHeader } from '../components/Decor.jsx';
import { festivalConfig } from '../config/festivalConfig.js';
import { analyticsEnabled, getConsent, setConsent } from '../lib/analytics.js';
import { useState } from 'react';

const UPDATED = '14 अक्टूबर 2026';

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="devanagari text-2xl text-maroon-700">{title}</h2>
      <div className="devanagari-body mt-3 space-y-3 text-sm leading-relaxed text-navy-700">{children}</div>
    </section>
  );
}

export default function Privacy() {
  const [consent, setLocal] = useState(() => getConsent());
  const change = (v) => {
    setConsent(v);
    setLocal(v);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <PageHeader hindi="गोपनीयता नीति" english="Privacy Policy" />
      <p className="text-center text-xs text-navy-500">अंतिम अपडेट: {UPDATED}</p>

      <div className="mt-6 rounded-2xl border border-gold-300/40 bg-white p-6 shadow-card sm:p-8">
        <p className="devanagari-body text-sm leading-relaxed text-navy-700">
          यह वेबसाइट {festivalConfig.nameHindi} ({festivalConfig.nameEnglish}) द्वारा चलाई जाती है। यह पृष्ठ सरल भाषा में बताता है कि यहाँ
          आपकी कौन-सी जानकारी इकट्ठा होती है, क्यों, और आपके पास क्या विकल्प हैं।
        </p>

        <Section title="1. हम कौन-सी जानकारी इकट्ठा करते हैं">
          <p>
            <strong>संपर्क फ़ॉर्म:</strong> जब आप "संपर्क करें" पेज से संदेश भेजते हैं तो आपका नाम, संदेश और (अगर आप लिखें तो) फ़ोन नंबर
            या ईमेल हमें मिलता है। यह जानकारी सिर्फ़ आपके सवाल का जवाब देने के लिए है।
          </p>
          <p>
            <strong>खाता (साइन-अप):</strong> खाता बनाने पर आपका नाम, ईमेल, पासवर्ड (केवल एन्क्रिप्टेड/hash रूप में) और, अगर आप लगाएं, प्रोफ़ाइल फोटो
            सुरक्षित रखी जाती है। ईमेल पर सिर्फ़ सत्यापन कोड भेजा जाता है। लॉगिन बनाए रखने के लिए एक ज़रूरी कुकी (user_session) लगती है।
          </p>
          <p>
            <strong>ऑनलाइन दान:</strong> दान दर्ज करने पर आपका नाम, (वैकल्पिक) मोबाइल, राशि और UTR समिति के रिकॉर्ड में रखा जाता है। मोबाइल केवल समिति देखती है।
          </p>
          <p>
            <strong>Google Analytics (केवल आपकी सहमति से):</strong> हम जानना चाहते हैं कि कितने लोग कौन-से पेज देखते हैं, ताकि वेबसाइट
            बेहतर बना सकें। इसके लिए Google Analytics कुकीज़ और गुमनाम उपयोग-आँकड़े (पेज, डिवाइस का प्रकार, अनुमानित शहर) इकट्ठा करता है। आपकी सहमति के बिना यह चालू नहीं होता।
          </p>
          <p>
            <strong>दान और खर्च की सूची:</strong> पारदर्शिता के लिए दान देने वालों के नाम और राशि सार्वजनिक सूची में दिखते हैं। जो
            दानदाता गुप्त रहना चाहते हैं उनका नाम "Anonymous" दिखाया जाता है। अपना नाम हटवाने या गुप्त करवाने के लिए हमसे संपर्क करें।
          </p>
        </Section>

        <Section title="2. तीसरे पक्ष की सेवाएँ">
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Cloudflare Turnstile</strong> - संपर्क फ़ॉर्म पर स्पैम रोकने के लिए "Verify you are human" जाँच। यह आपके ब्राउज़र की कुछ
              तकनीकी जानकारी Cloudflare को भेजता है।
            </li>
            <li>
              <strong>Google Analytics</strong> - ऊपर बताए अनुसार, सिर्फ़ सहमति मिलने पर।
            </li>
            <li>
              <strong>Google Fonts और Google Maps</strong> - अक्षर (फ़ॉन्ट) और संपर्क पेज का नक्शा दिखाने के लिए। इन्हें लोड करते समय आपका
              IP पता Google तक पहुँचता है।
            </li>
            <li>
              <strong>Open-Meteo</strong> - होम पेज पर मौसम दिखाने के लिए। आपके ब्राउज़र से उनके सर्वर पर अनुरोध जाता है (हम आपकी कोई
              निजी जानकारी नहीं भेजते)।
            </li>
            <li>
              <strong>Telegram</strong> - आपका संपर्क संदेश समिति के निजी Telegram ग्रुप में पहुँचता है, जहाँ सिर्फ़ समिति के सदस्य उसे देखते
              हैं।
            </li>
          </ul>
        </Section>

        <Section title="3. जानकारी कब तक रखी जाती है">
          <p>
            संपर्क संदेश तब तक रखे जाते हैं जब तक उनका जवाब देना या रिकॉर्ड रखना ज़रूरी है। आप कहेंगे तो हम उसे हटा देंगे। Google
            Analytics का डेटा Google की अपनी अवधि-सेटिंग के अनुसार रखा जाता है।
          </p>
        </Section>

        <Section title="4. आपके विकल्प">
          <p>आप कभी भी Analytics की सहमति बदल सकते हैं:</p>
          {analyticsEnabled() ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-gold-50 px-3 py-1 text-xs">
                अभी: {consent === 'granted' ? 'अनुमति दी हुई है' : consent === 'denied' ? 'अनुमति नहीं दी' : 'अभी चुना नहीं'}
              </span>
              <button type="button" onClick={() => change('granted')} className="btn-outline !px-4 !py-1.5">
                अनुमति दें
              </button>
              <button type="button" onClick={() => change('denied')} className="btn-outline !px-4 !py-1.5">
                अनुमति वापस लें
              </button>
            </div>
          ) : (
            <p className="text-navy-500">इस समय इस वेबसाइट पर Analytics चालू नहीं है।</p>
          )}
          <p>
            अनुमति वापस लेने के बाद नए पेज-व्यू नहीं भेजे जाएंगे; पहले से बनी Google कुकीज़ आप अपने ब्राउज़र की सेटिंग से हटा सकते हैं।
            आप अपनी दी हुई जानकारी देखने, सुधारने या हटाने के लिए भी कह सकते हैं।
          </p>
        </Section>

        <Section title="5. बच्चों की जानकारी">
          <p>यह वेबसाइट जान-बूझकर बच्चों से कोई निजी जानकारी नहीं माँगती।</p>
        </Section>

        <Section title="6. संपर्क">
          <p>
            इस नीति या अपनी जानकारी के बारे में कोई सवाल हो तो{' '}
            <Link to="/contact" className="font-medium text-maroon-700 underline underline-offset-2">
              संपर्क पेज
            </Link>{' '}
            से हमें लिखें। इस नीति में बदलाव होने पर ऊपर की "अंतिम अपडेट" तारीख बदल दी जाएगी।
          </p>
        </Section>
      </div>
    </div>
  );
}
