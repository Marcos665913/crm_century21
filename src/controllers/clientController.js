    // src/controllers/clientController.js
    const Client = require('../models/Client');
    const CustomField = require('../models/CustomField'); // Asegúrate de importar CustomField
    const xlsx = require('xlsx'); // Asegúrate de tener instalado 'xlsx' o 'xlsx-js-style'
    const jwt = require('jsonwebtoken'); // Necesario para los tokens temporales

    // Obtener clientes (sin cambios)
    exports.getClients = async (req, res) => {
    try {
        let clients;
        if (req.user.role === 'privileged' || req.user.role === 'master') {
        clients = await Client.find().populate('createdBy', 'name email role');
        } else {
        clients = await Client.find({ createdBy: req.user._id }).populate('createdBy', 'name email role');
        }
        res.json(clients);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
    };

    // --- FUNCIÓN MODIFICADA: generateExportUrl ---
    exports.generateExportUrl = async (req, res, next) => {
    try {
        // req.user.id ya viene del authMiddleware
        const userId = req.user.id;
        const userRole = req.user.role;

        // Generar un token JWT de corta duración para la descarga
        // Este token contendrá el ID del usuario y su rol, y expirará rápido (ej. 30 segundos)
        const downloadPayload = { id: userId, role: userRole, purpose: 'file_download' };
        const downloadToken = jwt.sign(downloadPayload, process.env.JWT_SECRET, { expiresIn: '30s' }); // Expira en 30 segundos

        // *** CAMBIO CRÍTICO AQUÍ: Construir la URL de descarga con la URL pública de Render ***
        // Opción 1 (Recomendada): Usar process.env.RENDER_EXTERNAL_HOSTNAME si Render lo inyecta.
        // Esto es lo más dinámico y correcto para Render.
        const publicBaseUrl = process.env.RENDER_EXTERNAL_HOSTNAME 
                            ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/api` 
                            : 'https://crm-century21.onrender.com/api'; // <-- Fallback a la URL hardcodeada de Render

        // Si tu backend tiene una variable de entorno BASE_URL_PUBLIC que tú configuras en Render, podrías usar:
        // const publicBaseUrl = process.env.BASE_URL_PUBLIC || 'https://crm-century21.onrender.com/api';

        const exportUrl = `${publicBaseUrl}/clients/export?token=${downloadToken}`;

        res.status(200).json({ downloadUrl: exportUrl });

    } catch (error) {
        console.error('Error al generar URL de exportación:', error);
        next(error);
    }
    };
    // --- FIN DE FUNCIÓN MODIFICADA: generateExportUrl ---


    // --- FUNCIÓN MODIFICADA: exportClients ---
    exports.exportClients = async (req, res, next) => {
    try {
        // *** CAMBIO CLAVE: Validar el token temporal de descarga aquí ***
        const downloadToken = req.query.token; // El token viene como parámetro de consulta
        if (!downloadToken) {
        return res.status(401).json({ mensaje: 'Token de descarga no proporcionado.' });
        }

        let decodedToken;
        try {
        decodedToken = jwt.verify(downloadToken, process.env.JWT_SECRET);
        if (decodedToken.purpose !== 'file_download') {
            return res.status(403).json({ mensaje: 'Token inválido para descarga.' });
        }
        } catch (tokenError) {
        return res.status(403).json({ mensaje: 'Token de descarga inválido o expirado.' });
        }

        // Ahora usamos el ID y el rol del token de descarga para obtener los clientes
        const userIdFromToken = decodedToken.id;
        const userRoleFromToken = decodedToken.role;

        // 1. Obtener los datos de los clientes según el rol del usuario
        let clients;
        if (userRoleFromToken === 'privileged' || userRoleFromToken === 'master') {
        clients = await Client.find().populate('createdBy', 'name email');
        } else {
        clients = await Client.find({ createdBy: userIdFromToken }).populate('createdBy', 'name email');
        }

        // 2. Obtener las definiciones de los campos personalizados para usarlos como cabeceras
        const customFieldDefs = await CustomField.find();
        const customFieldHeaders = customFieldDefs.map(field => field.name);
        const customFieldKeys = customFieldDefs.map(field => field.key);

        // 3. Formatear los datos para el archivo Excel
        const dataForExcel = clients.map(client => {
        // Función para formatear fechas
        const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-MX') : '';
        const formatTime = (date) => date ? new Date(date).toLocaleTimeString('es-MX') : '';

        // Mapeo de campos estándar
        let row = {
            'FECHA DE CONTACTO': formatDate(client.fields.fechaContacto),
            'HORA DE CONTACTO': formatTime(client.fields.fechaContacto),
            'NOMBRE': client.fields.nombre,
            'TELEFONO': client.fields.telefono,
            'CORREO': client.fields.correo,
            'ASUNTO': client.fields.asunto,
            'TIPO DE INMUEBLE': client.fields.tipoInmueble,
            'ORIGEN': client.fields.origen,
            'ESTATUS': client.fields.estatus,
            'SEGUIMIENTO': client.fields.seguimiento,
            'FECHA ASIGNACION': formatDate(client.fields.fechaAsignacion),
            'HORA ASIGNACION': formatTime(client.fields.fechaAsignacion),
            'PRESUPUESTO': client.fields.presupuesto,
            'TIPO DE PAGO': client.fields.tipoPago,
            'ZONA': client.fields.zona,
            'ESPECIFICACIONES': client.fields.especificaciones,
            'OBSERVACIONES': client.fields.observaciones,
            'ASESOR ASIGNADO': client.createdBy ? client.createdBy.name : 'No asignado'
        };

        // Añadir campos personalizados dinámicamente
        customFieldKeys.forEach((key, index) => {
            const headerName = customFieldHeaders[index];
            // Asegúrate de que customFieldsData sea un Map y que key exista
            row[headerName] = client.customFieldsData && typeof client.customFieldsData.get === 'function' 
                            ? client.customFieldsData.get(key) || '' 
                            : client.customFieldsData[key] || ''; // Fallback para acceso directo
        });

        return row;
        });

        // 4. Crear el libro y la hoja de Excel
        const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
        const workbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Clientes');

        // 5. Preparar el archivo para la descarga
        const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        
        res.setHeader('Content-Disposition', 'attachment; filename="reporte_clientes.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(buffer);

    } catch (error) {
        console.error('Error al exportar clientes:', error); // Log más específico
        next(error);
    }
    };
    // --- FIN DE FUNCIÓN MODIFICADA: exportClients ---

    // Agregar cliente
    exports.addClient = async (req, res, next) => {
    try {
        const { fields, customFieldsData } = req.body;
        
        // Validar que los campos requeridos existan
        if (!fields || !fields.nombre || !fields.telefono) {
            return res.status(400).json({ mensaje: 'Nombre y teléfono son obligatorios.' });
        }

        const newClientData = {
        fields,
        customFieldsData: customFieldsData || {},
        createdBy: req.user.id
        };

        const client = await Client.create(newClientData);
        const populatedClient = await Client.findById(client._id).populate('createdBy', 'name email role');

        res.status(201).json(populatedClient);

    } catch (error) {
        // Si es un error de duplicado (código 11000 de MongoDB)
        if (error.code === 11000) {
        return res.status(409).json({ mensaje: 'Ya existe un cliente con ese nombre o teléfono.' });
        }
        next(error); // Pasa otros errores al manejador central
    }
    };

    // Actualizar cliente
    exports.updateClient = async (req, res, next) => {
        try {
            const { fields, customFieldsData } = req.body;

            const updatedClient = await Client.findByIdAndUpdate(
                req.params.id,
                { fields, customFieldsData },
                { new: true, runValidators: true }
            ).populate('createdBy', 'name email role');

            if (!updatedClient) {
                return res.status(404).json({ mensaje: 'Cliente no encontrado' });
            }
            
            res.status(200).json(updatedClient);

        } catch (error) {
            next(error);
        }
    };

    // Eliminar cliente (sin cambios, solo master puede eliminar)
    exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        if (req.user.role !== 'master') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo usuario master puede eliminar clientes.' });
        }

        await client.deleteOne();
        res.json({ mensaje: 'Cliente eliminado' });
    } catch (error) {
        console.error('Error al eliminar cliente:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
    };

    // Eliminar campos específicos de un cliente (sin cambios, solo master puede eliminar campos)
    exports.deleteClientFields = async (req, res) => {
    try {
        if (req.user.role !== 'master') {
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo usuario master puede eliminar campos.' });
        }

        const client = await Client.findById(req.params.id);
        if (!client) {
        return res.status(404).json({ mensaje: 'Cliente no encontrado' });
        }

        const camposAEliminar = req.body.campos;
        if (!Array.isArray(camposAEliminar)) {
        return res.status(400).json({ mensaje: 'El cuerpo debe contener un arreglo "campos".' });
        }

        camposAEliminar.forEach(campo => {
        delete client.fields[campo];
        });

        await client.save();
        res.json({ mensaje: 'Campos eliminados correctamente', client });
    } catch (error) {
        console.error('Error al eliminar campos de cliente:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
    };
