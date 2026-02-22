/**
 * COMPATIBILITY SHIM — do not add logic here.
 *
 * The canonical auth store has moved to:
 *   features/auth/store/authStore.ts
 *
 * All existing pages that import from @/stores/authStore continue to work.
 * Migrate imports to @/features/auth when updating a page.
 */
export { useAuthStore } from '@/features/auth/store/authStore';
