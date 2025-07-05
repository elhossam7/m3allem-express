
import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceCategory, JobRequest } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { jobRequestSchema, JobRequestFormData } from '../../schemas/validationSchemas';

interface JobRequestFormProps {
  onSubmit: (jobData: Omit<JobRequest, 'id' | 'customerId' | 'createdAt' | 'status' | 'bids' | 'chatHistory' | 'paymentStatus' | 'escrowAmount'>) => void;
  onCancel: () => void;
}

const JobRequestForm: React.FC<JobRequestFormProps> = ({ onSubmit, onCancel }) => {
  const [image, setImage] = useState<File | null>(null);
  const { addToast } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<JobRequestFormData>({
    resolver: zodResolver(jobRequestSchema),
    defaultValues: {
      category: ServiceCategory.Plumbing,
      description: '',
      location: '',
      proposedPrice: 100,
      urgency: 'medium',
    },
  });

  const onFormSubmit = async (data: JobRequestFormData) => {
    try {
      const jobData = {
        ...data,
        imageUrl: image ? URL.createObjectURL(image) : `https://picsum.photos/seed/${Date.now()}/600/400`,
      };
      
      await onSubmit(jobData);
      addToast('Job request created successfully!', 'success');
    } catch (error) {
      addToast('Failed to create job request. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Post a New Job</h2>
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700">Service Category</label>
          <Controller
            name="category"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                id="category"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
              >
                {Object.values(ServiceCategory).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          />
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">Describe the problem</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="description"
                rows={4}
                placeholder="Please provide a detailed description of the work needed..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
          <p className="mt-1 text-xs text-slate-500">
            {watch('description')?.length || 0}/500 characters
          </p>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-slate-700">Location</label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                id="location"
                placeholder="Enter your address or location details..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            )}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="proposedPrice" className="block text-sm font-medium text-slate-700">Proposed Budget (MAD)</label>
            <Controller
              name="proposedPrice"
              control={control}
              render={({ field }) => (
                <input
                  {...field}
                  type="number"
                  id="proposedPrice"
                  min="50"
                  max="10000"
                  step="10"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {errors.proposedPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.proposedPrice.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-slate-700">Urgency Level</label>
            <Controller
              name="urgency"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="urgency"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md"
                >
                  <option value="low">Low - Flexible timing</option>
                  <option value="medium">Medium - Within a week</option>
                  <option value="high">High - ASAP</option>
                </select>
              )}
            />
            {errors.urgency && (
              <p className="mt-1 text-sm text-red-600">{errors.urgency.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="additionalNotes" className="block text-sm font-medium text-slate-700">Additional Notes (Optional)</label>
          <Controller
            name="additionalNotes"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                id="additionalNotes"
                rows={2}
                placeholder="Any additional information or special requirements..."
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-cyan-500 focus:border-cyan-500"
              />
            )}
          />
          {errors.additionalNotes && (
            <p className="mt-1 text-sm text-red-600">{errors.additionalNotes.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-slate-700">Upload a Photo/Video (optional)</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-cyan-600 hover:text-cyan-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500">
                  <span>Upload a file</span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*,video/*"
                    onChange={(e) => e.target.files && setImage(e.target.files[0])} 
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, MP4 up to 10MB</p>
            </div>
          </div>
          {image && <p className="text-sm text-slate-500 mt-2">Selected: {image.name}</p>}
        </div>

        <div className="flex justify-end space-x-4">
          <button 
            type="button" 
            onClick={onCancel} 
            className="bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-200 transition duration-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Submit Job Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobRequestForm;
