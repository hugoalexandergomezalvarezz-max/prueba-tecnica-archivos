const archivosService = require('../services/archivos.service');
const responderError = require('../errors/responderError');

async function cargarArchivo(req, res) {
    try {
        const archivo = await archivosService.guardarArchivo(req.session.usuarioId, req.file);

        res.status(201).json({
            mensaje: 'Archivo cargado exitosamente.',
            archivo
        });
    } catch (error) {
        responderError(res, error);
    }
}

module.exports = { cargarArchivo };