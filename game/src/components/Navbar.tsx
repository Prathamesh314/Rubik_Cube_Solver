"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Bell, Gamepad2, LogOut, Check, X, User } from "lucide-react";
// You must create this context as per the implementation plan
import { useSocket } from "@/context/SocketContext"; 

const navItems = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Find Friends", href: "/friends" },
  { label: "Profile", href: "/profile" },
];

export const NavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  
  // 1. Consume global socket state
  // notifications: Array of friend requests
  // removeNotification: Helper to clear item after accepting/declining
  const { notifications, isReady } = useSocket(); 

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    router.push("/");
  };

  // Mock handlers for Accept/Decline (You will connect these to your API later)
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
        <div className="flex items-center gap-3">
          
          {/* Notification Area */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              
              {/* Notification Dot - Only show if there are notifications */}
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-slate-700 bg-slate-900 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-300">
                    Notifications
                  </span>
                  <span className={`text-[10px] ${isReady ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {isReady ? '● Live' : '○ Connecting...'}
                  </span>
                </div>
                
                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Bell className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                      <p className="text-xs text-slate-500">No new notifications</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-slate-800">
                      {notifications.map((notif) => (
                        <li key={notif.id} className="px-4 py-3 hover:bg-slate-800/50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                              <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-300">
                                <span className="font-bold text-white">{notif.fromUsername}</span> sent you a friend request.
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              
                              <div className="flex gap-2 mt-2">
                                <button 
                                  onClick={() => handleAcceptRequest(notif.id, notif.fromUserId)}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 text-[10px] font-medium transition-colors"
                                >
                                  <Check className="w-3 h-3" /> Accept
                                </button>
                                <button 
                                  onClick={() => handleDeclineRequest(notif.id)}
                                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600 text-[10px] font-medium transition-colors"
                                >
                                  <X className="w-3 h-3" /> Decline
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

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
  );
};