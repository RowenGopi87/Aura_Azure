import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface EmiratesUser {
  id: string;
  userPrincipalName: string;
  email: string;
  displayName: string;
  givenName?: string;
  surname?: string;
  jobTitle?: string;
  department?: string;
  officeLocation?: string;
  employeeId?: string;
  businessPhones?: string[];
  managerEmail?: string;
  roles: string[];
  sessionId?: string;
  loginTime?: string;
  accessToken?: string;
  // RBAC fields
  departmentId?: string;
  primaryRoleId?: string;
  organizationalLevel?: string;
}

interface AuthState {
  user: EmiratesUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: EmiratesUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (user: EmiratesUser) => {
        set({ 
          user: {
            ...user,
            loginTime: new Date().toISOString()
          }, 
          isAuthenticated: true,
          isLoading: false 
        });
        
        // Track login event (will be implemented with audit system)
        if (typeof window !== 'undefined') {
          console.log('User logged in:', user.displayName);
        }
      },
      
      logout: () => {
        const { user } = get();
        
        // Track logout event
        if (typeof window !== 'undefined' && user) {
          console.log('User logged out:', user.displayName);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        });
        
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      updateLastActivity: () => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              lastActivity: new Date().toISOString()
            }
          });
        }
      }
    }),
    {
      name: 'emirates-auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);
