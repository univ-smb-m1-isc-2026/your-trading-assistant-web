import { Link } from 'react-router-dom'
import { useProfile } from '../hooks/use-profile'

/**
 * Bandeau informatif affiché en haut des pages si le webhook Discord n'est pas configuré.
 */
export function WebhookBanner() {
  const { profile, loaded } = useProfile()

  // On ne l'affiche que si le profil est chargé et que le webhook est vide
  if (!loaded || !profile || profile.discordWebhook) {
    return null
  }

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-4 py-3 sm:px-6">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-primary">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm font-medium">
            <span className="hidden sm:inline text-primary/80">Notification :</span> Configurez votre webhook Discord pour recevoir des notifications en temps réel.
          </p>
        </div>
        <Link
          to="/profile"
          className="shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          Configurer
        </Link>
      </div>
    </div>
  )
}
