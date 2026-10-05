// Thin fetch client for the /api/* serverless functions, plus a small
// generic hook (useResourceList) reused by every list view — public pages
// and the admin panel alike.
import { useCallback, useEffect, useState } from 'react';

const BASE = '/api';

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.status = status;
    this.errors = errors || null;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError('Internet connection उपलब्ध नहीं है। कृपया अपना कनेक्शन जांचें।', 0, null);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some responses (e.g. 204) legitimately have no JSON body
  }

  if (!res.ok) {
    throw new ApiError(
      (data && (data.error || data.message)) || 'डेटा लोड नहीं हो सका। कृपया कुछ देर बाद पुनः प्रयास करें।',
      res.status,
      data && data.errors
    );
  }
  return data || {};
}

export function listResource(resource, params = {}) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );
  const qs = new URLSearchParams(clean).toString();
  return request(`/${resource}${qs ? `?${qs}` : ''}`, { method: 'GET' });
}

export function createResource(resource, body) {
  return request(`/${resource}`, { method: 'POST', body });
}

export function updateResource(resource, id, body) {
  return request(`/${resource}/${encodeURIComponent(id)}`, { method: 'PUT', body });
}

export function deleteResource(resource, id) {
  return request(`/${resource}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function login(password) {
  return request('/auth/login', { method: 'POST', body: { password } });
}

export function logout() {
  return request('/auth/logout', { method: 'POST' });
}

export function getSession() {
  return request('/auth/session', { method: 'GET' });
}

export function getSummary() {
  return request('/summary', { method: 'GET' });
}

/**
 * कुल Donation / कुल खर्च / शेष राशि — shared by the public Donations and
 * Expenses pages and the admin dashboard so the three numbers are always
 * computed the same way, in one place.
 */
export function useSummary() {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const refresh = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    getSummary()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState((s) => ({ ...s, loading: false, error: err.message })));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

/**
 * Generic paginated/filterable list hook. `params` should be a plain object
 * (page, pageSize, search, range, category, ...) — pass a new object each
 * render, it's compared by value via JSON.stringify.
 */
export function useResourceList(resource, params = {}, { skip = false } = {}) {
  const [state, setState] = useState({
    items: [],
    total: 0,
    overallTotal: undefined,
    overallCount: undefined,
    loading: true,
    error: null,
  });
  const paramsKey = JSON.stringify(params);

  const refresh = useCallback(() => {
    if (skip) {
      setState((s) => ({ ...s, items: [], total: 0, loading: false, error: null }));
      return;
    }
    setState((s) => ({ ...s, loading: true, error: null }));
    listResource(resource, JSON.parse(paramsKey))
      .then((data) => {
        setState({
          items: data.items || [],
          total: data.total || 0,
          overallTotal: data.overallTotal,
          overallCount: data.overallCount,
          loading: false,
          error: null,
        });
      })
      .catch((err) => {
        setState((s) => ({ ...s, loading: false, error: err.message }));
      });
    // paramsKey covers the params dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource, paramsKey, skip]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
