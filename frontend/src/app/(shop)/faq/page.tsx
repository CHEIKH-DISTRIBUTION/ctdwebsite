'use client';

import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ_ITEMS = [
  {
    q: 'Comment passer une commande ?',
    a: "Parcourez notre catalogue, ajoutez les produits souhaités au panier, puis cliquez sur « Commander ». Renseignez votre adresse de livraison, choisissez votre moyen de paiement et validez.",
  },
  {
    q: 'Quels sont les moyens de paiement acceptés ?',
    a: 'Nous acceptons Wave, Orange Money, le virement bancaire et le paiement à la livraison (espèces). Les paiements mobiles sont instantanés.',
  },
  {
    q: 'Quels sont les délais de livraison ?',
    a: "La livraison est généralement effectuée en 24h pour Dakar et sa banlieue. Pour les autres régions du Sénégal, comptez 48 à 72h selon la zone.",
  },
  {
    q: 'Combien coûte la livraison ?',
    a: 'La livraison est gratuite pour toute commande supérieure à 50 000 FCFA. En dessous, des frais de livraison de 2 000 FCFA sont appliqués.',
  },
  {
    q: 'Puis-je annuler ou modifier ma commande ?',
    a: "Vous pouvez annuler votre commande tant qu'elle n'est pas en cours de préparation. Rendez-vous dans « Mes commandes » pour voir le statut et les options disponibles.",
  },
  {
    q: 'Comment suivre ma commande ?',
    a: 'Connectez-vous à votre compte et accédez à « Mes commandes ». Vous y verrez le statut en temps réel de chaque commande (en attente, en préparation, en livraison, livrée).',
  },
  {
    q: "Que faire si je reçois un produit endommagé ?",
    a: "Contactez-nous dans les 48 heures suivant la réception avec une photo du produit. Nous procéderons à un échange ou un remboursement.",
  },
  {
    q: "Qu'est-ce qu'un pack ?",
    a: "Les packs sont des ensembles de produits pré-composés à prix réduit. Ils sont conçus pour les familles et les commerçants qui souhaitent économiser sur leurs achats groupés.",
  },
  {
    q: 'Comment créer un compte ?',
    a: 'Cliquez sur « Créer un compte » depuis la page de connexion. Renseignez votre nom, email et mot de passe. Votre numéro de téléphone est optionnel mais nécessaire pour passer commande.',
  },
  {
    q: 'Comment modifier mon mot de passe ?',
    a: "Connectez-vous, accédez à « Mon compte » > onglet « Paramètres », puis utilisez le formulaire de changement de mot de passe.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800">{q}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-gray-600 text-sm leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l&apos;accueil
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Questions fréquentes</h1>
        <p className="text-gray-500 mb-10">
          Retrouvez les réponses aux questions les plus courantes.
        </p>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem key={i} q={item.q} a={item.a} />
          ))}
        </div>

        <div className="mt-12 p-6 bg-white border border-gray-200 rounded-2xl text-center">
          <p className="text-gray-700 font-medium mb-2">Vous ne trouvez pas votre réponse ?</p>
          <p className="text-sm text-gray-500 mb-4">
            Notre équipe est disponible pour vous aider.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#001489] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </div>
  );
}
