const { sql, conectarDB } = require('../db');

async function crearUsuario(nombreUsuario, correo, contrasenaHash) {
    const pool = await conectarDB();
    
    const resultado = await pool.request()
        .input('nombreUsuario', sql.NVarChar, nombreUsuario)
        .input('correo', sql.NVarChar, correo)
        .input('contrasenaHash', sql.NVarChar, contrasenaHash)
        .query(`
            INSERT INTO Usuarios (NombreUsuario, Correo, Contrasena) 
            VALUES (@nombreUsuario, @correo, @contrasenaHash)
        `);
        
    return resultado;
}

module.exports = { crearUsuario };