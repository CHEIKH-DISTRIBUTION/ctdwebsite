const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env.test') });
const mongoose = require('mongoose');
const User = require('../models/User');
jest.setTimeout(30000); // au cas où

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase(); // supprime la base de test
  await mongoose.connection.close();
});

describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '771234567'
    });

    const fetched = await User.findById(user._id).select('+password');
    expect(fetched.password).not.toBe('password123');
  });
});
