// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Para seguridad
const connectDB = require('./src/config/db');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const clientRoutes = require('./src/routes/clientRoutes');
const roleRoutes = require('./src/routes/roleRoutes');
const userRoutes = require('./src/routes/userRoutes');
const reminderRoutes = require('./src/routes/reminderRoutes');
const customFieldRoutes = require('./src/routes/customFieldRoutes');

// Crear la aplicación Express
const app = express();

// Conectar a la Base de Datos
connectDB();

// Middlewares de seguridad y configuración
app.use(helmet()); // Añade cabeceras de seguridad
app.use(cors());   // Habilita CORS para todas las rutas
app.use(express.json()); // Permite parsear JSON en las peticiones

// Definición de Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/custom-fields', customFieldRoutes);

// Middleware para manejar rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

// Middleware centralizado para manejar errores
app.use((err, req, res, next) => {
  console.error('ERROR INESPERADO:', err);
  res.status(500).json({ mensaje: err.message || 'Error interno del servidor' });
});

module.exports = app;