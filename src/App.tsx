import { Navigate, Routes, Route } from 'react-router'
import './App.css'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth-route'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/about" element={<h1>About</h1>} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
