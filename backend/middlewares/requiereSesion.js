function requiereSesion(req, res, next) {
    if (!req.session || !req.session.usuarioId) {
        return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
    }

    next();
}

module.exports = requiereSesion;