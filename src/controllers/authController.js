const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // Si el usuario existe pero está inactivo, no se puede registrar.
      if (existingUser.status === 'inactive') {
        return res.status(403).json({ mensaje: 'Este correo electrónico está asociado a una cuenta desactivada.' });
      }
      // Si el usuario ya existe y está activo.
      return res.status(409).json({ mensaje: 'Este correo electrónico ya está en uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const newUser = new User({ name, email, passwordHash, role, status: 'active' });
    await newUser.save();

    const payload = { id: newUser._id, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ token });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    // Verificamos si la cuenta está activa ANTES de comprobar la contraseña.
    if (user.status === 'inactive') {
      return res.status(403).json({ mensaje: 'Esta cuenta ha sido desactivada.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas.' });
    }

    const payload = { id: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (error) {
    next(error);
  }
};
