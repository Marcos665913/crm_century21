const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: false
  },
  fecha: {
    type: Date,
    required: true
  },
  mensaje: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'notified', 'completed'], // Estados claros
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
