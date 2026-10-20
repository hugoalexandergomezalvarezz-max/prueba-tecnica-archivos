
if db_id('ArchivosDB') is NULL
    create database ArchivosDB;
go


use ArchivosDB;
go

/*Creación de la tabla Usuarios*/
if object_id('Usuarios', 'U') is null
create table Usuarios(
	Id int identity(1,1) primary key,
	NombreUsuario nvarchar(50) not null unique,
	Correo nvarchar(100) not null unique,
	Contrasena nvarchar(255) not null,
	FechaRegistro datetime2 not null default sysdatetime()
);
go  

select * from Usuarios;

/* Creación de la tabla Archivos */
if object_id('Archivos', 'U') is null
create table Archivos(
	Id uniqueidentifier primary key default newid(),
	UsuarioId int not null,
	NombreOriginal nvarchar(255) not null,
	NombreGuardado nvarchar(100) not null unique,
	Tipo nvarchar(100) not null,
	TamanoBytes bigint not null,
	FechaCarga datetime2 not null default sysdatetime(),
	constraint FK_Archivos_Usuarios foreign key (UsuarioId) references Usuarios(Id)
);
go















