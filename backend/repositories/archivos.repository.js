const { sql, conectarDB } = require('../db');

async function crearArchivo(archivo) {
    const pool = await conectarDB();

    await pool.request()
        .input('id', sql.UniqueIdentifier, archivo.id)
        .input('usuarioId', archivo.usuarioId)
        .input('nombreOriginal', sql.NVarChar, archivo.nombreOriginal)
        .input('nombreGuardado', sql.NVarChar, archivo.nombreGuardado)
        .input('tipo', sql.NVarChar, archivo.tipo)
        .input('tamanoBytes', sql.Int, archivo.tamanoBytes)
        .query(`
            INSERT INTO Archivos (Id, UsuarioId, NombreOriginal, NombreGuardado, Tipo, TamanoBytes)
            VALUES (@id, @usuarioId, @nombreOriginal, @nombreGuardado, @tipo, @tamanoBytes)
        `);
}

async function listarPorUsuario(usuarioId) {
    const pool = await conectarDB();

    const resultado = await pool.request()
        .input('usuarioId', usuarioId)
        .query(`
            SELECT Id, NombreOriginal, Tipo, TamanoBytes
            FROM Archivos
            WHERE UsuarioId = @usuarioId
        `);

    return resultado.recordset;
}

module.exports = { crearArchivo, listarPorUsuario };