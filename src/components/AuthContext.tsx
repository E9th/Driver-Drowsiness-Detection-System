import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, getToken, clearToken, logout, AuthUser } from '../utils/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logoutUser: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const me = await getMe();
    setUser(me);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function logoutUser() {
    logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logoutUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
