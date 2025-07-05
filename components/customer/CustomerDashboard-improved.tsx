import React, { useState, useEffect } from 'react';
import { Customer, JobRequest, JobStatus, Artisan, Notification } from '../../types';
import JobRequestForm from './JobRequestForm';
import JobStatusView from './JobStatusView';
import LeaveReview from './LeaveReview';
import AdvancedSearch from '../shared/AdvancedSearch';
import { useJobRequests, useCreateJobRequest } from '../../hooks/useJobRequests';
import { useSubmitReview } from '../../hooks/useReview';
import { useWebSocket, useJobUpdates } from '../../hooks/useWebSocket';
import { useLocalization } from '../../hooks/useLocalization';
import { getArtisansByIds, getJobById } from '../../services/api';
import { SearchFiltersData } from '../../schemas/validationSchemas';

interface CustomerDashboardProps {
  user: Customer;
  notificationLink: Notification['link'] | null;
  onLinkConsumed: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, notificationLink, onLinkConsumed }) => {
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  
  // State for the review modal
  const [reviewingJob, setReviewingJob] = useState<JobRequest | null>(null);
  const [artisanForReview, setArtisanForReview] = useState<Artisan | null>(null);

  // Use React Query for data fetching
  const { data: jobRequests = [], isLoading, refetch } = useJobRequests(user.id);
  const createJobMutation = useCreateJobRequest();
  const submitReviewMutation = useSubmitReview();

  // WebSocket for real-time updates
  const { isConnected } = useWebSocket();
  
  // Internationalization
  const { t } = useLocalization();

  // Handle real-time job updates
  useJobUpdates(selectedJob?.id || '', (update) => {
    if (update.type === 'status_change') {
      refetch(); // Refetch jobs when status changes
    }
  });

  // Effect to handle navigation from notifications
  useEffect(() => {
    const handleLink = async () => {
      if (notificationLink && notificationLink.view === 'job' && notificationLink.jobId) {
        const job = await getJobById(notificationLink.jobId);
        if (job && job.customerId === user.id) {
          setSelectedJob(job);
        }
        onLinkConsumed();
      }
    };
    handleLink();
  }, [notificationLink, onLinkConsumed, user.id]);

  // Effect to fetch artisan details when review modal is opened
  useEffect(() => {
    const fetchArtisanForReview = async () => {
      if (reviewingJob && reviewingJob.acceptedArtisanId) {
        setArtisanForReview(null);
        const artisans = await getArtisansByIds([reviewingJob.acceptedArtisanId]);
        if (artisans.length > 0) {
          setArtisanForReview(artisans[0]);
        }
      } else {
        setArtisanForReview(null);
      }
    };
    fetchArtisanForReview();
  }, [reviewingJob]);

  const handleJobSubmit = async (jobData: any) => {
    try {
      await createJobMutation.mutateAsync({ customerId: user.id, jobData });
      setIsCreatingJob(false);
      refetch();
    } catch (error) {
      console.error('Failed to create job:', error);
    }
  };

  const handleSearchFilters = (filters: SearchFiltersData) => {
    // TODO: Implement filtered search logic
    console.log('Search filters:', filters);
  };

  const handleResetSearch = () => {
    // TODO: Reset search filters
    console.log('Reset search filters');
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewingJob || !reviewingJob.acceptedArtisanId) {
      throw new Error('Cannot submit review: No job or artisan selected');
    }

    try {
      await submitReviewMutation.mutateAsync({
        artisanId: reviewingJob.acceptedArtisanId,
        customerId: user.id,
        jobId: reviewingJob.id,
        rating,
        comment
      });
      
      // Update the job's isReviewed status locally
      if (selectedJob && selectedJob.id === reviewingJob.id) {
        setSelectedJob({ ...selectedJob, isReviewed: true });
      }
      
      setReviewingJob(null);
      refetch();
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error; // Re-throw to let the LeaveReview component handle the error display
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-lg text-slate-600">{t('common.loading')}</div>
      </div>
    );
  }

  if (isCreatingJob) {
    return (
      <JobRequestForm
        onSubmit={handleJobSubmit}
        onCancel={() => setIsCreatingJob(false)}
      />
    );
  }

  if (selectedJob) {
    return (
      <>
        <JobStatusView
          jobRequest={selectedJob}
          onBack={() => { setSelectedJob(null); setReviewingJob(null); }}
          onRefreshJob={() => refetch()}
          onReview={(job) => setReviewingJob(job)}
        />
        {/* Show review modal when reviewingJob is set */}
        {reviewingJob && artisanForReview && (
          <LeaveReview
            job={reviewingJob}
            artisan={artisanForReview}
            onSubmit={handleReviewSubmit}
            onClose={() => setReviewingJob(null)}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('customer.dashboard.title')}</h1>
          <p className="text-slate-600">Welcome back, {user.name}!</p>
          {isConnected && (
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
              ● Live updates enabled
            </span>
          )}
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 border border-gray-300 text-slate-700 rounded-md hover:bg-gray-50"
          >
            {showSearch ? 'Hide Search' : 'Advanced Search'}
          </button>
          <button
            onClick={() => setIsCreatingJob(true)}
            className="bg-cyan-500 text-white px-4 py-2 rounded-md hover:bg-cyan-600 transition-colors"
          >
            {t('customer.createJob')}
          </button>
        </div>
      </div>

      {showSearch && (
        <AdvancedSearch
          onSearch={handleSearchFilters}
          onReset={handleResetSearch}
          isLoading={false}
        />
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-slate-800">{t('customer.myJobs')}</h2>
        </div>
        
        <div className="p-6">
          {jobRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No job requests yet. Create your first job!</p>
              <button
                onClick={() => setIsCreatingJob(true)}
                className="bg-cyan-500 text-white px-6 py-2 rounded-md hover:bg-cyan-600 transition-colors"
              >
                {t('customer.createJob')}
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {jobRequests.map((job) => (
                <div
                  key={job.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => { setReviewingJob(null); setSelectedJob(job); }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-slate-800">{job.category}</h3>
                      <p className="text-sm text-slate-600 mt-1">{job.description}</p>
                      <div className="flex items-center mt-2 space-x-4">
                        <span className="text-sm text-slate-500">📍 {job.location}</span>
                        <span className="text-sm font-medium text-cyan-600">{job.proposedPrice} MAD</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        job.status === JobStatus.Open ? 'bg-yellow-100 text-yellow-800' :
                        job.status === JobStatus.InProgress ? 'bg-blue-100 text-blue-800' :
                        job.status === JobStatus.Completed ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status}
                      </span>
                      {job.bids && job.bids.length > 0 && (
                        <p className="text-xs text-slate-500 mt-1">
                          {job.bids.length} bid{job.bids.length !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
