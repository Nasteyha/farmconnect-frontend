import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import OwnerListings from './pages/OwnerListings'
import RequireRole from './components/RequireRole'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/admin/dashboard"
          element={
            <RequireRole role="admin">
              <AdminDashboard />
            </RequireRole>
          }
        />
        <Route
          path="/owner/listings"
          element={
            <RequireRole role="landowner">
              <OwnerListings />
            </RequireRole>
          }
        />

        {/* Old addresses still work, they just go to the one login page */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/owner/login" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App