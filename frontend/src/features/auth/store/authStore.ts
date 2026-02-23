'use client';

/**
 * features/auth/store/authStore — canonical auth store.
 *
 * Access tokens are short-lived (15 min).
 * The httpClient handles transparent refresh via an httpOnly cookie.
 * This store listens for two custom events dispatched by httpClient:
 *   - auth:token-refreshed  → update the in-memory token state
 *   - auth:session-expired  → clear state and let middleware redirect to login
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';
import { ApiError } from '@/shared/api/httpClient';
import type { UserResponse, LoginPayload, RegisterPayload } from '@/shared/types/user.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

interface AuthState {
  user:            UserResponse | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  error:           string | null;

  login:             (email: string, password: string, captchaToken?: string) => Promise<void>;
  register:          (name: string, email: string, password: string, phone: string, address?: string, captchaToken?: string) => Promise<void>;
  loginWithGoogle:   (idToken: string) => Promise<void>;
  loginWithFacebook: (accessToken: string) => Promise<void>;
  logout:            () => void;
  autoLogin:         () => Promise<void>;
  fetchProfile:      () => Promise<void>;
  clearError:        () => void;
}

/** Shared cookie + localStorage + zustand setter after receiving tokens. */
function applyTokens(
  set: (partial: Partial<AuthState>) => void,
  token: string,
  user: UserResponse
) {
  localStorage.setItem('token', token);
  // Cookie for middleware/SSR reads — 30 days matches JWT_EXPIRE
  const maxAge = 30 * 24 * 60 * 60;
  document.cookie = `token=${token}; path=/; SameSite=Lax; Max-Age=${maxAge}`;
  set({ token, isAuthenticated: true, user });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      isLoading:       false,
      error:           null,

      login: async (email, password, captchaToken) => {
        set({ isLoading: true, error: null });
        try {
          const payload = captchaToken
            ? { email, password, 'cf-turnstile-response': captchaToken }
            : { email, password };
          const { token, user } = await authApi.login(payload);
          applyTokens(set, token, user);
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Identifiants incorrects';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (name, email, password, phone, address, captchaToken) => {
        set({ isLoading: true, error: null });
        try {
          const payload: RegisterPayload & { 'cf-turnstile-response'?: string } =
            { name, email, password, phone };
          if (address)      payload.address = { street: address };
          if (captchaToken) payload['cf-turnstile-response'] = captchaToken;
          const { token, user } = await authApi.register(payload);
          applyTokens(set, token, user);
        } catch (err) {
          const message = err instanceof ApiError ? err.message : "Erreur lors de l'inscription";
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      loginWithGoogle: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.googleAuth(idToken);
          applyTokens(set, token, user);
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Erreur connexion Google';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      loginWithFacebook: async (accessToken) => {
        set({ isLoading: true, error: null });
        try {
          const { token, user } = await authApi.facebookAuth(accessToken);
          applyTokens(set, token, user);
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Erreur connexion Facebook';
          set({ error: message });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const user = await authApi.getProfile();
          set({ user });
        } catch {
          // Silent — token may be expired; httpClient will refresh automatically
        }
      },

      logout: () => {
        // Fire-and-forget: revoke refresh token on server (reads httpOnly cookie)
        if (typeof window !== 'undefined') {
          fetch(`${API_BASE}/api/auth/logout`, {
            method:      'POST',
            credentials: 'include',
          }).catch(() => {});
        }
        localStorage.removeItem('token');
        document.cookie = 'token=; path=/; Max-Age=0';
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },

      autoLogin: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        set({ token, isAuthenticated: true });
        await get().fetchProfile();
      },

      clearError: () => set({ error: null }),
    }),
    {
      name:       'cheikh-auth',
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// ── Global event wiring ────────────────────────────────────────────────────
// httpClient dispatches these when token refresh succeeds or fails.
if (typeof window !== 'undefined') {
  window.addEventListener('auth:token-refreshed', ((e: CustomEvent<{ token: string }>) => {
    useAuthStore.setState({ token: e.detail.token });
    // Keep cookie in sync with JWT_EXPIRE (30 days)
    const maxAge = 30 * 24 * 60 * 60;
    document.cookie = `token=${e.detail.token}; path=/; SameSite=Lax; Max-Age=${maxAge}`;
  }) as EventListener);

  window.addEventListener('auth:session-expired', () => {
    useAuthStore.getState().logout();
  });
}
