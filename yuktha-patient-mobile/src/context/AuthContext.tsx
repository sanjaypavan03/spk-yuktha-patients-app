import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

// In mobile development, use the actual machine IP for physical device testing
// or 10.0.2.2 for Android Emulator. 
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:9012' 
  : 'http://10.12.138.8:9012'; 

interface AuthContextType {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  API_URL: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: false,
  API_URL: '',
  login: async () => ({ success: false, error: 'Not implemented' }),
  signup: async () => ({ success: false, error: 'Not implemented' }),
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

    // Load session on startup
    useEffect(() => {
        async function loadStorage() {
            try {
                let savedUser, savedToken;
                if (Platform.OS === 'web') {
                    savedUser = localStorage.getItem('yuktha_user');
                    savedToken = localStorage.getItem('yuktha_token');
                } else {
                    savedUser = await SecureStore.getItemAsync('yuktha_user');
                    savedToken = await SecureStore.getItemAsync('yuktha_token');
                }

                if (savedUser && savedToken) {
                    setUser(JSON.parse(savedUser));
                    setToken(savedToken);
                } else {
                    // AUTO-LOGIN for Standalone Mode
                    const mockUser = { id: 'local-user', name: 'Sanjay', email: 'sanjay@local.dev', role: 'user' };
                    const mockToken = 'mock-standalone-token';
                    setUser(mockUser);
                    setToken(mockToken);
                    if (Platform.OS === 'web') {
                        localStorage.setItem('yuktha_user', JSON.stringify(mockUser));
                        localStorage.setItem('yuktha_token', mockToken);
                    } else {
                        await SecureStore.setItemAsync('yuktha_user', JSON.stringify(mockUser));
                        await SecureStore.setItemAsync('yuktha_token', mockToken);
                    }
                }
            } catch (error) {
                console.error('Failed to load auth state', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadStorage();
    }, []);

  // Save session when it changes
  useEffect(() => {
    async function saveStorage() {
      if (Platform.OS === 'web') {
        if (user && token) {
          localStorage.setItem('yuktha_user', JSON.stringify(user));
          localStorage.setItem('yuktha_token', token);
        } else if (!user && !token) {
          localStorage.removeItem('yuktha_user');
          localStorage.removeItem('yuktha_token');
        }
      } else {
        if (user && token) {
          await SecureStore.setItemAsync('yuktha_user', JSON.stringify(user));
          await SecureStore.setItemAsync('yuktha_token', token);
        } else if (!user && !token) {
          await SecureStore.deleteItemAsync('yuktha_user');
          await SecureStore.deleteItemAsync('yuktha_token');
        }
      }
    }
    saveStorage();
  }, [user, token]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            // MOCK LOGIN for Standalone Mode
            const mockUser = { id: 'local-user', name: 'Sanjay', email: email, role: 'user' };
            const mockToken = 'mock-standalone-token';
            setUser(mockUser);
            setToken(mockToken);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'MOCK Login failed' };
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string, phone: string = '') => {
        setIsLoading(true);
        try {
            // MOCK SIGNUP for Standalone Mode
            const mockUser = { id: 'local-user', name: name, email: email, role: 'user' };
            const mockToken = 'mock-standalone-token';
            setUser(mockUser);
            setToken(mockToken);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'MOCK Signup failed' };
        } finally {
            setIsLoading(false);
        }
    };

  const logout = () => {
    setUser(null);
    setToken(null);
    router.replace('/');
  };

    const refreshUser = async () => {
        if (!token) return;
        try {
            // Standalone Mock: Just refresh based on what we have
            if (user) {
                console.log("🔄 Standalone: Refreshing user state locally");
                setUser({ ...user });
            }
        } catch (e) {
            console.error("Refresh user error:", e);
        }
    };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, API_URL: API_BASE_URL, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
