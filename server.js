// server.js
const http = require('http');
const dotenv = require('dotenv');
const app = require('./app'); // Importa la app de Express
const reminderScheduler = require('./src/jobs/reminderScheduler'); // Importa el planificador

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  // Inicia el planificador de recordatorios una vez que el servidor está activo
  reminderScheduler.start();
});
