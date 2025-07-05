import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { UserRole, Artisan, Customer, Notification } from './types';
import Header from './components/Header';
import CustomerDashboard from './components/customer/CustomerDashboard-improved';
import ArtisanDashboard from './components/artisan/ArtisanDashboard';
import ArtisanProfilePage from './components/artisan/ArtisanProfilePage';
import AuthPage from './components/auth/AuthPage';
import CustomerProfilePage from './components/customer/CustomerProfilePage';
import ArtisanProfileEditPage from './components/artisan/ArtisanProfileEditPage';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryProvider } from './providers/QueryProvider';
import ErrorBoundary from './components/shared/ErrorBoundary';
import './i18n';

const AppContent: React.FC = () => {
  const { currentUser, login, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleAuthSuccess = (user: any) => {
    login(user);
    if (user.role === UserRole.Artisan) {
      navigate('/artisan/dashboard');
    } else {
      navigate('/customer/dashboard');
    }
  };

  const handleProfileUpdate = (updatedUser: any) => {
    updateUser(updatedUser);
    addToast('Profile updated successfully!', 'success');
    if (updatedUser.role === UserRole.Artisan) {
      navigate('/artisan/profile');
    } else {
      navigate('/customer/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigate = (view: 'dashboard' | 'profile') => {
    if (currentUser?.role === UserRole.Artisan) {
      navigate(`/artisan/${view}`);
    } else if (currentUser?.role === UserRole.Customer) {
      navigate(`/customer/${view}`);
    }
  };

  const handleNotificationClick = (link: Notification['link']) => {
    // This will be improved with a dedicated context or query params
    if (link && link.view === 'job' && link.jobId) {
        if(currentUser?.role === UserRole.Artisan) {
            navigate(`/artisan/dashboard?jobId=${link.jobId}`);
        } else {
            navigate(`/customer/dashboard?jobId=${link.jobId}`);
        }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <main className="flex-grow flex items-center justify-center p-4">
            <AuthPage onAuthSuccess={handleAuthSuccess} />
        </main>
        <footer className="text-center p-4 text-xs text-slate-400 border-t border-slate-200">
          M3allem Express - Your bridge to trusted local artisans.
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onNavigate={handleNavigate}
        onNotificationClick={handleNotificationClick} 
      />
      <main className="p-4 sm:p-6 lg:p-8">
        <Routes>
            {currentUser.role === UserRole.Artisan ? (
                <>
                    <Route path="/artisan/dashboard" element={<ArtisanDashboard artisan={currentUser as Artisan} notificationLink={null} onLinkConsumed={() => {}} />} />
                    <Route path="/artisan/profile" element={<ArtisanProfilePage artisan={currentUser as Artisan} onEdit={() => navigate('/artisan/profile/edit')} onBack={() => navigate('/artisan/dashboard')} />} />
                    <Route path="/artisan/profile/edit" element={<ArtisanProfileEditPage artisan={currentUser as Artisan} onProfileUpdate={handleProfileUpdate} onCancel={() => navigate('/artisan/profile')} />} />
                    <Route path="/*" element={<Navigate to="/artisan/dashboard" />} />
                </>
            ) : (
                <>
                    <Route path="/customer/dashboard" element={<CustomerDashboard user={currentUser as Customer} notificationLink={null} onLinkConsumed={() => {}} />} />
                    <Route path="/customer/profile" element={<CustomerProfilePage customer={currentUser as Customer} onProfileUpdate={handleProfileUpdate} onBack={() => navigate('/customer/dashboard')} />} />
                    <Route path="/*" element={<Navigate to="/customer/dashboard" />} />
                </>
            )}
        </Routes>
      </main>
      <footer className="text-center p-4 text-xs text-slate-400 border-t border-slate-200 mt-8">
        M3allem Express - Your bridge to trusted local artisans.
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ToastProvider>
          <NotificationProvider>
            <AuthProvider>
              <Router>
                <AppContent />
              </Router>
            </AuthProvider>
          </NotificationProvider>
        </ToastProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

export default App;
