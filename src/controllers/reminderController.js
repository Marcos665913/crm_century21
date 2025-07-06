const Reminder = require('../models/Reminder');

// --- FUNCIÓN CORREGIDA ---
exports.scheduleReminder = async (req, res, next) => {
    try {
        const { cliente, fecha, mensaje } = req.body;
        if (!fecha || !mensaje) {
            return res.status(400).json({ mensaje: 'La fecha y el mensaje son obligatorios.' });
        }
        const reminder = new Reminder({
            usuario: req.user.id,
            cliente: cliente || null,
            fecha,
            mensaje,
        });
        
        // Guardamos el nuevo recordatorio
        const savedReminder = await reminder.save();
        
        // Devolvemos el objeto completo que se guardó. Esto soluciona el error en Flutter.
        res.status(201).json(savedReminder);

    } catch (error) {
        next(error);
    }
};
// --- FIN DE LA CORRECCIÓN ---

exports.getReminders = async (req, res, next) => {
    try {
        const reminders = await Reminder.find({ usuario: req.user.id }).populate('cliente', 'fields.nombre');
        res.status(200).json(reminders);
    } catch (error) {
        next(error);
    }
};

exports.deleteReminder = async (req, res, next) => {
    try {
        const reminderId = req.params.id;
        const userId = req.user.id;
        const reminder = await Reminder.findById(reminderId);

        if (!reminder) {
            return res.status(404).json({ mensaje: 'Recordatorio no encontrado.' });
        }
        if (reminder.usuario.toString() !== userId) {
            return res.status(403).json({ mensaje: 'Acceso denegado.' });
        }
        await Reminder.findByIdAndDelete(reminderId);
        res.status(200).json({ mensaje: 'Recordatorio eliminado correctamente.' });
    } catch (error) {
        next(error);
    }
};