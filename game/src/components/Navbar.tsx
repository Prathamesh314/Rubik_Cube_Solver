"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Bell,
  Gamepad2,
  LogOut,
  Check,
  X,
  User,
  MessageSquare,
} from "lucide-react";
import FeedbackModal from "./FeedbackModel";
import { useNotification } from "@/context/NotificationContext";

const navItems = [
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Find Friends", href: "/friends" },
  { label: "Profile", href: "/profile" },
];

export const NavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { get } = useNotification();

  // 🔔 notifications & pagination logic
  const notifications = get();
  const unreadCount = notifications.length;

  const [page, setPage] = useState(0);
  const pageSize = 5;

  const totalPages = Math.max(1, Math.ceil(unreadCount / pageSize || 1));
  const start = page * pageSize;
  const pageNotifications = notifications.slice(start, start + pageSize);

  // clamp page if notifications count changes
  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(unreadCount / pageSize) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [unreadCount, page, pageSize]);

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
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("player");
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("token");
    }
    router.push("/login");
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
                pathname === item.href ||
                pathname?.startsWith(item.href + "/");
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

            {/* 🔔 Notification Bell + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-md border border-slate-800 bg-slate-950 shadow-xl text-xs">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
                    <span className="text-[11px] font-semibold text-slate-300">
                      Notifications
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {unreadCount} total
                    </span>
                  </div>

                  {/* List */}
                  <div className="max-h-64 overflow-y-auto">
                    {pageNotifications.length === 0 ? (
                      <div className="px-3 py-4 text-[11px] text-slate-500">
                        No notifications
                      </div>
                    ) : (
                      pageNotifications.map((n) => (
                        <div
                          key={n.id}
                          className="border-b border-slate-900 px-3 py-2 text-slate-100"
                        >
                          {typeof n.message === "string"
                            ? n.message
                            : JSON.stringify(n.message)}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {unreadCount > pageSize && (
                    <div className="flex items-center justify-between border-t border-slate-800 bg-slate-950 px-3 py-2 text-[11px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span>
                        Page {page + 1} of {totalPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) =>
                            Math.min(totalPages - 1, p + 1)
                          )
                        }
                        disabled={page >= totalPages - 1}
                        className="rounded-md border border-slate-700 px-2 py-1 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  )}
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
                pathname === item.href ||
                pathname?.startsWith(item.href + "/");
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
