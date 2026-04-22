"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, []);

  return <>{children}</>;
}
