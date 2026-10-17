import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';

// Bottom-right shortcut to the contact page, with a soft pulse ring.
export default function FloatingContact() {
  const { pathname } = useLocation();
  if (pathname === '/contact' || pathname === '/login' || pathname === '/signup') return null;
  return (
    <Link
      to="/contact"
      aria-label="हमसे संपर्क करें"
      className="no-print fixed bottom-5 right-4 z-40 sm:right-6"
    >
      <span className="absolute inset-0 animate-ping rounded-full bg-maroon-600/40" aria-hidden="true" />
      <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-maroon-700 text-ivory-50 shadow-lift transition duration-200 hover:scale-110 hover:bg-maroon-600">
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </span>
    </Link>
  );
}
