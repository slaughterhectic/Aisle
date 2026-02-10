"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuthStore = void 0;
const zustand_1 = require("zustand");
const middleware_1 = require("zustand/middleware");
const api_1 = __importDefault(require("@/lib/api"));
exports.useAuthStore = (0, zustand_1.create)()((0, middleware_1.persist)((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api_1.default.post('/auth/login', credentials);
            const { accessToken, user } = response.data;
            set({
                user,
                token: accessToken,
                isAuthenticated: true,
                isLoading: false
            });
        }
        catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    register: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api_1.default.post('/auth/register', {
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
        }
        catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            set({ error: message, isLoading: false });
            throw error;
        }
    },
    logout: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        localStorage.removeItem('accessToken');
    },
    setError: (error) => set({ error }),
}), {
    name: 'auth-storage',
    partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
}));
//# sourceMappingURL=use-auth-store.js.map