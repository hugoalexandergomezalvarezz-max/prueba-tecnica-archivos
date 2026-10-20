const bcrypt = require('bcrypt');
const usuariosRepository = require('../repositories/usuarios.repository');

async function registrarUsuario(nombreUsuario, correo, contrasena) {
    if (contrasena.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres.');
    }

    const saltRounds = 10;
    const contrasenaHash = await bcrypt.hash(contrasena, saltRounds);

    const resultado = await usuariosRepository.crearUsuario(nombreUsuario, correo, contrasenaHash);
    
    return resultado;
}

module.exports = { registrarUsuario };