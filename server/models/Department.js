const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  faculty: { type: String, required: true }
});

module.exports = mongoose.model('Department', departmentSchema);
