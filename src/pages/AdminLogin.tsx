import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      return
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      if (response.ok) {
        sessionStorage.setItem('adminLoggedIn', 'true')
        navigate('/admin/dashboard')
      } else {
        setError('Invalid admin credentials')
      }
    } catch {
      setError('Could not reach the server. Is the backend running?')
    }
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-8">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl border border-forest/10 p-10 flex flex-col gap-5"
      >
        <h1 className="font-display text-3xl font-semibold text-forest">
          Admin login
        </h1>
        <p className="font-body text-forest/70">
          Sign in to view the FarmConnect dashboard.
        </p>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="px-4 py-3 rounded-lg border border-forest/20 font-body text-forest focus:outline-none focus:border-marigold"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded-lg border border-forest/20 font-body text-forest focus:outline-none focus:border-marigold"
        />

        {error && (
          <p className="font-body text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90"
        >
          Log in
        </button>
      </form>
    </div>
  )
}

export default AdminLogin