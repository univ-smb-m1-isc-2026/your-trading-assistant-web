/**
 * Page de connexion — JSX pur.
 *
 * Ce composant ne contient aucune logique métier : tout est délégué
 * à useLogin(). Son seul rôle est de décrire la mise en page et les
 * interactions visuelles (labels, placeholders, états disabled/loading).
 *
 * C'est le pattern "Container / Presenter" appliqué via un hook :
 *   useLogin()   = le "container" (logique, effets, state)
 *   LoginPage    = le "presenter" (JSX, accessibilité, style)
 */

import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useLogin } from '../hooks/use-login'

export function LoginPage() {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useLogin()

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
        <h1 className="mb-8 text-center text-lg font-semibold tracking-wide text-gray-400 uppercase">
          Trading Assistant
        </h1>

        <h2 className="mb-6 text-2xl font-bold text-white">Connexion</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
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
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </div>
  )
}
