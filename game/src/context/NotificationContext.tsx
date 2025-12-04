"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

export type Notification = {
  id: string;
  message: string;
  type?: "info" | "success" | "error";
};

type NotificationContextValue = {
  add: (message: string, type?: Notification["type"]) => void;
  get: () => Notification[];
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const add = useCallback(
    (message: string, type: Notification["type"] = "info") => {
      setNotifications((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          message,
          type,
        },
      ]);
    },
    []
  );

  const get = useCallback(() => notifications, [notifications]);

  const value: NotificationContextValue = { add, get };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotification must be used inside a <NotificationProvider />"
    );
  }
  return ctx;
};
