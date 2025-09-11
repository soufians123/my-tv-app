import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [fontSize, setFontSize] = useState('medium');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [animations, setAnimations] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('admin-theme');
    const savedPrimaryColor = localStorage.getItem('admin-primary-color');
    const savedFontSize = localStorage.getItem('admin-font-size');
    const savedSidebarState = localStorage.getItem('admin-sidebar-collapsed');
    const savedAnimations = localStorage.getItem('admin-animations');

    if (savedTheme) setTheme(savedTheme);
    if (savedPrimaryColor) setPrimaryColor(savedPrimaryColor);
    if (savedFontSize) setFontSize(savedFontSize);
    if (savedSidebarState) setSidebarCollapsed(JSON.parse(savedSidebarState));
    if (savedAnimations) setAnimations(JSON.parse(savedAnimations));
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Set CSS custom properties
    root.style.setProperty('--primary-color', primaryColor);
    root.style.setProperty('--font-size-base', getFontSizeValue(fontSize));
    root.style.setProperty('--animations-enabled', animations ? '1' : '0');

    // Save to localStorage
    localStorage.setItem('admin-theme', theme);
    localStorage.setItem('admin-primary-color', primaryColor);
    localStorage.setItem('admin-font-size', fontSize);
    localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(sidebarCollapsed));
    localStorage.setItem('admin-animations', JSON.stringify(animations));
  }, [theme, primaryColor, fontSize, sidebarCollapsed, animations]);

  const getFontSizeValue = (size) => {
    switch (size) {
      case 'small': return '14px';
      case 'medium': return '16px';
      case 'large': return '18px';
      default: return '16px';
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
  };

  const updateFontSize = (size) => {
    setFontSize(size);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const toggleAnimations = () => {
    setAnimations(prev => !prev);
  };

  const resetToDefaults = () => {
    setTheme('light');
    setPrimaryColor('#3B82F6');
    setFontSize('medium');
    setSidebarCollapsed(false);
    setAnimations(true);
  };

  const value = {
    theme,
    primaryColor,
    fontSize,
    sidebarCollapsed,
    animations,
    toggleTheme,
    updatePrimaryColor,
    updateFontSize,
    toggleSidebar,
    toggleAnimations,
    resetToDefaults,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;