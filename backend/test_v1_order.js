require('dotenv').config();
const mongoose = require('mongoose');

require('./src/models/User');
require('./src/models/Product');
require('./src/models/Pack');
require('./src/models/Order');

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Product = require('./src/models/Product');
  const Order = require('./src/models/Order');
  
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const product = await Product.findById('699b9adde1945c278b601eae').session(session);
      console.log('Product found:', product.name, 'stock:', product.stock);
      
      const updated = await Product.findOneAndUpdate(
        { _id: '699b9adde1945c278b601eae', stock: { $gte: 1 } },
        { $inc: { stock: -1 } },
        { session, new: true }
      );
      console.log('Stock reserved, new stock:', updated.stock);
      
      const [order] = await Order.create([{
        user: '699b80536b4a9b4395b2bcf2',
        items: [{ product: product._id, quantity: 1, price: product.price, name: product.name, total: product.price }],
        subtotal: product.price,
        deliveryFee: 2000,
        total: product.price + 2000,
        paymentMethod: 'cash',
        deliveryAddress: { street: 'Rue 10', city: 'Dakar' },
        contactInfo: { phone: '771234567' },
        tracking: [{ status: 'pending', message: 'Test', updatedBy: '699b80536b4a9b4395b2bcf2' }]
      }], { session });
      
      console.log('Order created:', order._id);
    });
    console.log('TRANSACTION COMMITTED OK');
  } catch(e) {
    console.error('ERROR:', e.message);
  } finally {
    session.endSession();
  }
  
  await mongoose.disconnect();
}

test().catch(e => { console.error('FATAL:', e.message); });
