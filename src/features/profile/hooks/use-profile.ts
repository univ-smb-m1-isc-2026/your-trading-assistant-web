/**
 * Hook pour gérer les données du profil utilisateur.
 */

import { useState, useCallback } from 'react'
import { useProfileStore } from '@/stores/use-profile-store'
import { useAuthStore } from '@/stores/use-auth-store'
import { profileService } from '@/services/profile-service'
import type { UpdateProfileRequest } from '@/types/api'

export function useProfile() {
  const { profile, loaded, setProfile, setLoaded } = useProfileStore()
  const setToken = useAuthStore((s) => s.setToken)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  /**
   * Charge le profil si nécessaire.
   */
  const loadProfile = useCallback(async (force = false) => {
    if (loaded && !force) return
    
    setLoading(true)
    setError(null)
    try {
      const data = await profileService.getProfile()
      setProfile(data)
      setLoaded(true)
    } catch (err) {
      setError('Impossible de charger le profil.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [loaded, setProfile, setLoaded])

  /**
   * Met à jour le profil.
   */
  const updateProfile = async (data: UpdateProfileRequest) => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      const response = await profileService.updateProfile(data)
      setProfile(response.profile)
      if (response.token) {
        setToken(response.token) // Sauvegarde du nouveau token uniquement s'il est fourni
      }
      setSuccess(true)
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Erreur lors de la mise à jour.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Supprime le compte utilisateur.
   */
  const deleteAccount = async () => {
    setLoading(true)
    setError(null)
    
    try {
      await profileService.deleteAccount()
      useProfileStore.getState().reset()
    } catch (err) {
      setError('Erreur lors de la suppression du compte.')
      console.error(err)
      throw err // On relance pour que la vue puisse gérer
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loaded,
    loading,
    error,
    success,
    loadProfile,
    updateProfile,
    deleteAccount
  }
}
