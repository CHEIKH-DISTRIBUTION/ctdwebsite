const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

const seedData = async () => {
    try {
        // Supprimer les données existantes
        await User.deleteMany({});
        await Product.deleteMany({});
        await Category.deleteMany({});

        console.log('Données existantes supprimées');

        // Créer un utilisateur admin
        const adminUser = await User.create({
            name: 'Administrateur',
            email: 'admin@cheikhdistribution.sn',
            password: 'admin123',
            phone: '+221771234567',
            role: 'admin',
            address: {
                street: 'Avenue Cheikh Anta Diop',
                city: 'Dakar',
                region: 'Dakar',
                country: 'Sénégal'
            }
        });

        console.log('Utilisateur admin créé');

        // Créer les catégories
        const categories = [
            {
                name: 'Alimentaire',
                description: 'Produits alimentaires de qualité',
                icon: 'ShoppingBasket',
                createdBy: adminUser._id
            },
            {
                name: 'Hygiène',
                description: 'Produits d\'hygiène et de beauté',
                icon: 'Sparkles',
                createdBy: adminUser._id
            },
            {
                name: 'Électroménager',
                description: 'Appareils électroménagers',
                icon: 'Zap',
                createdBy: adminUser._id
            },
            {
                name: 'Vêtements',
                description: 'Vêtements et accessoires',
                icon: 'Shirt',
                createdBy: adminUser._id
            }
        ];

        await Category.insertMany(categories);
        console.log('Catégories créées');

        // Créer des produits d'exemple
        const products = [
            // Alimentaire
            {
                name: 'Riz Parfumé 25kg',
                description: 'Riz parfumé de qualité supérieure, idéal pour toute la famille',
                price: 15000,
                category: 'Alimentaire',
                stock: 50,
                minStock: 10,
                sku: 'RIZ-25KG-001',
                brand: 'Premium Rice',
                weight: { value: 25, unit: 'kg' },
                images: [{
                    url: 'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=400',
                    alt: 'Riz Parfumé 25kg',
                    isPrimary: true
                }],
                tags: ['riz', 'alimentaire', 'céréales'],
                isFeatured: true,
                createdBy: adminUser._id
            },
            {
                name: 'Huile de Tournesol 5L',
                description: 'Huile de tournesol pure, parfaite pour la cuisine',
                price: 8500,
                category: 'Alimentaire',
                stock: 30,
                minStock: 5,
                sku: 'HUILE-5L-001',
                brand: 'Golden Oil',
                weight: { value: 5, unit: 'l' },
                images: [{
                    url: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=400',
                    alt: 'Huile de Tournesol 5L',
                    isPrimary: true
                }],
                tags: ['huile', 'cuisine', 'alimentaire'],
                createdBy: adminUser._id
            },
            // Hygiène
            {
                name: 'Savon de Marseille',
                description: 'Savon naturel pour toute la famille',
                price: 800,
                category: 'Hygiène',
                stock: 75,
                minStock: 15,
                sku: 'SAVON-MAR-001',
                brand: 'Marseille Soap',
                weight: { value: 100, unit: 'g' },
                images: [{
                    url: 'https://images.pexels.com/photos/4465831/pexels-photo-4465831.jpeg?auto=compress&cs=tinysrgb&w=400',
                    alt: 'Savon de Marseille',
                    isPrimary: true
                }],
                tags: ['savon', 'hygiène', 'naturel'],
                createdBy: adminUser._id
            },
            // Électroménager
            {
                name: 'Mixeur 3 en 1',
                description: 'Mixeur multifonction avec plusieurs accessoires',
                price: 45000,
                category: 'Électroménager',
                stock: 15,
                minStock: 3,
                sku: 'MIXEUR-3EN1-001',
                brand: 'KitchenPro',
                dimensions: { length: 30, width: 20, height: 35, unit: 'cm' },
                images: [{
                    url: 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg?auto=compress&cs=tinysrgb&w=400',
                    alt: 'Mixeur 3 en 1',
                    isPrimary: true
                }],
                tags: ['mixeur', 'électroménager', 'cuisine'],
                isFeatured: true,
                createdBy: adminUser._id
            },
            // Vêtements
            {
                name: 'Chemise Homme Élégante',
                description: 'Chemise élégante pour homme, coton de qualité',
                price: 12000,
                category: 'Vêtements',
                stock: 25,
                minStock: 5,
                sku: 'CHEMISE-H-001',
                brand: 'Fashion Style',
                images: [{
                    url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=400',
                    alt: 'Chemise Homme Élégante',
                    isPrimary: true
                }],
                tags: ['chemise', 'homme', 'vêtements', 'élégant'],
                createdBy: adminUser._id
            }
        ];

        await Product.insertMany(products);
        console.log('Produits créés');

        console.log('Données de test créées avec succès!');
        console.log('Admin: admin@cheikhdistribution.sn / admin123');

    } catch (error) {
        console.error('Erreur lors de la création des données:', error);
    }
};

module.exports = seedData;