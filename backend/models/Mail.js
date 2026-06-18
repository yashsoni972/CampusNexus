const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  filename:     { type: String, required: true },
  originalName: { type: String, required: true },
  mimetype:     { type: String, required: true },
  size:         { type: Number, required: true },
  path:         { type: String, required: true }
}, { _id: true });

const recipientSchema = new mongoose.Schema({
  user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email:  { type: String },
  read:   { type: Boolean, default: false },
  readAt: { type: Date },
  folder: { type: String, enum: ['inbox', 'trash'], default: 'inbox' }
}, { _id: false });

const mailSchema = new mongoose.Schema({
  from:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to:          [recipientSchema],
  cc:          [recipientSchema],
  subject:     { type: String, trim: true, maxlength: 255, default: '(No Subject)' },
  body:        { type: String, maxlength: 50000, default: '' },
  attachments: [attachmentSchema],
  tags:        [{ type: String, trim: true, maxlength: 30 }],
  isDraft:     { type: Boolean, default: false },
  senderFolder:{ type: String, enum: ['sent', 'trash'], default: 'sent' },
  sentAt:      { type: Date }
}, { timestamps: true });

mailSchema.index({ from: 1, createdAt: -1 });
mailSchema.index({ 'to.user': 1, createdAt: -1 });

module.exports = mongoose.model('Mail', mailSchema);
