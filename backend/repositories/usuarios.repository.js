const { sql, conectarDB } = require('../db');

async function crearUsuario(nombreUsuario, correo, contrasenaHash) {
    const pool = await conectarDB();

    await pool.request()
        .input('nombreUsuario', sql.NVarChar, nombreUsuario)
        .input('correo', sql.NVarChar, correo)
        .input('contrasenaHash', sql.NVarChar, contrasenaHash)
        .query(`
            INSERT INTO Usuarios (NombreUsuario, Correo, Contrasena)
            VALUES (@nombreUsuario, @correo, @contrasenaHash)
        `);
}

async function buscarPorCorreo(correo) {
    const pool = await conectarDB();

    const resultado = await pool.request()
        .input('correo', sql.NVarChar, correo)
        .query('SELECT Id, NombreUsuario, Contrasena FROM Usuarios WHERE Correo = @correo');

    return resultado.recordset[0];
}

module.exports = { crearUsuario, buscarPorCorreo };