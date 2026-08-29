const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  university_id: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: '' },
  role_id: { type: Number, required: true },
  department_id: { type: Number, required: true },
  research_field: { type: String, default: 'Academic Research' },
  default_purpose: { type: String, default: 'Academic Research' },
  gender: { type: String, default: '' },
  room: { type: String, default: '' },
  created_at: { type: String },
  updated_at: { type: String }
});

module.exports = mongoose.model('User', userSchema);
