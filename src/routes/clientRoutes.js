// src/routes/clientRoutes.js
const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

// La ruta de exportar ahora NO usa el authMiddleware global para este endpoint
// router.use(authMiddleware); // COMENTA O ELIMINA ESTA LÍNEA SI ESTÁ ANTES DE /export

// Ruta para generar la URL de descarga (Esta SÍ DEBE ESTAR AUTENTICADA)
router.get('/export-url', authMiddleware, clientController.generateExportUrl); // <-- ¡NUEVA RUTA Y PROTEGIDA!

// Ruta para exportar los clientes a Excel. Ya no usa authMiddleware, verifica su propio token
// IMPORTANTE: Esta ruta DEBE ir *después* de router.use(authMiddleware) si lo tienes globalmente al inicio
// O, si lo mueves debajo, debe estar libre de authMiddleware.
// La mejor forma es asegurarse de que authMiddleware no aplique a esta específica.
// Por eso la moví arriba y le quité el router.use(authMiddleware); global si lo tienes.
// Si router.use(authMiddleware); está al principio, debes hacer una excepción
// o reestructurar tus rutas. Para esta explicación, asumo que solo quieres esta ruta sin authMiddleware global.
router.get('/export', clientController.exportClients); // <-- ¡AHORA NO PROTEGIDA POR EL MIDDLEWARE GLOBAL!

// Las demás rutas deben seguir protegidas si requieren autenticación.
// Si router.use(authMiddleware) estaba al principio, ponlo aquí para las rutas siguientes:
router.use(authMiddleware); // Vuelve a aplicar el middleware para las rutas que lo necesitan

// Rutas existentes (que sí requieren autenticación)
router.get('/', clientController.getClients);
router.post('/', clientController.addClient);
router.put('/:id', clientController.updateClient);
router.patch('/:id/fields', authorizeRoles('master'), clientController.deleteClientFields);
router.delete('/:id', authorizeRoles('master'), clientController.deleteClient);

module.exports = router;