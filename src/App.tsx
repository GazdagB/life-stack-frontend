import { Navigate, Routes, Route } from 'react-router'
import './App.css'
import { ApplicationShell1 } from './components/application-shell1'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth-route'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Movies from './pages/Movies'
import RecurringExpenses from './pages/RecurringExpenses'
import Todos from './pages/Todos'

function App() {


  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<ApplicationShell1 className="min-h-svh" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/todos/today" element={<Todos />} />
            <Route path="/todos/completed" element={<Todos />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/recurring" element={<RecurringExpenses />} />
            <Route path="/expenses/coverage" element={<RecurringExpenses />} />
            <Route path="/expenses/overview" element={<Expenses />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/want-to-watch" element={<Movies />} />
            <Route path="/movies/watched" element={<Movies />} />
            <Route path="/movies/suggestions" element={<Movies />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  )
}

export default App
