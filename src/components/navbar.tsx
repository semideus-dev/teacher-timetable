"use client";

import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user) {
          const role = (session.user as any).role;
          setIsAdmin(role === "ADMIN");
        }
      } catch (error) {
        console.error("Failed to check admin status", error);
      } finally {
        setIsLoading(false);
      }
    }
    checkAdmin();
  }, []);

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="p-2">
              {/* <GraduationCap className="h-6 w-6 text-white" /> */}
              <Image src={"/lkc-logo.png"} width={50} height={50} alt="logo" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-lg font-bold text-slate-900">
                LKC Timetable
              </span>
              <span className="text-xs text-slate-600">
                Dept. of Computer Science & IT
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            {!isLoading && isAdmin && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  className="border-blue-900 text-blue-900 hover:bg-blue-50"
                >
                  Admin Panel
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
