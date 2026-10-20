const usuariosService = require('../services/usuarios.service');
const ErrorDeNegocio = require('../errors/ErrorDeNegocio');

function responderError(res, error) {
    if (error instanceof ErrorDeNegocio) {
        return res.status(error.estado).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.' });
}

async function registrarUsuario(req, res) {
    try {
        const { nombreUsuario, correo, contrasena } = req.body ?? {};

        if (!nombreUsuario || !correo || !contrasena) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        await usuariosService.registrarUsuario(nombreUsuario, correo, contrasena);

        res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
    } catch (error) {
        responderError(res, error);
    }
}

async function iniciarSesion(req, res) {
    try {
        const { correo, contrasena } = req.body ?? {};

        if (!correo || !contrasena) {
            return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        }

        const usuario = await usuariosService.iniciarSesion(correo, contrasena);

        req.session.usuarioId = usuario.id;
        req.session.nombreUsuario = usuario.nombreUsuario;

        res.status(200).json({
            mensaje: 'Inicio de sesión exitoso.',
            usuario: usuario.nombreUsuario
        });
    } catch (error) {
        responderError(res, error);
    }
}

module.exports = { registrarUsuario, iniciarSesion };