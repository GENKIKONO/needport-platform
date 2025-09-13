"use client";

import { useState, useEffect } from "react";

export function UnreadBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initial load
    fetchUnreadCount();
    
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchUnreadCount, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/chat/unread-count');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );
}