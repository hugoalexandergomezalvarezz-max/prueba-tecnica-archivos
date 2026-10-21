const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');

router.post('/registro', usuariosController.registrarUsuario);
router.post('/login', usuariosController.iniciarSesion);
router.post('/logout', usuariosController.cerrarSesion);

module.exports = router;