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
 */

import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import type { Candle } from '@/types/api'

interface CandlestickChartProps {
  candles: Candle[]
  /** Hauteur du graphique en pixels (défaut : 400) */
  height?: number
}

export function CandlestickChart({ candles, height = 400 }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      height,
      layout: {
        background: { color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      crosshair: {
        mode: 1, // CrosshairMode.Magnet
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
      },
    })

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    // Conversion du format API vers le format lightweight-charts :
    //   { date, open, high, low, close } → { time, open, high, low, close }
    //   lightweight-charts attend "time" au format "YYYY-MM-DD" (string ISO)
    const chartData = candles.map((c) => ({
      time: c.date as `${number}-${number}-${number}`,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }))

    series.setData(chartData)
    chart.timeScale().fitContent()

    // Cleanup obligatoire : détruit le canvas et les listeners DOM
    return () => {
      chart.remove()
    }
  }, [candles, height])

  return <div ref={containerRef} className="w-full rounded-lg overflow-hidden" />
}
