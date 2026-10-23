import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registrarUsuario } from '../api/usuarios'
import estilos from './Registro.module.css'

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
    <main className={estilos.pagina}>
      <div className={estilos.tarjeta}>
        <h1 className={estilos.titulo}>Crear cuenta</h1>

        <form className={estilos.formulario} onSubmit={manejarEnvio}>
          <label className={estilos.campo}>
            Nombre de usuario
            <input
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
            />
          </label>

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
            <span className={estilos.ayuda}>Mínimo 8 caracteres</span>
          </label>

          {error && <p className={estilos.error} role="alert">{error}</p>}

          <button className={estilos.boton} type="submit" disabled={enviando}>
            {enviando ? 'Registrando...' : 'Registrarme'}
          </button>
        </form>

        <button
          className={estilos.proximamente}
          type="button"
          disabled
          title="Función pendiente: recibirías un enlace de acceso en tu correo"
        >
          Registrarme con mi correo personal (próximamente)
        </button>

        <p className={estilos.pie}>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </main>
  )
}

export default Registro