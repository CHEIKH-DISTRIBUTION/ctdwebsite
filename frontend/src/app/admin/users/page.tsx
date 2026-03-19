'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { adminApi } from '@/features/admin/api/admin.api';
import type { UserResponse, UserRole } from '@/shared/types/user.types';
import {
  Loader2,
  AlertTriangle,
  Users,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Truck,
  User,
  Plus,
  X,
  Eye,
  EyeOff,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const PRIMARY   = '#F9461C';
const SECONDARY = '#001489';
const LIMIT     = 20;

const ROLE_LABELS: Record<UserRole, string>  = {
  customer: 'Client',
  admin:    'Admin',
  delivery: 'Livreur',
};

const ROLE_COLORS: Record<UserRole, { bg: string; color: string }> = {
  customer: { bg: '#EFF6FF', color: '#1D4ED8' },
  admin:    { bg: '#FEF3C7', color: '#92400E' },
  delivery: { bg: '#D1FAE5', color: '#065F46' },
};

const ROLE_ICONS: Record<UserRole, React.ElementType> = {
  customer: User,
  admin:    ShieldCheck,
  delivery: Truck,
};

export default function AdminUsersPage() {
  const [users, setUsers]               = useState<UserResponse[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [roleFilter, setRoleFilter]     = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [togglingId, setTogglingId]     = useState<string | null>(null);
  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);

  // Create user modal
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating]     = useState(false);
  const [newUser, setNewUser]       = useState({ name: '', email: '', password: '', phone: '', role: 'delivery' as UserRole });
  const [showPw, setShowPw]         = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Nom, email et mot de passe requis.');
      return;
    }
    setCreating(true);
    try {
      await adminApi.createUser(newUser);
      toast.success('Utilisateur créé', { description: `${newUser.name} (${ROLE_LABELS[newUser.role]})` });
      setShowCreate(false);
      setNewUser({ name: '', email: '', password: '', phone: '', role: 'delivery' });
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la création.');
    } finally {
      setCreating(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Parameters<typeof adminApi.getUsers>[0] = { page, limit: LIMIT };
      if (roleFilter) params.role = roleFilter;
      if (activeFilter !== '') params.isActive = activeFilter === 'true';
      const result = await adminApi.getUsers(params);
      setUsers(result.users);
      setTotalPages(result.pagination.pages);
      setTotal(result.pagination.total);
    } catch {
      setError('Impossible de charger les utilisateurs.');
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, activeFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset to page 1 when filters change
  const handleRoleFilter = (v: string) => { setRoleFilter(v); setPage(1); };
  const handleActiveFilter = (v: string) => { setActiveFilter(v); setPage(1); };

  const handleToggleActive = async (user: UserResponse) => {
    setTogglingId(user._id);
    try {
      const updated = user.isActive
        ? await adminApi.deactivateUser(user._id)
        : await adminApi.activateUser(user._id);
      setUsers((prev) => prev.map((u) => u._id === user._id ? updated : u));
      toast.success(updated.isActive ? 'Compte activé' : 'Compte désactivé', {
        description: user.name,
      });
    } catch {
      toast.error('Impossible de modifier le statut.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setChangingRoleId(userId);
    try {
      const updated = await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => u._id === userId ? updated : u));
      toast.success('Rôle mis à jour', { description: ROLE_LABELS[newRole] });
    } catch {
      toast.error('Impossible de changer le rôle.');
    } finally {
      setChangingRoleId(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">{total} compte{total !== 1 ? 's' : ''} au total</p>
          )}
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-[#001489] hover:bg-[#001070] rounded-xl"
        >
          <Plus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setShowCreate(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-5">Créer un utilisateur</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <input
                type="text"
                placeholder="Nom complet *"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#001489]"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#001489]"
              />
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="Mot de passe *"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm pr-10 focus:outline-none focus:border-[#001489]"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <input
                type="text"
                placeholder="Téléphone (optionnel)"
                value={newUser.phone}
                onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#001489]"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-[#001489]"
              >
                <option value="delivery">Livreur</option>
                <option value="customer">Client</option>
                <option value="admin">Administrateur</option>
              </select>
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 rounded-xl"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-[#001489] hover:bg-[#001070] rounded-xl"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Créer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {/* Role filter */}
        {[
          { value: '', label: 'Tous les rôles' },
          { value: 'customer',  label: 'Clients' },
          { value: 'admin',     label: 'Admins' },
          { value: 'delivery',  label: 'Livreurs' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleRoleFilter(opt.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={
              roleFilter === opt.value
                ? { background: SECONDARY, color: '#fff' }
                : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
            }
          >
            {opt.label}
          </button>
        ))}

        <div className="w-px h-8 self-center bg-gray-200 mx-1" />

        {/* Active filter */}
        {[
          { value: '', label: 'Tous' },
          { value: 'true',  label: 'Actifs' },
          { value: 'false', label: 'Désactivés' },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleActiveFilter(opt.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={
              activeFilter === opt.value
                ? { background: PRIMARY, color: '#fff' }
                : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
            }
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={load} className="ml-auto">Réessayer</Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && !error && users.length === 0 && (
        <div className="text-center py-24 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Aucun utilisateur trouvé</p>
        </div>
      )}

      {/* User cards */}
      {!loading && !error && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((user) => {
            const rc = ROLE_COLORS[user.role];
            const RoleIcon = ROLE_ICONS[user.role];
            const isToggling = togglingId === user._id;
            const isChangingRole = changingRoleId === user._id;

            return (
              <div
                key={user._id}
                className={`bg-white rounded-2xl border p-5 space-y-4 transition-opacity ${
                  !user.isActive ? 'opacity-60 border-gray-200' : 'border-gray-100'
                }`}
              >
                {/* Top row */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${SECONDARY}, #001070)` }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 text-sm leading-tight">{user.name}</p>
                      <span
                        className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: rc.bg, color: rc.color }}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {ROLE_LABELS[user.role]}
                      </span>
                      {!user.isActive && (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                          Inactif
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="h-3 w-3" />
                          {user.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {user.role === 'delivery' && user.deliveryRating && user.deliveryRating.count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <Star className="h-3 w-3 fill-current" />
                          {user.deliveryRating.average.toFixed(1)} ({user.deliveryRating.count} avis)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-50">
                  {/* Role selector */}
                  <div className="relative">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value as UserRole)}
                      disabled={isChangingRole}
                      className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-gray-200 text-xs
                                 font-medium bg-white text-gray-700
                                 focus:outline-none focus:border-[#001489] transition-all disabled:opacity-50"
                    >
                      <option value="customer">Client</option>
                      <option value="admin">Admin</option>
                      <option value="delivery">Livreur</option>
                    </select>
                    {isChangingRole && (
                      <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 animate-spin text-gray-400" />
                    )}
                  </div>

                  {/* Activate / deactivate */}
                  <Button
                    size="sm"
                    variant={user.isActive ? 'destructive' : 'outline'}
                    disabled={isToggling}
                    onClick={() => handleToggleActive(user)}
                    className="rounded-lg text-xs h-8"
                  >
                    {isToggling ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : user.isActive ? (
                      'Désactiver'
                    ) : (
                      'Activer'
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">Page {page} / {totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
