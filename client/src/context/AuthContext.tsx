import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextProps {
  emailVerified: boolean;
  userRole: string;
  login: (authToken: string, role: string,  emailVerifiedStatus: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emailVerified, setEmailVerified] = useState<boolean>(() => {
    const storedEmailVerified = localStorage.getItem('emailVerified');
    return storedEmailVerified === 'true';
  });
  const [userRole, setUserRole] = useState<string>(() => {
    return localStorage.getItem('role') || '';
  });

  useEffect(() => {
    const updateAuthState = () => {
      const token = localStorage.getItem('authToken');
      const role = localStorage.getItem('role');
      const emailVerifiedStatus = localStorage.getItem('emailVerified') === 'true';

      if (token) {
        setEmailVerified(emailVerifiedStatus);
        setUserRole(role || '');
      } else {
        setEmailVerified(false);
        setUserRole('');
      }
    };

    // Run on mount to set initial state
    updateAuthState();

    // Add an event listener to update state when localStorage changes
    window.addEventListener('storage', updateAuthState);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', updateAuthState);
    };
  }, []);

  const login = (authToken: string, role: string, emailVerifiedStatus: boolean) => {
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('role', role);
    localStorage.setItem('emailVerified', String(emailVerifiedStatus));
    setEmailVerified(emailVerifiedStatus);
    setUserRole(role);
    console.log("User logged in: ", authToken, role);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('role');
    localStorage.removeItem('emailVerified');
    setEmailVerified(false);
    setUserRole('');
  };

  return (
    <AuthContext.Provider value={{ emailVerified, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
