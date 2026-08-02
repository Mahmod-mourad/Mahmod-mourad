import { create } from 'zustand';
import type { UserResponseDto } from '@nexahire/types';

interface AuthState {
  user: UserResponseDto | null;
  setUser: (user: UserResponseDto | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
