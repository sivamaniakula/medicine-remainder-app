require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const r = await User.updateOne(
    { _id: '6a9d3be5211292edf13f0817' },
    { $set: { fcmToken: 'feBDU6aEWJN9VA9wOeaFmJ:APA91bFYahB87rfXTc77-tlkQs-0oNtWzHIDUFaLPfcRXfftTKWcKpnxgIX7TA03VZjGsxzqUs43wYOvgTfqkt86koT8qSVbyANgZJ72YghbxvN5l3w2viM' } }
  );
  console.log('Matched:', r.matchedCount, 'Modified:', r.modifiedCount);
  process.exit(0);
});
