import { useState, useEffect, useRef } from 'react'
import { useProfile } from '../hooks/use-profile'
import { useAuthStore } from '@/stores/use-auth-store'
import { cn } from '@/utils/cn'

/**
 * Page de profil utilisateur.
 * Permet de gérer les informations personnelles, la sécurité et le webhook Discord.
 */
export function ProfilePage() {
  const { profile, loading, error, success, updateProfile, deleteAccount } = useProfile()
  const logout = useAuthStore((s) => s.logout)
  
  // Section Informations Personnelles
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  
  // Section Sécurité
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  // Section Discord
  const [webhookUrl, setWebhookUrl] = useState('')

  // On track quelle section est en cours d'update pour afficher les bons états de chargement
  const [activeSection, setActiveSection] = useState<'info' | 'security' | 'discord' | 'delete' | null>(null)

  // Suppression de compte
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const deleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialisation des champs avec les valeurs actuelles
  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setEmail(profile.email || '')
      if (profile.discordWebhook) {
        setWebhookUrl(profile.discordWebhook)
      } else {
        setWebhookUrl('')
      }
    }
  }, [profile])

  // Nettoyage du timer au démontage
  useEffect(() => {
    return () => {
      if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    }
  }, [])

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActiveSection('info')
    await updateProfile({ username: username.trim(), email: email.trim() })
    setTimeout(() => setActiveSection(null), 3000)
  }

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActiveSection('security')
    await updateProfile({ oldPassword, newPassword })
    // Reset fields after attempt
    setOldPassword('')
    setNewPassword('')
    setTimeout(() => setActiveSection(null), 3000)
  }

  const handleDiscordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActiveSection('discord')
    await updateProfile({ discordWebhook: webhookUrl.trim() || null })
    setTimeout(() => setActiveSection(null), 3000)
  }

  const handleDeleteAccount = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      deleteTimerRef.current = setTimeout(() => {
        setConfirmingDelete(false)
      }, 3000)
      return
    }
    
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current)
    setActiveSection('delete')
    await deleteAccount()
    logout() // Déconnecter l'utilisateur après suppression
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mon Profil</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Gérez vos informations personnelles, vos paramètres de sécurité et vos notifications.
        </p>
      </header>

      <div className="grid gap-8">
        
        {/* Carte Informations Personnelles */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Informations Personnelles</h2>
          </div>

          <form onSubmit={handleInfoSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  id="username"
                  type="text"
                  placeholder="Jean Dupont"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="jean.dupont@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={loading && activeSection === 'info'}
                className={cn(
                  "rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                  success && activeSection === 'info' && "bg-green-600 hover:bg-green-700"
                )}
              >
                {loading && activeSection === 'info' ? 'Enregistrement...' : success && activeSection === 'info' ? 'Enregistré !' : 'Enregistrer les informations'}
              </button>

              {error && activeSection === 'info' && (
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Carte Sécurité */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Sécurité</h2>
          </div>

          <form onSubmit={handleSecuritySubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ancien mot de passe
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={(loading && activeSection === 'security') || !oldPassword || !newPassword}
                className={cn(
                  "rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                  success && activeSection === 'security' && "bg-green-600 hover:bg-green-700"
                )}
              >
                {loading && activeSection === 'security' ? 'Modification...' : success && activeSection === 'security' ? 'Mot de passe modifié !' : 'Modifier le mot de passe'}
              </button>

              {error && activeSection === 'security' && (
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </span>
              )}
            </div>
          </form>
        </div>

        {/* Carte Notifications Discord */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications Discord</h2>
          </div>

          <form onSubmit={handleDiscordSubmit} className="space-y-6">
            <div>
              <label htmlFor="webhook" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Webhook URL
              </label>
              <input
                id="webhook"
                type="text"
                placeholder="https://discord.com/api/webhooks/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-blue-500"
              />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500 italic">
                Les alertes déclenchées seront envoyées directement sur votre serveur Discord via cette URL.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={loading && activeSection === 'discord'}
                className={cn(
                  "rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed",
                  success && activeSection === 'discord' && "bg-green-600 hover:bg-green-700"
                )}
              >
                {loading && activeSection === 'discord' ? 'Enregistrement...' : success && activeSection === 'discord' ? 'Enregistré !' : 'Enregistrer les modifications'}
              </button>

              {error && activeSection === 'discord' && (
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </span>
              )}
            </div>
          </form>

          {/* Note d'aide déplacée à l'intérieur ou juste après pour plus de clarté */}
          <div className="mt-6 rounded-lg bg-slate-100 p-4 dark:bg-slate-800/50">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Besoin d'aide ?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Pour obtenir une URL de Webhook : allez dans les Paramètres de votre serveur Discord &gt; Intégrations &gt; Webhooks &gt; Nouveau Webhook &gt; Copier l'URL.
            </p>
          </div>
        </div>

        {/* Zone Dangereuse : Suppression de compte */}
        <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900/50 dark:bg-slate-900/50 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 dark:text-red-500">Zone Dangereuse</h2>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
            La suppression de votre compte est définitive. Toutes vos données (alertes, favoris, préférences) seront effacées de manière irréversible.
          </p>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={loading && activeSection === 'delete'}
            className={cn(
              "rounded-lg px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
              confirmingDelete 
                ? "bg-red-700 hover:bg-red-800 ring-4 ring-red-500/20" 
                : "bg-red-600 hover:bg-red-700"
            )}
          >
            {loading && activeSection === 'delete' 
              ? 'Suppression en cours...' 
              : confirmingDelete 
                ? 'Êtes-vous sûr ? (Cliquez pour confirmer)' 
                : 'Supprimer mon compte'}
          </button>
          
          {error && activeSection === 'delete' && (
            <p className="mt-4 text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
