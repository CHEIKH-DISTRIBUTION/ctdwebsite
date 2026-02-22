jest.setTimeout(30000);
require('dotenv').config({ path: './src/tests/.env.test' });
require('dotenv').config({ path: './.env.test' });

const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

describe('Product Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a valid product', async () => {
    const user = await User.create({
      name: 'Admin',
      email: 'admin@test.com',
      password: 'securepass123',
      phone: '771234567',
    });

    const product = await Product.create({
      name: 'Riz parfumé 25kg',
      description: 'Un riz de qualité supérieure pour toute la famille.',
      price: 12000,
      category: 'Alimentaire',
      images: [{ url: 'http://example.com/image.jpg' }],
      stock: 50,
      sku: 'RIZ25-001',
      createdBy: user._id,
    });

    expect(product.name).toBe('Riz parfumé 25kg');
    expect(product.stock).toBeGreaterThan(0);
    expect(product.rating.average).toBe(0);
    expect(product.rating.count).toBe(0);
    expect(product.isActive).toBe(true);
  });

  it('should not allow negative price', async () => {
    const user = await User.findOne(); // On réutilise un user existant

    try {
      await Product.create({
        name: 'Produit invalide',
        description: 'Prix négatif',
        price: -5000,
        category: 'Alimentaire',
        images: [{ url: 'http://example.com/image.jpg' }],
        stock: 10,
        sku: 'NEG-001',
        createdBy: user._id,
      });
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.errors.price).toBeDefined();
      expect(err.errors.price.message).toContain('Le prix ne peut pas être négatif');
    }
  });

  it('should calculate average rating correctly', async () => {
    const product = await Product.findOne();

    product.reviews.push(
      { user: new mongoose.Types.ObjectId(), rating: 4 },
      { user: new mongoose.Types.ObjectId(), rating: 5 },
      { user: new mongoose.Types.ObjectId(), rating: 3 }
    );

    product.calculateAverageRating();
    await product.save();

    expect(product.rating.average).toBeCloseTo(4.0, 1); // (4+5+3)/3 = 4
    expect(product.rating.count).toBe(3);
  });
});
