const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  badge_color: { type: String, required: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('Role', roleSchema);
