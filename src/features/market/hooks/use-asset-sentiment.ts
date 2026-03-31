import { useState, useEffect, useCallback } from 'react'
import { getSentimentPoll, getUserSentiment, putUserSentiment } from '@/services/market-service'
import type { SentimentPollResponse, SentimentType } from '@/types/api'
import { useAuthStore } from '@/stores/use-auth-store'

export interface UseAssetSentimentReturn {
  poll: SentimentPollResponse | null
  userVote: SentimentType | null
  loading: boolean
  error: string | null
  vote: (type: SentimentType) => Promise<void>
}

export function useAssetSentiment(symbol: string): UseAssetSentimentReturn {
  const [poll, setPoll] = useState<SentimentPollResponse | null>(null)
  const [userVote, setUserVote] = useState<SentimentType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { token } = useAuthStore()
  const isAuthenticated = !!token

  const fetchSentimentData = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)
    
    try {
      // 1. On lance la récupération du poll
      const pollPromise = getSentimentPoll(symbol)
      
      // 2. Si l'utilisateur est connecté, on récupère son vote
      const userVotePromise = isAuthenticated 
        ? getUserSentiment(symbol) 
        : Promise.resolve(null)
      
      const [pollData, userVoteData] = await Promise.all([pollPromise, userVotePromise])
      
      setPoll(pollData)
      // Si on a un vote (ça peut être undefined si empty body via api-client)
      if (userVoteData && 'type' in userVoteData) {
        setUserVote(userVoteData.type)
      } else {
        setUserVote(null)
      }
    } catch (err: any) {
      // On ignore l'erreur 404 (par exemple si pas encore de votes ou symbol inconnu)
      // On log les autres erreurs
      if (err.message && err.message.includes('404')) {
        setPoll({ symbol, bullishCount: 0, bearishCount: 0, totalVotes: 0, bullishPercentage: 0 })
      } else {
        setError(err.message || 'Erreur lors de la récupération du sentiment')
      }
    } finally {
      setLoading(false)
    }
  }, [symbol, isAuthenticated])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      await fetchSentimentData()
    }

    if (!cancelled) {
      load()
    }

    return () => {
      cancelled = true
    }
  }, [fetchSentimentData])

  const vote = useCallback(async (type: SentimentType) => {
    if (!isAuthenticated) {
      // Pourrait déclencher un toast "Connectez-vous pour voter" 
      // Mais on bloque simplement l'action pour le moment
      return
    }

    if (userVote === type) {
      // L'utilisateur a déjà voté pour ce choix, on ne fait rien
      return
    }

    const previousVote = userVote

    // Optimistic UI : Mise à jour locale immédiate
    setUserVote(type)

    try {
      await putUserSentiment(symbol, type)
      // Succès: on rafraîchit le poll complet pour avoir les stats à jour
      await fetchSentimentData()
    } catch (err: any) {
      // Échec: on annule le changement local
      setUserVote(previousVote)
      setError("Impossible d'enregistrer le vote")
    }
  }, [symbol, userVote, isAuthenticated, fetchSentimentData])

  return { poll, userVote, loading, error, vote }
}
