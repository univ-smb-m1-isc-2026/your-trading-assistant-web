/**
 * Service d'authentification.
 *
 * Toutes les requêtes vers /auth/* passent par ici.
 * Les composants et stores ne touchent jamais fetch directement.
 *
 * Pourquoi séparer le service du store ?
 *   → Le service ne sait pas QUOI faire avec le token (le stocker, rediriger...).
 *   Il se contente de faire la requête et de retourner les données.
 *   C'est la page (login-page, register-page) qui décide ensuite d'appeler
 *   useAuthStore().setToken(token). Cette séparation rend le service testable
 *   indépendamment de l'UI et du store.
 */

import { apiClient } from '@/services/api-client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api'

/**
 * POST /auth/login
 * Authentifie un utilisateur existant et retourne un JWT.
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiClient.request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * POST /auth/register
 * Crée un nouveau compte et retourne un JWT (connexion immédiate).
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return apiClient.request<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
