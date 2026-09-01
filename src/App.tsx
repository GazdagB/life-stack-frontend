import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route } from 'react-router'
import './App.css'
import { ApplicationShell1 } from './components/application-shell1'
import { ProtectedRoute, PublicOnlyRoute } from './components/auth-route'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Login = lazy(() => import('./pages/Login'))
const Profile = lazy(() => import('./pages/Profile'))
const Movies = lazy(() => import('./pages/Movies'))
const RecurringExpenses = lazy(() => import('./pages/RecurringExpenses'))
const Todos = lazy(() => import('./pages/Todos'))
const BusinessHub = lazy(() => import('./pages/Business'))
const Settings = lazy(() => import('./pages/Settings'))
const Banking = lazy(() => import('./pages/Banking'))
const Legal = lazy(() => import('./pages/Legal'))

function RouteFallback() {
  return <div className="min-h-32 animate-pulse rounded-xl bg-muted/50" aria-hidden="true" />
}

function App() {


  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<ApplicationShell1 className="min-h-svh" />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/todos" element={<Todos />} />
            <Route path="/todos/today" element={<Todos />} />
            <Route path="/todos/completed" element={<Todos />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/recurring" element={<RecurringExpenses />} />
            <Route path="/expenses/coverage" element={<RecurringExpenses />} />
            <Route path="/expenses/overview" element={<Expenses />} />
            <Route path="/expenses/bank-accounts" element={<Banking />} />
            <Route path="/expenses/bank-accounts/callback" element={<Banking />} />
            <Route path="/expenses/import" element={<Banking />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movies/want-to-watch" element={<Movies />} />
            <Route path="/movies/watched" element={<Movies />} />
            <Route path="/movies/suggestions" element={<Movies />} />
            <Route path="/business" element={<BusinessHub />} />
            <Route path="/business/clients" element={<BusinessHub />} />
            <Route path="/business/invoices" element={<BusinessHub />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
