const crypto = require('crypto');
const fs = require('fs/promises');
const archivosRepository = require('../repositories/archivos.repository');
const path = require('path');
const ErrorDeNegocio = require('../errors/ErrorDeNegocio');
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;


async function guardarArchivo(usuarioId, archivoSubido) {
    const archivo = {
        id: crypto.randomUUID(),
        usuarioId,
        nombreOriginal: Buffer.from(archivoSubido.originalname, 'latin1').toString('utf8'),
        nombreGuardado: archivoSubido.filename,
        tipo: archivoSubido.mimetype,
        tamanoBytes: archivoSubido.size
    };

    try {
        await archivosRepository.crearArchivo(archivo);
    } catch (error) {
        await fs.unlink(archivoSubido.path).catch(() => {});
        throw error;
    }

    return {
        id: archivo.id,
        nombreOriginal: archivo.nombreOriginal,
        tipo: archivo.tipo,
        tamanoBytes: archivo.tamanoBytes
    };
}

async function listarArchivos(usuarioId) {
    const filas = await archivosRepository.listarPorUsuario(usuarioId);

    return filas.map((fila) => ({
        id: fila.Id,
        nombreOriginal: fila.NombreOriginal,
        tipo: fila.Tipo,
        tamanoBytes: Number(fila.TamanoBytes)
    }));
}

async function obtenerArchivoParaDescarga(id, usuarioId) {

    if (!UUID_REGEX.test(id)) {
    throw new ErrorDeNegocio('Archivo no encontrado.', 404);
    }
    const archivo = await archivosRepository.obtenerPorIdYUsuario(id, usuarioId);

    if (!archivo) {
        throw new ErrorDeNegocio('Archivo no encontrado.', 404);
    }

    return {
        rutaEnDisco: path.join(__dirname, '..', 'uploads', archivo.NombreGuardado),
        nombreOriginal: archivo.NombreOriginal,
        tipo: archivo.Tipo
    };
}

module.exports = { guardarArchivo, listarArchivos, obtenerArchivoParaDescarga };