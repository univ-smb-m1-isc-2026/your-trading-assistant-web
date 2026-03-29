/**
 * Service de gestion du profil utilisateur.
 * Communique avec les routes backend /profile.
 */

import { apiClient } from './api-client'
import type { UserProfile, UpdateProfileRequest, UpdateProfileResponse } from '@/types/api'

export const profileService = {
  /**
   * Récupère le profil de l'utilisateur.
   * GET /profile
   */
  async getProfile(): Promise<UserProfile> {
    return apiClient.request<UserProfile>('/profile')
  },

  /**
   * Met à jour le profil.
   * PUT /profile
   * Retourne le profil mis à jour et un nouveau token JWT.
   */
  async updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    return apiClient.request<UpdateProfileResponse>('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * Supprime définitivement le compte de l'utilisateur.
   * DELETE /profile
   */
  async deleteAccount(): Promise<void> {
    return apiClient.request<void>('/profile', {
      method: 'DELETE',
    })
  }
}
