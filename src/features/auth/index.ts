/**
 * Point d'entrée public de la feature auth.
 *
 * Pourquoi un barrel (index.ts) ?
 *   → Il définit l'API publique de la feature. Les modules EXTÉRIEURS
 *   à cette feature importent uniquement depuis '@/features/auth',
 *   jamais depuis un chemin interne comme '@/features/auth/pages/login-page'.
 *
 *   Avantages :
 *   - Renommer ou déplacer un fichier interne n'impacte qu'un seul endroit
 *   - Clair : ce qui est exporté ici = ce que la feature expose au reste de l'app
 *   - Cohérent avec le pattern npm packages (chaque package a son index)
 *
 * On n'exporte PAS les hooks ici : useLogin et useRegister sont des détails
 * d'implémentation internes à la feature. Seules les pages (et le store, via
 * src/stores/) sont des points d'ancrage extérieurs.
 */

export { LoginPage } from './pages/login-page'
export { RegisterPage } from './pages/register-page'
