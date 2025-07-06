const admin = require('firebase-admin');
const serviceAccount = require('../../serviceAccountKey.json');

// Asegura que solo se inicialice una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK inicializado.');
}

const sendNotification = async (token, title, body) => {
  if (!token) return;
  
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