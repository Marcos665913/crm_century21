const CustomField = require('../models/CustomField');
const Client = require('../models/Client'); // Para actualizar los clientes existentes

// Controlador para crear un nuevo campo personalizado (solo master)
exports.createCustomField = async (req, res) => {
  const { name } = req.body; // Solo necesitamos el nombre, el tipo es 'string'
  const key = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '').toLowerCase(); // Generar un 'key' a partir del nombre

  try {
    const existingField = await CustomField.findOne({ $or: [{ name }, { key }] });
    if (existingField) {
      return res.status(400).json({ message: 'Ya existe un campo con este nombre o clave.' });
    }

    const newCustomField = new CustomField({ name, key, type: 'string' }); // type es 'string' por defecto
    await newCustomField.save();

    // MODIFICACIÓN CRUCIAL: Añadir el nuevo campo a todos los clientes existentes con valor null
    await Client.updateMany(
      {}, // Para todos los clientes
      { $set: { [`customFieldsData.${key}`]: '' } } // Añadir el campo con una cadena vacía
      // Si prefieres null, sería: { $set: { [`customFieldsData.${key}`]: null } }
      // Pero como definimos 'of: String', Mongoose puede convertir null a '' automáticamente si no es estrictamente nulo.
      // String vacía es más segura para el frontend si el campo espera String.
    );

    res.status(201).json(newCustomField);
  } catch (error) {
    console.error('Error al crear campo personalizado:', error);
    if (error.code === 11000) { // Error de duplicado de MongoDB
      return res.status(400).json({ message: 'El nombre o clave del campo ya existe.' });
    }
    res.status(500).json({ message: 'Error del servidor al crear campo personalizado.' });
  }
};

// Controlador para obtener todos los campos personalizados definidos
exports.getCustomFields = async (req, res) => {
  try {
    const customFields = await CustomField.find();
    res.json(customFields);
  } catch (error) {
    console.error('Error al obtener campos personalizados:', error);
    res.status(500).json({ message: 'Error del servidor al obtener campos personalizados.' });
  }
};

// Controlador para eliminar un campo personalizado (solo master)
exports.deleteCustomField = async (req, res) => {
  try {
    console.log('Intentando eliminar campo personalizado con ID:', req.params.id); // DEBUG
    const { id } = req.params;
    const customFieldToDelete = await CustomField.findById(id);

    if (!customFieldToDelete) {
      console.log('Campo personalizado no encontrado para ID:', id); // DEBUG
      return res.status(404).json({ message: 'Campo personalizado no encontrado.' });
    }

    console.log('Campo encontrado:', customFieldToDelete.name, 'con key:', customFieldToDelete.key); // DEBUG

    // MODIFICACIÓN CRUCIAL: Eliminar el campo de todos los clientes existentes
    console.log('Intentando eliminar campo de todos los clientes con key:', customFieldToDelete.key); // DEBUG
    await Client.updateMany(
      {}, // Para todos los clientes
      { $unset: { [`customFieldsData.${customFieldToDelete.key}`]: '' } } // Eliminar el campo usando $unset
    );
    console.log('Campo eliminado de todos los clientes.'); // DEBUG

    // Luego, elimina la definición del campo en la colección CustomField
    console.log('Intentando eliminar definición del campo CustomField:', id); // DEBUG
    await CustomField.findByIdAndDelete(id);
    console.log('Definición de CustomField eliminada.'); // DEBUG

    res.json({ message: 'Campo personalizado eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar campo personalizado:', error); // DEBE MOSTRAR EL ERROR AHORA
    res.status(500).json({ message: 'Error del servidor al eliminar campo personalizado.' });
  }
};

