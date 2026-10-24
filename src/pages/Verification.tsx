import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { getCurrentUser, clearCurrentUser, authHeaders, homeForRole } from '../auth'
import { statusLabel, docTypeLabel, MAX_UPLOAD_MB, ALLOWED_EXTENSIONS } from '../documents'

type Me = {
  document_status: string
  document_type: string | null
}

// FastAPI sends either a plain string or a list of validation problems
function readError(detail: unknown): string {
  if (typeof detail === 'string') return detail
  return 'The file was not accepted. Please check it and try again.'
}

const BADGE: Record<string, string> = {
  'not submitted': 'bg-forest/5 text-forest/70',
  pending: 'bg-marigold/20 text-forest',
  approved: 'bg-forest/10 text-forest',
  rejected: 'bg-red-100 text-red-700',
}

function Verification() {
  const navigate = useNavigate()
  const [user] = useState(getCurrentUser)
  const [me, setMe] = useState<Me | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [inputKey, setInputKey] = useState(0) // changing this empties the file picker
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false) // true right after a successful upload

  // The document status lives in the database, so ask the server who we are
  useEffect(() => {
    const loadMe = async () => {
      try {
        const response = await fetch(`${API_URL}/me`, { headers: authHeaders() })
        if (response.status === 401) {
          clearCurrentUser()
          navigate('/login')
          return
        }
        if (!response.ok) {
          setError('Could not load your verification status')
          return
        }
        setMe(await response.json())
      } catch {
        setError('Could not reach the server. Is the backend running?')
      }
    }
    loadMe()
  }, [navigate])

  if (!user) return null

  const isLandowner = user.role === 'landowner'
  const neededDocument = isLandowner ? 'land document' : 'national ID'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Please choose a file first')
      return
    }
    // These checks are for quick feedback. The server checks again, and its checks are the real ones.
    const dot = file.name.lastIndexOf('.')
    const extension = dot >= 0 ? file.name.slice(dot).toLowerCase() : ''
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setError('Only PDF, PNG or JPG files are allowed')
      return
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setError(`File is too large (maximum ${MAX_UPLOAD_MB} MB)`)
      return
    }

    // A file cannot travel as JSON, so it goes as "form data". The server decides the document type from our role.
    // Do NOT set Content-Type yourself here: the browser adds it, with the boundary the server needs.
    const form = new FormData()
    form.append('file', file)

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/me/document`, {
        method: 'POST',
        headers: authHeaders(),
        body: form,
      })
      if (response.status === 401) {
        clearCurrentUser()
        navigate('/login')
        return
      }
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        setError(readError(body?.detail))
        return
      }
      setMe(await response.json())
      setFile(null)
      setInputKey((k) => k + 1)
      setSubmitted(true)
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const status = me?.document_status ?? ''
  const canSubmit = status !== 'approved' // an approved document is final

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-forest">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-8 py-5">
          <span className="font-display text-xl text-sand">FarmConnect</span>
          <Link
            to={homeForRole(user.role)}
            className="px-5 py-2 text-sand border border-sand/40 rounded-full font-body transition-colors hover:bg-sand/10"
          >
            Back
          </Link>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-8 py-16">
        <h1 className="font-display text-4xl font-semibold text-forest">Verification</h1>
        <p className="font-body text-forest/70 mt-2">
          Submit your {neededDocument} so other users can trust you. An administrator reviews it. FarmConnect marks a document as reviewed, it does not prove legal
          ownership of land.
        </p>

        <div className="bg-white rounded-2xl border border-forest/10 p-8 mt-8">
          <p className="font-body text-sm text-forest/60">Your status</p>
          {me ? (
            <div className="mt-2 flex items-center gap-3">
              <span className={`px-4 py-1 rounded-full font-body text-sm font-semibold ${BADGE[status] ?? BADGE['not submitted']}`}>
                {statusLabel(status)}
              </span>
              {status !== 'not submitted' && (
                <span className="font-body text-sm text-forest/70">{docTypeLabel(me.document_type)}</span>
              )}
            </div>
          ) : (
            !error && <p className="font-body text-forest/70 mt-2">Loading...</p>
          )}
          {status === 'rejected' && (
            <p className="font-body text-sm text-red-700 mt-3">
              Your document was rejected. Please submit a clearer or correct one below.
            </p>
          )}
          {status === 'pending' && (
            <p className="font-body text-sm text-forest/70 mt-3">
              An administrator will review it soon. You can replace it if you chose the wrong file.
            </p>
          )}
        </div>

        {submitted && (
          <div role="status" className="bg-forest/10 border border-forest/20 rounded-2xl p-8 mt-6">
            <p className="font-display text-2xl font-semibold text-forest">Document submitted</p>
            <p className="font-body text-forest/80 mt-2">
              Thank you, you are all done. An administrator will review your document. You can leave this page,
              and your status above will update once it has been reviewed.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-6">
              <Link
                to={homeForRole(user.role)}
                className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90"
              >
                Go to my page
              </Link>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="font-body text-sm text-forest underline"
              >
                Submit a different file
              </button>
            </div>
          </div>
        )}

        {me && canSubmit && !submitted && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-forest/10 p-8 mt-6 flex flex-col gap-5"
          >
            <div className="font-body">
              <p className="text-sm text-forest/60">Document needed</p>
              <p className="text-forest font-semibold capitalize">{neededDocument}</p>
            </div>

            <div>
              <p className="font-body text-sm font-semibold text-forest">
                File (PDF, PNG or JPG, up to {MAX_UPLOAD_MB} MB)
              </p>
              {/* The real file input is hidden. The label below is what people see and click. */}
              <div className="mt-2 flex items-center gap-4 rounded-lg border-2 border-dashed border-forest/30 px-5 py-4">
                <label className="cursor-pointer px-5 py-2 rounded-full bg-sand border border-forest/40 text-forest font-body text-sm font-semibold transition-colors hover:bg-forest/10 focus-within:ring-2 focus-within:ring-marigold">
                  Choose file
                  <input
                    key={inputKey}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
                <span className="font-body text-sm text-forest/70 break-all">
                  {file ? file.name : 'No file chosen'}
                </span>
              </div>
            </div>

            <p className="font-body text-xs text-forest/60">
              While FarmConnect is a student project, please upload only sample files, never a real ID or title deed.
            </p>

            {error && <p className="font-body text-sm text-red-700">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-forest text-sand rounded-full font-body font-semibold transition-colors hover:bg-forest/90 disabled:opacity-60"
            >
              {loading ? 'Uploading...' : status === 'not submitted' ? 'Submit document' : 'Replace document'}
            </button>
          </form>
        )}

        {!canSubmit && error && <p className="font-body text-sm text-red-700 mt-4">{error}</p>}
        {!me && error && <p className="font-body text-sm text-red-700 mt-4">{error}</p>}
      </div>
    </div>
  )
}

export default Verification
