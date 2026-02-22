
require('dotenv').config({ path: './src/tests/.env.test' });

const mongoose = require('mongoose');
const Category = require('../models/Category');
const { v4: uuidv4 } = require('uuid');

describe('Category Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a valid category', async () => {
    const name = `Produits Test ${uuidv4()}`;
    const category = new Category({
      name,
      icon: 'test-icon',
      createdBy: new mongoose.Types.ObjectId()
    });

    const saved = await category.save();

    expect(saved._id).toBeDefined();
    expect(saved.name).toContain('Produits Test');
    expect(saved.slug).toMatch(/^produits-test/);
  });

  it('should fail if name is missing', async () => {
    const category = new Category({
      icon: 'no-name-icon',
      createdBy: new mongoose.Types.ObjectId()
    });

    let error;
    try {
      await category.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
  });

  it('should generate slug from name automatically', async () => {
    const name = `Produits Test ${uuidv4()}`;
    const expectedSlug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const category = new Category({
      name,
      icon: 'slug-icon',
      createdBy: new mongoose.Types.ObjectId()
    });

    const saved = await category.save();

    expect(saved.slug).toBe(expectedSlug);
  });
});