import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'

function OwnerLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (response.status === 401) {
        setError('Incorrect email or password')
        return
      }
      if (!response.ok) {
        setError('Something went wrong. Please try again.')
        return
      }

      const user = await response.json()
      if (user.role !== 'landowner') {
        setError('This login is for landowners. Growers sign in elsewhere.')
        return
      }

      sessionStorage.setItem(
        'ownerUser',
        JSON.stringify({ id: user.id, name: user.name, email: user.email })
      )
      navigate('/owner/listings')
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-8">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-2xl border border-forest/10 p-10 flex flex-col gap-5"
      >
        <h1 className="font-[family-name:--font-display] text-3xl font-semibold text-forest">
          Landowner login
        </h1>
        <p className="font-[family-name:--font-body] text-forest/70">
          Sign in to manage your land listings.
        </p>

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-4 py-3 rounded-lg border border-forest/20 font-[family-name:--font-body] text-forest focus:outline-none focus:border-marigold"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="px-4 py-3 rounded-lg border border-forest/20 font-[family-name:--font-body] text-forest focus:outline-none focus:border-marigold"
        />

        {error && (
          <p className="font-[family-name:--font-body] text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-forest text-sand rounded-full font-[family-name:--font-body] font-semibold transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}

export default OwnerLogin