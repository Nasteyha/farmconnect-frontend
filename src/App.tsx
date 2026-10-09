import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import OwnerLogin from './pages/OwnerLogin'
import OwnerListings from './pages/OwnerListings'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/owner/login" element={<OwnerLogin />} />
        <Route path="/owner/listings" element={<OwnerListings />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App