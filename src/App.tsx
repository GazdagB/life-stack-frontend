import { Routes, Route } from 'react-router'
import './App.css'
import Login from './pages/Login'

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<h1 className="text-3xl font-bold">Home</h1>} />
        <Route path="/about" element={<h1>About</h1>} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  )
}

export default App
