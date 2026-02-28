/**
 * Hook métier pour le formulaire de connexion.
 *
 * Pourquoi un hook séparé de la page ?
 *   AGENTS.md : "Separate logic from presentation. Extract business logic
 *   and side effects into custom hooks. A component file should primarily
 *   contain JSX."
 *
 *   Un hook testable de manière isolée :
 *   - pas besoin de monter un composant pour tester la logique de submit
 *   - la page LoginPage ne contient plus que du JSX → facile à lire
 *   - si demain on veut réutiliser la logique de login ailleurs
 *     (ex: modal, popup), on importe juste ce hook
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '@/services/auth-service'
import { useAuthStore } from '@/stores/use-auth-store'

export interface UseLoginReturn {
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  error: string | null
  loading: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useLogin(): UseLoginReturn {
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { token } = await login({ email, password })
      setToken(token)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { email, setEmail, password, setPassword, error, loading, handleSubmit }
}
