const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const ErrorDeNegocio = require('../errors/ErrorDeNegocio');

const CARPETA_ARCHIVOS = path.join(__dirname, '..', 'uploads');
const TAMANO_MAXIMO = 10 * 1024 * 1024;
const EXTENSIONES_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.docx', '.xlsx'];

fs.mkdirSync(CARPETA_ARCHIVOS, { recursive: true });

const almacenamiento = multer.diskStorage({
    destination: (req, archivo, cb) => cb(null, CARPETA_ARCHIVOS),
    filename: (req, archivo, cb) => {
        const extension = path.extname(archivo.originalname).toLowerCase();
        cb(null, crypto.randomUUID() + extension);
    }
});

function filtrarTipo(req, archivo, cb) {
    const extension = path.extname(archivo.originalname).toLowerCase();

    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
        return cb(new ErrorDeNegocio('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG, TXT, DOCX y XLSX.'));
    }

    cb(null, true);
}

const recibirArchivo = multer({
    storage: almacenamiento,
    limits: { fileSize: TAMANO_MAXIMO },
    fileFilter: filtrarTipo
}).single('archivo');

function subirArchivo(req, res, next) {
    recibirArchivo(req, res, (error) => {
        if (error) {
            if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({ error: 'El archivo supera el tamaño máximo de 10 MB.' });
            }
            if (error instanceof multer.MulterError) {
                return res.status(400).json({ error: 'No se pudo procesar el archivo enviado.' });
            }
            if (error instanceof ErrorDeNegocio) {
                return res.status(error.estado).json({ error: error.message });
            }

            console.error(error);
            return res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'Debes seleccionar un archivo.' });
        }

        next();
    });
}

module.exports = subirArchivo;