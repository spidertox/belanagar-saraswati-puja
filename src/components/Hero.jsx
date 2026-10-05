import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { festivalConfig } from '../config/festivalConfig.js';
import { CornerMotif, LogoBadge } from './Decor.jsx';
import { HeroArt } from './Backdrop.jsx';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

// The hero has no background colour of its own: the faint lotus + veena
// wallpaper and the spring-yellow glow from <SiteBackdrop /> show through,
// and the lotus-and-veena picture sits under the buttons.
export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pt-16 sm:px-6 sm:pt-24">
      <CornerMotif className="absolute left-4 top-4 h-14 w-14 text-gold-400/70 sm:h-20 sm:w-20" />
      <CornerMotif className="absolute right-4 top-4 h-14 w-14 text-gold-400/70 sm:h-20 sm:w-20" flip />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-3xl text-center"
      >
        <div className="mx-auto max-w-2xl">
          <motion.div variants={item} className="mb-3">
            <LogoBadge className="w-44 sm:w-52" />
          </motion.div>
          <motion.p variants={item} className="devanagari text-xl text-saffron-600 sm:text-2xl">
            ॥ ॐ ऐं सरस्वत्यै नमः ॥
          </motion.p>
          <motion.h1 variants={item} className="devanagari mt-4 text-balance text-4xl leading-tight text-maroon-700 sm:text-5xl">
            {festivalConfig.nameHindi}
          </motion.h1>
          <motion.p variants={item} className="devanagari-body mt-4 text-base text-navy-700 sm:text-lg">
            विद्या, संगीत और ज्ञान की देवी माँ सरस्वती को समर्पित
          </motion.p>
          <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/events"
              className="rounded-full bg-maroon-700 px-6 py-3 text-sm font-medium text-ivory-50 shadow-card transition hover:bg-maroon-600"
            >
              पूजा कार्यक्रम देखें
            </Link>
            <Link
              to="/donations"
              className="rounded-full border border-maroon-700 px-6 py-3 text-sm font-medium text-maroon-700 transition hover:bg-maroon-700 hover:text-ivory-50"
            >
              दान विवरण देखें
            </Link>
          </motion.div>
        </div>

        <motion.div variants={item} className="mt-10 sm:mt-12">
          <HeroArt className="block h-auto w-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
