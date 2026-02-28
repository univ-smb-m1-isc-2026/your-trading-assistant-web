/**
 * Page d'inscription.
 *
 * Même architecture que login-page : logique dans useRegister(),
 * composant = JSX pur.
 *
 * Champs requis par l'API (voir API-TEST-COMMANDS.md) :
 *   - username : string non vide
 *   - email    : email valide
 *   - password : min 8 caractères
 *
 * Après inscription réussie, le backend retourne directement un JWT
 * (l'utilisateur est connecté immédiatement, pas besoin de re-login).
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register } from '@/services/auth-service'
import { useAuthStore } from '@/stores/use-auth-store'
import { cn } from '@/utils/cn'

function useRegister() {
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { token } = await register({ username, email, password })
      setToken(token)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    error, loading, handleSubmit,
  }
}

export function RegisterPage() {
  const {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    error, loading, handleSubmit,
  } = useRegister()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
        <h1 className="mb-8 text-center text-lg font-semibold tracking-wide text-gray-400 uppercase">
          Trading Assistant
        </h1>

        <h2 className="mb-6 text-2xl font-bold text-white">Créer un compte</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="username" className="text-sm font-medium text-gray-400">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn(
                'rounded-lg border bg-gray-800 px-4 py-2.5 text-sm text-white',
                'border-gray-700 placeholder-gray-600',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
              )}
              placeholder="Jean Dupont"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium text-gray-400">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                'rounded-lg border bg-gray-800 px-4 py-2.5 text-sm text-white',
                'border-gray-700 placeholder-gray-600',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
              )}
              placeholder="jean@example.com"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-medium text-gray-400">
              Mot de passe
              <span className="ml-2 text-xs text-gray-600">(min. 8 caractères)</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                'rounded-lg border bg-gray-800 px-4 py-2.5 text-sm text-white',
                'border-gray-700 placeholder-gray-600',
                'focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none',
              )}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-900 bg-red-950 px-4 py-2.5 font-mono text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors',
              'bg-blue-600 text-white hover:bg-blue-500',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
