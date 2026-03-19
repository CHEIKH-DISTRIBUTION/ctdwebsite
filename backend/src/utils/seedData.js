const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Pack = require('../models/Pack');

const seedData = async () => {
  try {
    // Supprimer les données existantes
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Pack.deleteMany({});

    console.log('Données existantes supprimées');

    // ── Admin ──────────────────────────────────────────────────────────────
    const admin = await User.create({
      name: 'Abdoulaye Diaw',
      email: 'admin@cheikhdistribution.sn',
      password: 'admin123',
      phone: '+221776490634',
      role: 'admin',
      address: {
        street: 'Marché Sandaga, Rue 10',
        city: 'Dakar',
        region: 'Dakar',
        country: 'Sénégal',
      },
    });

    // Livreur de test
    await User.create({
      name: 'Moussa Ndiaye',
      email: 'livreur@cheikhdistribution.sn',
      password: 'livreur123',
      phone: '+221781234567',
      role: 'delivery',
      address: {
        street: 'Parcelles Assainies U26',
        city: 'Dakar',
        region: 'Dakar',
        country: 'Sénégal',
      },
    });

    // Client de test
    await User.create({
      name: 'Fatou Sow',
      email: 'client@cheikhdistribution.sn',
      password: 'client123',
      phone: '+221709876543',
      role: 'customer',
      address: {
        street: 'HLM Grand Yoff',
        city: 'Dakar',
        region: 'Dakar',
        country: 'Sénégal',
      },
    });

    console.log('Utilisateurs créés (admin + livreur + client)');

    // ── Catégories ─────────────────────────────────────────────────────────
    // Use create() one by one so the pre('save') hook generates slugs
    const catData = [
      {
        name: 'Alimentaire',
        description: 'Riz, huile, sucre, conserves et produits de base',
        icon: 'ShoppingBasket',
        sortOrder: 1,
        seoTitle: 'Produits alimentaires en gros — Cheikh Distribution',
        seoDescription:
          'Riz, huile, sucre, conserves et épices en gros au Sénégal. Livraison Dakar et régions.',
        createdBy: admin._id,
      },
      {
        name: 'Hygiène',
        description: 'Détergents, savons, produits d\'entretien et soins',
        icon: 'Sparkles',
        sortOrder: 2,
        seoTitle: 'Produits d\'hygiène en gros — Cheikh Distribution',
        seoDescription:
          'Savon, lessive, javel, couches et soins corporels en gros. Prix grossiste Sénégal.',
        createdBy: admin._id,
      },
      {
        name: 'Électroménager',
        description: 'Ventilateurs, réfrigérateurs, cuisinières et petit électro',
        icon: 'Zap',
        sortOrder: 3,
        seoTitle: 'Électroménager pas cher — Cheikh Distribution',
        seoDescription:
          'Ventilateurs, réfrigérateurs, cuisinières à gaz et petit électroménager. Prix grossiste Dakar.',
        createdBy: admin._id,
      },
      {
        name: 'Vêtements',
        description: 'Bazin, tissus, prêt-à-porter et accessoires',
        icon: 'Shirt',
        sortOrder: 4,
        seoTitle: 'Vêtements et tissus en gros — Cheikh Distribution',
        seoDescription:
          'Bazin riche, tissus wax, boubous et prêt-à-porter en gros au Sénégal.',
        createdBy: admin._id,
      },
    ];
    const cats = [];
    for (const c of catData) {
      cats.push(await Category.create(c));
    }

    console.log('Catégories créées');

    // ── Produits ───────────────────────────────────────────────────────────
    // Images : Pexels (libres de droits, liens stables)
    const products = await Product.insertMany([
      // ────────── ALIMENTAIRE ──────────
      {
        name: 'Riz Brisé Ordinaire 25 kg',
        description:
          'Brisure de riz importée, sac de 25 kg. Le riz le plus consommé au Sénégal, base du thiéboudienne.',
        price: 12500,
        category: 'Alimentaire',
        stock: 200,
        minStock: 30,
        sku: 'ALM-RIZ-BRI-25',
        brand: 'Uncle Sam',
        weight: { value: 25, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Sac de riz brisé 25 kg',
            isPrimary: true,
          },
        ],
        tags: ['riz', 'brisure', 'thiéboudienne', 'céréales'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Riz Parfumé Thaï 25 kg',
        description:
          'Riz parfumé grain long de qualité premium. Idéal pour les cérémonies et la revente détail.',
        price: 18000,
        category: 'Alimentaire',
        stock: 120,
        minStock: 20,
        sku: 'ALM-RIZ-PAR-25',
        brand: 'Royal Umbrella',
        weight: { value: 25, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Riz parfumé Thaï 25 kg',
            isPrimary: true,
          },
        ],
        tags: ['riz', 'parfumé', 'thaï', 'premium'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Huile Végétale Niinal 20 L',
        description:
          'Bidon d\'huile végétale raffinée 20 litres. Incontournable pour la restauration et la revente.',
        price: 22000,
        category: 'Alimentaire',
        stock: 80,
        minStock: 15,
        sku: 'ALM-HUI-VEG-20',
        brand: 'Niinal',
        weight: { value: 20, unit: 'l' },
        images: [
          {
            url: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Bidon huile végétale 20 L',
            isPrimary: true,
          },
        ],
        tags: ['huile', 'végétale', 'cuisine', 'bidon'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Huile d\'Arachide 5 L',
        description:
          'Huile d\'arachide pure pressée, bidon de 5 litres. Saveur authentique pour le mafé et la cuisine sénégalaise.',
        price: 9500,
        category: 'Alimentaire',
        stock: 100,
        minStock: 20,
        sku: 'ALM-HUI-ARA-5',
        brand: 'Sunor',
        weight: { value: 5, unit: 'l' },
        images: [
          {
            url: 'https://images.pexels.com/photos/1022385/pexels-photo-1022385.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Huile d\'arachide 5 L',
            isPrimary: true,
          },
        ],
        tags: ['huile', 'arachide', 'mafé', 'sénégalais'],
        createdBy: admin._id,
      },
      {
        name: 'Sucre en Poudre 50 kg',
        description:
          'Sac de sucre cristallisé blanc 50 kg. Indispensable pour les boutiques et la restauration.',
        price: 28000,
        category: 'Alimentaire',
        stock: 150,
        minStock: 25,
        sku: 'ALM-SUC-PDR-50',
        brand: 'CSS',
        weight: { value: 50, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/2523650/pexels-photo-2523650.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Sac de sucre 50 kg',
            isPrimary: true,
          },
        ],
        tags: ['sucre', 'poudre', 'blanc', 'sac'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Lait en Poudre Nido 900 g',
        description:
          'Lait en poudre entier Nido, boîte de 900 g. Très demandé pour les familles et les boutiquiers.',
        price: 5500,
        category: 'Alimentaire',
        stock: 300,
        minStock: 40,
        sku: 'ALM-LAI-NID-900',
        brand: 'Nido',
        weight: { value: 900, unit: 'g' },
        images: [
          {
            url: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Lait en poudre Nido 900 g',
            isPrimary: true,
          },
        ],
        tags: ['lait', 'poudre', 'nido', 'bébé', 'famille'],
        createdBy: admin._id,
      },
      {
        name: 'Concentré de Tomates 400 g × 24',
        description:
          'Carton de 24 boîtes de concentré de tomates double concentration. Base de toutes les sauces sénégalaises.',
        price: 14000,
        category: 'Alimentaire',
        stock: 90,
        minStock: 15,
        sku: 'ALM-TOM-CON-24',
        brand: 'Dieg Bou Diar',
        weight: { value: 9.6, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Carton concentré de tomates',
            isPrimary: true,
          },
        ],
        tags: ['tomate', 'concentré', 'sauce', 'carton'],
        createdBy: admin._id,
      },
      {
        name: 'Thé Vert Gunpowder 500 g',
        description:
          'Thé vert chinois Gunpowder en vrac, sachet de 500 g. Le thé de l\'Attaya, tradition sénégalaise.',
        price: 3500,
        category: 'Alimentaire',
        stock: 250,
        minStock: 50,
        sku: 'ALM-THE-GUN-500',
        brand: 'Sultan',
        weight: { value: 500, unit: 'g' },
        images: [
          {
            url: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Thé vert Gunpowder 500 g',
            isPrimary: true,
          },
        ],
        tags: ['thé', 'vert', 'attaya', 'gunpowder'],
        createdBy: admin._id,
      },
      {
        name: 'Café Soluble Nescafé 200 g',
        description:
          'Café soluble Nescafé Classic, pot de 200 g. Café instantané le plus vendu en Afrique de l\'Ouest.',
        price: 4200,
        category: 'Alimentaire',
        stock: 180,
        minStock: 30,
        sku: 'ALM-CAF-NES-200',
        brand: 'Nescafé',
        weight: { value: 200, unit: 'g' },
        images: [
          {
            url: 'https://images.pexels.com/photos/585750/pexels-photo-585750.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Café Nescafé 200 g',
            isPrimary: true,
          },
        ],
        tags: ['café', 'nescafé', 'soluble', 'petit-déjeuner'],
        createdBy: admin._id,
      },
      {
        name: 'Farine de Blé T55 25 kg',
        description:
          'Sac de farine de blé type 55, 25 kg. Pour boulangeries, pâtisseries et ménages.',
        price: 11000,
        category: 'Alimentaire',
        stock: 100,
        minStock: 20,
        sku: 'ALM-FAR-BLE-25',
        brand: 'Grands Moulins de Dakar',
        weight: { value: 25, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/5765/flour-powder-wheat-jar.jpg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Farine de blé 25 kg',
            isPrimary: true,
          },
        ],
        tags: ['farine', 'blé', 'boulangerie', 'pain'],
        createdBy: admin._id,
      },
      {
        name: 'Bouillon Maggi × 100 cubes',
        description:
          'Boîte de 100 cubes Maggi. L\'assaisonnement incontournable de la cuisine sénégalaise.',
        price: 3800,
        category: 'Alimentaire',
        stock: 400,
        minStock: 60,
        sku: 'ALM-BOU-MAG-100',
        brand: 'Maggi',
        weight: { value: 400, unit: 'g' },
        images: [
          {
            url: 'https://images.pexels.com/photos/2802527/pexels-photo-2802527.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Bouillon Maggi 100 cubes',
            isPrimary: true,
          },
        ],
        tags: ['bouillon', 'maggi', 'assaisonnement', 'cube'],
        createdBy: admin._id,
      },
      {
        name: 'Pâtes Spaghetti 500 g × 20',
        description:
          'Carton de 20 paquets de spaghetti 500 g. Alimentation quotidienne pour les familles.',
        price: 8500,
        category: 'Alimentaire',
        stock: 120,
        minStock: 20,
        sku: 'ALM-PAT-SPA-20',
        brand: 'Pasta Roma',
        weight: { value: 10, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Carton spaghetti 20 × 500 g',
            isPrimary: true,
          },
        ],
        tags: ['pâtes', 'spaghetti', 'carton', 'famille'],
        createdBy: admin._id,
      },
      {
        name: 'Sel Iodé 1 kg × 25',
        description:
          'Carton de 25 paquets de sel iodé fin 1 kg. Conforme aux normes de santé publique.',
        price: 4000,
        category: 'Alimentaire',
        stock: 200,
        minStock: 30,
        sku: 'ALM-SEL-IOD-25',
        brand: 'Sel du Sénégal',
        weight: { value: 25, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Sel iodé carton 25 kg',
            isPrimary: true,
          },
        ],
        tags: ['sel', 'iodé', 'carton', 'cuisine'],
        createdBy: admin._id,
      },
      {
        name: 'Lait Concentré Bonnet Rouge 390 g × 48',
        description:
          'Carton de 48 boîtes de lait concentré sucré. Indispensable pour le café Touba et le petit-déjeuner.',
        price: 32000,
        category: 'Alimentaire',
        stock: 60,
        minStock: 10,
        sku: 'ALM-LAI-BON-48',
        brand: 'Bonnet Rouge',
        weight: { value: 18.7, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Lait concentré Bonnet Rouge carton',
            isPrimary: true,
          },
        ],
        tags: ['lait', 'concentré', 'bonnet-rouge', 'café-touba'],
        createdBy: admin._id,
      },

      // ────────── HYGIÈNE ──────────
      {
        name: 'Lessive OMO Multi-Active 5 kg',
        description:
          'Sac de lessive en poudre OMO 5 kg. Lavage à la main ou en machine, mousse abondante.',
        price: 7500,
        category: 'Hygiène',
        stock: 150,
        minStock: 25,
        sku: 'HYG-LES-OMO-5',
        brand: 'OMO',
        weight: { value: 5, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/5217882/pexels-photo-5217882.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Lessive OMO 5 kg',
            isPrimary: true,
          },
        ],
        tags: ['lessive', 'omo', 'poudre', 'linge'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Eau de Javel 5 L',
        description:
          'Bidon d\'eau de Javel concentrée 5 litres. Désinfection, nettoyage et blanchiment du linge.',
        price: 2500,
        category: 'Hygiène',
        stock: 180,
        minStock: 30,
        sku: 'HYG-JAV-BID-5',
        brand: 'La Croix',
        weight: { value: 5, unit: 'l' },
        images: [
          {
            url: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Eau de Javel 5 L',
            isPrimary: true,
          },
        ],
        tags: ['javel', 'désinfectant', 'nettoyage', 'bidon'],
        createdBy: admin._id,
      },
      {
        name: 'Savon de Marseille 400 g × 12',
        description:
          'Carton de 12 savons de Marseille 400 g. Savon multi-usage pour le corps et le linge.',
        price: 6000,
        category: 'Hygiène',
        stock: 100,
        minStock: 20,
        sku: 'HYG-SAV-MAR-12',
        brand: 'Le Fer à Cheval',
        weight: { value: 4.8, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Savon de Marseille × 12',
            isPrimary: true,
          },
        ],
        tags: ['savon', 'marseille', 'carton', 'naturel'],
        createdBy: admin._id,
      },
      {
        name: 'Dentifrice Colgate 100 ml × 12',
        description:
          'Carton de 12 tubes de dentifrice Colgate Triple Action 100 ml. Hygiène bucco-dentaire quotidienne.',
        price: 7200,
        category: 'Hygiène',
        stock: 120,
        minStock: 20,
        sku: 'HYG-DEN-COL-12',
        brand: 'Colgate',
        weight: { value: 1.2, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/3737579/pexels-photo-3737579.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Dentifrice Colgate × 12',
            isPrimary: true,
          },
        ],
        tags: ['dentifrice', 'colgate', 'dents', 'hygiène'],
        createdBy: admin._id,
      },
      {
        name: 'Couches Bébé Pampers Taille 3 × 68',
        description:
          'Méga pack Pampers Baby-Dry taille 3 (6-10 kg), 68 couches. Absorption 12h, anti-fuites.',
        price: 12500,
        category: 'Hygiène',
        stock: 80,
        minStock: 15,
        sku: 'HYG-COU-PAM-68',
        brand: 'Pampers',
        weight: { value: 2.5, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/3845459/pexels-photo-3845459.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Couches Pampers taille 3',
            isPrimary: true,
          },
        ],
        tags: ['couches', 'pampers', 'bébé', 'taille-3'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Papier Toilette × 12 rouleaux',
        description:
          'Pack de 12 rouleaux de papier toilette double épaisseur. Doux et résistant.',
        price: 3500,
        category: 'Hygiène',
        stock: 200,
        minStock: 40,
        sku: 'HYG-PAP-TOI-12',
        brand: 'Moltonel',
        weight: { value: 1.5, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/3958181/pexels-photo-3958181.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Papier toilette × 12',
            isPrimary: true,
          },
        ],
        tags: ['papier', 'toilette', 'rouleaux'],
        createdBy: admin._id,
      },
      {
        name: 'Shampooing Palmolive 350 ml × 6',
        description:
          'Lot de 6 flacons de shampooing Palmolive Naturals 350 ml. Pour cheveux normaux.',
        price: 5400,
        category: 'Hygiène',
        stock: 90,
        minStock: 15,
        sku: 'HYG-SHA-PAL-6',
        brand: 'Palmolive',
        weight: { value: 2.1, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Shampooing Palmolive × 6',
            isPrimary: true,
          },
        ],
        tags: ['shampooing', 'palmolive', 'cheveux', 'lot'],
        createdBy: admin._id,
      },
      {
        name: 'Savon Liquide Vaisselle 5 L',
        description:
          'Bidon de liquide vaisselle concentré 5 litres. Dégraisse efficacement, mousse longue durée.',
        price: 3200,
        category: 'Hygiène',
        stock: 140,
        minStock: 25,
        sku: 'HYG-LIQ-VAI-5',
        brand: 'Madar',
        weight: { value: 5, unit: 'l' },
        images: [
          {
            url: 'https://images.pexels.com/photos/4239013/pexels-photo-4239013.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Liquide vaisselle 5 L',
            isPrimary: true,
          },
        ],
        tags: ['vaisselle', 'liquide', 'bidon', 'nettoyant'],
        createdBy: admin._id,
      },

      // ────────── ÉLECTROMÉNAGER ──────────
      {
        name: 'Ventilateur sur Pied 16"',
        description:
          'Ventilateur sur pied 16 pouces, 3 vitesses, oscillation 90°. Silencieux et robuste. Indispensable à Dakar.',
        price: 25000,
        category: 'Électroménager',
        stock: 40,
        minStock: 8,
        sku: 'ELC-VEN-PIE-16',
        brand: 'Tornado',
        dimensions: { length: 45, width: 45, height: 130, unit: 'cm' },
        images: [
          {
            url: 'https://images.pexels.com/photos/3653849/pexels-photo-3653849.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Ventilateur sur pied 16 pouces',
            isPrimary: true,
          },
        ],
        tags: ['ventilateur', 'pied', 'fraîcheur', 'été'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Réfrigérateur 2 Portes 210 L',
        description:
          'Réfrigérateur-congélateur 210 litres, classe A+, froid statique. Faible consommation adaptée au réseau sénégalais.',
        price: 185000,
        category: 'Électroménager',
        stock: 10,
        minStock: 2,
        sku: 'ELC-REF-2P-210',
        brand: 'Hisense',
        dimensions: { length: 55, width: 55, height: 145, unit: 'cm' },
        images: [
          {
            url: 'https://images.pexels.com/photos/2343467/pexels-photo-2343467.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Réfrigérateur 2 portes 210 L',
            isPrimary: true,
          },
        ],
        tags: ['réfrigérateur', 'frigo', 'congélateur', 'hisense'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Mixeur Blender 1.5 L',
        description:
          'Blender multifonction 1,5 litre, 500 W, lames inox, bol en verre. Jus, smoothies et sauces.',
        price: 32000,
        category: 'Électroménager',
        stock: 25,
        minStock: 5,
        sku: 'ELC-MIX-BLE-15',
        brand: 'Moulinex',
        dimensions: { length: 18, width: 18, height: 40, unit: 'cm' },
        images: [
          {
            url: 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Blender Moulinex 1.5 L',
            isPrimary: true,
          },
        ],
        tags: ['mixeur', 'blender', 'jus', 'cuisine'],
        createdBy: admin._id,
      },
      {
        name: 'Cuisinière à Gaz 4 Feux + Four',
        description:
          'Cuisinière à gaz 4 brûleurs avec four et grill. Allumage piezo, émaillée blanche.',
        price: 145000,
        category: 'Électroménager',
        stock: 8,
        minStock: 2,
        sku: 'ELC-CUI-GAZ-4F',
        brand: 'Beko',
        dimensions: { length: 60, width: 60, height: 85, unit: 'cm' },
        images: [
          {
            url: 'https://images.pexels.com/photos/6489091/pexels-photo-6489091.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Cuisinière à gaz 4 feux',
            isPrimary: true,
          },
        ],
        tags: ['cuisinière', 'gaz', 'four', 'cuisine'],
        createdBy: admin._id,
      },
      {
        name: 'Fer à Repasser Vapeur 2200 W',
        description:
          'Fer à repasser à vapeur 2200 W, semelle antiadhésive, réservoir 300 ml. Défroissage rapide.',
        price: 18000,
        category: 'Électroménager',
        stock: 35,
        minStock: 5,
        sku: 'ELC-FER-VAP-22',
        brand: 'Philips',
        weight: { value: 1.2, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Fer à repasser Philips vapeur',
            isPrimary: true,
          },
        ],
        tags: ['fer', 'repasser', 'vapeur', 'linge'],
        createdBy: admin._id,
      },
      {
        name: 'Télévision LED 32"',
        description:
          'TV LED 32 pouces HD Ready, 2 HDMI, 1 USB, TNT intégrée. Qualité d\'image supérieure.',
        price: 125000,
        category: 'Électroménager',
        stock: 12,
        minStock: 3,
        sku: 'ELC-TV-LED-32',
        brand: 'Samsung',
        dimensions: { length: 73, width: 17, height: 44, unit: 'cm' },
        images: [
          {
            url: 'https://images.pexels.com/photos/1444416/pexels-photo-1444416.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Télévision LED 32 pouces',
            isPrimary: true,
          },
        ],
        tags: ['télévision', 'tv', 'led', 'samsung', '32-pouces'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Bouilloire Électrique 1.7 L',
        description:
          'Bouilloire électrique inox 1,7 litre, 2000 W, arrêt automatique. Pour le thé attaya et le café Touba.',
        price: 12000,
        category: 'Électroménager',
        stock: 50,
        minStock: 10,
        sku: 'ELC-BOU-ELE-17',
        brand: 'Sinbo',
        weight: { value: 0.9, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/6316068/pexels-photo-6316068.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Bouilloire électrique 1.7 L',
            isPrimary: true,
          },
        ],
        tags: ['bouilloire', 'électrique', 'thé', 'café'],
        createdBy: admin._id,
      },

      // ────────── VÊTEMENTS ──────────
      {
        name: 'Bazin Riche Allemand 10 yards',
        description:
          'Tissu Bazin Riche qualité allemande, 10 yards (9,1 m). Couleur au choix. Pour boubous et tenues de cérémonie.',
        price: 35000,
        category: 'Vêtements',
        stock: 60,
        minStock: 10,
        sku: 'VET-BAZ-ALL-10',
        brand: 'Bazin Riche',
        weight: { value: 2, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/6046183/pexels-photo-6046183.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Bazin Riche 10 yards',
            isPrimary: true,
          },
        ],
        tags: ['bazin', 'tissu', 'cérémonie', 'boubou', 'tailleur'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'Tissu Wax Hollandais 6 yards',
        description:
          'Tissu wax imprimé qualité hollandaise, 6 yards (5,5 m). Motifs variés, coloris vibrants.',
        price: 15000,
        category: 'Vêtements',
        stock: 80,
        minStock: 15,
        sku: 'VET-WAX-HOL-6',
        brand: 'Vlisco',
        weight: { value: 1.2, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/6044266/pexels-photo-6044266.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Tissu Wax hollandais 6 yards',
            isPrimary: true,
          },
        ],
        tags: ['wax', 'tissu', 'hollandais', 'pagne', 'mode'],
        isFeatured: true,
        createdBy: admin._id,
      },
      {
        name: 'T-Shirts Coton Homme × 6',
        description:
          'Lot de 6 t-shirts col rond 100 % coton, tailles assorties (M à XXL). Basiques pour la revente.',
        price: 9000,
        category: 'Vêtements',
        stock: 70,
        minStock: 15,
        sku: 'VET-TSH-COT-6',
        brand: 'Fashion Style',
        weight: { value: 1.5, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Lot de 6 t-shirts coton',
            isPrimary: true,
          },
        ],
        tags: ['t-shirt', 'coton', 'homme', 'lot', 'basique'],
        createdBy: admin._id,
      },
      {
        name: 'Sandales Homme Cuir',
        description:
          'Sandales homme en cuir véritable, semelle caoutchouc antidérapante. Confort et élégance au quotidien.',
        price: 8500,
        category: 'Vêtements',
        stock: 45,
        minStock: 10,
        sku: 'VET-SAN-CUI-H',
        brand: 'Dakar Shoes',
        weight: { value: 0.8, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/1449844/pexels-photo-1449844.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Sandales homme cuir',
            isPrimary: true,
          },
        ],
        tags: ['sandales', 'cuir', 'homme', 'chaussures'],
        createdBy: admin._id,
      },
      {
        name: 'Boubou Homme Brodé',
        description:
          'Grand boubou homme en bazin brodé, taille unique ample. Tenue traditionnelle pour les vendredis et cérémonies.',
        price: 28000,
        category: 'Vêtements',
        stock: 30,
        minStock: 5,
        sku: 'VET-BOU-BRO-H',
        brand: 'Dakar Couture',
        weight: { value: 1, unit: 'kg' },
        images: [
          {
            url: 'https://images.pexels.com/photos/7689734/pexels-photo-7689734.jpeg?auto=compress&cs=tinysrgb&w=600',
            alt: 'Boubou homme brodé',
            isPrimary: true,
          },
        ],
        tags: ['boubou', 'brodé', 'homme', 'traditionnel', 'cérémonie'],
        createdBy: admin._id,
      },
    ]);

    console.log(`${products.length} produits créés`);

    // ── Packs ──────────────────────────────────────────────────────────────
    // Trouver quelques produits pour les packs
    const rizBrise = products.find((p) => p.sku === 'ALM-RIZ-BRI-25');
    const huile20 = products.find((p) => p.sku === 'ALM-HUI-VEG-20');
    const sucre = products.find((p) => p.sku === 'ALM-SUC-PDR-50');
    const tomate = products.find((p) => p.sku === 'ALM-TOM-CON-24');
    const maggi = products.find((p) => p.sku === 'ALM-BOU-MAG-100');
    const lessiveOmo = products.find((p) => p.sku === 'HYG-LES-OMO-5');
    const javel = products.find((p) => p.sku === 'HYG-JAV-BID-5');
    const savon = products.find((p) => p.sku === 'HYG-SAV-MAR-12');

    await Pack.create([
      {
        name: 'Pack Cuisine Essentiel',
        description:
          'L\'essentiel pour la cuisine sénégalaise : riz, huile, tomate et bouillon. Idéal pour les boutiques de quartier.',
        items: [
          { product: rizBrise._id, quantity: 2, priceAtTimeOfAddition: rizBrise.price, name: rizBrise.name },
          { product: huile20._id, quantity: 1, priceAtTimeOfAddition: huile20.price, name: huile20.name },
          { product: tomate._id, quantity: 2, priceAtTimeOfAddition: tomate.price, name: tomate.name },
          { product: maggi._id, quantity: 2, priceAtTimeOfAddition: maggi.price, name: maggi.name },
        ],
        originalPrice: 0, // sera calculé par le pre-save
        price: 72000,
        discount: 10,
        category: 'alimentaire',
        isFeatured: true,
        tags: ['cuisine', 'essentiel', 'boutique', 'starter'],
        image: {
          url: 'https://images.pexels.com/photos/6941010/pexels-photo-6941010.jpeg?auto=compress&cs=tinysrgb&w=600',
          alt: 'Pack Cuisine Essentiel',
        },
        createdBy: admin._id,
      },
      {
        name: 'Pack Famille Mensuel',
        description:
          'Le pack complet pour une famille : riz, sucre, huile, tomate, bouillon. Un mois de tranquillité.',
        items: [
          { product: rizBrise._id, quantity: 4, priceAtTimeOfAddition: rizBrise.price, name: rizBrise.name },
          { product: sucre._id, quantity: 1, priceAtTimeOfAddition: sucre.price, name: sucre.name },
          { product: huile20._id, quantity: 2, priceAtTimeOfAddition: huile20.price, name: huile20.name },
          { product: tomate._id, quantity: 3, priceAtTimeOfAddition: tomate.price, name: tomate.name },
          { product: maggi._id, quantity: 3, priceAtTimeOfAddition: maggi.price, name: maggi.name },
        ],
        originalPrice: 0,
        price: 150000,
        discount: 12,
        category: 'alimentaire',
        isFeatured: true,
        tags: ['famille', 'mensuel', 'complet', 'économique'],
        image: {
          url: 'https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=600',
          alt: 'Pack Famille Mensuel',
        },
        createdBy: admin._id,
      },
      {
        name: 'Pack Hygiène Maison',
        description:
          'Tout pour garder la maison propre : lessive, javel et savon. Économie garantie en lot.',
        items: [
          { product: lessiveOmo._id, quantity: 2, priceAtTimeOfAddition: lessiveOmo.price, name: lessiveOmo.name },
          { product: javel._id, quantity: 2, priceAtTimeOfAddition: javel.price, name: javel.name },
          { product: savon._id, quantity: 1, priceAtTimeOfAddition: savon.price, name: savon.name },
        ],
        originalPrice: 0,
        price: 24000,
        discount: 8,
        category: 'hygiene',
        isFeatured: true,
        tags: ['hygiène', 'maison', 'nettoyage', 'lot'],
        image: {
          url: 'https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=600',
          alt: 'Pack Hygiène Maison',
        },
        createdBy: admin._id,
      },
    ]);

    console.log('3 packs créés');

    console.log('\n══════════════════════════════════════════');
    console.log('  Seed terminé avec succès !');
    console.log('══════════════════════════════════════════');
    console.log('  Admin   : admin@cheikhdistribution.sn / admin123');
    console.log('  Livreur : livreur@cheikhdistribution.sn / livreur123');
    console.log('  Client  : client@cheikhdistribution.sn / client123');
    console.log(`  ${products.length} produits + 3 packs dans 4 catégories`);
    console.log('══════════════════════════════════════════\n');
  } catch (error) {
    console.error('Erreur lors de la création des données:', error);
    throw error;
  }
};

module.exports = seedData;
