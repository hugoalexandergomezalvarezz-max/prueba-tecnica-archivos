import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login'
import Registro from './pages/Registro/Registro'
import Archivos from './pages/Archivos/Archivos'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/archivos" element={<Archivos />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App