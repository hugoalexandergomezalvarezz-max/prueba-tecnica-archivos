async function leerRespuesta(respuesta) {
  const datos = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new Error(datos.error || 'Ocurrió un error. Intenta de nuevo.')
  }

  return datos
}

export async function listarArchivos() {
  const respuesta = await fetch('/api/archivos')
  const datos = await leerRespuesta(respuesta)

  return datos.archivos
}

export async function subirArchivo(archivo) {
  const formulario = new FormData()
  formulario.append('archivo', archivo)

  const respuesta = await fetch('/api/archivos', {
    method: 'POST',
    body: formulario,
  })

  return leerRespuesta(respuesta)
}

export async function eliminarArchivo(id) {
  const respuesta = await fetch(`/api/archivos/${id}`, {
    method: 'DELETE',
  })

  return leerRespuesta(respuesta)
}

export function urlDescarga(id) {
  return `/api/archivos/${id}/descargar`
}
