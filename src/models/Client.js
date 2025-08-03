const mongoose = require('mongoose');

const asuntoEnum = ['COMPRA', 'VENTA', 'RENTA', 'DAR A RENTA', 'ASESOR EXTERNO', 'ASESORIA'];
const tipoInmuebleEnum = ['CASA', 'DEPARTAMENTO', 'BODEGA', 'TERRENO', 'LOCAL', 'NAVE INDUSTRIAL'];
const tipoPagoEnum = ['EFECTIVO', 'BANCARIO', 'INFONAVIT', 'FOVISSTE', 'N/A'];
const origenEnum = [
    'AMIGO/CONOCIDO', 'ESFERA DE INFLUENCIA', 'LONAS O ROTULO', 'TARJETAS', 
    'WHATSAPP', 'FACEBOOK', 'PAGINA WEB C21 GLOBAL', 'PROPIEDADES.COM', 
    'INMUEBLES 24', 'C21 MEXICO', 'INSTAGRAM', 'GOOGLE ADS', 'TIK TOK', 
    'YOUTUBE', 'TELEFONO OFICINA',
    'FACEBOOK PERSONAL', 'MARKET PLACE', 'GUARDIA'
];
const estatusEnum = [
    'SIN COMENZAR', 'INICIADO', 'EN CURSO', 'COMPLETADO', 
    'STANDBY (EN ESPERA)', 'CANCELADO', 'RECHAZADO', 'CITADO', 'SIN RESPUESTA'
];

const clientSchema = new mongoose.Schema({
  fields: {
    fechaContacto: { type: Date, default: Date.now },
    fechaAsignacion: { type: Date, default: Date.now },
    
    nombre: { type: String, required: [true, 'El nombre es obligatorio.'] },
    telefono: { type: String, required: [true, 'El teléfono es obligatorio.'] },
    correo: { type: String, required: false, default: '' },
    
    asunto: { type: String, required: true, enum: asuntoEnum },
    idOperacion: { type: String, required: false, default: '' }, 
    idsRelacionados: { type: String, required: false, default: '' }, 
    tipoInmueble: { type: String, required: false, enum: tipoInmuebleEnum },
    origen: { type: String, required: true, enum: origenEnum },
    estatus: { type: String, required: true, enum: estatusEnum, default: 'SIN COMENZAR' },
    
    seguimiento: { type: String, required: false, default: '' },
    
    presupuesto: { type: Number, required: true },
    // NUEVO CAMPO: Precio Sugerido
    precioSugerido: { type: Number, required: false, default: 0 },
    // FIN NUEVO CAMPO
    tipoPago: { type: String, required: true, enum: tipoPagoEnum },
    zona: { type: String, required: false, default: '' },
    
    especificaciones: { type: String, required: false, default: '' },
    observaciones: { type: String, required: false, default: '' }
  },
  customFieldsData: {
    type: Map,
    of: String,
    default: {}
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
