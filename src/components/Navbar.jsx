import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, UserRound, Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';
import SearchBar from './SearchBar.jsx';
import { useUser } from '../hooks/useUser.jsx';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const { user, loading } = useUser();

  // drawer: Esc closes it, and the page behind it does not scroll
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);
  const accountLink = loading ? null : user ? (
    <NavLink to="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-navy-700 hover:bg-maroon-700/10">
      {user.avatarUrl ? <img src={user.avatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full object-cover" /> : <UserRound className="h-5 w-5" aria-hidden="true" />}
      <span className="max-w-[8rem] truncate">{user.name}</span>
    </NavLink>
  ) : (
    <NavLink to="/login" onClick={() => setOpen(false)} className="rounded-full border border-maroon-700 px-4 py-1.5 text-sm font-medium text-maroon-700 hover:bg-maroon-700 hover:text-ivory-50">
      लॉगिन / साइन-अप
    </NavLink>
  );

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
            alt="बेलानगर सरस्वती पूजा समिति का लोगो"
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
                `rounded-full px-3 py-2 text-sm font-medium transition duration-200 ${
                  isActive ? 'bg-maroon-700 text-ivory-50' : 'text-navy-700 hover:bg-maroon-700/10'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((s) => !s)}
            className="rounded-full p-2.5 text-maroon-700 transition duration-200 hover:scale-110 hover:bg-maroon-700/10"
            aria-label={searchOpen ? 'खोज बंद करें' : 'साइट में खोजें'}
            aria-expanded={searchOpen}
          >
            {searchOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Search className="h-5 w-5" aria-hidden="true" />}
          </button>
          <ThemeToggle />
          <div className="ml-1 hidden lg:block">{accountLink}</div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full p-2.5 text-maroon-700 hover:bg-maroon-700/10 lg:hidden"
            aria-label="मेनू खोलें"
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {searchOpen ? <SearchBar links={links} onClose={() => setSearchOpen(false)} /> : null}

      {createPortal(
        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                key="backdrop"
                className="no-print fixed inset-0 z-[70] bg-navy-900/50 backdrop-blur-sm lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <motion.nav
                key="drawer"
                id="mobile-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="मोबाइल मेनू"
                className="no-print fixed inset-y-0 right-0 z-[71] flex w-72 max-w-[85vw] flex-col gap-1 overflow-y-auto bg-ivory-50 p-4 shadow-lift lg:hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mb-2 self-end rounded-full p-2.5 text-maroon-700 hover:bg-maroon-700/10"
                  aria-label="मेनू बंद करें"
                >
                  <X className="h-6 w-6" aria-hidden="true" />
                </button>
                {links.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-lg px-3 py-2.5 text-sm font-medium transition duration-200 ${
                        isActive ? 'bg-maroon-700 text-ivory-50' : 'text-navy-700 hover:bg-maroon-700/10'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="pt-2">{accountLink}</div>
              </motion.nav>
            </>
          ) : null}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
}
