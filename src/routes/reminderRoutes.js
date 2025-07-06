const express = require('express');
const router = express.Router();
const reminderController = require('../controllers/reminderController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Aplica el middleware de autenticación a todas las rutas de recordatorios
router.use(authMiddleware);

// Rutas existentes
router.post('/', reminderController.scheduleReminder);
router.get('/', reminderController.getReminders);

// --- INICIO DE NUEVA RUTA ---
// Nueva ruta para eliminar un recordatorio específico por su ID
router.delete('/:id', reminderController.deleteReminder);
// --- FIN DE NUEVA RUTA ---

module.exports = router;
