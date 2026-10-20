const crypto = require('crypto');
const fs = require('fs/promises');
const archivosRepository = require('../repositories/archivos.repository');

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

module.exports = { guardarArchivo };