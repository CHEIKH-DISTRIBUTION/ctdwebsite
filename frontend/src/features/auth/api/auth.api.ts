import { httpClient } from '@/shared/api/httpClient';
import type { AuthResponse, LoginPayload, RegisterPayload, UserResponse } from '@/shared/types/user.types';

/** Augmented payloads include the optional Cloudflare Turnstile token. */
type WithCaptcha<T> = T & { 'cf-turnstile-response'?: string };

export const authApi = {
  /** POST /api/auth/login */
  login: (payload: WithCaptcha<LoginPayload>) =>
    httpClient.post<AuthResponse>('/api/auth/login', payload),

  /** POST /api/auth/register */
  register: (payload: WithCaptcha<RegisterPayload>) =>
    httpClient.post<AuthResponse>('/api/auth/register', payload),

  /** GET /api/auth/me — returns the authenticated user's profile */
  getProfile: () =>
    httpClient.get<UserResponse>('/api/auth/me'),

  /** POST /api/auth/google — verify Google id_token, return JWT */
  googleAuth: (idToken: string) =>
    httpClient.post<AuthResponse>('/api/auth/google', { idToken }),

  /** POST /api/auth/facebook — verify Facebook access_token, return JWT */
  facebookAuth: (accessToken: string) =>
    httpClient.post<AuthResponse>('/api/auth/facebook', { accessToken }),
};
