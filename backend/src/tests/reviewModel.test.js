require('dotenv').config({ path: './src/tests/.env.test' });

const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const User = require('../models/User');

describe('Review Model', () => {
  let user, product;

  beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  user = await User.create({
    name: 'Test User',
    email: `testuser-${Date.now()}@example.com`,
    phone: '770000000', // ✅ ajoute ce champ
    password: 'password123'
  });

  product = await Product.create({
    name: 'Test Product',
    description: 'Description du produit',
    price: 100,
    category: 'Alimentaire',
    sku: `sku-${Date.now()}`,
    stock: 10,
    createdBy: user._id
  });
});


  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await Review.deleteMany({});
  });

  it('should create a valid review', async () => {
    const review = new Review({
      user: user._id,
      product: product._id,
      rating: 4,
      comment: 'Super produit !'
    });

    const savedReview = await review.save();

    expect(savedReview._id).toBeDefined();
    expect(savedReview.rating).toBe(4);
    expect(savedReview.comment).toMatch(/super produit/i);
    expect(savedReview.product.toString()).toBe(product._id.toString());
    expect(savedReview.user.toString()).toBe(user._id.toString());
  });

  it('should fail with invalid rating', async () => {
    const review = new Review({
      user: user._id,
      product: product._id,
      rating: 6, // invalide, au-dessus de 5
      comment: 'Note invalide'
    });

    await expect(review.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should populate user and product', async () => {
    const review = await Review.create({
      user: user._id,
      product: product._id,
      rating: 5,
      comment: 'Excellent !'
    });

    const populated = await Review.findById(review._id).populate('user').populate('product');

    expect(populated.user.email).toBe(user.email);
    expect(populated.product.name).toBe(product.name);
  });
});
