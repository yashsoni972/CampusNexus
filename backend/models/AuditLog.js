const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorName: { type: String },
  action: { type: String, required: true }, // e.g. 'ROLE_CHANGE', 'USER_DELETE', 'STATUS_TOGGLE'
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  targetName: { type: String },
  details: { type: String },
}, { timestamps: true });

auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
