# Gestión de archivos por usuario

## Instalación y ejecución

## Credenciales de prueba

## Decisiones y supuestos
    * use uniqueidentifier para los id de los archivos no sean consecutivos ni facliles de adivinar pero el servidor siempre verifica que parescan el usuario que inicio secion

    * Creé un usuario en SQL Server propio con la app para no usar el usuario SA y le di permisos a la base de datos ArchivosDB

    * Encripté las contraseñas no en texto plano

    * Hice una arquitectura por capas para tenerlo más organizado adentro del backend van rutas controllers services y repositories

    * Creé varios errores esperados de mi mismo código (400 401 409) y si hay errores que no sé serían errores 500

    * En el correo guardé todos los correos en minúsculas y sin espacios para evitar duplicados 

    * El mensaje del login es el mismo si falla el correo o la contraseña, para no revelar qué correos existen





