import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Regular' | 'VIP';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (userData: RegisterData) => Promise<void>;
}

interface RegisterData {
    first_name: string;
    last_name: string;
    email: string;
    company: string;
    job_title: string;
    password: string;
    interests: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simulated user storage
const getStoredUser = (): User | null => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
};

const setStoredUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
};

const clearStoredUser = () => {
    localStorage.removeItem('user');
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = getStoredUser();
        if (storedUser) {
            setUser(storedUser);
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        try {
            const response = await authAPI.login(email, password);
            const userData = response.data.message;
            console.log('Logged in user data:', userData);

            const newUser: User = {
                id: userData.user_id,
                name: userData.full_name || email.split('@')[0],
                email: userData.email,
                role: userData.role || 'Regular',
            };

            setUser(newUser);
            setStoredUser(newUser);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            clearStoredUser();
        }
    };

    const register = async (userData: RegisterData): Promise<void> => {
        setIsLoading(true);
        try {
            await authAPI.register({
                first_name: userData.first_name,
                last_name: userData.last_name,
                email: userData.email,
                password: userData.password,
                company: userData.company,
                job_title: userData.job_title,
                interests: userData.interests,
            });

            // Auto login after registration
            await login(userData.email, userData.password);
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                register,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
