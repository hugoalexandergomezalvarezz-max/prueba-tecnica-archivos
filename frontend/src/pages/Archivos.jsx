import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarArchivos, subirArchivo, eliminarArchivo, urlDescarga } from '../api/archivos'
import { cerrarSesion } from '../api/usuarios'
import estilos from './Archivos.module.css'

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

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
    <main className={estilos.contenedor}>
      <header className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Mis archivos</h1>
        <button type="button" className={estilos.botonSecundario} onClick={manejarCerrarSesion}>
          Cerrar sesión
        </button>
      </header>

      <form className={estilos.subida} onSubmit={manejarSubida}>
        <input
          type="file"
          onChange={(e) => setArchivoElegido(e.target.files[0] ?? null)}
        />
        <button className={estilos.boton} type="submit" disabled={subiendo}>
          {subiendo ? 'Subiendo...' : 'Subir'}
        </button>
      </form>

      {error && <p className={estilos.error} role="alert">{error}</p>}
      {cargando && <p className={estilos.vacio}>Cargando...</p>}

      {!cargando && archivos.length === 0 && (
        <p className={estilos.vacio}>Todavía no has subido archivos.</p>
      )}

      <ul className={estilos.lista}>
        {archivos.map((archivo) => (
          <li className={estilos.archivo} key={archivo.id}>
            <div>
              <div className={estilos.nombre}>{archivo.nombreOriginal}</div>
              <div className={estilos.detalle}>
                {archivo.tipo} · {formatearTamano(archivo.tamanoBytes)}
              </div>
            </div>
            <div className={estilos.acciones}>
              <a className={estilos.descargar} href={urlDescarga(archivo.id)}>
                Descargar
              </a>
              <button
                type="button"
                className={estilos.eliminar}
                onClick={() => manejarEliminar(archivo)}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}

export default Archivos