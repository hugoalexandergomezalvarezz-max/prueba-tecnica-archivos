async function leerRespuesta(respuesta) {
  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new Error(datos.error || 'Ocurrió un error. Intenta de nuevo.')
  }

  return datos
}

export async function registrarUsuario(nombreUsuario, correo, contrasena) {
  const respuesta = await fetch('/api/usuarios/registro', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreUsuario, correo, contrasena }),
  })

  return leerRespuesta(respuesta)
}

export async function iniciarSesion(correo, contrasena) {
  const respuesta = await fetch('/api/usuarios/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  })

  return leerRespuesta(respuesta)
}

export async function cerrarSesion() {
  const respuesta = await fetch('/api/usuarios/logout', {
    method: 'POST',
  })

  return leerRespuesta(respuesta)
}