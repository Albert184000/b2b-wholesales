import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Eye, MailOpen, Search } from 'lucide-react';
import {
  Button,
  Card,
  Column,
  DataTable,
  KPICard,
  PageHeader,
  SearchBar,
  StatusBadge
} from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { NotificationItem } from '../../types';

export const BuyerNotificationsPage: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showToast
  } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const buyerNotifications = notifications.filter((notification) => !notification.link?.startsWith('/admin'));
  const buyerUnreadCount = buyerNotifications.filter((notification) => !notification.read).length;

  const filteredNotifications = buyerNotifications.filter((notification) => {
    const query = searchTerm.trim().toLowerCase();
    return (
      query === '' ||
      notification.title.toLowerCase().includes(query) ||
      notification.message.toLowerCase().includes(query) ||
      notification.type.toLowerCase().includes(query)
    );
  });

  const columns: Column<NotificationItem>[] = [
    {
      key: 'notification',
      header: 'Notification',
      accessor: (notification) => (
        <div className="min-w-[300px]">
          <div className="flex flex-wrap items-center gap-2">
            <div className="font-bold text-slate-900">{notification.title}</div>
            {!notification.read && <StatusBadge status="Unread" size="sm" showDot={false} />}
          </div>
          <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
        </div>
      )
    },
    { key: 'type', header: 'Type', accessor: (notification) => <StatusBadge status={notification.type} size="sm" /> },
    { key: 'time', header: 'Time', accessor: (notification) => <span className="text-xs font-semibold text-slate-500">{notification.timestamp}</span> },
    {
      key: 'actions',
      header: 'Actions',
      accessor: (notification) => (
        <div className="flex flex-wrap items-center gap-1.5">
          {notification.link && (
            <Link to={notification.link}>
              <Button variant="outline" size="xs" icon={Eye}>
                Open
              </Button>
            </Link>
          )}
          {!notification.read && (
            <Button
              variant="ghost"
              size="xs"
              icon={MailOpen}
              onClick={() => {
                markNotificationAsRead(notification.id);
                showToast('Notification marked as read.', 'info');
              }}
            >
              Read
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Review RFQ, quote, invoice, shipment, and account updates for your buyer workspace."
        breadcrumbs={[
          { label: 'Buyer Portal', href: '/buyer/dashboard' },
          { label: 'Notifications' }
        ]}
        actions={
          <Button variant="outline" size="sm" icon={CheckCheck} onClick={markAllNotificationsAsRead}>
            Mark All Read
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard title="Inbox" value={buyerNotifications.length} subtext="Buyer-facing messages" icon={Bell} />
        <KPICard title="Unread" value={buyerUnreadCount} subtext="Buyer-facing unread notices" icon={MailOpen} />
        <KPICard title="Actionable" value={buyerNotifications.filter((notification) => notification.link).length} subtext="Linked records" icon={Eye} />
      </div>

      <Card className="border-slate-200" noPadding>
        <div className="space-y-4 p-4">
          <div className="max-w-md">
            <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search notifications..." />
          </div>
          <DataTable columns={columns} data={filteredNotifications} emptyMessage="No notifications match the current search." />
        </div>
      </Card>
    </div>
  );
};
