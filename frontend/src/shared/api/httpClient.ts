/**
 * httpClient — single HTTP client for the entire frontend.
 *
 * Token refresh strategy:
 *   - Access tokens are short-lived (15 min).
 *   - On 401, the client transparently calls POST /api/auth/refresh
 *     (the browser sends the httpOnly refresh-token cookie automatically).
 *   - If refresh succeeds → retry original request with new token.
 *   - If refresh fails → dispatch 'auth:session-expired' so the auth store
 *     can clear state and redirect to login.
 *   - Concurrent 401s share one refresh call (no token-refresh stampede).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  code?: string;
};

// ── Token refresh ──────────────────────────────────────────────────────────

/** Pending refresh promise — shared so concurrent 401s trigger only one refresh. */
let refreshPromise: Promise<string | null> | null = null;

async function attemptTokenRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method:      'POST',
      credentials: 'include', // sends the httpOnly refreshToken cookie automatically
      headers:     { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }
      return null;
    }

    const body = await res.json();
    if (!body.success || !body.data?.token) return null;

    const newToken = body.data.token as string;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', newToken);
      window.dispatchEvent(
        new CustomEvent('auth:token-refreshed', { detail: { token: newToken } })
      );
    }
    return newToken;
  } catch {
    return null;
  }
}

// ── Core request function ──────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // required for refresh-token cookie on /api/auth/refresh
  });

  // ── 401: attempt transparent token refresh then retry once ─────────────
  if (response.status === 401 && path !== '/api/auth/refresh') {
    if (!refreshPromise) {
      refreshPromise = attemptTokenRefresh().finally(() => { refreshPromise = null; });
    }
    const newToken = await refreshPromise;

    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retry = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
      const retryBody: ApiResponse<T> = await retry.json();
      if (retry.ok && retryBody.success) return retryBody.data;
      throw new ApiError(retryBody.message ?? 'Erreur', retry.status, retryBody.code);
    }

    throw new ApiError('Session expirée', 401, 'SESSION_EXPIRED');
  }

  const body: ApiResponse<T> = await response.json();

  if (!response.ok || !body.success) {
    throw new ApiError(body.message ?? 'Une erreur est survenue', response.status, body.code);
  }

  return body.data;
}

/** Multipart/form-data — no Content-Type header (browser sets boundary automatically). */
async function requestForm<T>(path: string, method: 'POST' | 'PUT', data: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    body:        data,
    headers,
    credentials: 'include',
  });
  const body: ApiResponse<T> = await response.json();

  if (!response.ok || !body.success) {
    throw new ApiError(body.message ?? 'Une erreur est survenue', response.status, body.code);
  }

  return body.data;
}

// ── Exported client ────────────────────────────────────────────────────────

export const httpClient = {
  get:      <T>(path: string)               => request<T>(path),
  post:     <T>(path: string, data: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put:      <T>(path: string, data: unknown) => request<T>(path, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:   <T>(path: string)               => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, data: FormData) => requestForm<T>(path, 'POST', data),
  putForm:  <T>(path: string, data: FormData) => requestForm<T>(path, 'PUT',  data),
};
