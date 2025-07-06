const admin = require('firebase-admin');
// const serviceAccount = require('../../serviceAccountKey.json'); // <-- ¡COMENTA o ELIMINA ESTA LÍNEA!

// Asegura que solo se inicialice una vez
if (!admin.apps.length) {
  try {
    // Lee la clave del entorno y conviértela de JSON string a objeto JavaScript
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase Admin SDK inicializado.');
  } catch (error) {
    console.error('Error al inicializar Firebase Admin SDK:', error.message);
    // Puedes decidir si quieres que la app falle si Firebase no se inicializa
    // process.exit(1); 
  }
}

const sendNotification = async (token, title, body) => {
  if (!token) {
    console.log('No se proporcionó token FCM para enviar notificación.');
    return;
  }

  const message = {
    notification: { title, body },
    token: token,
  };

  try {
    await admin.messaging().send(message);
    console.log(`Notificación enviada a token: ...${token.slice(-10)}`);
  } catch (error) {
    console.error('Error al enviar notificación:', error.message);
  }
};

module.exports = { sendNotification };