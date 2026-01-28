import { create } from 'zustand';
import { authAPI } from '../services/api';

interface User {
    id: number;
    email: string;
    name?: string;
    tier: string;
    verificationsUsed: number;
    verificationsLimit: number;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name?: string) => Promise<void>;
    logout: () => void;
    loadUser: () => Promise<void>;
    clearError: () => void;
    updateProfile: (data: { name: string }) => Promise<void>;
    changePassword: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.login(email, password);
            const { user, tokens } = response.data;

            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);

            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Login failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.register(email, password, name);
            const { user, tokens } = response.data;

            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);

            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Registration failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    logout: () => {
        authAPI.logout();
        set({ user: null, isAuthenticated: false });
    },

    loadUser: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            set({ isAuthenticated: false, isLoading: false });
            return;
        }

        set({ isLoading: true });
        try {
            const response = await authAPI.getMe();
            set({ user: response.data.user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),

    updateProfile: async (data: { name: string }) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authAPI.updateProfile(data.name);
            set((state) => ({
                user: state.user ? { ...state.user, name: response.data.user.name } : null,
                isLoading: false
            }));
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to update profile';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },

    changePassword: async (data: any) => {
        set({ isLoading: true, error: null });
        try {
            await authAPI.changePassword(data);
            set({ isLoading: false });
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Failed to change password';
            set({ error: errorMessage, isLoading: false });
            throw error;
        }
    },
}));
