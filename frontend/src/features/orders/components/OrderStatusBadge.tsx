'use client';

import { Truck, CheckCircle, Clock, XCircle, Package, RotateCcw, Loader } from 'lucide-react';
import type { OrderStatus } from '@/shared/types/order.types';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  pending:    { label: 'En attente',    icon: Clock,        className: 'bg-amber-100 text-amber-700' },
  confirmed:  { label: 'Confirmée',     icon: CheckCircle,  className: 'bg-blue-100 text-blue-700' },
  preparing:  { label: 'En préparation',icon: Package,      className: 'bg-indigo-100 text-indigo-700' },
  ready:      { label: 'Prête',         icon: CheckCircle,  className: 'bg-teal-100 text-teal-700' },
  delivering: { label: 'En livraison',  icon: Truck,        className: 'bg-purple-100 text-purple-700' },
  delivered:  { label: 'Livrée',        icon: CheckCircle,  className: 'bg-green-100 text-green-700' },
  cancelled:  { label: 'Annulée',       icon: XCircle,      className: 'bg-red-100 text-red-700' },
  refunded:   { label: 'Remboursée',    icon: RotateCcw,    className: 'bg-gray-100 text-gray-700' },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function OrderStatusBadge({ status, size = 'md' }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    icon: Loader,
    className: 'bg-gray-100 text-gray-600',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${config.className} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      {config.label}
    </span>
  );
}
