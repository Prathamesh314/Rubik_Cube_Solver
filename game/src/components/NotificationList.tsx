"use client";

import React from "react";
import { useNotification } from "@/context/NotificationContext";

export const NotificationList: React.FC = () => {
  const { get } = useNotification();
  const notifications = get();

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white shadow-lg"
        >
          {n.message}
        </div>
      ))}
    </div>
  );
};
