
import React, { useState } from 'react';
import { Customer, User } from '../../types';
import { updateCustomerProfile } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface CustomerProfilePageProps {
  customer: Customer;
  onProfileUpdate: (updatedUser: User) => void;
  onBack: () => void;
}

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customer, onProfileUpdate, onBack }) => {
  const [name, setName] = useState(customer.name);
  const [phone, setPhone] = useState(customer.phone);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast("Passwords do not match.", "error");
      return;
    }

    setIsLoading(true);
    try {
      const updatedCustomer = await updateCustomerProfile(customer.id, name, phone, password || undefined);
      // The parent component (`App.tsx`) will show the success toast
      onProfileUpdate(updatedCustomer);
      // Clear password fields after successful submission
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      addToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <button onClick={onBack} className="mb-6 text-cyan-600 hover:text-cyan-800 font-semibold">
        &larr; Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-slate-50 border-b flex items-center space-x-6">
          <img src={customer.avatarUrl} alt={customer.name} className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow-md" />
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{customer.name}</h2>
            <p className="text-lg text-slate-600">{customer.email}</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-700">Edit Profile Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700">Phone Number</label>
                    <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
            </div>
            
            <div>
              <label htmlFor="email_display" className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" id="email_display" value={customer.email} disabled className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-slate-100 cursor-not-allowed"/>
               <p className="mt-2 text-xs text-slate-500">Email address cannot be changed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="password"className="block text-sm font-medium text-slate-700">New Password</label>
                  <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                <div>
                  <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isLoading} className="flex justify-center items-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-300">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
