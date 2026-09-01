const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  user_id: { type: Number, required: true },
  check_in_time: { type: String, required: true },
  check_out_time: { type: String, default: null },
  purpose_of_visit: { type: String, required: true },
  research_topic: { type: String, required: true },
  duration_minutes: { type: Number, default: 0 },
  status: { type: String, required: true, enum: ['ACTIVE', 'COMPLETED', 'PENDING_APPROVAL', 'REJECTED'] },
  created_at: { type: String, required: true }
});

sessionSchema.index({ status: 1 });
sessionSchema.index({ user_id: 1, status: 1 });
sessionSchema.index({ check_in_time: -1 });

module.exports = mongoose.model('Session', sessionSchema);
