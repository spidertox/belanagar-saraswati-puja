import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Drop-in replacement for <input type="password"> with a show/hide eye.
export default function PasswordInput({ className = '', ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={show ? 'text' : 'password'} className={`${className} !pr-12`} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'पासवर्ड छुपाएं' : 'पासवर्ड दिखाएं'}
        aria-pressed={show}
        className="absolute right-1 top-[calc(50%+2px)] -translate-y-1/2 rounded-full p-2.5 text-navy-500 transition duration-200 hover:bg-navy-900/5 hover:text-navy-900"
      >
        {show ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
      </button>
    </div>
  );
}
