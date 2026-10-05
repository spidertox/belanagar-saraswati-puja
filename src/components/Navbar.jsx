import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { festivalConfig } from '../config/festivalConfig.js';

const links = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'हमारे बारे में' },
  { to: '/events', label: 'पूजा कार्यक्रम' },
  { to: '/donations', label: 'Donations' },
  { to: '/expenses', label: 'खर्च का विवरण' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/committee', label: 'Committee' },
  { to: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gold-300/50 bg-ivory-50/90 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-maroon-700 focus:px-4 focus:py-2 focus:text-sm focus:text-ivory-50"
      >
        मुख्य सामग्री पर जाएं
      </a>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <NavLink
          to="/"
          className="flex flex-shrink-0 items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <img
            src={festivalConfig.logoSrc}
            alt=""
            width={festivalConfig.logoWidth}
            height={festivalConfig.logoHeight}
            className="h-9 w-auto sm:h-10"
          />
          <span className="devanagari text-lg text-maroon-700 sm:text-xl">{festivalConfig.shortNameHindi}</span>
        </NavLink>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="मुख्य मेनू">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-maroon-700 text-ivory-50' : 'text-navy-700 hover:bg-maroon-700/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="rounded-full p-2 text-maroon-700 hover:bg-maroon-700/10 lg:hidden"
          aria-label={open ? 'मेनू बंद करें' : 'मेनू खोलें'}
          aria-expanded={open}
        >
          {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            aria-label="मोबाइल मेनू"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gold-300/50 lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3 sm:px-6">
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive ? 'bg-maroon-700 text-ivory-50' : 'text-navy-700 hover:bg-maroon-700/10'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
