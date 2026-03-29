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
import { createChart, CandlestickSeries, LineSeries, HistogramSeries, createSeriesMarkers } from 'lightweight-charts'
import type { ISeriesApi, SeriesMarker, Time } from 'lightweight-charts'
import type { Candle, MovingAverageSeries, TriggeredAlert, ChartPatternDetail } from '@/types/api'
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
  /** Alertes déclenchées à afficher sur le graphique */
  triggeredAlerts?: TriggeredAlert[]
  /** Figures chartistes (patterns) avec lignes */
  chartPatterns?: ChartPatternDetail[]
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
  alerts: TriggeredAlert[] = [],
  patterns: ChartPatternDetail[] = []
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

  let alertsSection = ''
  if (alerts.length > 0) {
    const alertsHtml = alerts.map((alert) => {
      const isUp = alert.direction === 'ABOVE'
      let typeLabel = ''
      if (alert.type === 'MA_CROSSOVER') {
        typeLabel = isUp ? 'Golden Cross' : 'Death Cross'
      } else if (alert.type === 'PRICE_THRESHOLD') {
        typeLabel = 'Seuil de prix'
      } else {
        typeLabel = 'Volume'
      }
      
      const val = alert.thresholdValue !== null && alert.thresholdValue !== undefined 
        ? ` (${formatPrice(alert.thresholdValue)})` 
        : ''
        
      return `<div style="color: ${isUp ? upColor : downColor}; font-size:11px; padding: 2px 0;">
        🔔 ${typeLabel}${val}
      </div>`
    }).join('')

    alertsSection = `<div style="border-top:1px solid ${dividerColor}; margin-top:4px; padding-top:4px;">
      <div style="font-size:10px; color:${labelColor}; margin-bottom:2px; text-transform:uppercase;">Alertes Déclenchées</div>
      ${alertsHtml}
    </div>`
  }

  let patternsSection = ''
  if (patterns.length > 0) {
    const patternsHtml = patterns.map((p) => {
      return `<div style="color: ${labelColor}; font-size:11px; padding: 2px 0;">
        📐 ${p.type.replace(/_/g, ' ')}
      </div>`
    }).join('')

    patternsSection = `<div style="border-top:1px solid ${dividerColor}; margin-top:4px; padding-top:4px;">
      <div style="font-size:10px; color:${labelColor}; margin-bottom:2px; text-transform:uppercase;">Figures Chartistes</div>
      ${patternsHtml}
    </div>`
  }

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
        ${alertsSection}
        ${patternsSection}
      </div>
    </div>
  `
}

export function CandlestickChart({ candles, height = 400, movingAverages = [], triggeredAlerts = [], chartPatterns = [] }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (!containerRef.current || !tooltipRef.current) return

    const colors = getChartColors(theme)
    const tooltip = tooltipRef.current

    // Préparation des alertes pour un accès rapide dans le tooltip
    const alertsByDate = new Map<string, TriggeredAlert[]>()
    triggeredAlerts.forEach(alert => {
      const existing = alertsByDate.get(alert.candleDate) || []
      existing.push(alert)
      alertsByDate.set(alert.candleDate, existing)
    })

    // Préparation des figures chartistes pour un accès rapide dans le tooltip
    const patternsByDate = new Map<string, ChartPatternDetail[]>()
    if (Array.isArray(chartPatterns)) {
      chartPatterns.forEach(pattern => {
        // Toujours indexer par la date principale du pattern
        const dateExist = patternsByDate.get(pattern.date) || []
        if (!dateExist.includes(pattern)) dateExist.push(pattern)
        patternsByDate.set(pattern.date, dateExist)

        // Si des lignes sont présentes, indexer aussi par les dates de début/fin des lignes
        pattern.lines?.forEach(line => {
          const startExist = patternsByDate.get(line.start.date) || []
          if (!startExist.includes(pattern)) startExist.push(pattern)
          patternsByDate.set(line.start.date, startExist)

          const endExist = patternsByDate.get(line.end.date) || []
          if (!endExist.includes(pattern)) endExist.push(pattern)
          patternsByDate.set(line.end.date, endExist)
        })
      })
    }

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
        scaleMargins: {
          top: 0.1, // Laisse 10% d'espace en haut
          bottom: 0.25, // Laisse 25% d'espace en bas pour le volume
        },
      },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
      },
    })

    // ─── Volume (HistogramSeries au bas du chart) ───────────────────────────
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume', // Échelle de prix séparée
    })

    // Configuration de l'échelle du volume : occupe les 20% inférieurs du chart
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.8, // Les barres commencent à 80% de la hauteur totale
        bottom: 0,
      },
    })

    const volumeData = candles.map((c) => ({
      time: c.date as `${number}-${number}-${number}`,
      value: c.volume,
      // Couleur : vert si hausse, rouge si baisse (avec opacité)
      color: c.close >= c.open 
        ? theme === 'dark' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(34, 197, 94, 0.4)'
        : theme === 'dark' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(239, 68, 68, 0.4)',
    }))

    volumeSeries.setData(volumeData)

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

    // ─── Marqueurs (Alertes & Patterns sans lignes) ────────────────────────
    const markers: SeriesMarker<Time>[] = []

    if (triggeredAlerts.length > 0) {
      triggeredAlerts.forEach(alert => {
        markers.push({
          time: alert.candleDate as Time,
          position: alert.direction === 'ABOVE' ? 'belowBar' : 'aboveBar',
          color: alert.direction === 'ABOVE' ? '#22c55e' : '#ef4444',
          shape: 'circle',
          size: 1,
        })
      })
    }

    if (chartPatterns.length > 0) {
      chartPatterns.forEach(pattern => {
        // Si le pattern n'a pas de lignes, on l'affiche via un marqueur
        if (!pattern.lines || pattern.lines.length === 0) {
          markers.push({
            time: pattern.date as Time,
            position: pattern.category === 'BULLISH' ? 'belowBar' : (pattern.category === 'BEARISH' ? 'aboveBar' : 'inBar'),
            color: pattern.category === 'BULLISH' ? '#22c55e' : (pattern.category === 'BEARISH' ? '#ef4444' : '#94a3b8'),
            shape: pattern.category === 'BULLISH' ? 'arrowUp' : (pattern.category === 'BEARISH' ? 'arrowDown' : 'square'),
            text: pattern.type.split('_').map(w => w[0]).join(''), // Initiales
          })
        }
      })
    }

    if (markers.length > 0) {
      // Tri par date croissant obligatoire pour lightweight-charts
      markers.sort((a, b) => {
        const getTime = (t: any) => {
          if (typeof t === 'string') return new Date(t).getTime()
          if (typeof t === 'number') return t
          if (t && typeof t === 'object' && 'year' in t) {
            return new Date(t.year, t.month - 1, t.day).getTime()
          }
          return 0
        }
        return getTime(a.time) - getTime(b.time)
      })
      createSeriesMarkers(candleSeries, markers)
    }

    // ─── Moyennes Mobiles (LineSeries overlay) ──────────────────────────────
    const sortedMA = [...movingAverages].sort((a, b) => a.period - b.period)

    interface MaSeriesEntry {
      type: string
      period: number
      color: string
      series: ISeriesApi<'Line'>
      valueByDate: Map<string, number>
    }

    const maSeriesEntries: MaSeriesEntry[] = sortedMA.map((ma, index) => {
      const color = ma.color ?? getMaColor(index)

      const lineSeries = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      })

      const lineData = ma.values.map((v) => ({
        time: v.date as `${number}-${number}-${number}`,
        value: v.value,
      }))

      lineSeries.setData(lineData)

      const valueByDate = new Map<string, number>(
        ma.values.map((v) => [v.date, v.value]),
      )

      return { type: ma.type, period: ma.period, color, series: lineSeries, valueByDate }
    })

    // --- Figures Chartistes (LineSeries overlay en pointillés) ---
    chartPatterns.forEach((pattern) => {
      pattern.lines?.forEach((line) => {
        const lineSeries = chart.addSeries(LineSeries, {
          color: theme === 'dark' ? '#cbd5e1' : '#475569',
          lineWidth: 2,
          lineStyle: 2, // LineStyle.Dashed
          priceLineVisible: false,
          lastValueVisible: false,
          crosshairMarkerVisible: false,
        })
        
        const points = [line.start, line.end].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        
        lineSeries.setData([
          { time: points[0].date as Time, value: points[0].value },
          { time: points[1].date as Time, value: points[1].value }
        ])
      })
    })

    chart.timeScale().fitContent()

    const candleByDate = new Map<string, Candle>(candles.map((c) => [c.date, c]))
    const containerWidth = containerRef.current.clientWidth

    chart.subscribeCrosshairMove((param) => {
      if (
        !param.point ||
        param.point.x < 0 ||
        param.point.y < 0 ||
        !param.time
      ) {
        tooltip.style.display = 'none'
        return
      }

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

      const maValues = maSeriesEntries.map((entry) => ({
        type: entry.type,
        period: entry.period,
        value: entry.valueByDate.get(dateStr),
        color: entry.color,
      }))

      const alerts = alertsByDate.get(dateStr) || []
      const patterns = patternsByDate.get(dateStr) || []

      tooltip.innerHTML = buildTooltipHtml(dateStr, open, high, low, close, volume, theme, maValues, alerts, patterns)

      const OFFSET_X = 14
      const OFFSET_Y = -8
      const tooltipW = tooltip.offsetWidth
      const tooltipH = tooltip.offsetHeight

      let left = param.point.x + OFFSET_X
      let top = param.point.y + OFFSET_Y

      if (left + tooltipW > containerWidth - 8) {
        left = param.point.x - tooltipW - OFFSET_X
      }

      if (top < 8) {
        top = param.point.y + 24
      }

      if (top + tooltipH > height - 8) {
        top = height - tooltipH - 8
      }

      tooltip.style.left = `${left}px`
      tooltip.style.top = `${top}px`
      tooltip.style.display = 'block'
    })

    return () => {
      chart.remove()
      tooltip.style.display = 'none'
    }
  }, [candles, height, theme, movingAverages, triggeredAlerts, chartPatterns])

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
    transition: 'opacity 0.05s ease',
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} className="w-full overflow-hidden rounded-lg" />
      <div ref={tooltipRef} style={tooltipStyle} />
    </div>
  )
}
