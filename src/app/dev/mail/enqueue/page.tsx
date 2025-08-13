"use client";

import { useState, useEffect } from "react";

// Only allow in development
if (process.env.NODE_ENV === "production") {
  throw new Error("Not available in production");
}

interface Notification {
  id: string;
  kind: string;
  need_id: string;
  ref_id: string;
  status: string;
  created_at: string;
  retry_count: number;
  last_error?: string;
}

export default function NotificationEnqueuePage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await fetch("/api/admin/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const enqueueNotification = async (kind: string) => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/dev/notifications/enqueue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Enqueued ${kind} notification`);
        loadNotifications();
      } else {
        setMessage(`Error: ${data.message || "Failed to enqueue"}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const dispatchNow = async () => {
    setLoading(true);
    setMessage("");
    
    try {
      const res = await fetch("/api/admin/notifications/retry-due", {
        method: "POST",
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`Dispatched ${data.processed} notifications (${data.success} success, ${data.failed} failed)`);
        loadNotifications();
      } else {
        setMessage(`Error: ${data.message || "Failed to dispatch"}`);
      }
    } catch (error) {
      setMessage(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const notificationKinds = [
    "offer.added",
    "offer.updated", 
    "offer.deleted",
    "offer.adopted",
    "offer.unadopted",
    "need.threshold_reached"
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notification Testing</h1>
        
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes("Error") ? "bg-red-50 border border-red-200 text-red-800" : "bg-green-50 border border-green-200 text-green-800"
          }`}>
            {message}
          </div>
        )}
        
        {/* Enqueue Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Enqueue Test Notifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {notificationKinds.map(kind => (
              <button
                key={kind}
                onClick={() => enqueueNotification(kind)}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {kind}
              </button>
            ))}
          </div>
        </div>

        {/* Dispatch Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Dispatch Notifications</h2>
          <button
            onClick={dispatchNow}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? "Processing..." : "Dispatch Now"}
          </button>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Notifications (Last 20)</h2>
          
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3">Kind</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Retry Count</th>
                    <th className="text-left p-3">Created</th>
                    <th className="text-left p-3">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notification => (
                    <tr key={notification.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 font-mono text-xs">{notification.kind}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                          notification.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {notification.status}
                        </span>
                      </td>
                      <td className="p-3">{notification.retry_count}</td>
                      <td className="p-3 text-xs">
                        {new Date(notification.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 text-xs text-red-600 max-w-xs truncate">
                        {notification.last_error}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
