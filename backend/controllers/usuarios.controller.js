const usuariosService = require('../services/usuarios.service');
const responderError = require('../errors/responderError');

async function registrarUsuario(req, res) {
    try {
        const { nombreUsuario, correo, contrasena } = req.body ?? {};
        if (!nombreUsuario || !correo || !contrasena) return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        await usuariosService.registrarUsuario(nombreUsuario, correo, contrasena);
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente.' });
    } catch (error) {
        responderError(res, error);
    }
}

async function iniciarSesion(req, res) {
    try {
        const { correo, contrasena } = req.body ?? {};
        if (!correo || !contrasena) return res.status(400).json({ error: 'Faltan datos obligatorios.' });
        const usuario = await usuariosService.iniciarSesion(correo, contrasena);
        req.session.usuarioId = usuario.id;
        req.session.nombreUsuario = usuario.nombreUsuario;
        res.status(200).json({ mensaje: 'Inicio de sesión exitoso.', usuario: usuario.nombreUsuario });
    } catch (error) {
        responderError(res, error);
    }
}

function cerrarSesion(req, res) {
    req.session.destroy((error) => {
        if (error) return responderError(res, error);
        res.clearCookie('connect.sid');
        res.status(200).json({ mensaje: 'Sesión cerrada exitosamente.' });
    });
}

async function cambiarContrasena(req, res) {
    try {
        const { contrasenaActual, contrasenaNueva } = req.body ?? {};
        await usuariosService.cambiarContrasena(req.session.usuarioId, contrasenaActual, contrasenaNueva);
        res.status(200).json({ mensaje: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        responderError(res, error);
    }
}

module.exports = { registrarUsuario, iniciarSesion, cerrarSesion, cambiarContrasena };