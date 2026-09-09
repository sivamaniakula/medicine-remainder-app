require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const r = await User.updateMany(
    { role: 'patient' },
    { $set: { preferredChannel: 'voice' } }
  );
  console.log('Set to voice:', r.modifiedCount);
  process.exit(0);
});
