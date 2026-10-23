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
  const [busqueda, setBusqueda] = useState('')
  const [ordenAscendente, setOrdenAscendente] = useState(false)
  
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

    const TAMANO_MAXIMO = 10 * 1024 * 1024;
    const EXTENSIONES_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png', '.txt', '.docx', '.xlsx']
    
    const extension = archivoElegido.name.substring(archivoElegido.name.lastIndexOf('.')).toLowerCase()
    
    if (archivoElegido.size > TAMANO_MAXIMO) {
      setError('El archivo supera el tamaño máximo permitido de 10 MB.')
      return
    }
    
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      setError('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG, TXT, DOCX y XLSX.')
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

  const texto = busqueda.trim().toLowerCase()
  const archivosFiltrados = archivos.filter((archivo) => {
    if (!texto) return true
    return (
      archivo.nombreOriginal.toLowerCase().includes(texto) ||
      archivo.id.toLowerCase().includes(texto) ||
      formatearTamano(archivo.tamanoBytes).toLowerCase().includes(texto)
    )
  })

  const archivosOrdenados = archivosFiltrados.sort((a, b) => {
    return ordenAscendente
      ? a.tamanoBytes - b.tamanoBytes
      : b.tamanoBytes - a.tamanoBytes
  })

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

      {!cargando && archivos.length > 0 && (
        <>
          <div className={estilos.barraBusqueda}>
            <input
              type="search"
              placeholder="Buscar por nombre, ID o tamaño..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {archivosOrdenados.length === 0 ? (
            <p className={estilos.vacio}>Ningún archivo coincide con tu búsqueda.</p>
          ) : (
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th 
                    className={estilos.columnaOrdenable}
                    onClick={() => setOrdenAscendente(!ordenAscendente)}
                  >
                    Tamaño {ordenAscendente ? '↑' : '↓'}
                  </th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {archivosOrdenados.map((archivo) => (
                  <tr key={archivo.id}>
                    <td className={estilos.idCelda} title={archivo.id}>
                      {archivo.id.slice(0, 8)}...
                    </td>
                    <td>{archivo.nombreOriginal}</td>
                    <td>{formatearTamano(archivo.tamanoBytes)}</td>
                    <td className={estilos.accionesCelda}>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </main>
  )
}

export default Archivos