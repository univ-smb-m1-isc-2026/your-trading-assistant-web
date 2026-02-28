/**
 * Wrapper React pour lightweight-charts (TradingView).
 *
 * Pourquoi un wrapper ?
 *   lightweight-charts est une lib vanilla JS qui opère directement sur le DOM
 *   via un élément HTMLElement. React ne gère pas ce cycle de vie nativement.
 *   On utilise useRef pour accéder au nœud DOM réel, et useEffect pour créer
 *   le chart après le montage et le détruire avant le démontage (cleanup).
 *
 * API v5 : chart.addSeries(CandlestickSeries, options) remplace l'ancienne
 *   méthode chart.addCandlestickSeries() de la v4.
 *   De même, chart.addSeries(LineSeries, options) pour les moyennes mobiles.
 *
 * Support thème clair/sombre :
 *   lightweight-charts est vanilla JS — il ne réagit pas aux classes CSS.
 *   On lit le thème actif depuis useThemeStore et on passe les couleurs
 *   correspondantes au chart. Le useEffect dépend de `theme` : quand
 *   l'utilisateur bascule, le chart est détruit et recréé avec les
 *   nouvelles couleurs.
 *
 * Moyennes mobiles :
 *   Chaque MovingAverageSeries reçue en prop génère une LineSeries sur le chart.
 *   Les couleurs sont attribuées par période via MA_COLORS (bleu, orange, violet).
 *   Les valeurs MA sont intégrées dans le tooltip au survol.
 *
 * Tooltip au survol (crosshair) :
 *   On utilise chart.subscribeCrosshairMove() pour détecter le survol.
 *   Le tooltip est un <div> positionné en `position: absolute` par-dessus
 *   le canvas. On le manipule DIRECTEMENT via un ref (sans useState) car
 *   l'événement fire à ~60fps — un setState déclencherait trop de re-renders.
 *   Cette approche est recommandée par la documentation officielle.
 */

import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts'
import type { ISeriesApi } from 'lightweight-charts'
import type { Candle, MovingAverageSeries } from '@/types/api'
import { useThemeStore } from '@/stores/use-theme-store'

/**
 * Couleurs attribuées aux lignes MA par période.
 * L'index est la position de la période triée par ordre croissant.
 * Bleu = court terme, orange = moyen terme, violet = long terme.
 */
const MA_COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899']

interface CandlestickChartProps {
  candles: Candle[]
  /** Hauteur du graphique en pixels (défaut : 400) */
  height?: number
  /** Séries de moyennes mobiles à afficher en overlay sur le chart */
  movingAverages?: MovingAverageSeries[]
}

/**
 * Retourne les couleurs du chart en fonction du thème.
 */
function getChartColors(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    return {
      background: '#0f172a',
      text: '#94a3b8',
      grid: '#1e293b',
      border: '#334155',
    }
  }
  return {
    background: '#ffffff',
    text: '#64748b',
    grid: '#e2e8f0',
    border: '#cbd5e1',
  }
}

/**
 * Formate un nombre en prix lisible.
 * Ex: 94200.5 → "$94 200.50"
 */
function formatPrice(value: number): string {
  return '$' + value.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formate un volume avec séparateurs de milliers.
 * Ex: 1234567 → "1 234 567"
 */
function formatVolume(value: number): string {
  return value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
}

/**
 * Formate une date ISO (YYYY-MM-DD) en date lisible.
 * Ex: "2026-02-28" → "28 févr. 2026"
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Retourne la couleur attribuée à une MA selon son rang dans la liste triée.
 */
function getMaColor(index: number): string {
  return MA_COLORS[index % MA_COLORS.length]
}

/**
 * Génère le HTML interne du tooltip.
 * On écrit directement dans innerHTML pour éviter la création de
 * nombreux éléments DOM à chaque frame (perf ~60fps).
 *
 * maValues contient les valeurs des MAs à la date courante, ou undefined
 * si la MA n'a pas de valeur à cette date (pas assez de données).
 */
function buildTooltipHtml(
  date: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number | undefined,
  theme: 'light' | 'dark',
  maValues: Array<{ type: string; period: number; value: number | undefined; color: string }>,
): string {
  const isUp = close >= open
  const variation = ((close - open) / open) * 100
  const variationStr = (variation >= 0 ? '+' : '') + variation.toFixed(2) + '%'

  // Couleurs adaptées au thème
  const upColor = '#22c55e'
  const downColor = '#ef4444'
  const closeColor = isUp ? upColor : downColor
  const variationColor = isUp ? upColor : downColor

  const labelColor = theme === 'dark' ? '#94a3b8' : '#64748b'
  const valueColor = theme === 'dark' ? '#f1f5f9' : '#0f172a'
  const dateColor = theme === 'dark' ? '#cbd5e1' : '#334155'
  const dividerColor = theme === 'dark' ? '#1e293b' : '#e2e8f0'

  const row = (label: string, value: string, color: string) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;gap:16px;padding:3px 0;">
      <span style="font-size:11px;color:${labelColor};letter-spacing:0.05em;text-transform:uppercase;">${label}</span>
      <span style="font-size:12px;font-weight:600;font-family:monospace;color:${color};">${value}</span>
    </div>`

  // Lignes MA dans le tooltip
  const maRows = maValues
    .filter((ma) => ma.value !== undefined)
    .map((ma) => row(`${ma.type} ${ma.period}`, formatPrice(ma.value!), ma.color))
    .join('')

  const maSection = maRows
    ? `<div style="border-top:1px solid ${dividerColor};margin-top:4px;padding-top:4px;">${maRows}</div>`
    : ''

  return `
    <div style="padding:10px 14px 8px;">
      <div style="font-size:11px;font-weight:700;color:${dateColor};margin-bottom:8px;letter-spacing:0.02em;">${formatDate(date)}</div>
      <div style="border-top:1px solid ${dividerColor};padding-top:8px;display:flex;flex-direction:column;gap:1px;">
        ${row('Ouverture', formatPrice(open), valueColor)}
        ${row('Fermeture', formatPrice(close), closeColor)}
        ${row('Haut', formatPrice(high), upColor)}
        ${row('Bas', formatPrice(low), downColor)}
        ${volume !== undefined ? `<div style="border-top:1px solid ${dividerColor};margin-top:4px;padding-top:4px;">${row('Volume', formatVolume(volume), valueColor)}</div>` : ''}
        <div style="border-top:1px solid ${dividerColor};margin-top:4px;padding-top:4px;">
          ${row('Variation', variationStr, variationColor)}
        </div>
        ${maSection}
      </div>
    </div>
  `
}

export function CandlestickChart({ candles, height = 400, movingAverages = [] }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (!containerRef.current || !tooltipRef.current) return

    const colors = getChartColors(theme)
    const tooltip = tooltipRef.current

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: colors.background },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Magnet
      },
      rightPriceScale: {
        borderColor: colors.border,
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
      },
    })

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    // Conversion du format API → lightweight-charts
    const chartData = candles.map((c) => ({
      time: c.date as `${number}-${number}-${number}`,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))

    candleSeries.setData(chartData)

    // ─── Moyennes Mobiles (LineSeries overlay) ──────────────────────────────
    //
    // Chaque MovingAverageSeries génère une LineSeries avec une couleur
    // attribuée par index. Les séries sont triées par période croissante
    // pour que les couleurs soient stables (bleu = plus courte, etc.).
    //
    // On stocke les séries dans un tableau pour pouvoir récupérer leurs
    // valeurs dans le callback crosshairMove.

    const sortedMA = [...movingAverages].sort((a, b) => a.period - b.period)

    interface MaSeriesEntry {
      type: string
      period: number
      color: string
      series: ISeriesApi<'Line'>
      valueByDate: Map<string, number>
    }

    const maSeriesEntries: MaSeriesEntry[] = sortedMA.map((ma, index) => {
      // Si le parent a fourni une couleur (via MovingAverageSeries.color),
      // on l'utilise directement. Sinon, fallback sur la couleur par rang.
      const color = ma.color ?? getMaColor(index)

      const lineSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        // Pas d'axe de prix dédié — partage l'axe du candlestick
        priceLineVisible: false,
        // Pas de label de prix sur l'axe droit pour éviter l'encombrement
        lastValueVisible: false,
      })

      const lineData = ma.values.map((v) => ({
        time: v.date as `${number}-${number}-${number}`,
        value: v.value,
      }))

      lineSeries.setData(lineData)

      // Lookup Map pour le tooltip : date → valeur MA
      const valueByDate = new Map<string, number>(
        ma.values.map((v) => [v.date, v.value]),
      )

      return { type: ma.type, period: ma.period, color, series: lineSeries, valueByDate }
    })

    chart.timeScale().fitContent()

    // Lookup Map : date string → Candle complet (pour récupérer le volume)
    const candleByDate = new Map<string, Candle>(candles.map((c) => [c.date, c]))

    // Dimensions du container pour la logique de positionnement
    const containerWidth = containerRef.current.clientWidth

    // ─── Tooltip via subscribeCrosshairMove ───────────────────────────────────
    //
    // POURQUOI DOM DIRECT et pas useState ?
    //   subscribeCrosshairMove fire à ~60fps pendant le survol.
    //   Chaque setState déclencherait un re-render React complet → jank visuel.
    //   En manipulant directement le div via un ref, on reste dans le cycle de
    //   vie de lightweight-charts, sans impacter le cycle de React.
    //
    // POURQUOI pointer-events: none sur le tooltip ?
    //   Le div overlay est positionné par-dessus le canvas. Sans pointer-events:none
    //   il absorberait les events souris et le chart ne recevrait plus rien.

    chart.subscribeCrosshairMove((param) => {
      // Masquer si la souris sort du chart ou si pas de donnée sous le curseur
      if (
        !param.point ||
        param.point.x < 0 ||
        param.point.y < 0 ||
        !param.time
      ) {
        tooltip.style.display = 'none'
        return
      }

      // Récupérer les données OHLC depuis la Map interne du chart
      const rawData = param.seriesData.get(candleSeries)
      if (!rawData || !('open' in rawData)) {
        tooltip.style.display = 'none'
        return
      }

      const { open, high, low, close } = rawData as {
        open: number
        high: number
        low: number
        close: number
      }

      const dateStr = param.time as string
      const volume = candleByDate.get(dateStr)?.volume

      // Récupérer les valeurs MA à cette date
      const maValues = maSeriesEntries.map((entry) => ({
        type: entry.type,
        period: entry.period,
        value: entry.valueByDate.get(dateStr),
        color: entry.color,
      }))

      // Remplir le contenu du tooltip
      tooltip.innerHTML = buildTooltipHtml(dateStr, open, high, low, close, volume, theme, maValues)

      // ─── Positionnement intelligent ──────────────────────────────────────────
      const OFFSET_X = 14
      const OFFSET_Y = -8
      const tooltipW = tooltip.offsetWidth
      const tooltipH = tooltip.offsetHeight

      let left = param.point.x + OFFSET_X
      let top = param.point.y + OFFSET_Y

      // Si le tooltip déborde à droite → le placer à gauche du curseur
      if (left + tooltipW > containerWidth - 8) {
        left = param.point.x - tooltipW - OFFSET_X
      }

      // Si le tooltip déborde en haut → le placer en dessous
      if (top < 8) {
        top = param.point.y + 24
      }

      // Si le tooltip déborde en bas → le contraindre
      if (top + tooltipH > height - 8) {
        top = height - tooltipH - 8
      }

      tooltip.style.left = `${left}px`
      tooltip.style.top = `${top}px`
      tooltip.style.display = 'block'
    })

    // Cleanup : chart.remove() détruit aussi tous les listeners subscribeCrosshairMove
    return () => {
      chart.remove()
      tooltip.style.display = 'none'
    }
  }, [candles, height, theme, movingAverages])

  // Styles du tooltip — définis inline car ils sont fixes (non conditionnels)
  // et doivent être appliqués avant que le JS du chart les modifie.
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'none',
    pointerEvents: 'none',
    zIndex: 10,
    minWidth: '175px',
    borderRadius: '8px',
    border: `1px solid ${theme === 'dark' ? '#334155' : '#cbd5e1'}`,
    backgroundColor: theme === 'dark' ? '#1e293b' : '#ffffff',
    boxShadow: theme === 'dark'
      ? '0 4px 20px rgba(0,0,0,0.5)'
      : '0 4px 20px rgba(0,0,0,0.12)',
    // Transition légère pour éviter le clignotement au premier affichage
    transition: 'opacity 0.05s ease',
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} className="w-full overflow-hidden rounded-lg" />
      <div ref={tooltipRef} style={tooltipStyle} />
    </div>
  )
}
