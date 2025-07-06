const User = require('../models/User');

// Obtiene todos los usuarios (incluyendo inactivos para que el master los vea)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-passwordHash');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user || user.status === 'inactive') {
      return res.status(404).json({ mensaje: 'Usuario no encontrado o desactivado.' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Lógica de "Eliminar" ahora desactiva la cuenta
exports.deactivateUser = async (req, res, next) => {
  try {
    const userToDeactivate = await User.findById(req.params.id);

    if (!userToDeactivate) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }
    if (userToDeactivate._id.equals(req.user.id)) {
      return res.status(400).json({ mensaje: 'No puedes desactivar tu propia cuenta.' });
    }
    
    // Solo un master puede desactivar cuentas
    if (req.user.role !== 'master') {
      return res.status(403).json({ mensaje: 'Acceso denegado.' });
    }

    userToDeactivate.status = 'inactive';
    userToDeactivate.fcmToken = null; // Borramos el token para que no reciba notificaciones
    await userToDeactivate.save();

    res.status(200).json({ mensaje: `Usuario ${userToDeactivate.name} desactivado.` });
  } catch (error) {
    next(error);
  }
};

// Nueva función para reactivar cuentas
exports.reactivateUser = async (req, res, next) => {
  try {
    // Solo un master puede reactivar
    if (req.user.role !== 'master') {
      return res.status(403).json({ mensaje: 'Acceso denegado.' });
    }
    const userToReactivate = await User.findById(req.params.id);
    if (!userToReactivate) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    userToReactivate.status = 'active';
    await userToReactivate.save();
    res.status(200).json({ mensaje: `Usuario ${userToReactivate.name} reactivado.` });
  } catch (error) {
    next(error);
  }
};

// Controlador para guardar/actualizar el token FCM
exports.updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ mensaje: 'El token FCM es requerido.' });
    }
    await User.findByIdAndUpdate(req.user.id, { fcmToken: fcmToken });
    res.status(200).json({ mensaje: 'Token FCM actualizado correctamente.' });
  } catch (error) {
    next(error);
  }
};
