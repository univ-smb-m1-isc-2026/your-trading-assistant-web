/**
 * Store Zustand pour le profil utilisateur.
 */

import { create } from 'zustand'
import type { UserProfile } from '@/types/api'

interface ProfileState {
  profile: UserProfile | null
  loaded: boolean
  
  // Actions
  setProfile: (profile: UserProfile) => void
  setLoaded: (loaded: boolean) => void
  reset: () => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loaded: false,

  setProfile: (profile) => set({ profile }),
  setLoaded: (loaded) => set({ loaded }),
  reset: () => set({ profile: null, loaded: false })
}))
