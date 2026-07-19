import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Blog } from "./api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  ready: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isLoggedIn: false,
  ready: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Read from localStorage after mount (safe for SSR).
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) setToken(storedToken);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }

    setReady(true);
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token,
        ready,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Safely extract the user ID from a user object.
 * Handles various backend response formats that may have _id, id, userId, etc.
 */
export function getUserId(user: User | null | any): string | null {
  if (!user) return null;
  return user._id || user.id || user.userId || null;
}

/**
 * Checks if a user is the owner of a blog.
 */
export function isBlogOwner(blog: Blog | null | undefined, user: any): boolean {
  if (!blog || !user) return false;
  const userId = getUserId(user);
  if (!userId) return false;

  const bAuthor = blog.author;
  if (!bAuthor) return false;

  if (typeof bAuthor === "string") {
    return bAuthor === userId;
  }

  const bAuthorId = getUserId(bAuthor);
  return !!bAuthorId && bAuthorId === userId;
}