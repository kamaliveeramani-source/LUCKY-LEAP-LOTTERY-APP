const STORAGE_KEY = "ll_notifications";

const defaultNotifications = [
  {
    id: 1,
    title: "🎉 New Kerala Lottery Available",
    message: "Check out the latest Kerala draw and place your ticket now.",
    time: new Date().toISOString(),
    read: false,
  },
  {
    id: 2,
    title: "💰 Deposit Successful",
    message: "Your wallet top-up was completed successfully.",
    time: new Date().toISOString(),
    read: false,
  },
  {
    id: 3,
    title: "💸 Withdrawal Approved",
    message: "Your withdrawal has been approved and is on its way.",
    time: new Date().toISOString(),
    read: false,
  },
  {
    id: 4,
    title: "🎫 Ticket Purchased",
    message: "Your ticket purchase has been confirmed.",
    time: new Date().toISOString(),
    read: false,
  },
  {
    id: 5,
    title: "🏆 Jackpot Draw Today",
    message: "A big jackpot draw is happening soon — place your bet now.",
    time: new Date().toISOString(),
    read: false,
  },
  {
    id: 6,
    title: "🎁 New Promotion Available",
    message: "Discover the latest offer and get bonus rewards.",
    time: new Date().toISOString(),
    read: false,
  },
  {
    id: 7,
    title: "🔄 Transfer Successful",
    message: "Your recent fund transfer completed successfully.",
    time: new Date().toISOString(),
    read: false,
  },
];

const loadNotifications = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultNotifications;

  try {
    return JSON.parse(raw);
  } catch {
    return defaultNotifications;
  }
};

const saveNotifications = (notifications) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

export const addNotification = (title, message) => {
  const notifications = loadNotifications();
  const notification = {
    id: Date.now(),
    title,
    message,
    time: new Date().toISOString(),
    read: false,
  };

  saveNotifications([notification, ...notifications]);
  return notification;
};

export const getNotifications = () => loadNotifications();

export const getUnreadCount = () => {
  return loadNotifications().filter((item) => !item.read).length;
};

export const markAllRead = () => {
  const notifications = loadNotifications().map((item) => ({ ...item, read: true }));
  saveNotifications(notifications);
  return notifications;
};

export const clearNotifications = () => {
  localStorage.removeItem(STORAGE_KEY);
};
