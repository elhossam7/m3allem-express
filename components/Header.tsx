
import React, { useState, useEffect, useRef } from 'react';
import { User, Notification } from '../types';
import Icon from './Icon';
import { useNotifications } from '../contexts/NotificationContext';
import NotificationPanel from './shared/NotificationPanel';


interface HeaderProps {
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (view: 'dashboard' | 'profile') => void;
  onNotificationClick: (link: Notification['link']) => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, onLogout, onNavigate, onNotificationClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { unreadCount, markAllAsRead } = useNotifications();


  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    onLogout();
  };

  const handleNavigateClick = (view: 'dashboard' | 'profile') => {
    setDropdownOpen(false);
    onNavigate(view);
  };
  
  const handleToggleNotifications = () => {
    setNotificationsOpen(prev => !prev);
    if (!notificationsOpen && unreadCount > 0) {
        markAllAsRead();
    }
  }

  const handleNotificationItemClick = (link: Notification['link']) => {
    setNotificationsOpen(false);
    onNotificationClick(link);
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="bg-cyan-500 p-2 rounded-lg">
                <Icon name="briefcase" className="h-6 w-6 text-white"/>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              M3allem <span className="text-cyan-500">Express</span>
            </h1>
          </div>
          <div className="relative flex items-center gap-4">
            {currentUser && (
              <>
                <div ref={notificationsRef}>
                    <button onClick={handleToggleNotifications} className="relative text-slate-500 hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 rounded-full p-1.5">
                        <Icon name="bell" className="h-6 w-6"/>
                        {unreadCount > 0 && <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
                    </button>
                    {notificationsOpen && <NotificationPanel onNotificationClick={handleNotificationItemClick} onClose={() => setNotificationsOpen(false)}/>}
                </div>
              
                <div ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 rounded-full hover:ring-2 hover:ring-cyan-500 hover:ring-offset-2 transition-all duration-300"
                    aria-label="User menu"
                    aria-haspopup="true"
                  >
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-10 w-10 rounded-full object-cover" />
                  </button>
                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
                      <div className="py-1" role="none">
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm text-slate-900 font-semibold" role="none">
                            Signed in as
                          </p>
                          <p className="text-sm font-medium text-slate-700 truncate" role="none">
                            {currentUser.name}
                          </p>
                        </div>
                        <button
                          onClick={() => handleNavigateClick('dashboard')}
                          className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 transition-colors"
                          role="menuitem"
                        >
                          Dashboard
                        </button>
                        <button
                          onClick={() => handleNavigateClick('profile')}
                          className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 transition-colors"
                          role="menuitem"
                        >
                          My Profile
                        </button>
                        <div className="border-t my-1"></div>
                        <button
                          onClick={handleLogoutClick}
                          className="text-red-600 block w-full text-left px-4 py-2 text-sm hover:bg-red-50 transition-colors"
                          role="menuitem"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
