require('dotenv').config();
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

client.content.v1.contents.list({ limit: 20 }).then(contents => {
  contents.forEach(c => console.log(c.sid, '|', c.friendlyName, '|', JSON.stringify(c.types)));
}).catch(err => console.error('Error:', err.message));
