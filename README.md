# Gestión de archivos por usuario

Aplicación web donde cada usuario se registra, inicia sesión, sube archivos, ve solo los suyos, los descarga, los elimina y cierra sesión.

## Instalación y ejecución

_Pendiente: se completa al terminar el proyecto._

## Credenciales de prueba

_Pendiente: se completa al terminar el proyecto._

## Decisiones y supuestos

### Arquitectura

- Usé una arquitectura por capas dentro del backend: rutas, controllers, services y repositories. Así cada capa tiene una sola responsabilidad.
- Los errores esperados (400, 401, 404, 409) los lanzo yo con mensajes claros. Cualquier error inesperado responde 500 con un mensaje genérico y el detalle solo queda en el servidor.

### Base de datos

- Creé un usuario propio en SQL Server para la aplicación, con permisos solo sobre la base ArchivosDB, en lugar de usar el usuario SA.
- Usé UNIQUEIDENTIFIER como id de los archivos para que no sean consecutivos ni fáciles de adivinar. Aun así, el servidor siempre verifica que el archivo pertenezca al usuario con sesión iniciada.

### Usuarios y sesión

- Las contraseñas se guardan como hash con bcrypt,  nunca en texto plano.
- Guardo los correos en minúsculas y sin espacios para evitar duplicados.
- El mensaje del login es el mismo si falla el correo o la contraseña, para no revelar qué correos existen.

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