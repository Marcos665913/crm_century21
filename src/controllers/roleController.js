// src/controllers/roleController.js
const User = require('../models/User');

exports.assignRole = async (req, res, next) => {
  try {
    const { userId, role } = req.body;
    const allowedRoles = ['normal', 'privileged', 'master'];
    
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' });
    }

    const userToUpdate = await User.findById(userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const requesterRole = req.user.role;

    // Un usuario 'master' puede asignar cualquier rol (incluido 'master') a cualquier otro usuario.
    // Un usuario 'privileged' solo puede asignar 'normal' o 'privileged' a usuarios que no sean 'master'.
    if (requesterRole === 'privileged' && (role === 'master' || userToUpdate.role === 'master')) {
      return res.status(403).json({ message: 'Acceso denegado. Un usuario privilegiado no puede asignar o modificar el rol master.' });
    }
    
    userToUpdate.role = role;
    await userToUpdate.save();

    res.json({ message: 'Rol actualizado', user: userToUpdate });
  } catch (error) {
    next(error);
  }
};