

import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect, useRef } from 'react';
import { Notification, User, JobRequest, Artisan, Customer, UserRole, JobStatus } from '../types';
import { getAllJobRequests, getAllArtisans, getAllCustomers } from '../services/api';
import { sampleArtisans, sampleCustomers } from '../constants';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_STORAGE_KEY = 'm3allem_notifications';

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
        const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
  });
  
  // A bit of a hack to get the current user from App.tsx without a full-blown user context
  // In a larger app, a dedicated UserProvider would be better.
  // For now, we find the currently logged-in user from the App's state.
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const previousJobs = useRef<JobRequest[]>([]);
  const allArtisans = useRef<Artisan[]>([]);
  const allCustomers = useRef<Customer[]>([]);
  
  const addNotification = useCallback((newNotification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    setNotifications(prev => {
        const fullNotification: Notification = {
            ...newNotification,
            id: `notif-${Date.now()}`,
            timestamp: Date.now(),
            isRead: false,
        };
        // Avoid duplicate notifications
        if (prev.some(n => n.message === fullNotification.message)) {
            return prev;
        }
        const updated = [fullNotification, ...prev];
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  }, []);

  const detectChanges = useCallback((newJobs: JobRequest[], user: User) => {
    const prevJobsMap = new Map(previousJobs.current.map(job => [job.id, job]));

    newJobs.forEach(newJob => {
        const oldJob = prevJobsMap.get(newJob.id);

        // --- Notifications for Artisans ---
        if (user.role === UserRole.Artisan) {
            const artisanUser = user as Artisan;
            // 1. New Job Available
            if (!oldJob && newJob.status === JobStatus.Open && newJob.category === artisanUser.specialization) {
                addNotification({
                    message: `A new ${newJob.category} job is available in ${newJob.location}.`,
                    link: { view: 'dashboard_tab', tabName: 'available' }
                });
            }
            // 2. Bid Accepted
            if (oldJob && oldJob.status === JobStatus.Open && newJob.status === JobStatus.AwaitingPayment && newJob.acceptedArtisanId === user.id) {
                const customer = allCustomers.current.find(c => c.id === newJob.customerId);
                addNotification({
                    message: `${customer?.name || 'A customer'} accepted your bid for the ${newJob.category} job.`,
                    link: { view: 'dashboard_tab', tabName: 'bids' }
                });
            }
             // 3. Dispute Raised
            if (oldJob && oldJob.status === JobStatus.Completed && newJob.status === JobStatus.Disputed && newJob.acceptedArtisanId === user.id) {
                 const customer = allCustomers.current.find(c => c.id === newJob.customerId);
                 addNotification({
                    message: `A dispute has been raised by ${customer?.name || 'a customer'} for the ${newJob.category} job.`,
                    link: { view: 'dashboard_tab', tabName: 'disputed' }
                 });
            }
        }

        // --- Notifications for Customers ---
        if (user.role === UserRole.Customer && newJob.customerId === user.id) {
            // 1. New Bid Received
            if (oldJob && newJob.bids.length > oldJob.bids.length) {
                const newBid = newJob.bids[newJob.bids.length - 1];
                const artisan = allArtisans.current.find(a => a.id === newBid.artisanId);
                addNotification({
                    message: `${artisan?.name || 'An artisan'} placed a bid on your ${newJob.category} job.`,
                    link: { view: 'job', jobId: newJob.id }
                });
            }
            // 2. Job Marked Complete
            if (oldJob && oldJob.status === JobStatus.InProgress && newJob.status === JobStatus.Completed) {
                 const artisan = allArtisans.current.find(a => a.id === newJob.acceptedArtisanId);
                 addNotification({
                    message: `${artisan?.name || 'Your artisan'} has marked the ${newJob.category} job as complete.`,
                    link: { view: 'job', jobId: newJob.id }
                 });
            }
        }
    });
  }, [addNotification]);


  // Effect for polling and detecting changes
  useEffect(() => {
    const AppContent = document.getElementById('root')?.firstElementChild;
    const observer = new MutationObserver(() => {
        // This is a proxy to find when the user logs in, since we don't have a shared user context
        const header = document.querySelector('header');
        if (header?.innerText.includes('Logout')) {
           // A bit of a hacky way to check if a user is logged in
           // and get their name to find them in the mock DB.
           const userNameElement = header.querySelector('p.truncate');
           if (userNameElement) {
               const userName = userNameElement.textContent;
                const user = [...sampleArtisans, ...sampleCustomers].find(u => u.name === userName);
                if (user && user.id !== currentUser?.id) {
                    setCurrentUser(user);
                }
           }
        } else {
            if(currentUser) setCurrentUser(null);
        }
    });

    if (AppContent) {
        observer.observe(AppContent, { childList: true, subtree: true });
    }

    const poll = async (user: User) => {
        try {
            // Fetch all necessary data
            const [jobs, artisans, customers] = await Promise.all([
                getAllJobRequests(),
                getAllArtisans(),
                getAllCustomers()
            ]);
            
            allArtisans.current = artisans;
            allCustomers.current = customers;
            
            // Only detect changes if it's not the first run
            if (previousJobs.current.length > 0) {
                detectChanges(jobs, user);
            }

            previousJobs.current = jobs;

        } catch (error) {
            console.error("Polling error:", error);
        }
    };
    
    let intervalId: number | null = null;
    if (currentUser) {
       poll(currentUser); // Initial poll
       intervalId = window.setInterval(() => poll(currentUser), 5000); // Poll every 5 seconds
    }

    return () => {
        if(intervalId) window.clearInterval(intervalId);
        observer.disconnect();
    };
  }, [currentUser, detectChanges]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, isRead: true }));
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    });
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
