import { Link } from 'react-router-dom';
import { LotusIcon } from '../components/Decor.jsx';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <LotusIcon className="h-12 w-12 text-gold-400" />
      <h1 className="devanagari mt-4 text-3xl text-maroon-700">पृष्ठ नहीं मिला</h1>
      <p className="mt-2 text-sm text-navy-600">जिस पृष्ठ को आप खोज रहे हैं वह उपलब्ध नहीं है।</p>
      <Link
        to="/"
        className="mt-6 rounded-full bg-maroon-700 px-6 py-2.5 text-sm font-medium text-ivory-50 transition hover:bg-maroon-600"
      >
        होम पेज पर जाएं
      </Link>
    </div>
  );
}
