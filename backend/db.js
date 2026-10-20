const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

async function conectarDB() {
    try {
        const pool = await sql.connect(config);
        console.log('Conectado a SQL Server');
        return pool;
    } catch (error) {
        console.error('Error de conexión a SQL Server:', error.message);
        process.exit(1); 
    }
}

module.exports = { sql, conectarDB };