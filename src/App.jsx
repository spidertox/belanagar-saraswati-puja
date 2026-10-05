import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import { SiteBackdrop } from './components/Backdrop.jsx';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Events from './pages/Events.jsx';
import Donations from './pages/Donations.jsx';
import Expenses from './pages/Expenses.jsx';
import Gallery from './pages/Gallery.jsx';
import Committee from './pages/Committee.jsx';
import Contact from './pages/Contact.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminLayout from './components/admin/AdminLayout.jsx';
import Login from './pages/admin/Login.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import ManageResource from './pages/admin/ManageResource.jsx';

function PublicLayout() {
  return (
    <div className="puja-wallpaper relative isolate flex min-h-screen flex-col">
      <SiteBackdrop />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/events" element={<Events />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/committee" element={<Committee />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path=":resource" element={<ManageResource />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
