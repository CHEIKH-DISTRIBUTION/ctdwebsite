'use client';

import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isValidSenegalPhone } from '@/shared/utils/phone';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  ShoppingBag,
  Heart,
  Settings,
  Edit3,
  Save,
  LogOut,
  Bell,
  Star,
  Calendar,
  Package,
  Eye,
  Loader2,
  AlertTriangle,
  Lock,
  CheckCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { ordersApi } from '@/features/orders/api/orders.api';
import { httpClient } from '@/shared/api/httpClient';
import { useFavorites } from '@/features/favorites';
import { authApi } from '@/features/auth/api/auth.api';
import type { OrderResponse } from '@/shared/types/order.types';
import type { UserAddressEntry } from '@/shared/types/user.types';

const COLORS = {
  primary:   '#001489',
  secondary: '#F9461C',
  accent:    '#FFB500',
};

const STATUS_LABELS: Record<string, string> = {
  pending:    'En attente',
  confirmed:  'Confirmée',
  preparing:  'En préparation',
  ready:      'Prête',
  delivering: 'En livraison',
  delivered:  'Livrée',
  cancelled:  'Annulée',
  refunded:   'Remboursée',
};

const STATUS_COLORS: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  preparing:  'bg-blue-100 text-blue-700',
  ready:      'bg-purple-100 text-purple-700',
  delivering: 'bg-orange-100 text-orange-700',
  delivered:  'bg-green-100 text-green-700',
  cancelled:  'bg-red-100 text-red-700',
  refunded:   'bg-gray-100 text-gray-700',
};

export default function AccountPage() {
  const { user, logout, fetchProfile } = useAuthStore();
  const { products: favoriteProducts, isLoadingProducts: favLoading, fetchFavorites, toggleFavorite } = useFavorites();
  const router = useRouter();

  const isCustomer = user?.role === 'customer';

  const [isEditing, setIsEditing]   = useState(false);
  const [isSaving, setIsSaving]     = useState(false);
  const [saveError, setSaveError]   = useState<string | null>(null);
  const [activeTab, setActiveTab]   = useState('profile');

  // Password change
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving]   = useState(false);
  const [pwError, setPwError]     = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [userData, setUserData]     = useState({
    name:    user?.name    ?? '',
    phone:   user?.phone   ?? '',
    address: user?.address?.street ?? '',
  });

  // Orders
  const [orders, setOrders]           = useState<OrderResponse[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError]     = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const result = await ordersApi.getMyOrders({ limit: 3 });
      setOrders(result.orders);
      setOrdersTotal(result.pagination.total);
    } catch {
      setOrdersError('Impossible de charger vos commandes.');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { if (isCustomer) loadOrders(); }, [isCustomer, loadOrders]);

  // Keep form in sync when user profile refreshes
  useEffect(() => {
    if (user) {
      setUserData({
        name:    user.name,
        phone:   user.phone  ?? '',
        address: user.address?.street ?? '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-12 text-center max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-[#001489] to-[#001070] rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-3">Accès non autorisé</h1>
            <p className="text-gray-600 mb-6">Veuillez vous connecter pour accéder à votre compte.</p>
            <Button
              asChild
              className="rounded-xl py-3 px-6 font-semibold transition-all hover:shadow-lg"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Link href="/login">Se connecter</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const memberSince = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  const handleSave = async () => {
    if (userData.phone && !isValidSenegalPhone(userData.phone)) {
      setSaveError('Numéro de téléphone invalide. Entrez un numéro sénégalais (ex: 77 123 45 67).');
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await httpClient.put('/api/auth/profile', {
        name:    userData.name,
        phone:   userData.phone,
        address: { street: userData.address },
      });
      await fetchProfile();
      setIsEditing(false);
    } catch {
      setSaveError('Impossible de sauvegarder. Réessayez.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
    setUserData({
      name:    user.name,
      phone:   user.phone  ?? '',
      address: user.address?.street ?? '',
    });
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // ── Addresses ─────────────────────────────────────────────────────────────
  const [addresses, setAddresses]       = useState<UserAddressEntry[]>([]);
  const [addrLoading, setAddrLoading]   = useState(false);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr, setNewAddr]           = useState({ label: 'Domicile', street: '', city: 'Dakar', isDefault: false });

  const loadAddresses = useCallback(async () => {
    setAddrLoading(true);
    try { setAddresses(await authApi.getAddresses()); } catch { /* ignore */ }
    finally { setAddrLoading(false); }
  }, []);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  const handleAddAddress = async () => {
    if (!newAddr.street.trim() || !newAddr.city.trim()) return;
    try {
      const updated = await authApi.addAddress({ ...newAddr, country: 'Sénégal' } as Omit<UserAddressEntry, '_id'>);
      setAddresses(updated);
      setShowAddrForm(false);
      setNewAddr({ label: 'Domicile', street: '', city: 'Dakar', isDefault: false });
    } catch { /* ignore */ }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const updated = await authApi.deleteAddress(id);
      setAddresses(updated);
    } catch { /* ignore */ }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      const updated = await authApi.updateAddress(id, { isDefault: true });
      setAddresses(updated);
    } catch { /* ignore */ }
  };

  const handlePasswordChange = async () => {
    setPwError(null);
    setPwSuccess(false);

    if (!pwData.currentPassword || !pwData.newPassword) {
      setPwError('Veuillez remplir tous les champs.');
      return;
    }
    if (pwData.newPassword.length < 8) {
      setPwError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwError('Les mots de passe ne correspondent pas.');
      return;
    }

    setPwSaving(true);
    try {
      await httpClient.put('/api/auth/change-password', {
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      });
      setPwSuccess(true);
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe.';
      setPwError(message);
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Mon compte</h1>
              <p className="text-sm sm:text-base text-gray-600">Gérez vos informations personnelles et préférences</p>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="self-start sm:self-auto text-[#f9461c] hover:text-[#d93a14] hover:bg-[#f9461c]/10 rounded-xl transition-all border-[#f9461c]"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-gray-200 shadow-lg rounded-2xl">
                <CardHeader className="text-center pb-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-[#001489] to-[#001070] rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-gray-800">{user.name}</CardTitle>
                  <CardDescription className="text-gray-600">{user.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                      <Star className="h-4 w-4 text-[#FFB500]" />
                      <span className="text-gray-700">
                        {user.role === 'admin' ? 'Administrateur' : user.role === 'delivery' ? 'Livreur' : 'Client fidèle'}
                      </span>
                    </div>
                    {isCustomer && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl">
                        <ShoppingBag className="h-4 w-4 text-green-600" />
                        <span className="text-gray-700">
                          {ordersLoading
                            ? '…'
                            : `${ordersTotal} commande${ordersTotal !== 1 ? 's' : ''}`}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-700">Membre depuis {memberSince}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className={`grid ${isCustomer ? 'grid-cols-4' : 'grid-cols-2'} mb-8 bg-gray-100 p-1 rounded-xl`}>
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#001489] transition-all"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Profil</span>
                  </TabsTrigger>
                  {isCustomer && (
                    <TabsTrigger
                      value="orders"
                      className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#001489] transition-all"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span className="hidden sm:inline">Commandes</span>
                    </TabsTrigger>
                  )}
                  {isCustomer && (
                    <TabsTrigger
                      value="wishlist"
                      className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#001489] transition-all"
                    >
                      <Heart className="h-4 w-4" />
                      <span className="hidden sm:inline">Favoris</span>
                    </TabsTrigger>
                  )}
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#001489] transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Paramètres</span>
                  </TabsTrigger>
                </TabsList>

                {/* ── Profile tab ───────────────────────────────────────── */}
                <TabsContent value="profile">
                  <Card className="border-gray-200 shadow-lg rounded-2xl">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-gray-800 flex items-center gap-2">
                          <User className="h-5 w-5 flex-shrink-0" style={{ color: COLORS.primary }} />
                          Informations personnelles
                        </CardTitle>
                        {!isEditing ? (
                          <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 rounded-xl border-[#001489] text-[#001489] hover:bg-[#001489]/10 transition-all self-start sm:self-auto"
                          >
                            <Edit3 className="h-4 w-4" />
                            Modifier
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2 self-start sm:self-auto">
                            <Button
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="rounded-xl"
                              disabled={isSaving}
                            >
                              Annuler
                            </Button>
                            <Button
                              onClick={handleSave}
                              className="flex items-center gap-2 rounded-xl transition-all hover:shadow-lg"
                              style={{ backgroundColor: COLORS.primary }}
                              disabled={isSaving}
                            >
                              {isSaving
                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                : <Save className="h-4 w-4" />}
                              {isSaving ? 'Sauvegarde…' : 'Sauvegarder'}
                            </Button>
                          </div>
                        )}
                      </div>
                      {saveError && (
                        <p className="text-sm text-red-600 flex items-center gap-1 mt-2">
                          <AlertTriangle className="h-4 w-4" />
                          {saveError}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="flex items-center gap-2 text-gray-700">
                            <User className="h-4 w-4" />
                            Nom complet
                          </Label>
                          <Input
                            id="name"
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            disabled={!isEditing}
                            className="rounded-xl border-gray-300 focus:border-[#001489]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="flex items-center gap-2 text-gray-700">
                            <Mail className="h-4 w-4" />
                            Adresse email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email}
                            disabled
                            className="rounded-xl bg-gray-100 border-gray-300"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="flex items-center gap-2 text-gray-700">
                            <Phone className="h-4 w-4" />
                            Téléphone
                          </Label>
                          <Input
                            id="phone"
                            value={userData.phone}
                            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                            disabled={!isEditing}
                            className="rounded-xl border-gray-300 focus:border-[#001489]"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address" className="flex items-center gap-2 text-gray-700">
                            <MapPin className="h-4 w-4" />
                            Adresse
                          </Label>
                          <Input
                            id="address"
                            value={userData.address}
                            onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                            disabled={!isEditing}
                            className="rounded-xl border-gray-300 focus:border-[#001489]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Addresses */}
                  <Card className="border-gray-200 shadow-lg rounded-2xl mt-6">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <CardTitle className="text-gray-800 flex items-center gap-2">
                          <MapPin className="h-5 w-5 flex-shrink-0" style={{ color: COLORS.primary }} />
                          Mes adresses de livraison
                        </CardTitle>
                        <Button
                          variant="outline"
                          onClick={() => setShowAddrForm(!showAddrForm)}
                          className="flex items-center gap-2 rounded-xl border-[#001489] text-[#001489] hover:bg-[#001489]/10 transition-all self-start sm:self-auto"
                        >
                          <Plus className="h-4 w-4" />
                          Ajouter
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Add address form */}
                      {showAddrForm && (
                        <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-4 space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <Label className="text-sm text-gray-700">Libellé</Label>
                              <Input
                                value={newAddr.label}
                                onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                                placeholder="Ex: Domicile, Bureau"
                                className="rounded-xl border-gray-300 focus:border-[#001489]"
                              />
                            </div>
                            <div className="space-y-1 sm:col-span-2">
                              <Label className="text-sm text-gray-700">Rue / Quartier</Label>
                              <Input
                                value={newAddr.street}
                                onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                                placeholder="Ex: Quartier Médina, Rue 10"
                                className="rounded-xl border-gray-300 focus:border-[#001489]"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-sm text-gray-700">Ville</Label>
                              <Input
                                value={newAddr.city}
                                onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                                placeholder="Ex: Dakar"
                                className="rounded-xl border-gray-300 focus:border-[#001489]"
                              />
                            </div>
                            <div className="flex items-end gap-3">
                              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={newAddr.isDefault}
                                  onChange={(e) => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                                  className="rounded border-gray-300"
                                />
                                Adresse par défaut
                              </label>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-1">
                            <Button
                              onClick={handleAddAddress}
                              className="rounded-xl transition-all hover:shadow-lg"
                              style={{ backgroundColor: COLORS.primary }}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Enregistrer
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setShowAddrForm(false)}
                              className="rounded-xl"
                            >
                              Annuler
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Address list */}
                      {addrLoading ? (
                        <div className="flex items-center justify-center py-8 text-gray-400">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                      ) : addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-600 text-sm">
                            Aucune adresse enregistrée. Ajoutez-en une pour accélérer vos commandes.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {addresses.map((addr) => (
                            <div
                              key={addr._id}
                              className={`flex items-start justify-between gap-3 p-4 border rounded-xl transition-all ${
                                addr.isDefault
                                  ? 'border-[#001489] bg-blue-50/50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-3 min-w-0">
                                <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5 text-gray-400" />
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-800 flex items-center gap-2">
                                    {addr.label}
                                    {addr.isDefault && (
                                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#001489] text-white">
                                        Par défaut
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-600 truncate">
                                    {addr.street}, {addr.city}
                                    {addr.region ? `, ${addr.region}` : ''}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {!addr.isDefault && (
                                  <button
                                    onClick={() => handleSetDefaultAddress(addr._id)}
                                    className="text-xs text-[#001489] hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                                    title="Définir par défaut"
                                  >
                                    Par défaut
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Orders tab ────────────────────────────────────────── */}
                <TabsContent value="orders">
                  <Card className="border-gray-200 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5" style={{ color: COLORS.primary }} />
                        Historique des commandes
                      </CardTitle>
                      <CardDescription>
                        Consultez l&apos;état de vos commandes récentes
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : ordersError ? (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm">{ordersError}</p>
                          <button onClick={loadOrders} className="ml-auto text-sm underline">
                            Réessayer
                          </button>
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-12">
                          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune commande</h3>
                          <p className="text-gray-600 mb-6">
                            Vous n&apos;avez pas encore passé de commande.
                          </p>
                          <Button
                            asChild
                            className="rounded-xl"
                            style={{ backgroundColor: COLORS.primary }}
                          >
                            <Link href="/products">Commencer mes achats</Link>
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            {orders.map((order) => (
                              <motion.div
                                key={order._id}
                                whileHover={{ scale: 1.01 }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-6 border border-gray-200 rounded-2xl hover:shadow-md transition-all"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
                                    <Package className="h-6 w-6" style={{ color: COLORS.primary }} />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                      })}
                                    </p>
                                    <p className="text-sm flex items-center gap-2 mt-1">
                                      <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-700'}`}>
                                        {STATUS_LABELS[order.status] ?? order.status}
                                      </span>
                                      <span className="text-gray-600">
                                        {order.items.length} article{order.items.length !== 1 ? 's' : ''}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 sm:text-right">
                                  <p className="font-bold text-base sm:text-lg" style={{ color: COLORS.primary }}>
                                    {order.total.toLocaleString('fr-FR')} FCFA
                                  </p>
                                  <Button asChild variant="ghost" size="sm" className="text-gray-600 hover:text-[#001489]">
                                    <Link href={`/orders/${order._id}`}>
                                      <Eye className="h-4 w-4 mr-1" />
                                      Détails
                                    </Link>
                                  </Button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                          {ordersTotal > 3 && (
                            <div className="mt-6 text-center">
                              <Button
                                asChild
                                variant="outline"
                                className="rounded-xl border-[#001489] text-[#001489] hover:bg-[#001489]/10"
                              >
                                <Link href="/orders">
                                  Voir toutes les commandes ({ordersTotal})
                                </Link>
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Wishlist tab ──────────────────────────────────────── */}
                <TabsContent value="wishlist">
                  <Card className="border-gray-200 shadow-lg rounded-2xl">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="text-gray-800 flex items-center gap-2">
                            <Heart className="h-5 w-5" style={{ color: COLORS.secondary }} />
                            Mes produits favoris
                          </CardTitle>
                          <CardDescription>Retrouvez vos produits sauvegardés</CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl text-xs flex-shrink-0"
                          onClick={fetchFavorites}
                          disabled={favLoading}
                        >
                          {favLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Actualiser'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {favLoading ? (
                        <div className="flex items-center justify-center py-12 text-gray-400">
                          <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                      ) : favoriteProducts.length === 0 ? (
                        <div className="text-center py-12">
                          <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun favori</h3>
                          <p className="text-gray-600 mb-6">
                            Cliquez sur le ❤️ d&apos;un produit pour l&apos;ajouter ici.
                          </p>
                          <Button
                            asChild
                            className="rounded-xl"
                            style={{ backgroundColor: COLORS.primary }}
                          >
                            <Link href="/products">Parcourir les produits</Link>
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {favoriteProducts.map((product) => {
                            const img = product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url ?? '/images/placeholder.jpg';
                            return (
                              <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex gap-3 p-3 border border-gray-200 rounded-xl hover:shadow-md transition-all"
                              >
                                <Link href={`/products/${product._id}`} className="flex-shrink-0">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 relative">
                                    <img src={img} alt={product.name} className="w-full h-full object-cover" />
                                  </div>
                                </Link>
                                <div className="flex-1 min-w-0">
                                  <Link href={`/products/${product._id}`}>
                                    <p className="font-semibold text-sm text-gray-800 line-clamp-2 hover:text-[#001489] transition-colors">
                                      {product.name}
                                    </p>
                                  </Link>
                                  <p className="text-sm font-bold mt-1" style={{ color: COLORS.secondary }}>
                                    {product.price.toLocaleString('fr-FR')} FCFA
                                  </p>
                                </div>
                                <button
                                  onClick={() => toggleFavorite(product._id)}
                                  className="flex-shrink-0 p-1.5 rounded-full hover:bg-red-50 transition-colors self-start"
                                  title="Retirer des favoris"
                                >
                                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* ── Settings tab ──────────────────────────────────────── */}
                <TabsContent value="settings" className="space-y-6">
                  {/* Password change */}
                  <Card className="border-gray-200 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Lock className="h-5 w-5" style={{ color: COLORS.primary }} />
                        Changer le mot de passe
                      </CardTitle>
                      <CardDescription>
                        Utilisez un mot de passe fort d&apos;au moins 8 caractères
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {pwSuccess && (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
                          <CheckCircle className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm">Mot de passe mis à jour avec succès.</p>
                        </div>
                      )}
                      {pwError && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
                          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                          <p className="text-sm">{pwError}</p>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword" className="flex items-center gap-2 text-gray-700">
                          <Lock className="h-4 w-4" />
                          Mot de passe actuel
                        </Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={pwData.currentPassword}
                          onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })}
                          className="rounded-xl border-gray-300 focus:border-[#001489]"
                          placeholder="Entrez votre mot de passe actuel"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="flex items-center gap-2 text-gray-700">
                            <Shield className="h-4 w-4" />
                            Nouveau mot de passe
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={pwData.newPassword}
                            onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })}
                            className="rounded-xl border-gray-300 focus:border-[#001489]"
                            placeholder="8 caractères minimum"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword" className="flex items-center gap-2 text-gray-700">
                            <Shield className="h-4 w-4" />
                            Confirmer le mot de passe
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={pwData.confirmPassword}
                            onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })}
                            className="rounded-xl border-gray-300 focus:border-[#001489]"
                            placeholder="Répétez le nouveau mot de passe"
                          />
                        </div>
                      </div>
                      <Button
                        onClick={handlePasswordChange}
                        disabled={pwSaving}
                        className="rounded-xl transition-all hover:shadow-lg"
                        style={{ backgroundColor: COLORS.primary }}
                      >
                        {pwSaving
                          ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Modification…</>
                          : <><Lock className="h-4 w-4 mr-2" />Modifier le mot de passe</>}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Notification info */}
                  <Card className="border-gray-200 shadow-lg rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-gray-800 flex items-center gap-2">
                        <Bell className="h-5 w-5" style={{ color: COLORS.primary }} />
                        Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <Bell className="h-5 w-5 text-[#001489] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">Notifications activées</p>
                          <p className="text-xs text-gray-600 mt-1">
                            Vous recevez les confirmations de commande et les alertes de sécurité par email.
                            Contactez-nous pour modifier vos préférences.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

              </Tabs>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
