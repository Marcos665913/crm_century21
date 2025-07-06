const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, authorizeRoles } = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/all', userController.getAllUsers);
router.get('/profile', userController.getUserProfile);
router.post('/fcm-token', userController.updateFcmToken);

// La ruta DELETE ahora apunta a la función de desactivar
router.delete('/:id', authorizeRoles('master'), userController.deactivateUser);
// Nueva ruta PATCH para reactivar usuarios
router.patch('/:id/reactivate', authorizeRoles('master'), userController.reactivateUser);

module.exports = router;
