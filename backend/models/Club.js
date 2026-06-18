const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now }
}, { _id: false });

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
  description: { type: String, trim: true, maxlength: 500 },
  tags: [{ type: String, trim: true, maxlength: 30 }],
  avatar: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Virtual member count
clubSchema.virtual('memberCount').get(function () {
  return this.members.length;
});

module.exports = mongoose.model('Club', clubSchema);
