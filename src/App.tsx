import { useEffect, useState } from 'react'
import { getHello } from '@/services/hello-service'
import type { HelloResponse } from '@/types/api'
import { cn } from '@/utils/cn'

export function App() {
  const [data, setData] = useState<HelloResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getHello()
      .then(setData)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Erreur inconnue')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <div className="rounded-xl border border-gray-800 bg-gray-900 px-10 py-8 text-center shadow-lg">
        <h1 className="mb-6 text-lg font-semibold tracking-wide text-gray-400 uppercase">
          Trading Assistant — API
        </h1>

        {loading && (
          <p className="animate-pulse text-gray-500">Connexion au backend…</p>
        )}

        {error && (
          <p className={cn('font-mono text-sm', 'text-red-400')}>
            {error}
          </p>
        )}

        {data && (
          <p className="text-4xl font-bold text-white">
            {data.message}
          </p>
        )}
      </div>
    </div>
  )
}
