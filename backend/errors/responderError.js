const ErrorDeNegocio = require('./ErrorDeNegocio');

function responderError(res, error) {
    if (error instanceof ErrorDeNegocio) {
        return res.status(error.estado).json({ error: error.message });
    }

    console.error(error);
    return res.status(500).json({ error: 'Ocurrió un error en el servidor. Intenta de nuevo más tarde.' });
}

module.exports = responderError;