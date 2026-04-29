import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

// In mobile development, use the actual machine IP for physical device testing
// or 10.0.2.2 for Android Emulator. 
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:9012' 
  : 'https://norman-concerned-macro-motors.trycloudflare.com'; 

export interface User {
  id: string;
  yukthaId?: string;
  name: string;
  email: string;
  role: string;
  qrCode?: string;
  phone?: string;
}

function generateYukthaId(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000).toString();
  return `YKT-${year}-${random}`;
}

const uid = () => Math.random().toString(36).substring(2, 11);

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  API_URL: string;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
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
  updateUser: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
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
                    const mockUser: User = { 
                      id: 'local-user', 
                      yukthaId: 'YKT-2026-882299',
                      name: 'Sanjay', 
                      email: 'sanjay@local.dev', 
                      role: 'user' 
                    };
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
            const mockUser: User = { 
              id: 'local-user', 
              yukthaId: user?.yukthaId || 'YKT-2026-882299',
              name: user?.name || 'Sanjay', 
              email: email, 
              role: 'user' 
            };
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
            const yukthaId = generateYukthaId();
            const newUser: User = { 
              id: uid(), 
              yukthaId,
              qrCode: yukthaId,
              name: name, 
              email: email, 
              role: 'user' 
            };
            const mockToken = 'mock-standalone-token';
            setUser(newUser);
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

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...data };
    setUser(updatedUser);
    
    // Persist to storage
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem('yuktha_user', JSON.stringify(updatedUser));
      } else {
        await SecureStore.setItemAsync('yuktha_user', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error("Failed to persist user update:", e);
    }
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
    <AuthContext.Provider value={{ user, token, isLoading, API_URL: API_BASE_URL, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
