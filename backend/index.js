require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');
const usuariosRoutes = require('./routes/usuarios.routes');
const archivosRoutes = require('./routes/archivos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
    console.error('ERROR: Falta SESSION_SECRET en el archivo .env');
    process.exit(1);
}

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { 
        secure: false,
        httpOnly: true,
        maxAge: 30 * 60 * 1000
    }
}));

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/archivos', archivosRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});