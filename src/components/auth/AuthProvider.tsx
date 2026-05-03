"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuthStore, type User } from "@/stores/useAuthStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { authApi } from "@/lib/api/auth/authApi";
import {
  loadGoogleScript,
  initializeGoogleSignIn,
  triggerGooglePrompt,
} from "@/lib/google-auth";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (credential?: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  isLoginModalOpen: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    login,
    logout: clearAuth,
    updateUser: updateAuthUser,
  } = useAuthStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const handleGoogleCallback = useCallback(
    async (googleToken: string) => {
      setLocalLoading(true);
      try {
        const response = await authApi.googleAuth(googleToken);
        login(
          {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            username: response.user.username,
            avatar: response.user.avatar,
            provider: response.user.provider,
          },
          {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          },
        );
        toast.success("Đăng nhập thành công!");
        analytics.loginAttempt({ method: "google", success: true });
        closeLoginModal();
      } catch (error) {
        console.error("Google auth error:", error);
        toast.error("Đăng nhập Google thất bại. Vui lòng thử lại.");
        analytics.loginAttempt({ method: "google", success: false });
      } finally {
        setLocalLoading(false);
      }
    },
    [login, closeLoginModal]
  );

  const loginWithGoogle = useCallback(async (credential?: string) => {
    if (credential) {
      await handleGoogleCallback(credential);
    } else if (!googleReady) {
      await initializeGoogleAndPrompt();
    } else {
      triggerGooglePrompt();
    }
  }, [googleReady, handleGoogleCallback]);

  const initializeGoogleAndPrompt = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID not configured");
      toast.error("Google OAuth chưa được cấu hình");
      return;
    }

    try {
      await loadGoogleScript();
      initializeGoogleSignIn(clientId, handleGoogleCallback, {
        autoSelect: false,
      });
      setGoogleReady(true);
      triggerGooglePrompt();
    } catch (error) {
      console.error("Failed to initialize Google Sign-In:", error);
      toast.error("Không thể khởi tạo đăng nhập Google");
    }
  }, [handleGoogleCallback]);

  const loginWithEmail = useCallback(
    async (email: string, password: string) => {
      setLocalLoading(true);
      try {
        const response = await authApi.login(email, password);
        login(
          {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            username: response.user.username,
            avatar: response.user.avatar,
            provider: response.user.provider,
          },
          {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          },
        );
        toast.success("Đăng nhập thành công!");
        analytics.loginAttempt({ method: "email", success: true });
        closeLoginModal();
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
        analytics.loginAttempt({ method: "email", success: false });
        throw error;
      } finally {
        setLocalLoading(false);
      }
    },
    [login, closeLoginModal]
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      setLocalLoading(true);
      try {
        const response = await authApi.register(email, password, name);
        login(
          {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            username: response.user.username,
            avatar: response.user.avatar,
            provider: response.user.provider,
          },
          {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          },
        );
        toast.success("Đăng ký thành công!");
        analytics.customEvent("user_register", {
          method: "email",
          success: true,
        });
        closeLoginModal();
      } catch (error) {
        console.error("Register error:", error);
        toast.error("Đăng ký thất bại. Email có thể đã được sử dụng.");
        analytics.customEvent("user_register", {
          method: "email",
          success: false,
        });
        throw error;
      } finally {
        setLocalLoading(false);
      }
    },
    [login, closeLoginModal]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      clearAuth();
      toast.success("Đã đăng xuất");
    }
  }, [clearAuth]);

  // Check for expired tokens on mount and handle refresh failure
  useEffect(() => {
    const handleTokenRefreshFailure = () => {
      clearAuth();
      toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    };

    // Listen for custom event from tokenManager when refresh fails
    window.addEventListener("auth:token-refresh-failed", handleTokenRefreshFailure);

    return () => {
      window.removeEventListener("auth:token-refresh-failed", handleTokenRefreshFailure);
    };
  }, [clearAuth]);

  // Sync watch history when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      useHistoryStore.getState().syncFromDatabase();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const initGoogle = async () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) return;

      try {
        await loadGoogleScript();
        initializeGoogleSignIn(clientId, handleGoogleCallback, {
          autoSelect: true,
        });
        setGoogleReady(true);
      } catch (error) {
        console.error("Failed to initialize Google:", error);
      }
    };

    initGoogle();
  }, [handleGoogleCallback]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading: isLoading || localLoading,
    loginWithGoogle,
    loginWithEmail,
    register,
    logout,
    updateUser: updateAuthUser,
    openLoginModal,
    closeLoginModal,
    isLoginModalOpen,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
