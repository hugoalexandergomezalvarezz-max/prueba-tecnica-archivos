const bcrypt = require('bcrypt');
const usuariosRepository = require('../repositories/usuarios.repository');
const ErrorDeNegocio = require('../errors/ErrorDeNegocio');

const RONDAS_SAL = 10;
const LARGO_MINIMO_CONTRASENA = 8;
const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function registrarUsuario(nombreUsuario, correo, contrasena) {
    if (typeof nombreUsuario !== 'string' || typeof correo !== 'string' || typeof contrasena !== 'string') {
        throw new ErrorDeNegocio('Los datos enviados no son válidos.');
    }

    nombreUsuario = nombreUsuario.trim();
    correo = correo.trim().toLowerCase();

    if (!nombreUsuario) {
        throw new ErrorDeNegocio('El nombre de usuario es obligatorio.');
    }
    if (!FORMATO_CORREO.test(correo)) {
        throw new ErrorDeNegocio('El correo no tiene un formato válido.');
    }
    if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
        throw new ErrorDeNegocio('La contraseña debe tener al menos 8 caracteres.');
    }

    const contrasenaHash = await bcrypt.hash(contrasena, RONDAS_SAL);

    try {
        await usuariosRepository.crearUsuario(nombreUsuario, correo, contrasenaHash);
    } catch (error) {
        if (error.number === 2627 || error.number === 2601) {
            throw new ErrorDeNegocio('El nombre de usuario o el correo ya están en uso.', 409);
        }
        throw error;
    }
}

async function iniciarSesion(correo, contrasena) {
    if (typeof correo !== 'string' || typeof contrasena !== 'string') {
        throw new ErrorDeNegocio('Los datos enviados no son válidos.');
    }

    const usuario = await usuariosRepository.buscarPorCorreo(correo.trim().toLowerCase());
    if (!usuario) {
        throw new ErrorDeNegocio('Correo o contraseña incorrectos.', 401);
    }

    const contrasenaCorrecta = await bcrypt.compare(contrasena, usuario.Contrasena);
    if (!contrasenaCorrecta) {
        throw new ErrorDeNegocio('Correo o contraseña incorrectos.', 401);
    }

    return { id: usuario.Id, nombreUsuario: usuario.NombreUsuario };
}

module.exports = { registrarUsuario, iniciarSesion };