/**
 * Page protégée — visible uniquement après authentification.
 *
 * Elle sert à valider visuellement que :
 *   1. La connexion a bien fonctionné (token présent dans le store)
 *   2. Le JWT peut être inspecté (on affiche les claims décodés)
 *   3. Le logout efface bien le token et redirige vers /login
 *
 * Décodage du JWT :
 *   Un JWT est composé de 3 parties base64url séparées par des points :
 *   <header>.<payload>.<signature>
 *   On décode uniquement le payload (partie 2) en base64, on n'a pas besoin
 *   de vérifier la signature côté client — c'est le rôle du backend.
 *   On utilise `unknown` + type guard pour rester strict TypeScript.
 */

import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/use-auth-store'

interface JwtPayload {
  sub?: string
  id?: number
  username?: string
  iat?: number
  exp?: number
  [key: string]: unknown
}

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    // Le payload est la 2ème partie du token (index 1), encodée en base64url
    const base64url = token.split('.')[1]
    // base64url utilise '-' et '_' au lieu de '+' et '/'
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(base64)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString('fr-FR')
}

export function DashboardPage() {
  const token = useAuthStore((s) => s.token)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const payload = token ? decodeJwtPayload(token) : null

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-950 p-6">
      <div className="w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 px-8 py-10 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:border-red-800 hover:bg-red-950 hover:text-red-400"
          >
            Logout
          </button>
        </div>

        <p className="mb-6 text-sm text-green-400">
          Connecte avec succes. Token JWT valide.
        </p>

        {payload && (
          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase">
              JWT Payload (claims)
            </h2>

            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-800">
                  {payload.username && (
                    <tr>
                      <td className="py-2 pr-4 font-mono text-gray-500">username</td>
                      <td className="py-2 font-medium text-white">{String(payload.username)}</td>
                    </tr>
                  )}
                  {payload.sub && (
                    <tr>
                      <td className="py-2 pr-4 font-mono text-gray-500">sub</td>
                      <td className="py-2 text-white">{String(payload.sub)}</td>
                    </tr>
                  )}
                  {payload.id !== undefined && (
                    <tr>
                      <td className="py-2 pr-4 font-mono text-gray-500">id</td>
                      <td className="py-2 text-white">{String(payload.id)}</td>
                    </tr>
                  )}
                  {payload.iat && (
                    <tr>
                      <td className="py-2 pr-4 font-mono text-gray-500">iat</td>
                      <td className="py-2 text-gray-400">{formatTimestamp(payload.iat)}</td>
                    </tr>
                  )}
                  {payload.exp && (
                    <tr>
                      <td className="py-2 pr-4 font-mono text-gray-500">exp</td>
                      <td className="py-2 text-gray-400">{formatTimestamp(payload.exp)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <details className="group">
              <summary className="cursor-pointer text-xs text-gray-600 hover:text-gray-400">
                Voir le token brut
              </summary>
              <p className="mt-2 break-all rounded-lg border border-gray-800 bg-gray-950 p-3 font-mono text-xs text-gray-500">
                {token}
              </p>
            </details>
          </div>
        )}
      </div>
    </div>
  )
}
