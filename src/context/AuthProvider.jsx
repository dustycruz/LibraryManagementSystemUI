import { useState, useCallback, useEffect } from 'react';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }) {
  const savedToken = localStorage.getItem('lms_token');
  const savedUser = localStorage.getItem('lms_user');

  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : null);
  const [token, setToken] = useState(savedToken ?? null);
  const [loading] = useState(false);

  // --- NEW FEATURES: State initialization ---
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('lms_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('lms_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state changes with localStorage
  useEffect(() => {
    localStorage.setItem('lms_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('lms_cart', JSON.stringify(cart));
  }, [cart]);


  // --- NEW FEATURES: Actions ---
  const toggleFavorite = useCallback((book) => {
    setFavorites((prev) => {
      const exists = prev.some((b) => b.bookId === book.bookId);
      if (exists) {
        return prev.filter((b) => b.bookId !== book.bookId);
      } else {
        return [...prev, book];
      }
    });
  }, []);

  const isFavorite = useCallback((bookId) => {
    return favorites.some((b) => b.bookId === bookId);
  }, [favorites]);

  const addToCart = useCallback((book) => {
    setCart((prev) => {
      const exists = prev.some((b) => b.bookId === book.bookId);
      if (exists) return prev; // Avoid duplicates in reservation cart
      return [...prev, book];
    });
  }, []);

  const removeFromCart = useCallback((bookId) => {
    setCart((prev) => prev.filter((b) => b.bookId !== bookId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);


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
    setCart([]);
    setFavorites([]);
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    localStorage.removeItem('lms_cart');
    localStorage.removeItem('lms_favorites');
  }, []);

  const hasRole = useCallback((role) => {
    return user?.roles?.includes(role) ?? false;
  }, [user]);

  const isAdminOrLibrarian = useCallback(() => {
    return hasRole('Admin') || hasRole('Librarian');
  }, [hasRole]);

  return (
    <AuthContext.Provider value={{ 
      user, token, login, logout, loading, hasRole, isAdminOrLibrarian,
      favorites, toggleFavorite, isFavorite,                  // Exposed Favorites API
      cart, addToCart, removeFromCart, clearCart              // Exposed Cart API
    }}>
      {children}
    </AuthContext.Provider>
  );
}