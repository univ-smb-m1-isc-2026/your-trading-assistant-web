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
 *
 * Redesign : support thème clair/sombre via les classes dark: de Tailwind.
 * La palette utilise les design tokens définis dans index.css (primary, etc.).
 */

import { Link } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { useLogin } from '../hooks/use-login'

export function LoginPage() {
  const { email, setEmail, password, setPassword, error, loading, handleSubmit } = useLogin()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm">
        {/* Retour à l'accueil */}
        <div className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary dark:text-slate-400 dark:hover:text-primary"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour à l'accueil
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white px-8 py-10 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-lg">
          {/* Logo */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 16l4-8 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Trading Assistant
            </h1>
          </div>

          <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Connexion</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-slate-600 dark:text-slate-400">
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
                  'rounded-lg border px-4 py-2.5 text-sm transition-colors',
                  'bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400',
                  'dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder-slate-500',
                  'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
                )}
                placeholder="jean@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-600 dark:text-slate-400">
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
                  'rounded-lg border px-4 py-2.5 text-sm transition-colors',
                  'bg-slate-50 text-slate-900 border-slate-300 placeholder-slate-400',
                  'dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:placeholder-slate-500',
                  'focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none',
                )}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-300 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
                'bg-primary text-white hover:bg-primary-hover',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-hover hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
