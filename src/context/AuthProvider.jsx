import { useState, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const savedToken = localStorage.getItem('lms_token');
  const savedUser = localStorage.getItem('lms_user');

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [token, setToken] = useState(savedToken ?? null);
  const [loading] = useState(false);

  const login = useCallback((authData) => {
    const userData = {
      userId: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
    };
    setToken(authData.token);
    setUser(userData);
    localStorage.setItem('lms_token', authData.token);
    localStorage.setItem('lms_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
  }, []);

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  const isAdminOrLibrarian = useCallback(() => {
    return hasRole('Admin') || hasRole('Librarian');
  }, [hasRole]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, hasRole, isAdminOrLibrarian }}>
      {children}
    </AuthContext.Provider>
  );
}