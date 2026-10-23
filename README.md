# Git
Durante el desarrollo de mi proyecto trabajé con dos ramas en Git utilizando la rama desarrollo para ir avanzando poco a poco y guardar los cambios que fui realizando en más de 30 commits donde se puede observar el progreso del sistema las pruebas y las correcciones que hice a lo largo del proceso cuando terminé uní la rama desarrollo con main para dejar lista la versión final del proyecto y así poder mostrar el trabajo que realicé y cómo fue evolucionando desde el inicio hasta el final

# Gestión de archivos por usuario

Es una aplicación web donde cada usuario administra únicamente sus propios archivos

Lo que más cuidé en el proyecto fue la seguridad: ningún usuario puede ver ni descargar ni borrar los archivos de otro aunque conozca su id o cambie la URL de la petición

## Tecnologías

- Frontend: React con Vite
- Backend: Node.js con Express
- Base de datos: SQL Server

## Funciones

Las que pide la prueba:
- Registro de usuarios
- Inicio y cierre de sesión
- Subir archivos de máximo 10 MB
- Ver solo mis archivos
- Descargar mis archivos
- Eliminar mis archivos

Extras que agregué:
- Tabla con ID nombre tamaño y acciones
- Buscador por nombre ID o tamaño
- Orden por tamaño al hacer clic en el título de la columna
- Validación en el navegador del tamaño y del tipo antes de subir el archivo (el servidor la vuelve a validar)
- Sesión que expira a los 30 minutos
- Cambio de contraseña con la sesión iniciada

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
frontend/
  src/api/            llamadas al backend
  src/pages/          pantallas (Login, Registro, Archivos)
database/
  script.sql          creación de la base de datos y usuarios de prueba
```

## Instalación y ejecución

### Requisitos

- Node.js 20 o superior y pnpm
- SQL Server (yo usé SQL Server Express) con autenticación mixta activada
- SQL Server Management Studio (SSMS) para correr el script
- Windows porque los archivos se guardan en C:\ProyectoArchivos

### 1. Descargar el código

```bash
git clone https://github.com/hugoalexandergomezalvarezz-max/prueba-tecnica-archivos.git
cd prueba-tecnica-archivos
```

### 2. Crear la base de datos

Abrir database/script.sql en SSMS y ejecutarlo completo
- Crea la base ArchivosDB
- Crea las tablas Usuarios y Archivos
- Crea los dos usuarios de prueba
- Se puede correr más de una vez sin duplicar nada

Después crear el usuario de SQL Server que usa la aplicación y cambiar la contraseña por la suya

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

### 3. Backend

```bash
cd backend
pnpm install
```

Copiar el archivo .env.example como .env y llenar los valores

```
PORT=3000
DB_SERVER=localhost\SQLEXPRESS
DB_USER=app_user
DB_PASSWORD=la_contrasena_del_paso_anterior
DB_DATABASE=ArchivosDB
SESSION_SECRET=una_frase_secreta_cualquiera
```

Cambiar DB_SERVER por el nombre de su instancia de SQL Server y arrancar el servidor

```bash
node index.js
```

Debe aparecer el mensaje: Servidor corriendo en el puerto 3000

### 4. Frontend

En otra terminal

```bash
cd frontend
pnpm install
pnpm dev
```

Abrir localhost:5173 en el navegador

El backend y el frontend tienen que estar corriendo al mismo tiempo

Si se cambia el puerto del backend hay que cambiar también el destino del proxy en frontend/vite.config.js

## Credenciales de prueba

Son usuarios que crea el script con datos inventados

| Usuario  | Correo        | Contraseña |
| -------- | ------------- | ---------- |
| HugoTest | hugo@test.com | 12345678   |
| AnaTest  | ana@test.com  | 12345678   |

Se inicia sesión con el correo y la contraseña

## Decisiones y supuestos

### Arquitectura

- Usé una arquitectura por capas en el backend: rutas controllers services y repositories
- Así la presentación la lógica y el acceso a datos no se mezclan y cada capa tiene una sola función
- En el frontend separé las pantallas de las llamadas al servidor y cada pantalla tiene sus propios estilos con CSS Modules
- Los errores esperados (400 401 404 y 409) los lanzo yo con mensajes claros
- Si ocurre un error inesperado respondo 500 con un mensaje genérico y el detalle se queda solo en el servidor para no mostrar información interna

### Base de datos

- Elegí SQL Server y creé un usuario propio para la aplicación con permisos solo de lectura y escritura sobre ArchivosDB en lugar de usar el usuario SA
- Usé UNIQUEIDENTIFIER como id de los archivos para que no sean consecutivos ni fáciles de adivinar
- Aun así el servidor siempre revisa que el archivo sea del usuario que tiene la sesión iniciada
- Los usuarios o correos repetidos los detecta la base con restricciones UNIQUE y el servidor lo convierte en un error 409 con un mensaje claro
- Todas las consultas usan parámetros para que los datos nunca se peguen dentro del texto SQL y así evito la inyección SQL

### Usuarios y sesión

- Las contraseñas se guardan con hash de bcrypt y nunca en texto plano y deben tener mínimo 8 caracteres
- Guardo los correos en minúsculas y sin espacios para evitar duplicados
- El mensaje del login es el mismo si falla el correo o la contraseña para no revelar qué correos existen
- Usé sesiones en el servidor con express-session y una cookie httpOnly en lugar de un token JWT porque así puedo invalidar la sesión al cerrarla y es más simple de explicar
- La sesión expira a los 30 minutos
- La sesión vive en la memoria del servidor por eso si el servidor se reinicia hay que volver a iniciar sesión y para esta prueba me pareció suficiente
- Al cerrar sesión el servidor destruye la sesión y borra la cookie
- El frontend usa un proxy de Vite hacia el backend para que el navegador vea un solo origen y la cookie funcione sin configurar CORS
- Para cambiar la contraseña el usuario escribe la actual y la nueva y el servidor guarda el hash nuevo

### Archivos

- Los archivos se guardan en el disco en C:\ProyectoArchivos fuera de la carpeta del proyecto y de cualquier carpeta pública
- Cada usuario tiene su propia subcarpeta que se crea cuando sube su primer archivo
- A los archivos solo se llega por la ruta de descarga que antes valida la sesión y el dueño
- Cada archivo se guarda con un nombre generado por el servidor (UUID más la extensión) y el nombre original queda solo en la base de datos
- Así dos usuarios pueden subir archivos con el mismo nombre sin pisarse y nadie puede adivinar la ruta
- Tipos permitidos: PDF JPG PNG TXT DOCX y XLSX por ser los formatos más comunes de documentos e imágenes
- No permití ejecutables ni comprimidos ni HTML porque son los de más riesgo
- El tamaño máximo es de 10 MB y se valida en el servidor con multer antes de guardar nada
- Si el archivo no cumple el servidor responde con un mensaje claro y no guarda nada en el disco
- Si falla el guardado de los datos en la base borro el archivo del disco para que no queden archivos sin dueño

### Seguridad de acceso

- La sesión se valida en el servidor en cada petición de archivos antes de listar subir descargar o eliminar
- El dueño del archivo sale siempre de la sesión del servidor y nunca de lo que manda el cliente
- Listar descargar y eliminar filtran por id y por usuario al mismo tiempo
- Si alguien pide un archivo ajeno o que no existe respondo 404 con el mismo mensaje porque con un 403 le confirmaría que el archivo existe
- Valido el formato del id antes de consultar la base para que un id inválido dé 404 y no un error 500
- Al eliminar borro primero la fila de la base y después el archivo del disco

## Limitaciones y mejoras pendientes

- Solo valido la extensión del archivo y no su contenido real (en producción también revisaría el contenido)
- La cookie de sesión no es secure porque trabajo en localhost (en producción usaría HTTPS)
- No limité los intentos de inicio de sesión
- Por falta de tiempo quedaron pendientes:
  - Recuperar la contraseña con un enlace al correo
  - Correo de bienvenida al registrarse
  - Edición de perfil con foto
  - Paginación de la lista
  - Usar un ORM en lugar de consultas escritas a mano (aunque mis consultas ya usan parámetros)
- En las pantallas dejé deshabilitados los marcadores de esas funciones para mostrar la idea