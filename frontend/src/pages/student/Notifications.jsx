import React, { useState, useEffect } from 'react';
import { Navbar } from '../../components/Navbar';
import {
  getMyNotificationsApi,
  markNotificationReadApi,
  markAllNotificationsReadApi
} from '../../api/notifications';
import { Bell, CheckCircle2, Clock, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = async () => {
    try {
      const data = await getMyNotificationsApi();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-[#0D0F0D] flex flex-col selection:bg-[#9BE5E3]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="blue" size="sm" icon={Bell}>
                Notifications Center
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0D0F0D] tracking-tight">
              Classroom Alerts
            </h1>
            <p className="text-xs sm:text-sm text-[#3D3F4A] mt-1">
              Live session alerts, room invitations, and course announcements
            </p>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              icon={Check}
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </Button>
          )}
        </div>

        <Card className="p-0 overflow-hidden divide-y divide-[#F0F2F5] shadow-sd-md">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#8A8B97]">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8A8B97]">No notifications at this time.</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
                className={`p-5 flex items-start gap-4 transition-colors ${
                  n.is_read ? 'bg-white text-[#8A8B97]' : 'bg-[#3DA8A5]/5 text-[#0D0F0D]'
                } hover:bg-[#F8FAFC] cursor-pointer`}
              >
                <div className="mt-1">
                  {n.is_read ? (
                    <CheckCircle2 className="w-5 h-5 text-[#CBD5E1]" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-[#3DA8A5] block shadow-sm"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-relaxed">{n.message}</p>
                  <span className="text-xs text-[#8A8B97] mt-1.5 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </Card>
      </main>
    </div>
  );
};
