import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const KEY = 'bsp-theme'; // 'light' | 'dark'; absent = follow the system setting

const saved = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

// The class is first applied by the tiny script in index.html (no white flash);
// this button only flips it and remembers the choice.
export default function ThemeToggle({ className = '' }) {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // while the visitor has not chosen, follow the operating system live
  useEffect(() => {
    if (typeof matchMedia !== 'function') return undefined;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => !saved() && setDark(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    try {
      localStorage.setItem(KEY, next ? 'dark' : 'light');
    } catch {
      // private mode: the choice just is not remembered
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'लाइट मोड चालू करें' : 'डार्क मोड चालू करें'}
      className={`rounded-full p-2.5 text-maroon-700 transition duration-200 hover:scale-110 hover:bg-maroon-700/10 ${className}`}
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  );
}
