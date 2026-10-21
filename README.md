# Gestión de archivos por usuario

Aplicación web donde cada usuario se registra, inicia sesión, sube archivos, ve solo los suyos, los descarga, los elimina y cierra sesión.

**Tecnologías:** Node.js con Express y express-session, SQL Server, React con Vite.

## Instalación y ejecución

### Requisitos

- Node.js y pnpm
- SQL Server (por ejemplo SQL Server Express) con autenticación mixta activada, y SQL Server Management Studio (SSMS)

### 1. Crear la base de datos

1. Abre `database/script.sql` en SSMS y ejecútalo completo. Crea la base `ArchivosDB`, las tablas `Usuarios` y `Archivos` y los dos usuarios de prueba. Se puede ejecutar más de una vez sin duplicar nada.
2. Crea el usuario de SQL Server que usa la aplicación (cambia la contraseña):

```sql
CREATE LOGIN app_user WITH PASSWORD = 'tu_contrasena_aqui';
GO
USE ArchivosDB;
GO
CREATE USER app_user FOR LOGIN app_user;
ALTER ROLE db_datareader ADD MEMBER app_user;
ALTER ROLE db_datawriter ADD MEMBER app_user;
GO
```

### 2. Backend

```bash
cd backend
pnpm install
```

Copia `.env.example` como `.env` y completa los valores:

```
PORT=3000
DB_SERVER=localhost\\SQLEXPRESS
DB_USER=app_user
DB_PASSWORD=la_contrasena_del_paso_anterior
DB_DATABASE=ArchivosDB
SESSION_SECRET=una_frase_secreta_cualquiera
```

Ajusta `DB_SERVER` al nombre de tu instancia de SQL Server. Luego arranca el servidor:

```bash
node index.js
```

Debe mostrar `Servidor corriendo en el puerto 3000`. La carpeta `backend/uploads` se crea sola al arrancar.

### 3. Frontend

En otra terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Abre `http://localhost:5173` en el navegador. Backend y frontend deben estar corriendo al mismo tiempo.

## Credenciales de prueba

| Usuario  | Correo         | Contraseña |
| -------- | -------------- | ---------- |
| HugoTest | hugo@test.com  | 12345678   |
| AnaTest  | ana@test.com   | 12345678   |

## Decisiones y supuestos

### Arquitectura

- Usé una arquitectura por capas dentro del backend: rutas, controllers, services y repositories. Así cada capa tiene una sola responsabilidad.
- En el frontend separé las pantallas (`pages`) de las llamadas al servidor (`api`).
- Los errores esperados (400, 401, 404, 409) los lanzo yo con mensajes claros. Cualquier error inesperado responde 500 con un mensaje genérico y el detalle solo queda en el servidor.

### Base de datos

- Creé un usuario propio en SQL Server para la aplicación, con permisos solo sobre la base ArchivosDB, en lugar de usar el usuario SA.
- Usé UNIQUEIDENTIFIER como id de los archivos para que no sean consecutivos ni fáciles de adivinar. Aun así, el servidor siempre verifica que el archivo pertenezca al usuario con sesión iniciada.

### Usuarios y sesión

- Las contraseñas se guardan como hash con bcrypt, nunca en texto plano.
- Guardo los correos en minúsculas y sin espacios para evitar duplicados.
- El mensaje del login es el mismo si falla el correo o la contraseña, para no revelar qué correos existen.
- La sesión vive en la memoria del servidor (express-session) y se identifica con una cookie. Si el servidor se reinicia, las sesiones se pierden y hay que volver a iniciar sesión. Para esta prueba es suficiente y simple de explicar.
- El frontend usa un proxy de Vite hacia el backend, así el navegador ve un solo origen y la cookie de sesión funciona sin configurar CORS.

### Archivos

- Los archivos se guardan en `backend/uploads`, fuera de cualquier carpeta pública. Solo se llega a ellos por la ruta de descarga, que primero valida la sesión y el dueño.
- En el disco cada archivo se guarda con un nombre generado por el servidor (UUID más extensión). El nombre original queda solo en la base de datos. Así dos usuarios pueden subir archivos con el mismo nombre sin pisarse y nadie puede adivinar la ruta.
- Tipos permitidos: PDF, JPG, PNG, TXT, DOCX y XLSX. Son los formatos de documentos e imágenes más comunes, y no incluí ejecutables ni comprimidos, que son los de más riesgo.
- El tamaño máximo es de 10 MB por archivo, validado en el servidor con multer antes de guardar nada.

### Seguridad de acceso

- El dueño de cada archivo se toma siempre de la sesión del servidor, nunca de lo que manda el cliente. Listar, descargar y eliminar filtran por id y por usuario al mismo tiempo.
- Si un usuario pide un archivo ajeno o inexistente, respondo 404 con el mismo mensaje. Con un 403 le confirmaría que el archivo existe.
- Valido el formato del id antes de consultar la base de datos, para que un id inválido dé 404 y no un error 500.
- Al eliminar, borro primero la fila de la base de datos y después el archivo del disco. Si falla el borrado del disco, el usuario ya no ve el archivo y el error queda registrado en el servidor.