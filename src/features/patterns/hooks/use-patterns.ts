import { useEffect, useState, useCallback } from 'react'
import { getPatterns, getPatternStats } from '@/services/market-service'
import type { ChartPatternResponse, Page, PatternStats } from '@/types/api'

export interface UsePatternsReturn {
  patterns: ChartPatternResponse[]
  stats: PatternStats
  loading: boolean
  error: string | null
  totalPages: number
  totalElements: number
  currentPage: number
  setPage: (page: number) => void
  fetch: () => void
}

export function usePatterns(
  size: number = 20,
  symbol?: string,
  type?: string,
  category?: string
): UsePatternsReturn {
  const [data, setData] = useState<Page<ChartPatternResponse> | null>(null)
  const [stats, setStats] = useState<PatternStats>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)

  const fetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [patternsResponse, statsResponse] = await Promise.all([
        getPatterns(currentPage, size, symbol, type, category),
        getPatternStats(symbol, category)
      ])
      setData(patternsResponse)
      setStats(statsResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }, [currentPage, size, symbol, type, category])

  useEffect(() => {
    void fetch()
  }, [fetch])

  return {
    patterns: data?.content ?? [],
    stats,
    loading,
    error,
    totalPages: data?.totalPages ?? 0,
    totalElements: data?.totalElements ?? 0,
    currentPage,
    setPage: setCurrentPage,
    fetch,
  }
}
