import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../api/usuarios'

function Login() {
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
      await iniciarSesion(correo, contrasena)
      navigate('/archivos')
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main>
      <h1>Iniciar sesión</h1>

      <form onSubmit={manejarEnvio}>
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
          {enviando ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </main>
  )
}

export default Login