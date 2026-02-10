import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<AuthResponse>('/auth/login', credentials);
          const { accessToken, user } = response.data;
          
          set({ 
            user, 
            token: accessToken, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          // Token is also handled in api interceptor via localStorage, 
          // but persist middleware handles syncing state to localStorage too.
        } catch (error: any) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<AuthResponse>('/auth/register', {
            email: credentials.email,
            password: credentials.password,
            name: credentials.name,
            tenantName: credentials.tenantName
          });

          const { accessToken, user } = response.data;
          
          set({ 
            user, 
            token: accessToken, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
           const message = error.response?.data?.message || 'Registration failed';
           set({ error: message, isLoading: false });
           throw error;
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        localStorage.removeItem('accessToken'); // Clear manually if needed for API interceptor
      },
      
      setError: (error) => set({ error }),
    }),
    {
      name: 'auth-storage', // unique name
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
