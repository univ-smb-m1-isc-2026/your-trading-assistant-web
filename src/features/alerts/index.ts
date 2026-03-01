/**
 * Barrel de la feature alerts.
 *
 * Expose les éléments nécessaires aux autres modules :
 *   - AlertsPage : pour le routage dans App.tsx
 *   - TodayAlertsBanner : pour le dashboard (assets-page.tsx)
 *   - AlertForm, AlertCard, TriggeredAlertCard : pour asset-detail-page.tsx
 *   - useAssetAlerts : hook utilisé dans asset-detail-page.tsx
 *
 * Les hooks internes (useAlerts, useTriggeredAlerts) ne sont PAS exportés
 * car ils sont consommés en interne par les composants et la page.
 * Exception : useAssetAlerts est exporté car il est utilisé dans market/.
 */

export { AlertsPage } from './pages/alerts-page'
export { TodayAlertsBanner } from './components/today-alerts-banner'
export { AlertForm } from './components/alert-form'
export { AlertCard } from './components/alert-card'
export { TriggeredAlertCard } from './components/triggered-alert-card'
export { useAssetAlerts } from './hooks/use-asset-alerts'
