import { User, LoginCredentials, RegisterCredentials } from '@/types';
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
export declare const useAuthStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<AuthState>, "setState" | "persist"> & {
    setState(partial: AuthState | Partial<AuthState> | ((state: AuthState) => AuthState | Partial<AuthState>), replace?: false | undefined): unknown;
    setState(state: AuthState | ((state: AuthState) => AuthState), replace: true): unknown;
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<AuthState, {
            user: any;
            token: string | null;
            isAuthenticated: boolean;
        }, unknown>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: AuthState) => void) => () => void;
        onFinishHydration: (fn: (state: AuthState) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<AuthState, {
            user: any;
            token: string | null;
            isAuthenticated: boolean;
        }, unknown>>;
    };
}>;
export {};
