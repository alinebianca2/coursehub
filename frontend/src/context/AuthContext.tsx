import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import * as authService from "../services/authService";
import { AuthUser } from "../types/auth";

// Armazenamento em localStorage é adequado para esta aplicação acadêmica
// local. Em produção, o recomendado seria um cookie httpOnly + Secure,
// que não fica acessível a JavaScript no navegador (mitiga XSS).
const STORAGE_KEY = "coursehub:auth";

interface StoredAuth {
  token: string;
  user: AuthUser;
}

function readStoredAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<StoredAuth | null>(() => readStoredAuth());

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    const next: StoredAuth = { token: result.token, user: result.user };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setAuth(next);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth?.user ?? null,
      token: auth?.token ?? null,
      login,
      logout,
    }),
    [auth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
