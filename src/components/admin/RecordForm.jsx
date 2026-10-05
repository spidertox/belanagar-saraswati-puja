import { useState } from 'react';

function defaultsFromFields(fields, initial) {
  const values = {};
  for (const f of fields) {
    if (initial && Object.prototype.hasOwnProperty.call(initial, f.name)) {
      values[f.name] = initial[f.name];
    } else if (f.type === 'checkbox') {
      values[f.name] = false;
    } else {
      values[f.name] = '';
    }
  }
  return values;
}

/**
 * One form, driven by a field schema (see src/config/adminResources.js), used
 * for adding and editing every admin-managed record type. Keeping a single
 * implementation means donations/expenses/events/gallery/announcements all
 * validate and submit the same way.
 */
export default function RecordForm({ fields, initialValues, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [values, setValues] = useState(() => defaultsFromFields(fields, initialValues));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState('');

  function setField(name, value) {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  function validateClientSide() {
    const newErrors = {};
    for (const f of fields) {
      const val = values[f.name];
      if (f.required && (val === '' || val === undefined || val === null)) {
        newErrors[f.name] = 'यह फ़ील्ड आवश्यक है';
      } else if (f.type === 'number' && val !== '' && Number(val) <= 0) {
        newErrors[f.name] = 'राशि 0 से अधिक होनी चाहिए';
      }
    }
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      return;
    }
    setSubmitting(true);
    setGeneralError('');
    try {
      const payload = { ...values };
      for (const f of fields) {
        if (f.type === 'number' && payload[f.name] !== '') payload[f.name] = Number(payload[f.name]);
      }
      await onSubmit(payload);
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setGeneralError(err.message || 'Save नहीं हो सका। कृपया दोबारा प्रयास करें।');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {generalError ? (
        <p className="rounded-lg bg-maroon-700/10 px-3 py-2 text-sm text-maroon-700">{generalError}</p>
      ) : null}

      {fields.map((f) => (
        <div key={f.name}>
          {f.type === 'checkbox' ? (
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={Boolean(values[f.name])}
                onChange={(e) => setField(f.name, e.target.checked)}
                className="h-4 w-4 rounded border-navy-900/30 text-maroon-700 focus:ring-gold-500"
              />
              {f.label}
            </label>
          ) : (
            <>
              <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-navy-700">
                {f.label}
              </label>
              {f.type === 'textarea' ? (
                <textarea
                  id={f.name}
                  value={values[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus:border-gold-500"
                />
              ) : f.type === 'select' ? (
                <select
                  id={f.name}
                  value={values[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  className="w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm focus:border-gold-500"
                >
                  <option value="" disabled>
                    चुनें
                  </option>
                  {(f.options || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={f.name}
                  type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'time' ? 'time' : 'text'}
                  inputMode={f.type === 'number' ? 'decimal' : undefined}
                  value={values[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  min={f.min}
                  className="w-full rounded-lg border border-navy-900/15 px-3 py-2 text-sm focus:border-gold-500"
                />
              )}
              {f.helpText ? <p className="mt-1 text-xs text-navy-500">{f.helpText}</p> : null}
            </>
          )}
          {errors[f.name] ? <p className="mt-1 text-xs text-maroon-600">{errors[f.name]}</p> : null}
        </div>
      ))}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-navy-900/15 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-900/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-maroon-700 px-5 py-2 text-sm font-medium text-ivory-50 transition hover:bg-maroon-600 disabled:opacity-60"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}
