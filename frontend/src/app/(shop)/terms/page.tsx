import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — Cheikh Distribution',
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales de Vente</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : mars 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Objet</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes conditions générales de vente (CGV) régissent les relations contractuelles
              entre Cheikh Distribution, entreprise de distribution en gros basée à Dakar, Sénégal,
              et tout client effectuant un achat sur la plateforme cheikhdistribution.sn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Produits et prix</h2>
            <p className="text-gray-600 leading-relaxed">
              Les produits proposés sont décrits avec la plus grande exactitude possible.
              Les prix sont indiqués en Francs CFA (FCFA) toutes taxes comprises (TVA 18% incluse).
              Cheikh Distribution se réserve le droit de modifier ses prix à tout moment,
              étant entendu que le prix applicable est celui en vigueur au moment de la validation de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Commandes</h2>
            <p className="text-gray-600 leading-relaxed">
              La validation de la commande implique l&apos;acceptation des présentes CGV.
              Une confirmation par email est envoyée après chaque commande.
              Cheikh Distribution se réserve le droit d&apos;annuler toute commande
              en cas d&apos;indisponibilité du produit ou de suspicion de fraude.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Paiement</h2>
            <p className="text-gray-600 leading-relaxed">
              Les moyens de paiement acceptés sont : Wave, Orange Money, virement bancaire
              et paiement à la livraison (espèces). Le paiement est exigible à la commande
              sauf pour l&apos;option « paiement à la livraison ».
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Livraison</h2>
            <p className="text-gray-600 leading-relaxed">
              La livraison est effectuée à l&apos;adresse indiquée lors de la commande.
              Les délais de livraison sont indicatifs (généralement 24h pour Dakar).
              La livraison est gratuite pour toute commande supérieure à 50 000 FCFA.
              En dessous de ce montant, des frais de livraison de 2 000 FCFA s&apos;appliquent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Droit de rétractation</h2>
            <p className="text-gray-600 leading-relaxed">
              Conformément à la réglementation en vigueur, le client dispose d&apos;un délai de
              14 jours à compter de la réception des produits pour exercer son droit de rétractation,
              sans avoir à justifier de motifs. Les produits doivent être retournés dans leur état d&apos;origine.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Réclamations</h2>
            <p className="text-gray-600 leading-relaxed">
              Pour toute réclamation, contactez-nous par email à contact@cheikhdistribution.sn
              ou par téléphone au +221 77 649 06 34. Nous nous engageons à traiter
              votre demande dans un délai de 48 heures ouvrées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Droit applicable</h2>
            <p className="text-gray-600 leading-relaxed">
              Les présentes CGV sont soumises au droit sénégalais.
              Tout litige sera porté devant les juridictions compétentes de Dakar.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
