const express = require('express');
const router = express.Router();
const requiereSesion = require('../middlewares/requiereSesion');
const subirArchivo = require('../middlewares/subirArchivo');
const archivosController = require('../controllers/archivos.controller');

router.post('/', requiereSesion, subirArchivo, archivosController.cargarArchivo);

module.exports = router;