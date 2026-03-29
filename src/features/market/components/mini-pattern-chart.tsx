import { useEffect, useRef } from 'react'
import { createChart, CandlestickSeries } from 'lightweight-charts'
import type { Candle } from '@/types/api'
import { useThemeStore } from '@/stores/use-theme-store'

interface MiniPatternChartProps {
  candles: Candle[]
  width?: number
  height?: number
}

export function MiniPatternChart({ candles, width = 180, height = 120 }: MiniPatternChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: {
        background: { color: 'transparent' },
        textColor: 'transparent',
      },
      grid: {
        vertLines: { visible: false },
        horzLines: { visible: false },
      },
      handleScale: false,
      handleScroll: false,
      rightPriceScale: {
        visible: false,
      },
      timeScale: {
        visible: false,
      },
      crosshair: {
        vertLine: { visible: false },
        horzLine: { visible: false },
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

    candleSeries.setData(
      candles.map((c) => ({
        time: c.date as `${number}-${number}-${number}`,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    )

    chart.timeScale().fitContent()

    return () => {
      chart.remove()
    }
  }, [candles, width, height, theme])

  return <div ref={containerRef} className="pointer-events-none" />
}
