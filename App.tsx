
import React, { useState } from 'react';
import { User, UserRole, Customer, Artisan, Notification } from './types';
import Header from './components/Header';
import CustomerDashboard from './components/customer/CustomerDashboard';
import ArtisanDashboard from './components/artisan/ArtisanDashboard';
import ArtisanProfilePage from './components/artisan/ArtisanProfilePage';
import AuthPage from './components/auth/AuthPage';
import CustomerProfilePage from './components/customer/CustomerProfilePage';
import ArtisanProfileEditPage from './components/artisan/ArtisanProfileEditPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';

const AppContent: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'editProfile'>('dashboard');
  const [notificationLink, setNotificationLink] = useState<Notification['link'] | null>(null);
  const { addToast } = useToast();

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleProfileUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    addToast('Profile updated successfully!', 'success');
    // Go to profile for artisans to see changes, dashboard for customers
    setCurrentView(updatedUser.role === UserRole.Artisan ? 'profile' : 'dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleNavigate = (view: 'dashboard' | 'profile' | 'editProfile') => {
    setNotificationLink(null); // Clear any notification links on manual navigation
    setCurrentView(view);
  };

  const handleNotificationClick = (link: Notification['link']) => {
    setNotificationLink(link);
    setCurrentView('dashboard'); // Always go to dashboard to handle the link
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Header currentUser={null} onLogout={() => {}} onNavigate={() => {}} onNotificationClick={() => {}}/>
        <main className="flex-grow flex items-center justify-center p-4">
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </main>
        <footer className="text-center p-4 text-xs text-slate-400 border-t border-slate-200">
          M3allem Express - Your bridge to trusted local artisans.
        </footer>
      </div>
    );
  }

  const renderContent = () => {
    if (currentUser.role === UserRole.Artisan) {
        const artisan = currentUser as Artisan;
        switch (currentView) {
            case 'profile':
                return <ArtisanProfilePage artisan={artisan} onBack={() => setCurrentView('dashboard')} onEdit={() => handleNavigate('editProfile')} backButtonText="&larr; Back to Dashboard" />;
            case 'editProfile':
                return <ArtisanProfileEditPage artisan={artisan} onProfileUpdate={handleProfileUpdate} onCancel={() => setCurrentView('profile')} />;
            default:
                return <ArtisanDashboard 
                    artisan={artisan} 
                    notificationLink={notificationLink}
                    onLinkConsumed={() => setNotificationLink(null)}
                />;
        }
    }

    if (currentUser.role === UserRole.Customer) {
        const customer = currentUser as Customer;
        if (currentView === 'profile') {
            return <CustomerProfilePage customer={customer} onProfileUpdate={handleProfileUpdate} onBack={() => setCurrentView('dashboard')} />;
        }
        return <CustomerDashboard 
            user={customer} 
            notificationLink={notificationLink} 
            onLinkConsumed={() => setNotificationLink(null)}
        />;
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header currentUser={currentUser} onLogout={handleLogout} onNavigate={handleNavigate} onNotificationClick={handleNotificationClick} />
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-xs text-slate-400 border-t border-slate-200 mt-8">
        M3allem Express - Your bridge to trusted local artisans.
      </footer>
    </div>
  );
};


const App: React.FC = () => {
  return (
    <ToastProvider>
        <NotificationProvider>
            <AppContent />
        </NotificationProvider>
    </ToastProvider>
  )
}

export default App;
