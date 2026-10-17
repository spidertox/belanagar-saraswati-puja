import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { SiteBackdrop } from './components/Backdrop.jsx';
import BackToTop from './components/BackToTop.jsx';
import FloatingContact from './components/FloatingContact.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Events from './pages/Events.jsx';
import Donations from './pages/Donations.jsx';
import Expenses from './pages/Expenses.jsx';
import Gallery from './pages/Gallery.jsx';
import Committee from './pages/Committee.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';
import FaqPage from './pages/Faq.jsx';
import Privacy from './pages/Privacy.jsx';
import ThankYou from './pages/ThankYou.jsx';
import RouteSeo from './components/RouteSeo.jsx';
import Analytics from './components/Analytics.jsx';
import RelatedLinks from './components/RelatedLinks.jsx';

import AdminLayout from './components/admin/AdminLayout.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageResource from './pages/admin/ManageResource.jsx';
import Signup from './pages/Signup.jsx';
import UserLogin from './pages/UserLogin.jsx';
import Account from './pages/Account.jsx';
import Payments from './pages/admin/Payments.jsx';
import UpiSettings from './pages/admin/UpiSettings.jsx';

function PublicLayout() {
  return (
    <div className="puja-wallpaper relative isolate flex min-h-screen flex-col">
      <SiteBackdrop />
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
        <RelatedLinks />
      </main>
      <Footer />
      <BackToTop />
      <FloatingContact />
    </div>
  );
}

export default function App() {
  return (
    <>
    <RouteSeo />
    <Analytics />
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/committee" element={<Committee />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="payments" element={<Payments />} />
        <Route path="upi-settings" element={<UpiSettings />} />
        <Route path=":resource" element={<ManageResource />} />
      </Route>

    </Routes>
    </>
  );
}
