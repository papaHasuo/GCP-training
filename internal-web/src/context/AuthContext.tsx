import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export type UserRole = "admin" | "editor" | "viewer";

interface AuthContextType {
  userRole: UserRole | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ userRole: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      try {
        // ID token の custom claims から直接 role を取得
        const decodedToken = await user.getIdTokenResult();
        const role = (decodedToken.claims?.role as UserRole) || "viewer";
        setUserRole(role);
      } catch (error) {
        console.error("Failed to fetch user role:", error);
        setUserRole("viewer");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ userRole, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
