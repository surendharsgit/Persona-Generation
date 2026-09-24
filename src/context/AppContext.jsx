import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(undefined);

export function AppProvider({ children }) {
  const [personas, setPersonas] = useState(() => {
    try {
      const saved = window.localStorage.getItem('personas');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [currentPersona, setCurrentPersona] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem('personas', JSON.stringify(personas));
    } catch (e) {
      console.warn(e);
    }
  }, [personas]);
  
  // Theme state defaulting to dark theme
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem('theme');
      return saved || 'dark';
    } catch {
      return 'dark';
    }
  });

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      window.localStorage.setItem('theme', theme);
    } catch (e) {
      console.warn(e);
    }
    
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const value = {
    personas,
    setPersonas,
    currentPersona,
    setCurrentPersona,
    theme,
    toggleTheme,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
