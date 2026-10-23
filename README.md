# Gestión de archivos por usuario

Aplicación web donde cada usuario se registra, inicia sesión, sube archivos, ve únicamente los suyos, los descarga, los elimina y cierra sesión. Lo más importante del proyecto es que ningún usuario pueda ver ni tocar los archivos de otro, aunque conozca su identificador o cambie la URL o la petición.

**Tecnologías:** Node.js con Express y express-session, SQL Server, React con Vite.

## Estructura del proyecto

```
backend/
  index.js            arranque del servidor
  db.js               conexión a SQL Server
  routes/             rutas de la API
  controllers/        reciben la petición y arman la respuesta
  services/           lógica de la aplicación
  repositories/       consultas a la base de datos
  middlewares/        validación de sesión y subida de archivos
  errors/             manejo de errores
  uploads/            archivos subidos (se crea al arrancar)
frontend/
  src/api/            llamadas al backend
  src/pages/          pantallas (Login, Registro, Archivos)
database/
  script.sql          creación de la base de datos y usuarios de prueba
```

## Instalación y ejecución

### Requisitos

- Node.js 20 o superior y pnpm
- SQL Server (por ejemplo SQL Server Express) con autenticación mixta activada
- SQL Server Management Studio (SSMS) o cualquier cliente para ejecutar scripts SQL

### 1. Base de datos

1. Abre `database/script.sql` en SSMS y ejecútalo completo. Crea la base `ArchivosDB`, las tablas `Usuarios` y `Archivos` y los dos usuarios de prueba. Se puede ejecutar más de una vez sin duplicar nada.
2. Crea el usuario de SQL Server que usa la aplicación, cambiando la contraseña por la tuya:

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

Copia el archivo `.env.example` como `.env` y completa los valores:

```
PORT=3000
DB_SERVER=localhost\\SQLEXPRESS
DB_USER=app_user
DB_PASSWORD=la_contrasena_del_paso_anterior
DB_DATABASE=ArchivosDB
SESSION_SECRET=una_frase_secreta_cualquiera
```

Ajusta `DB_SERVER` al nombre de tu instancia de SQL Server. Después arranca el servidor:

```bash
node index.js
```

Debe aparecer `Servidor corriendo en el puerto 3000`. La carpeta `backend/uploads` se crea sola al arrancar.

### 3. Frontend

En otra terminal:

```bash
cd frontend
pnpm install
pnpm dev
```

Abre `http://localhost:5173` en el navegador. El backend y el frontend deben estar corriendo al mismo tiempo. Si cambias el puerto del backend en el `.env`, cambia también el destino del proxy en `frontend/vite.config.js`.

## Credenciales de prueba

| Usuario  | Correo        | Contraseña |
| -------- | ------------- | ---------- |
| HugoTest | hugo@test.com | 12345678   |
| AnaTest  | ana@test.com  | 12345678   |

El inicio de sesión se hace con el correo y la contraseña.

## Decisiones y supuestos

### Arquitectura

- Usé una arquitectura por capas en el backend: rutas, controllers, services y repositories. Así la presentación, la lógica y el acceso a datos no se mezclan y cada capa tiene una sola responsabilidad.
- En el frontend separé las pantallas (`pages`) de las llamadas al servidor (`api`), y cada pantalla tiene sus propios estilos con CSS Modules. Los colores se definen una sola vez como variables en `index.css`.
- Los errores esperados (400, 401, 404 y 409) los lanzo yo con mensajes claros. Cualquier error inesperado responde 500 con un mensaje genérico y el detalle solo queda en el servidor.

### Base de datos

- Elegí SQL Server y creé un usuario propio para la aplicación, con permisos solo de lectura y escritura sobre `ArchivosDB`, en lugar de usar el usuario SA.
- Los archivos usan UNIQUEIDENTIFIER como id para que no sean consecutivos ni fáciles de adivinar. Aun así, el servidor siempre verifica que el archivo pertenezca al usuario con sesión iniciada.
- Los duplicados de usuario o correo los detecta la base de datos con restricciones UNIQUE, y el servidor traduce ese error a un 409 con un mensaje claro.

### Usuarios y sesión

- Las contraseñas se guardan como hash con bcrypt, nunca en texto plano, y deben tener al menos 8 caracteres.
- Guardo los correos en minúsculas y sin espacios para evitar duplicados.
- El mensaje del login es el mismo si falla el correo o la contraseña, para no revelar qué correos existen.
- La sesión vive en la memoria del servidor (express-session) y se identifica con una cookie. Si el servidor se reinicia, las sesiones se pierden y hay que iniciar sesión otra vez. Para esta prueba es suficiente y simple de explicar.
- Al cerrar sesión, el servidor destruye la sesión y borra la cookie, así la cookie vieja deja de servir.
- El frontend usa un proxy de Vite hacia el backend, así el navegador ve un solo origen y la cookie de sesión funciona sin configurar CORS.

### Archivos

- Los archivos se guardan en el disco, en `backend/uploads`, fuera de cualquier carpeta pública. Solo se llega a ellos por la ruta de descarga, que primero valida la sesión y el dueño.
- En el disco cada archivo se guarda con un nombre generado por el servidor (UUID más extensión). El nombre original queda solo en la base de datos. Así dos usuarios pueden subir archivos con el mismo nombre sin pisarse y nadie puede adivinar la ruta.
- Tipos permitidos: PDF, JPG, PNG, TXT, DOCX y XLSX. Son los formatos de documentos e imágenes más comunes, y no incluí ejecutables ni comprimidos, que son los de más riesgo.
- El tamaño máximo es de 10 MB por archivo, validado en el servidor con multer antes de guardar nada. Si el archivo no cumple, el servidor responde con un mensaje claro y no deja nada en el disco.

### Seguridad de acceso

- La sesión se valida en el servidor en cada petición de archivos, antes de listar, descargar, subir o eliminar.
- El dueño de cada archivo se toma siempre de la sesión del servidor, nunca de lo que manda el cliente. Listar, descargar y eliminar filtran por id y por usuario al mismo tiempo.
- Si un usuario pide un archivo ajeno o inexistente, respondo 404 con el mismo mensaje. Con un 403 le confirmaría que el archivo existe.
- Valido el formato del id antes de consultar la base de datos, para que un id inválido dé 404 y no un error 500.
- Al eliminar, borro primero la fila de la base de datos y después el archivo del disco. Si falla el borrado del disco, el usuario ya no ve el archivo y el error queda registrado en el servidor.
- La validación del formulario en el navegador es solo una ayuda para el usuario. Las validaciones que cuentan son las del servidor.