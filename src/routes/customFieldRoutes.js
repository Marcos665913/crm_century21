const express = require('express');
const router = express.Router();
const customFieldController = require('../controllers/customFieldController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Crear un nuevo campo personalizado (solo master)
router.post('/', authorizeRoles('master'), customFieldController.createCustomField);

// Obtener todos los campos personalizados (todos los roles pueden ver qué campos existen)
// MODIFICACIÓN: Todos los roles deben poder obtener estos campos para que el frontend los muestre.
router.get('/', authorizeRoles('normal', 'privileged', 'master'), customFieldController.getCustomFields);

// Eliminar un campo personalizado (solo master)
router.delete('/:id', authorizeRoles('master'), customFieldController.deleteCustomField);

module.exports = router;