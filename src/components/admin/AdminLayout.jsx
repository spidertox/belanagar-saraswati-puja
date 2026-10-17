import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  Wallet,
  Receipt,
  CalendarDays,
  Image as ImageIcon,
  Megaphone,
  ExternalLink,
  Users,
  QrCode,
  BadgeIndianRupee,
  UtensilsCrossed,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { adminResourceOrder, adminResources } from '../../config/adminResources.js';
import { LoadingSpinner } from '../StatusStates.jsx';
import { useToast } from '../Toast.jsx';
import { festivalConfig } from '../../config/festivalConfig.js';

const RESOURCE_ICONS = {
  donations: Wallet,
  expenses: Receipt,
  events: CalendarDays,
  committee: Users,
  bhog: UtensilsCrossed,
  gallery: ImageIcon,
  announcements: Megaphone,
};

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={festivalConfig.logoSrc}
        alt="समिति का लोगो"
        width={festivalConfig.logoWidth}
        height={festivalConfig.logoHeight}
        className="h-9 w-auto"
      />
      <div className="leading-tight">
        <p className="text-base font-semibold text-basanti-400">Admin Panel</p>
        <p className="devanagari text-xs text-ivory-100/60">{festivalConfig.shortNameHindi}</p>
      </div>
    </div>
  );
}

// Defined at module level (not inside AdminLayout): a component declared
// inside another component is re-created on every render, which remounted
// the whole menu each time and dropped keyboard focus.
function NavList({ items, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 p-3" aria-label="Admin menu">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-gold-500 text-navy-900 shadow-card' : 'text-ivory-100/80 hover:bg-ivory-50/10'
            }`
          }
        >
          <item.icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

// The admin surface is deliberately styled differently from the public
// site (navy chrome, denser layout) to signal "this is the back office".
export default function AdminLayout() {
  const { status, logout, refresh } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();

  // Any API call that comes back 401 means the 8-hour session ended: re-check
  // the session, which sends the person to the login page.
  useEffect(() => {
    function onUnauthorized() {
      showToast('सत्र समाप्त हो गया है। कृपया दोबारा लॉगिन करें।', { type: 'error' });
      refresh();
    }
    window.addEventListener('bsp:unauthorized', onUnauthorized);
    return () => window.removeEventListener('bsp:unauthorized', onUnauthorized);
  }, [refresh, showToast]);

  // close the mobile menu on navigation and on Escape
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKey = (e) => e.key === 'Escape' && setSidebarOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-navy-900">
        <LoadingSpinner label="सत्र जांचा जा रहा है..." />
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ...adminResourceOrder.map((key) => ({
      to: `/admin/${key}`,
      label: adminResources[key].labelHindi,
      icon: RESOURCE_ICONS[key] || LayoutDashboard,
    })),
    { to: '/admin/payments', label: 'ऑनलाइन भुगतान', icon: BadgeIndianRupee },
    { to: '/admin/upi-settings', label: 'UPI सेटिंग / QR', icon: QrCode },
  ];
  const current = navItems.find((n) => location.pathname.startsWith(n.to));

  async function handleLogout() {
    await logout();
    showToast('आप लॉग आउट हो गए हैं');
    navigate('/admin/login');
  }

  const siteLink = (
    <a
      href="/"
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ivory-100/80 hover:bg-ivory-50/10"
    >
      <ExternalLink className="h-4 w-4" aria-hidden="true" /> वेबसाइट देखें
    </a>
  );

  return (
    <div className="min-h-screen bg-ivory-100">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-navy-900 px-4 py-3 text-ivory-50 shadow-card lg:hidden">
        <button type="button" onClick={() => setSidebarOpen(true)} aria-label="मेनू खोलें" aria-expanded={sidebarOpen}>
          <Menu className="h-6 w-6" />
        </button>
        <p className="devanagari text-base">{current ? current.label : 'Admin Panel'}</p>
        <button type="button" onClick={handleLogout} aria-label="लॉग आउट">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <div className="lg:flex">
        <aside className="hidden h-screen w-64 flex-shrink-0 flex-col bg-navy-900 lg:sticky lg:top-0 lg:flex">
          <div className="border-b border-ivory-50/10 p-4">
            <Brand />
          </div>
          <NavList items={navItems} />
          <div className="mt-auto space-y-1 border-t border-ivory-50/10 p-3">
            {siteLink}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ivory-100/80 hover:bg-ivory-50/10"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
            </button>
          </div>
        </aside>

        <AnimatePresence>
          {sidebarOpen ? (
            <motion.div
              className="fixed inset-0 z-50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="absolute inset-0 bg-navy-900/60" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
              <motion.aside
                className="relative flex h-full w-72 max-w-[85vw] flex-col bg-navy-900"
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between border-b border-ivory-50/10 p-4">
                  <Brand />
                  <button type="button" onClick={() => setSidebarOpen(false)} aria-label="बंद करें">
                    <X className="h-5 w-5 text-ivory-100" />
                  </button>
                </div>
                <NavList items={navItems} onNavigate={() => setSidebarOpen(false)} />
                <div className="mt-auto space-y-1 border-t border-ivory-50/10 p-3">
                  {siteLink}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ivory-100/80 hover:bg-ivory-50/10"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
                  </button>
                </div>
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
