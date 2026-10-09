import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { saveCurrentUser, homeForRole } from '../auth'
import type { Role } from '../auth'

type SignupRole = 'landowner' | 'grower'

// Accepts 07XXXXXXXX / 01XXXXXXXX and turns it into +254XXXXXXXXX
function normalisePhone(raw: string) {
  const cleaned = raw.replace(/[\s-]/g, '')
  if (/^0[17]\d{8}$/.test(cleaned)) return '+254' + cleaned.slice(1)
  return cleaned
}

function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState<SignupRole | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanName = name.trim()
    const cleanEmail = email.trim()
    const cleanPhone = normalisePhone(phone)

    if (!role) {
      setError('Please choose whether you have land or want to grow')
      return
    }
    if (cleanName.length < 2 || cleanName.length > 100) {
      setError('Name must be between 2 and 100 characters')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError('Please enter a valid email address')
      return
    }
    if (!/^\+254\d{9}$/.test(cleanPhone)) {
      setError('Phone must look like 0712345678 or +254712345678')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (new TextEncoder().encode(password).length > 72) {
      setError('Password is too long (72 characters at most)')
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match')
      return
    }

    setLoading(true)
    try {
      const created = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          password,
          role,
        }),
      })

      if (created.status === 400) {
        const body = await created.json()
        setError(typeof body.detail === 'string' ? body.detail : 'Could not create the account')
        return
      }
      if (!created.ok) {
        setError('Some details were not accepted. Please check them and try again.')
        return
      }

      // Account exists. Log straight in so the person lands on their page.
      const loggedIn = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      })
      if (!loggedIn.ok) {
        navigate('/login')
        return
      }

      const user = await loggedIn.json()
      const userRole = user.role as Role
      saveCurrentUser({ id: user.id, name: user.name, email: user.email, role: userRole })
      navigate(homeForRole(userRole))
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const choiceClass = (selected: boolean) =>
    `flex-1 px-4 py-4 rounded-xl border text-left font-body transition-colors ${
      selected ? 'border-marigold bg-marigold/10' : 'border-forest/20 hover:border-forest/40'
    }`

  const inputClass =
    'px-4 py-3 rounded-lg border border-forest/20 font-body text-forest focus:outline-none focus:border-marigold'

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center px-8 py-12">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white rounded-2xl border border-forest/10 p-10 flex flex-col gap-5"
      >
        <h1 className="font-display text-3xl font-semibold text-forest">Create an account</h1>
        <p className="font-body text-forest/70">Join FarmConnect in a minute.</p>

        <div className="flex gap-3">
          <button type="button" onClick={() => setRole('landowner')} className={choiceClass(role === 'landowner')}>
            <span className="block font-semibold text-forest">I have land</span>
            <span className="block text-sm text-forest/60">List a plot</span>
          </button>
          <button type="button" onClick={() => setRole('grower')} className={choiceClass(role === 'grower')}>
            <span className="block font-semibold text-forest">I want to grow</span>
            <span className="block text-sm text-forest/60">Find a plot</span>
          </button>
        </div>

        <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        <input type="text" placeholder="Phone (0712345678)" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
        <input type="password" placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />

        {error && <p className="font-body text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90 disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <p className="font-body text-sm text-forest/70 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-semibold underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Register