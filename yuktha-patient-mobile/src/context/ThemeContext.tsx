import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const Colors = {
  light: {
    background: '#F8FAFC',
    foreground: '#0F172A',
    card: '#FFFFFF',
    border: '#F1F5F9',
    primary: '#10B981', // Emerald
    secondary: '#6366F1', // Indigo
    muted: '#F8FAFC',
    mutedForeground: '#94A3B8',
    accent: '#ECFDF5',
    accentForeground: '#059669',
    danger: '#F43F5E',
    shadow: '#000000',
  },
  dark: {
    background: '#020617', // Slate 950
    foreground: '#F8FAFC',
    card: '#0F172A', // Slate 900
    border: '#1E293B', // Slate 800
    primary: '#10B981',
    secondary: '#818CF8',
    muted: '#1E293B',
    mutedForeground: '#94A3B8',
    accent: '#064E3B', 
    accentForeground: '#34D399',
    danger: '#FB7185',
    shadow: '#000000',
  }
};

type ThemeColors = typeof Colors.light;

interface ThemeContextType {
  isDarkMode: boolean;
  theme: ThemeColors & { isDarkMode: boolean };
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  theme: { ...Colors.light, isDarkMode: false },
  toggleDarkMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    // Load theme from storage on mount
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('user-theme');
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          setIsDarkMode(systemColorScheme === 'dark');
        }
      } catch (e) {
        console.error('Failed to load theme', e);
      }
    };
    loadTheme();
  }, []);

  const toggleDarkMode = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('user-theme', newMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  };

  const theme = {
    ...(isDarkMode ? Colors.dark : Colors.light),
    isDarkMode
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, theme, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
