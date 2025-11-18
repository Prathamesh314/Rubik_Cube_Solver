// Filename: src/components/NavBar.tsx
"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Gamepad2, LogOut } from "lucide-react";

const navItems = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Find Friends", href: "/friends" },
  { label: "Profile", href: "/profile" },
];

export const NavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    // centralised logout logic for all pages using this NavBar
    if (typeof window !== "undefined") {
      localStorage.removeItem("player");
      sessionStorage.removeItem("userId");
    }
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        {/* Left: Brand */}
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center gap-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-800">
            <Gamepad2 className="w-4 h-4 text-slate-100" />
          </div>
          <span className="text-sm font-semibold text-slate-100">
            Rubik Arena
          </span>
        </button>

        {/* Center: Nav items (desktop) */}
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className={[
                  "px-3 py-1.5 rounded-md transition-colors",
                  isActive
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Notifications + Logout */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {/* Notification dot (optional) */}
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400" />
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="hidden sm:inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 pb-3 md:hidden">
        <nav className="flex flex-1 items-center justify-between gap-1 text-xs">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <button
                key={item.href}
                type="button"
                onClick={() => router.push(item.href)}
                className={[
                  "flex-1 px-2 py-1.5 rounded-md text-[11px] transition-colors",
                  isActive
                    ? "bg-slate-800 text-slate-100"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900",
                ].join(" ")}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
