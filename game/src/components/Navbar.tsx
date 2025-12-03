"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Gamepad2, LogOut, Check, X, User, MessageSquare } from "lucide-react";
import { useSocket } from "@/context/SocketContext"; 
import FeedbackModal from "./FeedbackModel";

const navItems = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Find Friends", href: "/friends" },
  { label: "Profile", href: "/profile" },
];

export const NavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  const { notifications, isReady } = useSocket(); 

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get userId from storage
  const [userId, setUserId] = useState<string>("");
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUserId = sessionStorage.getItem("userId") || "";
      setUserId(storedUserId);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("player");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
    }
    router.push("/login");
  };

  const handleAcceptRequest = (notificationId: string, fromUserId: string) => {
    console.log(`Accepted request from ${fromUserId}`);
    // TODO: Call API to accept friend
    // TODO: removeNotification(notificationId) via Context
  };

  const handleDeclineRequest = (notificationId: string) => {
    console.log(`Declined request`);
    // TODO: removeNotification(notificationId) via Context
  };

  return (
    <>
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

          {/* Right: Feedback + Notifications + Logout */}
          <div className="flex items-center gap-3">
            
            {/* Feedback Button */}
            <button
              type="button"
              onClick={() => setIsFeedbackModalOpen(true)}
              className="flex items-center gap-2 px-3 h-8 rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors text-sm font-medium"
              aria-label="Send feedback or report bug"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
              <span className="hidden md:inline"> / Report a Bug</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800 transition-colors"
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

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        userId={userId}
      />
    </>
  );
};