import { Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SpacesPage from './pages/SpacesPage'
import ProtectedRoute from './components/ProtectedRoute'
import SpacePage from './pages/SpacePage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <SpacesPage />
        </ProtectedRoute>
      } />
      <Route path="/space/:spaceId" element={
        <ProtectedRoute>
          <SpacePage />
        </ProtectedRoute>
      } />
    </Routes>
  )
}