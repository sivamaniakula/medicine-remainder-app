// Normalizes a stored phone number into E.164 format before it's handed
// to Twilio's Voice/WhatsApp APIs, which require a leading "+<country code>"
// (e.g. +919876543210). Numbers are stored in the DB as entered - often a
// plain 10-digit local number - so this converts at send-time instead of
// touching storage/lookup logic used elsewhere (registration, linking).
// Defaults to India's country code (91) since that's this app's market.
const toE164 = (phone, defaultCountryCode = "91") => {
  if (!phone) return phone;
  const trimmed = phone.toString().trim();
  if (trimmed.startsWith("+")) return trimmed;
  return `+${defaultCountryCode}${trimmed.replace(/\D/g, "")}`;
};

module.exports = { toE164 };
