/**
 * Store Zustand pour la gestion du thème (clair / sombre).
 *
 * Pourquoi un store dédié ?
 *   → Le thème impacte l'ensemble de l'application : layout, composants,
 *   et même les librairies non-React (lightweight-charts). Un store Zustand
 *   permet d'y accéder partout sans prop drilling ni Context.
 *
 * Stratégie de détection :
 *   1. Au premier chargement, on lit localStorage('theme').
 *   2. Si aucune préférence n'est sauvegardée, on détecte la préférence
 *      système via window.matchMedia('(prefers-color-scheme: dark)').
 *   3. L'utilisateur peut ensuite basculer manuellement — son choix
 *      est persisté dans localStorage et survit aux rechargements.
 *
 * Pourquoi manipuler <html> directement ?
 *   → Tailwind CSS v4 utilise le sélecteur `.dark` sur un ancêtre pour
 *   activer les variantes `dark:`. On le place sur <html> (documentElement)
 *   car c'est la racine du DOM — tous les composants héritent.
 */

import { create } from 'zustand'

type Theme = 'light' | 'dark'

const THEME_KEY = 'theme'

/**
 * Détecte la préférence système de l'utilisateur.
 * Retourne 'dark' si le système est en mode sombre, 'light' sinon.
 */
function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Lit le thème sauvegardé dans localStorage, ou la préférence système.
 */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return getSystemTheme()
}

/**
 * Applique la classe 'dark' sur <html> et met à jour localStorage.
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  localStorage.setItem(THEME_KEY, theme)
}

interface ThemeState {
  /** Le thème actif ('light' ou 'dark'). */
  theme: Theme

  /** Bascule entre light et dark. */
  toggleTheme: () => void

  /** Force un thème spécifique. */
  setTheme: (theme: Theme) => void
}

// Applique le thème initial dès le chargement du module
// (avant même que React ne monte) pour éviter un flash.
const initialTheme = getInitialTheme()
applyTheme(initialTheme)

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,

  toggleTheme: () => {
    set((state) => {
      const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return { theme: next }
    })
  },

  setTheme: (theme: Theme) => {
    applyTheme(theme)
    set({ theme })
  },
}))
