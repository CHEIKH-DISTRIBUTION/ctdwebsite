require('dotenv').config({ path: './src/tests/.env.test' });

const mongoose = require('mongoose');
const Order = require('../models/Order'); // Chemin vers votre modèle Order
const { v4: uuidv4 } = require('uuid');

describe('Order Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // Supprimer toutes les commandes après chaque test
    await Order.deleteMany({});
  });

  it('should create a valid order', async () => {
    const orderData = {
      user: new mongoose.Types.ObjectId(),
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          quantity: 2,
          price: 50,
          total: 100,
        },
      ],
      subtotal: 100,
      deliveryFee: 10,
      tax: 5,
      total: 115,
      paymentMethod: 'cash',
      deliveryAddress: {
        street: '123 Test St',
        city: 'Test City',
        zipCode: '12345',
      },
      contactInfo: {
        email: 'test@example.com',
        phone: '123-456-7890',
      },
    };

    const order = new Order(orderData);
    const savedOrder = await order.save();

    expect(savedOrder._id).toBeDefined();
    expect(savedOrder.orderNumber).toBeDefined(); // Vérifie que le numéro de commande est généré
    expect(savedOrder.user.toString()).toBe(orderData.user.toString());
    expect(savedOrder.items[0].quantity).toBe(2);
    expect(savedOrder.total).toBe(115);
    expect(savedOrder.status).toBe('pending'); // Valeur par défaut
    expect(savedOrder.paymentStatus).toBe('pending'); // Valeur par défaut
  });

  it('should generate a unique order number', async () => {
    const order1 = new Order({
      user: new mongoose.Types.ObjectId(),
      items: [{ product: new mongoose.Types.ObjectId(), quantity: 1, price: 10, total: 10 }],
      subtotal: 10,
      total: 10,
      paymentMethod: 'wave',
      deliveryAddress: { street: 'Street 1', city: 'City 1', zipCode: '12345' },
      contactInfo: { email: 'email1@example.com', phone: '123-456-7890' },
    });
    await order1.save();

    const order2 = new Order({
      user: new mongoose.Types.ObjectId(),
      items: [{ product: new mongoose.Types.ObjectId(), quantity: 1, price: 20, total: 20 }],
      subtotal: 20,
      total: 20,
      paymentMethod: 'orange_money',
      deliveryAddress: { street: 'Street 2', city: 'City 2', zipCode: '67890' },
      contactInfo: { email: 'email2@example.com', phone: '987-654-3210' },
    });
    await order2.save();

    expect(order1.orderNumber).not.toBe(order2.orderNumber); // Les numéros doivent être uniques
  });

  it('should fail validation if required fields are missing', async () => {
    const invalidOrder = new Order({
      // Intentionnellement manquant des champs requis
      items: [],
      subtotal: 0,
      total: 0,
    });

    await expect(invalidOrder.save()).rejects.toThrow(mongoose.Error.ValidationError);
  });

  it('should update the status of an order', async () => {
    const order = new Order({
      user: new mongoose.Types.ObjectId(),
      items: [{ product: new mongoose.Types.ObjectId(), quantity: 1, price: 10, total: 10 }],
      subtotal: 10,
      total: 10,
      paymentMethod: 'bank_transfer',
      deliveryAddress: { street: 'Street 3', city: 'City 3', zipCode: '54321' },
      contactInfo: { email: 'email3@example.com', phone: '555-555-5555' },
    });
    await order.save();

    order.status = 'confirmed';
    const updatedOrder = await order.save();

    expect(updatedOrder.status).toBe('confirmed');
  });
});