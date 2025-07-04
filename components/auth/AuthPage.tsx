import React, { useState } from 'react';
import { User, UserRole, ServiceCategory } from '../../types';
import { login, signup } from '../../services/api';
import Icon from '../Icon';

interface AuthPageProps {
  onAuthSuccess: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Customer);
  const [specialization, setSpecialization] = useState<ServiceCategory>(ServiceCategory.Plumbing);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let user: User | null;
      if (isLoginView) {
        user = await login(email, password);
        if (!user) {
          throw new Error("Invalid credentials or user does not exist.");
        }
      } else {
        user = await signup(name, email, password, role, role === UserRole.Artisan ? specialization : undefined);
      }
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
    setError(null);
  };


  return (
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">{isLoginView ? 'Login to your Account' : 'Create an Account'}</h2>
        <p className="text-slate-500 text-sm">Welcome to M3allem Express</p>
      </div>

      <div className="mb-6">
        <div className="flex bg-slate-100 rounded-lg p-1">
            <button onClick={() => setIsLoginView(true)} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${isLoginView ? 'bg-white shadow text-cyan-600' : 'text-slate-500'}`}>Login</button>
            <button onClick={() => setIsLoginView(false)} className={`w-1/2 py-2 text-sm font-semibold rounded-md transition-colors ${!isLoginView ? 'bg-white shadow text-cyan-600' : 'text-slate-500'}`}>Sign Up</button>
        </div>
      </div>

      {error && <p className="mb-4 text-center text-sm text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLoginView && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Full Name</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required={!isLoginView} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email Address</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
        </div>
        
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-slate-700">Password</label>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
        </div>

        {!isLoginView && (
            <>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700">I am a...</label>
                    <select id="role" value={role} onChange={e => setRole(e.target.value as UserRole)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                        <option value={UserRole.Customer}>Customer</option>
                        <option value={UserRole.Artisan}>Artisan</option>
                    </select>
                </div>
                {role === UserRole.Artisan && (
                    <div>
                        <label htmlFor="specialization" className="block text-sm font-medium text-slate-700">My Specialization</label>
                        <select id="specialization" value={specialization} onChange={e => setSpecialization(e.target.value as ServiceCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                            {Object.values(ServiceCategory).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                )}
            </>
        )}
        
        <div className="pt-2">
          <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-300">
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : (isLoginView ? 'Login' : 'Create Account')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AuthPage;