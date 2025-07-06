const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const { sendNotification } = require('../services/firebaseService');

const start = () => {
  console.log('Scheduler de recordatorios iniciado. Verificando cada minuto.');
  
  // Se ejecuta cada minuto
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      
      const dueReminders = await Reminder.find({
        fecha: { $lte: now },
        status: 'pending'
      }).populate('usuario', 'name email fcmToken');

      if (dueReminders.length === 0) {
        return;
      }

      console.log(`[Scheduler] Encontrados ${dueReminders.length} recordatorios pendientes.`);

      for (const reminder of dueReminders) {
        if (reminder.usuario && reminder.usuario.fcmToken) {
          
          console.log(`[Scheduler] Preparando notificación para: ${reminder.usuario.email}`);
          await sendNotification(
            reminder.usuario.fcmToken,
            'Recordatorio: Century 21',
            reminder.mensaje
          );
        } else {
          console.log(`[Scheduler] Usuario ${reminder.usuario?.email || 'desconocido'} no tiene token FCM. Omitiendo notificación.`);
        }
        
        reminder.status = 'notified'; 
        await reminder.save();
        console.log(`[Scheduler] Recordatorio "${reminder.mensaje}" marcado como notificado.`);
      }
    } catch (error) {
      console.error('[Scheduler] Error ejecutando la tarea:', error);
    }
  });
};

module.exports = { start };
