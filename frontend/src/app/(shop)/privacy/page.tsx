import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Cheikh Distribution',
};

export default function PrivacyPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : mars 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Responsable du traitement</h2>
            <p className="text-gray-600 leading-relaxed">
              Cheikh Distribution, entreprise de distribution en gros basée à Dakar, Sénégal,
              est responsable du traitement de vos données personnelles collectées sur la plateforme
              cheikhdistribution.sn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Données collectées</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous collectons les données suivantes lors de votre inscription et de vos commandes :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li>Nom complet</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresse de livraison</li>
              <li>Historique des commandes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Finalité du traitement</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li>Créer et gérer votre compte client</li>
              <li>Traiter et livrer vos commandes</li>
              <li>Vous contacter concernant vos commandes</li>
              <li>Vous envoyer des offres promotionnelles (avec votre consentement)</li>
              <li>Améliorer nos services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Conservation des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données personnelles sont conservées pendant la durée de votre compte actif
              et jusqu&apos;à 3 ans après votre dernière activité. Les données de facturation
              sont conservées 10 ans conformément aux obligations légales.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Partage des données</h2>
            <p className="text-gray-600 leading-relaxed">
              Vos données ne sont jamais vendues à des tiers. Elles peuvent être partagées avec :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li>Nos livreurs (adresse et téléphone pour la livraison uniquement)</li>
              <li>Nos prestataires de paiement (Wave, Orange Money) pour le traitement des transactions</li>
              <li>Les autorités compétentes sur demande légale</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Sécurité</h2>
            <p className="text-gray-600 leading-relaxed">
              Nous mettons en place des mesures techniques et organisationnelles pour protéger
              vos données : chiffrement des mots de passe, connexions sécurisées (HTTPS),
              et accès restreint aux données personnelles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Vos droits</h2>
            <p className="text-gray-600 leading-relaxed">
              Conformément à la loi sénégalaise sur la protection des données personnelles,
              vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mt-2">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit de suppression</li>
              <li>Droit d&apos;opposition au traitement</li>
            </ul>
            <p className="text-gray-600 leading-relaxed mt-3">
              Pour exercer ces droits, contactez-nous à contact@cheikhdistribution.sn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Notre site utilise des cookies essentiels au fonctionnement (authentification, panier).
              Aucun cookie publicitaire ou de traçage tiers n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Contact</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute question relative à la protection de vos données,
              contactez-nous par email à contact@cheikhdistribution.sn
              ou par téléphone au +221 78 XXX XX XX.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
