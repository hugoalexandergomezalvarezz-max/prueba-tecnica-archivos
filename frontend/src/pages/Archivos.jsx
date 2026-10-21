import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarArchivos, subirArchivo, eliminarArchivo, urlDescarga } from '../api/archivos'
import { cerrarSesion } from '../api/usuarios'

function Archivos() {
  const [archivos, setArchivos] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(true)
  const [archivoElegido, setArchivoElegido] = useState(null)
  const [subiendo, setSubiendo] = useState(false)
  const navigate = useNavigate()

  async function cargarLista() {
    try {
      const lista = await listarArchivos()
      setArchivos(lista)
    } catch (err) {
      if (err.message === 'Debes iniciar sesión para continuar.') {
        navigate('/login')
      } else {
        setError(err.message)
      }
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarLista()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function manejarSubida(e) {
    e.preventDefault()
    if (!archivoElegido) {
      setError('Elige un archivo antes de subir.')
      return
    }

    setError('')
    setSubiendo(true)

    try {
      await subirArchivo(archivoElegido)
      setArchivoElegido(null)
      e.target.reset()
      await cargarLista()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubiendo(false)
    }
  }

  async function manejarEliminar(archivo) {
    const confirmado = window.confirm(`¿Eliminar "${archivo.nombreOriginal}"?`)
    if (!confirmado) return

    setError('')

    try {
      await eliminarArchivo(archivo.id)
      await cargarLista()
    } catch (err) {
      setError(err.message)
    }
  }

  async function manejarCerrarSesion() {
    try {
      await cerrarSesion()
      navigate('/login')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <main>
      <h1>Mis archivos</h1>

      <button type="button" onClick={manejarCerrarSesion}>
        Cerrar sesión
      </button>

      <form onSubmit={manejarSubida}>
        <input
          type="file"
          onChange={(e) => setArchivoElegido(e.target.files[0] ?? null)}
        />
        <button type="submit" disabled={subiendo}>
          {subiendo ? 'Subiendo...' : 'Subir'}
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
      {cargando && <p>Cargando...</p>}

      {!cargando && archivos.length === 0 && (
        <p>Todavía no has subido archivos.</p>
      )}

      <ul>
        {archivos.map((archivo) => (
          <li key={archivo.id}>
            {archivo.nombreOriginal} ({archivo.tipo}, {archivo.tamanoBytes} bytes){' '}
            <a href={urlDescarga(archivo.id)}>Descargar</a>{' '}
            <button type="button" onClick={() => manejarEliminar(archivo)}>
              Eliminar
            </button>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Archivos