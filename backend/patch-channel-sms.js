require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const r = await User.updateOne(
    { _id: '6a9d3be5211292edf13f0817' },
    { $set: { preferredChannel: 'sms' } }
  );
  console.log('Matched:', r.matchedCount, 'Modified:', r.modifiedCount);
  process.exit(0);
});
