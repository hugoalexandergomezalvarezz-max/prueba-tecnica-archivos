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

async function listarArchivos(req, res) {
    try {
        const archivos = await archivosService.listarArchivos(req.session.usuarioId);
        res.status(200).json({ archivos });
    } catch (error) {
        responderError(res, error);
    }
}

async function descargarArchivo(req, res) {
    try {
        const archivo = await archivosService.obtenerArchivoParaDescarga(
            req.params.id,
            req.session.usuarioId
        );

        res.download(archivo.rutaEnDisco, archivo.nombreOriginal, (error) => {
            if (error && !res.headersSent) {
                responderError(res, error);
            }
        });
    } catch (error) {
        responderError(res, error);
    }
}

module.exports = { cargarArchivo, listarArchivos, descargarArchivo };