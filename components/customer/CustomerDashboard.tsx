
import React, { useState, useEffect, useCallback } from 'react';
import { Customer, JobRequest, JobStatus, Artisan, Notification } from '../../types';
import JobRequestForm from './JobRequestForm';
import JobStatusView from './JobStatusView';
import ReviewForm from './ReviewForm'; // Import new component
import { getJobRequestsForCustomer, addJobRequest as apiAddJobRequest, getArtisansByIds, addReview as apiAddReview, getJobById } from '../../services/api';

interface CustomerDashboardProps {
  user: Customer;
  notificationLink: Notification['link'] | null;
  onLinkConsumed: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ user, notificationLink, onLinkConsumed }) => {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobRequest | null>(null);
  
  // State for the review modal
  const [reviewingJob, setReviewingJob] = useState<JobRequest | null>(null);
  const [artisanForReview, setArtisanForReview] = useState<Artisan | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    const jobs = await getJobRequestsForCustomer(user.id);
    setJobRequests(jobs);
    setIsLoading(false);
  }, [user.id]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);
  
  // Effect to handle navigation from notifications
  useEffect(() => {
    const handleLink = async () => {
        if (notificationLink && notificationLink.view === 'job' && notificationLink.jobId) {
            const job = await getJobById(notificationLink.jobId);
            if (job && job.customerId === user.id) {
                setSelectedJob(job);
            }
            onLinkConsumed(); // Consume the link regardless of whether the job was found
        }
    };
    handleLink();
  }, [notificationLink, onLinkConsumed, user.id]);


  // Effect to fetch artisan details when review modal is opened
  useEffect(() => {
    const fetchArtisanForReview = async () => {
      if (reviewingJob && reviewingJob.acceptedArtisanId) {
        setArtisanForReview(null); // Clear previous artisan
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

  const handleAddJob = async (newJob: Omit<JobRequest, 'id' | 'customerId' | 'createdAt' | 'status' | 'bids' | 'chatHistory' | 'paymentStatus' | 'escrowAmount'>) => {
    await apiAddJobRequest(user.id, newJob);
    setIsCreatingJob(false);
    fetchJobs(); // Refresh the list
  };
  
  const handleReviewSubmit = async (rating: number, comment: string) => {
    if (!reviewingJob || !reviewingJob.acceptedArtisanId) return;

    await apiAddReview(
        reviewingJob.acceptedArtisanId,
        user.id,
        reviewingJob.id,
        rating,
        comment
    );
    setReviewingJob(null);
    fetchJobs(); // Refresh to hide the review button
  };
  
  const handleSelectJob = (job: JobRequest) => {
      const isClickable = (job.status === JobStatus.Open && job.bids.length > 0) || job.status === JobStatus.InProgress || job.status === JobStatus.AwaitingPayment || job.status === JobStatus.Completed || job.status === JobStatus.Disputed;
      if (isClickable) {
          setSelectedJob(job);
      }
  }

  if (isCreatingJob) {
    return <JobRequestForm onSubmit={handleAddJob} onCancel={() => setIsCreatingJob(false)} />;
  }

  if (selectedJob) {
    return <JobStatusView 
      jobRequest={selectedJob} 
      onBack={() => {
        setSelectedJob(null);
        fetchJobs(); // Re-fetch to see status updates
      }} 
      onRefreshJob={fetchJobs} 
    />;
  }

  const renderJobItem = (job: JobRequest) => {
    const isClickable = (job.status === JobStatus.Open && job.bids.length > 0) || job.status === JobStatus.InProgress || job.status === JobStatus.AwaitingPayment || job.status === JobStatus.Completed || job.status === JobStatus.Disputed;
    
    let statusColor = 'text-slate-600 bg-slate-200';
    if (job.status === JobStatus.Open) statusColor = 'text-green-600 bg-green-200';
    if (job.status === JobStatus.AwaitingPayment) statusColor = 'text-amber-600 bg-amber-200';
    if (job.status === JobStatus.InProgress) statusColor = 'text-blue-600 bg-blue-200';
    if (job.status === JobStatus.Completed) statusColor = 'text-purple-600 bg-purple-200';
    if (job.status === JobStatus.Disputed) statusColor = 'text-red-600 bg-red-200';

    
    return (
        <div 
            key={job.id} 
            onClick={() => handleSelectJob(job)} 
            className={`bg-white p-4 rounded-lg shadow transition-all duration-300 ${isClickable ? 'cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-cyan-500' : ''}`}
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-grow">
                    <span className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${statusColor}`}>
                        {job.status === JobStatus.Completed && job.isReviewed ? 'Reviewed' : job.status}
                    </span>
                    <h4 className="font-bold text-lg text-slate-800 mt-2">{job.category}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{job.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-cyan-600">{job.proposedPrice} MAD</p>
                    {job.status === JobStatus.Open && <p className="text-sm font-semibold text-slate-600 mt-1">{job.bids.length} Bid(s)</p>}
                    {job.status === JobStatus.AwaitingPayment && (
                        <p className="text-sm font-semibold text-amber-600 mt-1">Payment Required</p>
                    )}
                    {job.status === JobStatus.Disputed && (
                        <p className="text-sm font-semibold text-red-600 mt-1">Under Review</p>
                    )}
                    {job.status === JobStatus.Completed && !job.isReviewed && job.acceptedArtisanId && !job.dispute && (
                         <button
                            onClick={(e) => { e.stopPropagation(); setReviewingJob(job); }}
                            className="mt-2 bg-indigo-500 text-white font-bold py-1 px-3 rounded-lg hover:bg-indigo-600 transition duration-300 text-sm shadow"
                        >
                            Leave a Review
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
  };

  return (
    <>
      {reviewingJob && artisanForReview && (
        <ReviewForm 
            job={reviewingJob} 
            artisan={artisanForReview} 
            onCancel={() => setReviewingJob(null)} 
            onSubmit={handleReviewSubmit}
        />
      )}
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Welcome, {user.name}!</h2>
          <button
            onClick={() => setIsCreatingJob(true)}
            className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md"
          >
            Post a New Job
          </button>
        </div>

        <div>
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Your Job Requests</h3>
            {isLoading ? (
                <div className="space-y-4">
                    {/* Skeleton loaders */}
                    <div className="bg-white p-4 rounded-lg shadow h-24 animate-pulse"></div>
                    <div className="bg-white p-4 rounded-lg shadow h-24 animate-pulse"></div>
                </div>
            ) : jobRequests.length > 0 ? (
                <div className="space-y-4">
                    {jobRequests.map(renderJobItem)}
                </div>
            ) : (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <p className="text-slate-500 font-semibold">You have not posted any jobs yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Click "Post a New Job" to get started!</p>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
