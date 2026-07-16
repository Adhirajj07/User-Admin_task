const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  operation: { type: String, enum: ['Create', 'Update', 'Delete'], required: true },
  targetResourceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resource', default: null },
  data: {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true }
  },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  adminComment: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

requestSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Request', requestSchema);