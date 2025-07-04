
import React, { useState } from 'react';
import { ServiceCategory, JobRequest } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface JobRequestFormProps {
  onSubmit: (jobData: Omit<JobRequest, 'id' | 'customerId' | 'createdAt' | 'status' | 'bids' | 'chatHistory' | 'paymentStatus' | 'escrowAmount'>) => void;
  onCancel: () => void;
}

const JobRequestForm: React.FC<JobRequestFormProps> = ({ onSubmit, onCancel }) => {
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.Plumbing);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [proposedPrice, setProposedPrice] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const { addToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !location || !proposedPrice) {
        addToast("Please fill all required fields.", "error");
        return;
    }
    onSubmit({
      category,
      description,
      location,
      proposedPrice: Number(proposedPrice),
      imageUrl: image ? URL.createObjectURL(image) : `https://picsum.photos/seed/${Date.now()}/600/400`,
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Post a New Job</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Service Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ServiceCategory)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
          >
            {Object.values(ServiceCategory).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Describe the problem</label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g., Leaky faucet in the kitchen sink..."
          />
        </div>

        <div>
            <label htmlFor="image" className="block text-sm font-medium text-slate-700">Upload a Photo/Video (optional)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    <div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500"><span>Upload a file</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => e.target.files && setImage(e.target.files[0])} /></label><p className="pl-1">or drag and drop</p></div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
            </div>
            {image && <p className="text-sm text-slate-500 mt-2">Selected: {image.name}</p>}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700">Your Location</label>
          <input
            type="text"
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g., Maarif, Casablanca"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-slate-700">Propose Your Price (MAD)</label>
          <input
            type="number"
            id="price"
            value={proposedPrice}
            onChange={(e) => setProposedPrice(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="e.g., 150"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={onCancel} className="bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition duration-300">
            Cancel
          </button>
          <button type="submit" className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md">
            Submit Job Request
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobRequestForm;
