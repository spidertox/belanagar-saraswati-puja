import { useState } from 'react';
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { adminResourceOrder, adminResources } from '../../config/adminResources.js';
import { LoadingSpinner } from '../StatusStates.jsx';
import { useToast } from '../Toast.jsx';
import { festivalConfig } from '../../config/festivalConfig.js';

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={festivalConfig.logoSrc}
        alt=""
        width={festivalConfig.logoWidth}
        height={festivalConfig.logoHeight}
        className="h-9 w-auto"
      />
      <p className="text-lg text-basanti-400">Admin Panel</p>
    </div>
  );
}

// The admin surface is deliberately styled differently from the public
// site (navy chrome, denser layout) to signal "this is the back office" —
// see the design notes in the project README.
export default function AdminLayout() {
  const { status, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

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
    ...adminResourceOrder.map((key) => ({ to: `/admin/${key}`, label: adminResources[key].labelHindi, icon: null })),
  ];

  async function handleLogout() {
    await logout();
    showToast('आप लॉग आउट हो गए हैं');
    navigate('/admin/login');
  }

  function NavList({ onNavigate }) {
    return (
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-gold-500 text-navy-900' : 'text-ivory-100/80 hover:bg-ivory-50/10'
              }`
            }
          >
            {item.icon ? <item.icon className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
            {item.label}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-navy-900 px-4 py-3 text-ivory-50 lg:hidden">
        <button type="button" onClick={() => setSidebarOpen(true)} aria-label="मेनू खोलें">
          <Menu className="h-6 w-6" />
        </button>
        <p className="text-sm font-medium">Admin Panel</p>
        <button type="button" onClick={handleLogout} aria-label="लॉग आउट">
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      <div className="lg:flex">
        <aside className="hidden w-60 flex-shrink-0 flex-col bg-navy-900 lg:flex">
          <div className="p-4">
            <Brand />
          </div>
          <NavList />
          <div className="mt-auto p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ivory-100/80 hover:bg-ivory-50/10"
            >
              <LogOut className="h-4 w-4" /> Log out
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
              <div
                className="absolute inset-0 bg-navy-900/60"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              <motion.aside
                className="relative flex h-full w-64 flex-col bg-navy-900"
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between p-4">
                  <Brand />
                  <button type="button" onClick={() => setSidebarOpen(false)} aria-label="बंद करें">
                    <X className="h-5 w-5 text-ivory-100" />
                  </button>
                </div>
                <NavList onNavigate={() => setSidebarOpen(false)} />
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
