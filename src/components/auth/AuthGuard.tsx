"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useAuth";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useRequireAuth("/login");

  useEffect(() => {
    // Redirect is handled inside useRequireAuth
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        認証状態を確認しています…
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return <>{children}</>;
}
