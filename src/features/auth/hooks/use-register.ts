/**
 * Hook métier pour le formulaire d'inscription.
 *
 * Même logique de séparation que use-login.ts :
 * la page RegisterPage n'a qu'à consommer ce hook et se concentrer
 * sur le rendu JSX, sans mélanger la gestion d'état et les appels API.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { register } from '@/services/auth-service'
import { useAuthStore } from '@/stores/use-auth-store'

export interface UseRegisterReturn {
  username: string
  setUsername: (v: string) => void
  email: string
  setEmail: (v: string) => void
  password: string
  setPassword: (v: string) => void
  error: string | null
  loading: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
}

export function useRegister(): UseRegisterReturn {
  const setToken = useAuthStore((s) => s.setToken)
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { token } = await register({ username, email, password })
      setToken(token)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return { username, setUsername, email, setEmail, password, setPassword, error, loading, handleSubmit }
}
