import { createContext, useCallback, useEffect, useState } from "react";
import authService from "../services/authService";

import cartService from "../services/cartService";
import wishlistService from "../services/wishlistService";

export const AuthContext = createContext(null);

const TOKEN_KEY = "pharmaflow_token";
const USER_KEY = "pharmaflow_user";

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser); // { userId, firstName, role }
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    setInitializing(false);
  }, []);

  const persistSession = async (authResponse) => {
    // AuthResponse shape: { message, token, userId, firstName, role }
    const { token, userId, firstName, role } = authResponse;
    localStorage.setItem(TOKEN_KEY, token);
    const sessionUser = { userId, firstName, role };
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    setUser(sessionUser);

    if (role === "CUSTOMER") {
      await Promise.all([
        cartService.mergeGuestCart().catch(() => null),
        wishlistService.mergeGuestWishlist().catch(() => null),
      ]);
    }
    return sessionUser;
  };

  const login = useCallback(async (credentials) => {
    const res = await authService.login(credentials);
    return persistSession(res);
  }, []);

  const register = useCallback(async (data) => {
    const res = await authService.register(data);
    return persistSession(res);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles) => !!user && roles.includes(user.role),
    [user]
  );

  const value = {
    user,
    isAuthenticated: !!user,
    initializing,
    login,
    register,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
