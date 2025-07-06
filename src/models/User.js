const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['normal', 'privileged', 'master'], default: 'normal' },
  fcmToken: { type: String, required: false, default: null },
  // Controla si la cuenta está activa o ha sido "eliminada" por un admin.
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
