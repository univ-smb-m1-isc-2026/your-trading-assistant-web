import { useEffect, useState } from 'react'
import { getAiHealth, getAiPrediction, getAiTestReport } from '@/services/ai-service'
import type {
  AiHealthResponse,
  AiPredictionResponse,
  AiTestReportExample,
  AiTestReportResponse,
} from '@/services/ai-service'
import { getAssets, getCandles } from '@/services/market-service'
import type { Candle } from '@/types/api'

function signedPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function sampleStd(values: number[]): number {
  if (values.length <= 1) return 0
  const m = mean(values)
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function ema(values: number[], span: number): number[] {
  const alpha = 2 / (span + 1)
  const out = [values[0]]
  for (let i = 1; i < values.length; i += 1) {
    out.push(alpha * values[i] + (1 - alpha) * out[i - 1])
  }
  return out
}

function computeFeaturesFromCandles(candles: Candle[]): Record<string, number> | null {
  if (candles.length < 60) return null

  const sorted = [...candles].sort((a, b) => a.date.localeCompare(b.date))
  const close = sorted.map((c) => c.close)
  const open = sorted.map((c) => c.open)
  const high = sorted.map((c) => c.high)
  const low = sorted.map((c) => c.low)
  const volume = sorted.map((c) => c.volume)
  const n = sorted.length
  const last = n - 1

  const pctChange = (period: number): number | null => {
    const prev = close[last - period]
    if (!Number.isFinite(prev) || prev === 0) return null
    return close[last] / prev - 1
  }

  const rollingMeanClose = (period: number) => mean(close.slice(n - period))
  const rollingMeanVolume = (period: number) => mean(volume.slice(n - period))

  const dailyReturns: number[] = []
  for (let i = 1; i < n; i += 1) {
    dailyReturns.push(close[i] / close[i - 1] - 1)
  }

  const rollVol = (period: number) => sampleStd(dailyReturns.slice(dailyReturns.length - period))

  const deltas = []
  for (let i = n - 14; i < n; i += 1) {
    deltas.push(close[i] - close[i - 1])
  }
  const gains = deltas.map((d) => (d > 0 ? d : 0))
  const losses = deltas.map((d) => (d < 0 ? -d : 0))
  const avgGain = mean(gains)
  const avgLoss = mean(losses)
  const rs = avgGain / (avgLoss === 0 ? 1e-10 : avgLoss)
  const rsi14 = 100 - 100 / (1 + rs)

  const ema12 = ema(close, 12)
  const ema26 = ema(close, 26)
  const macdLine = close.map((_, i) => ema12[i] - ema26[i])
  const macdSignal = ema(macdLine, 9)
  const macdSignalDiff = (macdLine[last] - macdSignal[last]) / close[last]

  const bbMid = rollingMeanClose(20)
  const bbStd = sampleStd(close.slice(n - 20))
  const bbUpper = bbMid + 2 * bbStd
  const bbLower = bbMid - 2 * bbStd
  const bbWidth = bbUpper - bbLower
  const bollingerPos = (close[last] - bbLower) / (bbWidth === 0 ? 1e-10 : bbWidth)

  const trValues: number[] = []
  for (let i = n - 14; i < n; i += 1) {
    const prevClose = close[i - 1]
    const tr = Math.max(
      high[i] - low[i],
      Math.abs(high[i] - prevClose),
      Math.abs(low[i] - prevClose),
    )
    trValues.push(tr)
  }
  const atr14Pct = mean(trValues) / close[last]

  const day = new Date(`${sorted[last].date}T00:00:00Z`).getUTCDay()
  const dayOfWeek = (day + 6) % 7

  const return1d = pctChange(1)
  const return2d = pctChange(2)
  const return3d = pctChange(3)
  const return5d = pctChange(5)
  const return10d = pctChange(10)
  const return20d = pctChange(20)
  if (
    return1d == null || return2d == null || return3d == null ||
    return5d == null || return10d == null || return20d == null
  ) {
    return null
  }

  const previousClose = close[last - 1]
  if (!Number.isFinite(previousClose) || previousClose === 0) return null

  const computed = {
    return_1d: return1d,
    return_2d: return2d,
    return_3d: return3d,
    return_5d: return5d,
    return_10d: return10d,
    return_20d: return20d,
    close_vs_ma5: close[last] / rollingMeanClose(5) - 1,
    close_vs_ma10: close[last] / rollingMeanClose(10) - 1,
    close_vs_ma20: close[last] / rollingMeanClose(20) - 1,
    close_vs_ma50: close[last] / rollingMeanClose(50) - 1,
    volatility_5: rollVol(5),
    volatility_10: rollVol(10),
    volatility_20: rollVol(20),
    volume_ratio_5: volume[last] / rollingMeanVolume(5),
    volume_ratio_20: volume[last] / rollingMeanVolume(20),
    high_low_range: (high[last] - low[last]) / close[last],
    open_gap: (open[last] - previousClose) / previousClose,
    rsi_14: rsi14,
    macd_signal_diff: macdSignalDiff,
    bollinger_pos: bollingerPos,
    atr_14_pct: atr14Pct,
    day_of_week: Number(dayOfWeek),
  }

  const allFinite = Object.values(computed).every((v) => Number.isFinite(v))
  return allFinite ? computed : null
}

async function pickRandomPredictInput(): Promise<{
  symbol: string
  date: string
  features: Record<string, number>
}> {
  const assets = await getAssets()
  const symbols = [...assets.map((a) => a.symbol)].sort(() => Math.random() - 0.5)

  for (const symbol of symbols) {
    try {
      const candles = await getCandles(symbol)
      const features = computeFeaturesFromCandles(candles)
      if (!features) continue
      return {
        symbol,
        date: candles[candles.length - 1].date,
        features,
      }
    } catch {
      // on tente le symbole suivant
    }
  }

  throw new Error('Impossible de construire un vecteur de features depuis les données marché.')
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
  const [predictSymbol, setPredictSymbol] = useState<string | null>(null)
  const [predictDate, setPredictDate] = useState<string | null>(null)
  const [latestPrediction, setLatestPrediction] = useState<AiPredictionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const [healthRes, reportRes] = await Promise.all([
          getAiHealth(),
          getAiTestReport(),
        ])

        setHealth(healthRes)
        setReport(reportRes)

        const predictInput = await pickRandomPredictInput()
        setPredictSymbol(predictInput.symbol)
        setPredictDate(predictInput.date)

        const predictionRes = await getAiPrediction(predictInput.features)
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

        {!loading && predictSymbol && predictDate && latestPrediction && (
          <div className="mt-3 space-y-3">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Actif tiré au hasard depuis les données marché :{' '}
              <span className="font-semibold">{predictSymbol}</span> ({predictDate})
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
                Entrée utilisée : vecteur de features calculé depuis les bougies de l'API.
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
