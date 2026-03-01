/**
 * Sidebar — menu de navigation latéral gauche.
 *
 * Éléments de navigation :
 *   - Dashboard (liste des actifs) — actif
 *   - Favoris — actif (liste des assets favoris de l'utilisateur)
 *   - Alertes — placeholder (pas encore implémenté)
 *   - Signaux IA — placeholder (pas encore implémenté)
 *
 * Pourquoi des placeholders plutôt que de ne pas les afficher ?
 *   → Cela montre la structure de l'app et prépare l'UX. L'utilisateur
 *   voit que ces fonctionnalités existent (ou vont exister). Les items
 *   placeholder sont grisés avec un badge "Bientôt".
 *
 * La sidebar utilise <NavLink> de React Router pour marquer l'item actif
 * automatiquement (via la prop `className` qui reçoit `isActive`).
 */

import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface SidebarItemProps {
  to: string
  label: string
  icon: React.ReactNode
  disabled?: boolean
}

function SidebarItem({ to, label, icon, disabled }: SidebarItemProps) {
  if (disabled) {
    return (
      <div
        className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 opacity-50 dark:text-slate-600"
        title={`${label} — bientôt disponible`}
      >
        <span className="h-5 w-5 shrink-0">{icon}</span>
        <span className="text-sm font-medium">{label}</span>
        <span className="ml-auto rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-500">
          Bientôt
        </span>
      </div>
    )
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-400'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200',
        )
      }
    >
      <span className="h-5 w-5 shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

/* Icônes SVG inline — évite d'ajouter une dépendance d'icônes */
function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 16l4-8 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconStar() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBell() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBrain() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a4 4 0 014 4v1a3 3 0 012.74 4.26A4 4 0 0118 18h-1.5M12 2a4 4 0 00-4 4v1a3 3 0 01-2.74 4.26A4 4 0 006 18h1.5M12 2v20" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-slate-300 bg-white dark:border-slate-800 dark:bg-slate-900">
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-500">
          Navigation
        </p>
        <SidebarItem to="/dashboard" label="Marchés" icon={<IconChart />} />
        <SidebarItem to="/favorites" label="Favoris" icon={<IconStar />} />
        <SidebarItem to="/alerts" label="Alertes" icon={<IconBell />} />
        <SidebarItem to="/signals" label="Signaux IA" icon={<IconBrain />} disabled />
      </nav>

      {/* Footer sidebar — version */}
      <div className="border-t border-slate-300 p-3 dark:border-slate-800">
        <p className="text-center text-[10px] text-slate-600 dark:text-slate-600">
          v0.1.0 — Beta
        </p>
      </div>
    </aside>
  )
}
