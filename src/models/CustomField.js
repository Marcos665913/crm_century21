// C:\Users\lamam\OneDrive\Escritorio\BACKEND\src\models\CustomField.js
const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema({
  name: { // El nombre del campo que se mostrará en el frontend (ej. "Notas Adicionales")
    type: String,
    required: true,
    unique: true, // Asegura que no haya campos con el mismo nombre
    trim: true,
  },
  key: { // La clave interna para la base de datos (ej. "notasAdicionales" en camelCase)
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  type: { // El tipo de dato (por ahora solo 'string' según tus necesidades)
    type: String,
    required: true,
    enum: ['string'], // Restringimos los tipos de datos posibles
    default: 'string',
  },
  // Podrías añadir más propiedades si necesitas, ej: `order: Number` para ordenar en el frontend
}, { timestamps: true });

module.exports = mongoose.model('CustomField', customFieldSchema);