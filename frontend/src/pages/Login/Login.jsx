import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { iniciarSesion } from '../../api/usuarios'
import estilos from './Login.module.css'

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
    <main className={estilos.pagina}>
      <div className={estilos.tarjeta}>
        <h1 className={estilos.titulo}>Iniciar sesión</h1>

        <form className={estilos.formulario} onSubmit={manejarEnvio}>
          <label className={estilos.campo}>
            Correo
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
          </label>

          <label className={estilos.campo}>
            Contraseña
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </label>

          {error && <p className={estilos.error} role="alert">{error}</p>}

          <button className={estilos.boton} type="submit" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <button
          className={estilos.proximamente}
          type="button"
          disabled
          title="Esta función quedó pendiente para una próxima versión"
        >
          ¿Olvidaste tu contraseña? (próximamente)
        </button>

        <p className={estilos.pie}>
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>
    </main>
  )
}

export default Login