const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const requiereSesion = require('../middlewares/requiereSesion');

router.post('/registro', usuariosController.registrarUsuario);
router.post('/login', usuariosController.iniciarSesion);
router.post('/logout', usuariosController.cerrarSesion);
router.post('/cambiar-password', requiereSesion, usuariosController.cambiarContrasena);

module.exports = router;