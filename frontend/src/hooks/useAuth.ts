"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import api from "@/lib/api";

interface LoginCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function useAuth() {
  const router = useRouter();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const { data } = await api.post<{ access_token: string }>(
        "/auth/login",
        credentials,
      );

      const token = data.access_token;

      // Salva no localStorage para o axios interceptor
      localStorage.setItem("token", token);

      // Salva no cookie para o middleware do Next.js
      document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;

      const payload = JSON.parse(atob(token.split(".")[1])) as User & {
        userId: string;
      };
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        }),
      );

      router.push("/dashboard");
    },
    [router],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Remove o cookie
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  }, [router]);

  const getUser = useCallback((): User | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as User) : null;
  }, []);

  return { login, logout, getUser };
}
