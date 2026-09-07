const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  isLocationRequired: { type: Boolean, default: false },
  libraryLat: { type: Number, default: 11.5564 }, // Default to roughly Phnom Penh center
  libraryLng: { type: Number, default: 104.9282 },
  maxDistance: { type: Number, default: 500 } // 500 meters
});

module.exports = mongoose.model('Setting', settingSchema);
