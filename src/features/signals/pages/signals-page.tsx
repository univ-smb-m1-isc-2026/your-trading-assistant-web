import { useEffect, useState } from 'react'
import { getAiHealth } from '@/services/ai-service'
import type { AiHealthResponse } from '@/services/ai-service'

export function SignalsPage() {
  const [health, setHealth] = useState<AiHealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getAiHealth()
      .then(setHealth)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Signaux IA</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Prédictions de variations générées par le modèle de machine learning.
        </p>
      </div>

      {/* Status du service IA */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          État du service IA
        </h2>
        {loading && (
          <p className="mt-2 text-sm text-slate-500">Vérification en cours...</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-500">Erreur : {error}</p>
        )}
        {health && (
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${health.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {health.status === 'ok' ? 'Service opérationnel' : 'Service indisponible'}
            </span>
          </div>
        )}
      </div>

      {/* Infos sur le modèle */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Modèle de prédiction
        </h2>
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <p><span className="font-medium">Type :</span> HistGradientBoostingRegressor</p>
          <p><span className="font-medium">Cible :</span> Variation du prix (%) entre J et J+1</p>
          <p><span className="font-medium">Actifs :</span> 50 cryptomonnaies (Hyperliquid)</p>
          <p><span className="font-medium">Features :</span> 22 indicateurs techniques (RSI, MACD, Bollinger, ATR, etc.)</p>
        </div>
      </div>
    </div>
  )
}
