
import React, { useState } from 'react';
import { Artisan, User, ServiceCategory } from '../../types';
import { updateArtisanProfile } from '../../services/api';

interface ArtisanProfileEditPageProps {
  artisan: Artisan;
  onProfileUpdate: (updatedUser: User) => void;
  onCancel: () => void;
}

const ArtisanProfileEditPage: React.FC<ArtisanProfileEditPageProps> = ({ artisan, onProfileUpdate, onCancel }) => {
  const [name, setName] = useState(artisan.name);
  const [phone, setPhone] = useState(artisan.phone);
  const [specialization, setSpecialization] = useState(artisan.specialization);
  const [location, setLocation] = useState(artisan.location);
  const [portfolio, setPortfolio] = useState([...artisan.portfolio]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePortfolioChange = (index: number, value: string) => {
    const newPortfolio = [...portfolio];
    newPortfolio[index] = value;
    setPortfolio(newPortfolio);
  };

  const addPortfolioField = () => {
    setPortfolio([...portfolio, '']);
  };

  const removePortfolioField = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const cleanedPortfolio = portfolio.filter(url => url.trim() !== '');
      const updatedArtisan = await updateArtisanProfile(artisan.id, {
        name,
        phone,
        specialization,
        location,
        portfolio: cleanedPortfolio,
      });
      onProfileUpdate(updatedArtisan);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <button onClick={onCancel} className="mb-6 text-cyan-600 hover:text-cyan-800 font-semibold">
        &larr; Back to Profile
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 bg-slate-50 border-b">
          <h2 className="text-3xl font-bold text-slate-800">Edit Your Profile</h2>
          <p className="text-slate-500">Keep your professional information up to date.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {error && <p className="text-center text-sm text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="specialization" className="block text-sm font-medium text-slate-700">Specialization</label>
                <select id="specialization" value={specialization} onChange={(e) => setSpecialization(e.target.value as ServiceCategory)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                  {Object.values(ServiceCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
                <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500" placeholder="e.g., Casablanca"/>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-slate-700">Portfolio Images</h3>
              <p className="text-sm text-slate-500 mb-4">Add direct links (URLs) to your best work.</p>
              <div className="space-y-3">
                {portfolio.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input type="url" placeholder="https://example.com/image.jpg" value={url} onChange={(e) => handlePortfolioChange(index, e.target.value)} className="flex-grow block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                    <button type="button" onClick={() => removePortfolioField(index)} className="px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200">Remove</button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addPortfolioField} className="mt-3 text-sm font-semibold text-cyan-600 hover:text-cyan-800">+ Add another image</button>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3">
            <button type="button" onClick={onCancel} disabled={isLoading} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition duration-300 disabled:opacity-50">
                Cancel
            </button>
            <button type="submit" disabled={isLoading} className="flex justify-center items-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:bg-slate-300">
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtisanProfileEditPage;