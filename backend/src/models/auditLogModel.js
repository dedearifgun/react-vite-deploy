const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  role: { type: String },
  action: { type: String, required: true }, // create/update/delete/reorder
  model: { type: String, required: true }, // Product/Category
  itemId: { type: String },
  path: { type: String },
  method: { type: String },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

// Index untuk mempercepat agregasi: pencarian berdasarkan action dan rentang waktu
AuditLogSchema.index({ action: 1, createdAt: 1 });
AuditLogSchema.index({ createdAt: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);