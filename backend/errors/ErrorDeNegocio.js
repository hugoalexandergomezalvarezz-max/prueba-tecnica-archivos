class ErrorDeNegocio extends Error {
    constructor(mensaje, estado = 400) {
        super(mensaje);
        this.name = 'ErrorDeNegocio';
        this.estado = estado;
    }
}

module.exports = ErrorDeNegocio;