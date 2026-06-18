const mongoose = require('mongoose');

const clubMessageSchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'Club', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  type: { type: String, enum: ['text', 'system'], default: 'text' }
}, { timestamps: true });

clubMessageSchema.index({ club: 1, createdAt: -1 });

module.exports = mongoose.model('ClubMessage', clubMessageSchema);
