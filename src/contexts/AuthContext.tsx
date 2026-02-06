import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api, setStoredToken, type User } from "@/lib/api";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, accessType: "lifetime" | "per_story") => Promise<void>;
  logout: () => void;
  refetchUser: () => Promise<void>;
  setError: (err: string | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const u = await api.me();
      setUser(u);
      setError(null);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetchUser();
  }, [refetchUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      const { user: u, token } = await api.login(email, password);
      setStoredToken(token);
      setUser(u);
      return u;
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, accessType: "lifetime" | "per_story") => {
      setError(null);
      const { user: u, token } = await api.register(email, password, accessType);
      setStoredToken(token);
      setUser(u);
    },
    []
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    setError,
    user,
    loading,
    error,
    login,
    register,
    logout,
    refetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
