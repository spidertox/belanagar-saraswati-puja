import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Camera, Loader2, LogOut } from 'lucide-react';
import { PageHeader } from '../components/Decor.jsx';
import { LoadingSpinner } from '../components/StatusStates.jsx';
import { ConfirmDialog } from '../components/Modal.jsx';
import { useToast } from '../components/Toast.jsx';
import { useUser } from '../hooks/useUser.jsx';
import { userAvatar, userRename } from '../lib/api.js';

const MAX_BYTES = 2 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Resize to a 512px square JPEG in the browser: the upload stays small and
// whatever the phone camera produced (even 12 MB) works.
function toAvatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const size = 512;
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('यह फोटो खुल नहीं सकी।'));
    };
    img.src = url;
  });
}

export default function Account() {
  const { user, loading, setUser, logout } = useUser();
  const navigate = useNavigate();
  const showToast = useToast();
  const fileRef = useRef(null);
  const [name, setName] = useState(null);
  const [busy, setBusy] = useState(false);
  const [askLogout, setAskLogout] = useState(false);

  if (loading) return <div className="py-24"><LoadingSpinner /></div>;
  if (!user) return <Navigate to="/login" replace />;

  async function onFile(e) {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (!TYPES.includes(file.type)) return showToast('केवल JPG, PNG या WEBP फोटो चुनें।', { type: 'error' });
    if (file.size > 15 * MAX_BYTES) return showToast('फोटो बहुत बड़ी है।', { type: 'error' });
    setBusy(true);
    try {
      const dataUrl = await toAvatarDataUrl(file);
      const r = await userAvatar(dataUrl);
      setUser(r.user);
      showToast('प्रोफ़ाइल फोटो बदल गई');
    } catch (err) {
      showToast(err.message, { type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  async function saveName(e) {
    e.preventDefault();
    try {
      const r = await userRename(name.trim());
      setUser(r.user);
      setName(null);
      showToast('नाम बदल गया');
    } catch (err) {
      showToast(err.message, { type: 'error' });
    }
  }

  async function out() {
    await logout();
    navigate('/');
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <PageHeader hindi="मेरा खाता" english="My account" />
      <div className="space-y-5 rounded-2xl bg-white p-6 text-center shadow-card">
        <div className="relative mx-auto h-28 w-28">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={`${user.name} की प्रोफ़ाइल फोटो`} width={112} height={112} className="h-28 w-28 rounded-full border-4 border-gold-300 object-cover" />
          ) : (
            <div className="devanagari flex h-28 w-28 items-center justify-center rounded-full border-4 border-gold-300 bg-gold-50 text-4xl text-maroon-700" aria-hidden="true">
              {user.name.trim().charAt(0).toUpperCase()}
            </div>
          )}
          <button type="button" onClick={() => fileRef.current && fileRef.current.click()} disabled={busy} aria-label="प्रोफ़ाइल फोटो बदलें"
            className="absolute -bottom-1 -right-1 rounded-full bg-maroon-700 p-2 text-ivory-50 shadow disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Camera className="h-4 w-4" aria-hidden="true" />}
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="hidden" />
        </div>
        <p className="text-xs text-navy-500">JPG, PNG या WEBP · फोटो अपने-आप छोटी कर दी जाती है</p>

        {name === null ? (
          <div>
            <p className="devanagari text-xl text-maroon-700">{user.name}</p>
            <p className="break-all text-sm text-navy-600">{user.email}</p>
            <button type="button" onClick={() => setName(user.name)} className="mt-1 text-xs text-maroon-700 underline">नाम बदलें</button>
          </div>
        ) : (
          <form onSubmit={saveName} className="flex gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="नाम" className="w-full rounded-xl border border-navy-900/15 px-3 py-2 text-sm" />
            <button type="submit" className="btn-primary !px-4 !py-2">सेव</button>
          </form>
        )}

        <button type="button" onClick={() => setAskLogout(true)} className="btn-outline gap-2 !px-4 !py-2"><LogOut className="h-4 w-4" aria-hidden="true" /> लॉग आउट</button>
      </div>
      <ConfirmDialog open={askLogout} onClose={() => setAskLogout(false)} onConfirm={out} title="लॉग आउट?" message="क्या आप सच में लॉग आउट करना चाहते हैं?" confirmLabel="लॉग आउट" danger={false} />
    </div>
  );
}
