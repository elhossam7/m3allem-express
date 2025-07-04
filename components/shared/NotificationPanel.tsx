
import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Notification } from '../../types';
import Icon from '../Icon';

interface NotificationPanelProps {
  onNotificationClick: (link: Notification['link']) => void;
  onClose: () => void;
}

// Helper to format time since notification
const timeSince = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onNotificationClick, onClose }) => {
  const { notifications } = useNotifications();

  const handleItemClick = (notification: Notification) => {
    if (notification.link) {
      onNotificationClick(notification.link);
    } else {
        onClose();
    }
  };

  return (
    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <button
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`w-full text-left block px-4 py-3 text-sm transition-colors ${notif.link ? 'hover:bg-slate-50' : 'cursor-default'} ${!notif.isRead ? 'bg-cyan-50' : 'bg-white'}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {!notif.isRead && <div className="h-2.5 w-2.5 rounded-full bg-cyan-500 mt-1.5" />}
                </div>
                <div className="flex-grow">
                  <p className={`text-slate-700 ${!notif.isRead ? 'font-semibold' : 'font-normal'}`}>{notif.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{timeSince(notif.timestamp)}</p>
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center p-8">
            <Icon name="bell" className="h-10 w-10 text-slate-300 mx-auto mb-2"/>
            <p className="text-slate-500 font-semibold">No notifications yet</p>
            <p className="text-xs text-slate-400">We'll let you know when something happens.</p>
          </div>
        )}
      </div>
       {notifications.length > 0 && (
         <div className="p-2 border-t border-slate-200 text-center">
            <button onClick={onClose} className="text-xs font-semibold text-cyan-600 hover:underline">Close</button>
         </div>
       )}
    </div>
  );
};

export default NotificationPanel;
