/**
 * Landing Page — page d'accueil publique.
 *
 * Structure :
 *   1. Hero section : gradient animé, titre accrocheur, CTA "Créer un compte"
 *   2. Features : 4 cards présentant les fonctionnalités clés
 *   3. Footer minimal
 *
 * Le hero utilise un gradient CSS animé (défini dans index.css via @keyframes
 * gradient-shift). C'est une approche légère : pas de JS, pas de canvas,
 * pas de lib d'animation — juste du CSS.
 *
 * Pourquoi pas Framer Motion ?
 *   → Le projet n'en a pas besoin pour l'instant. Les animations CSS natives
 *   sont suffisantes pour fade-in + gradient. Ajouter une lib d'animation
 *   (~30 kB) n'est pas justifié.
 */

import { Link } from 'react-router-dom'
import { useThemeStore } from '@/stores/use-theme-store'
import { useAuthStore } from '@/stores/use-auth-store'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  animationClass: string
}

function FeatureCard({ icon, title, description, animationClass }: FeatureCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-300 bg-white p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary/40 dark:hover:shadow-primary/10 ${animationClass}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{description}</p>
    </div>
  )
}

export function LandingPage() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const token = useAuthStore((s) => s.token)
  const isLoggedIn = token !== null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Mini navbar landing */}
      <nav className="flex items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 16l4-8 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Your Trading Assistant
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle thème */}
          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800"
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
          >
            {theme === 'dark' ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
          </button>

          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Accéder au dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                Se connecter
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 py-24 lg:px-12 lg:py-36">
        {/* Gradient animé en arrière-plan */}
        <div
          className="animate-gradient absolute inset-0 opacity-20 dark:opacity-30"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #7c3aed, #2563eb, #06b6d4)',
          }}
        />
        {/* Cercles décoratifs floutés */}
        <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <div className="animate-fade-in-up">
            <span className="mb-6 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary dark:bg-primary/20">
              Beta — Accès anticipé
            </span>
          </div>

          <h1 className="animate-fade-in-up mb-6 text-4xl font-extrabold leading-tight text-slate-900 dark:text-white lg:text-6xl">
            Tradez plus{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              intelligemment
            </span>
            , pas plus longtemps
          </h1>

          <p className="animate-fade-in-up-delay-1 mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Your Trading Assistant aide les traders à prendre des décisions éclairées.
            Visualisez les marchés, configurez des alertes et laissez notre algorithme
            vous guider pour demain.
          </p>

          <div className="animate-fade-in-up-delay-2 flex flex-col items-center justify-center gap-4 sm:flex-row">
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                className="animate-pulse-glow rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-white transition-all hover:bg-primary-hover hover:scale-105"
              >
                Accéder au dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="animate-pulse-glow rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-white transition-all hover:bg-primary-hover hover:scale-105"
                >
                  Créer un compte gratuitement
                </Link>
                <Link
                  to="/login"
                  className="rounded-xl border border-slate-300 px-8 py-3.5 text-base font-medium text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-white"
                >
                  Se connecter
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="animate-fade-in-up mb-4 text-center text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">
            Tout ce qu'il faut pour trader sereinement
          </h2>
          <p className="animate-fade-in-up-delay-1 mx-auto mb-12 max-w-lg text-center text-slate-600 dark:text-slate-400">
            Des outils pensés pour le trader qui veut des résultats sans y passer la journée.
          </p>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              animationClass="animate-fade-in-up"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 16l4-8 4 4 4-8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Suivi des marchés"
              description="Visualisez en un coup d'œil tous vos actifs avec prix, variations et graphiques candlestick professionnels."
            />
            <FeatureCard
              animationClass="animate-fade-in-up-delay-1"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Alertes intelligentes"
              description="Définissez des seuils de prix ou de volume. Soyez notifié quand le marché bouge selon vos critères."
            />
            <FeatureCard
              animationClass="animate-fade-in-up-delay-2"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a4 4 0 014 4v1a3 3 0 012.74 4.26A4 4 0 0118 18h-1.5M12 2a4 4 0 00-4 4v1a3 3 0 01-2.74 4.26A4 4 0 006 18h1.5M12 2v20" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Signaux"
              description="Notre algorithme analyse les tendances et détecte les opportunités : probabilités de hausse, conseils de position."
            />
            <FeatureCard
              animationClass="animate-fade-in-up-delay-3"
              icon={
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 21h8M12 17v4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              }
              title="Interface PRO"
              description="Un design pensé pour les traders : thème clair et sombre, tableaux de bord, navigation fluide."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-300 px-6 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-slate-600 dark:text-slate-600">
            Your Trading Assistant — Projet INFO-803
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-600">
            Construit avec React, Vite et TypeScript
          </p>
        </div>
      </footer>
    </div>
  )
}
