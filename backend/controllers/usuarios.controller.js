const usuariosService = require('../services/usuarios.service');

async function registrarUsuario(req, res) {
    try {
        const { nombreUsuario, correo, contrasena } = req.body;

        if (!nombreUsuario || !correo || !contrasena) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        await usuariosService.registrarUsuario(nombreUsuario, correo, contrasena);

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });

    } catch (error) {
        if (error.number === 2627 || error.number === 2601) {
            return res.status(400).json({ error: 'El nombre de usuario o correo ya están en uso.' });
        }
        
        res.status(400).json({ error: error.message });
    }
}

module.exports = { registrarUsuario };