import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { apiService, ApiError, setBaseUrl, getBaseUrl } from '../services/api';

const DEFAULT_RENDER_API_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || 'https://doxabeta-student-management-1.onrender.com/api';

type ConnectionMode = 'PROXY' | 'DIRECT_8080' | 'DIRECT_RENDER';

interface AuthContextType {
  user: User | null;
  authHeader: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: ApiError | null;
  connectionMode: ConnectionMode;
  login: (username: string, password: string) => Promise<boolean>;
  loginAsDemoUser: (role: 'admin' | 'mentor' | 'student') => Promise<boolean>;
  logout: () => void;
  clearAuthError: () => void;
  setConnectionMode: (mode: ConnectionMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('internflow_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [authHeader, setAuthHeader] = useState<string | null>(() => {
    return localStorage.getItem('internflow_auth_header') || null;
  });

  const [connectionMode, setConnectionModeState] = useState<ConnectionMode>(() => {
    return (localStorage.getItem('internflow_conn_mode') as ConnectionMode) || 'DIRECT_RENDER';
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<ApiError | null>(null);

  useEffect(() => {
    if (connectionMode === 'DIRECT_8080') {
      setBaseUrl('http://localhost:8080/api');
    } else if (connectionMode === 'DIRECT_RENDER') {
      setBaseUrl(DEFAULT_RENDER_API_BASE_URL);
    } else {
      setBaseUrl('/api');
    }
  }, [connectionMode]);

  const setConnectionMode = (mode: ConnectionMode) => {
    setConnectionModeState(mode);
    localStorage.setItem('internflow_conn_mode', mode);
    if (mode === 'DIRECT_8080') {
      setBaseUrl('http://localhost:8080/api');
    } else if (mode === 'DIRECT_RENDER') {
      setBaseUrl(DEFAULT_RENDER_API_BASE_URL);
    } else {
      setBaseUrl('/api');
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    const b64 = btoa(`${username}:${password}`);
    const header = `Basic ${b64}`;

    try {
      // Validate credentials against backend
      const me = await apiService.getMe(header);
      setUser(me);
      setAuthHeader(header);
      localStorage.setItem('internflow_user', JSON.stringify(me));
      localStorage.setItem('internflow_auth_header', header);
      setIsLoading(false);
      return true;
    } catch (error: any) {
      setIsLoading(false);
      if (error instanceof ApiError) {
        setAuthError(error);
      } else {
        setAuthError(new ApiError(error.message || 'Authentication failed', 401));
      }
      return false;
    }
  };

  const loginAsDemoUser = async (role: 'admin' | 'mentor' | 'student'): Promise<boolean> => {
    const creds = {
      admin: { u: 'admin', p: 'admin123' },
      mentor: { u: 'mentor', p: 'mentor123' },
      student: { u: 'student', p: 'student123' }
    }[role];

    return login(creds.u, creds.p);
  };

  const logout = () => {
    setUser(null);
    setAuthHeader(null);
    setAuthError(null);
    localStorage.removeItem('internflow_user');
    localStorage.removeItem('internflow_auth_header');
  };

  const clearAuthError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authHeader,
        isAuthenticated: !!user && !!authHeader,
        isLoading,
        authError,
        connectionMode,
        login,
        loginAsDemoUser,
        logout,
        clearAuthError,
        setConnectionMode
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
