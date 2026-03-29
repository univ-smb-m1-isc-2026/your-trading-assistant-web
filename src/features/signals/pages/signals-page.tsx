import { useEffect, useState } from 'react'
import {
  getAiHealth,
  getAiLatestSample,
  getAiPrediction,
  getAiTestReport,
} from '@/services/ai-service'
import type {
  AiHealthResponse,
  AiLatestSampleResponse,
  AiPredictionResponse,
  AiTestReportExample,
  AiTestReportResponse,
} from '@/services/ai-service'

function signedPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function ExamplesTable({
  title,
  rows,
}: {
  title: string
  rows: AiTestReportExample[]
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Aucune ligne.</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Ticker</th>
              <th className="px-3 py-2 text-right">Prédit</th>
              <th className="px-3 py-2 text-right">Réel</th>
              <th className="px-3 py-2 text-right">Écart (pp)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-700 dark:text-slate-300">
            {rows.slice(0, 10).map((row) => (
              <tr key={`${title}-${row.date}-${row.ticker}-${row.abs_error_pp}`}>
                <td className="px-3 py-2">{row.date}</td>
                <td className="px-3 py-2 font-medium">{row.ticker}</td>
                <td className="px-3 py-2 text-right">{signedPct(row.predicted_pct)}</td>
                <td className="px-3 py-2 text-right">{signedPct(row.actual_pct)}</td>
                <td className="px-3 py-2 text-right">{row.abs_error_pp.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SignalsPage() {
  const [health, setHealth] = useState<AiHealthResponse | null>(null)
  const [report, setReport] = useState<AiTestReportResponse | null>(null)
  const [latestSample, setLatestSample] = useState<AiLatestSampleResponse | null>(null)
  const [latestPrediction, setLatestPrediction] = useState<AiPredictionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [healthRes, reportRes, sampleRes] = await Promise.all([
          getAiHealth(),
          getAiTestReport(),
          getAiLatestSample(),
        ])

        setHealth(healthRes)
        setReport(reportRes)
        setLatestSample(sampleRes)

        const predictionRes = await getAiPrediction(sampleRes.features)
        setLatestPrediction(predictionRes)
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      } finally {
        setLoading(false)
      }
    }

    void loadData()
  }, [])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Signaux IA</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Prédictions de variations générées par le modèle de machine learning.
        </p>
      </div>

      {/* Prédiction J+1 (utilise réellement /ai/predict) */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Prédiction J+1 (dernier actif disponible)
        </h2>

        {!loading && latestSample && latestPrediction && (
          <div className="mt-3 space-y-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Actif tiré au hasard sur la dernière date dispo :{' '}
              <span className="font-semibold">{latestSample.ticker}</span> ({latestSample.date})
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/30">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Variation prédite J+1
              </p>
              <p
                className={`mt-2 text-5xl font-extrabold ${
                  latestPrediction.predicted_variation_pct >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {signedPct(latestPrediction.predicted_variation_pct)}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Direction : <span className="font-semibold">{latestPrediction.direction}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Référence test (réel observé sur cette ligne) : {signedPct(latestSample.actual_variation_pct)}
              </p>
            </div>
          </div>
        )}
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

      {/* Résultats de test (test.log) */}
      {report && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Résultats du test modèle (test.log)
          </h2>

          <div className="mt-3 grid gap-3 text-sm text-slate-600 dark:text-slate-400 md:grid-cols-2">
            <p><span className="font-medium">Lignes de test :</span> {report.summary.test_rows}</p>
            <p><span className="font-medium">MAE :</span> ±{report.summary.mae_pct.toFixed(2)}%</p>
            <p><span className="font-medium">RMSE :</span> {report.summary.rmse_pct.toFixed(2)}%</p>
            <p><span className="font-medium">R² :</span> {report.summary.r2.toFixed(4)}</p>
            <p>
              <span className="font-medium">Direction correcte :</span>{' '}
              {report.summary.direction_success}/{report.summary.direction_total}{' '}
              ({report.summary.direction_accuracy_pct.toFixed(1)}%)
            </p>
            <p>
              <span className="font-medium">Pires / meilleures lignes :</span>{' '}
              {report.summary.worst_count} / {report.summary.best_count}
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-2 text-left">Marge (pp)</th>
                  <th className="px-3 py-2 text-right">Réussite</th>
                  <th className="px-3 py-2 text-right">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-700 dark:text-slate-300">
                {report.precision_table.map((row) => (
                  <tr key={row.margin_pp}>
                    <td className="px-3 py-2">± {row.margin_pp} pp</td>
                    <td className="px-3 py-2 text-right">{row.success}/{row.total}</td>
                    <td className="px-3 py-2 text-right">{row.rate_pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {report && (
        <div className="grid gap-6 xl:grid-cols-2">
          <ExamplesTable title="Pires prédictions" rows={report.worst_examples} />
          <ExamplesTable title="Meilleures prédictions" rows={report.best_examples} />
        </div>
      )}
    </div>
  )
}
