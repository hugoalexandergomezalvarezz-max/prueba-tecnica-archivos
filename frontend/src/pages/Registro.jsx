import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../api/usuarios'

function Registro() {
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const navigate = useNavigate()

  async function manejarEnvio(e) {
    e.preventDefault()
    setError('')
    setEnviando(true)

    try {
      await registrarUsuario(nombreUsuario, correo, contrasena)
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <h1>Crear cuenta</h1>

      <form onSubmit={manejarEnvio}>
        <label>
          Nombre de usuario
          <input
            type="text"
            value={nombreUsuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
          />
        </label>

        <label>
          Correo
          <input
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </label>

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Registrando...' : 'Registrarme'}
        </button>
      </form>
    </main>
  )
}

export default Registro