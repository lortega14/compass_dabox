import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";

export function useAuth(requireRole?: "ADMIN" | "USER") {
  const { user, isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verify = async () => {
      let currentUser = user;
      if (!isAuthenticated || !user) {
        currentUser = await checkAuth();
      }

      // If checkAuth fails and user is not authenticated
      if (!currentUser) {
        if (pathname !== "/login" && pathname !== "/setup-password") {
          router.replace("/login");
        }
        return;
      }

      // If user must change password, redirect to setup-password
      if (currentUser.mustChangePassword) {
        if (pathname !== "/setup-password") {
          router.replace("/setup-password");
        }
        return;
      }

      // If they are on auth pages but fully authenticated, redirect to their dashboard
      if (pathname === "/login" || pathname === "/setup-password") {
        if (currentUser.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
        return;
      }

      // Check role permissions
      if (requireRole && currentUser.role !== requireRole) {
        if (currentUser.role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/dashboard");
        }
      }
    };

    verify();
  }, [isAuthenticated, pathname, requireRole, router]);

  return { user, isAuthenticated, isLoading, logout };
}
