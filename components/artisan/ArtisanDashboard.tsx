
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Artisan, JobRequest, JobStatus, Customer, Notification } from '../../types';
import { getAllJobRequests, completeJob, getCustomersByIds } from '../../services/api';
import JobCard from './JobCard';
import Icon from '../Icon';
import { useToast } from '../../contexts/ToastContext';

interface ArtisanDashboardProps {
  artisan: Artisan;
  notificationLink: Notification['link'] | null;
  onLinkConsumed: () => void;
}

const ArtisanDashboard: React.FC<ArtisanDashboardProps> = ({ artisan, notificationLink, onLinkConsumed }) => {
  const [allJobs, setAllJobs] = useState<JobRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'bids' | 'inProgress' | 'completed' | 'disputed'>('available');

  const [categoryFilter] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'priceHigh'>('newest');
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // Store job ID being updated
  const { addToast } = useToast();

  const fetchJobsAndCustomers = useCallback(async () => {
    const jobs = await getAllJobRequests();
    setAllJobs(jobs);

    const relevantJobs = jobs.filter(job =>
      (job.status === JobStatus.InProgress || job.status === JobStatus.Completed || job.status === JobStatus.Disputed) &&
      job.acceptedArtisanId === artisan.id
    );

    if (relevantJobs.length > 0) {
      const customerIds = [...new Set(relevantJobs.map(job => job.customerId))];
      const fetchedCustomers = await getCustomersByIds(customerIds);
      setCustomers(fetchedCustomers);
    }
  }, [artisan.id]);

  useEffect(() => {
    fetchJobsAndCustomers();
  }, [fetchJobsAndCustomers]);
  
  useEffect(() => {
    if (notificationLink) {
        if(notificationLink.view === 'dashboard_tab' && notificationLink.tabName) {
            setActiveTab(notificationLink.tabName);
        }
        onLinkConsumed();
    }
  }, [notificationLink, onLinkConsumed]);

  const handleBidPlaced = (updatedJob: JobRequest) => {
    setAllJobs(prevJobs =>
      prevJobs.map(job => (job.id === updatedJob.id ? updatedJob : job))
    );
  };

  const handleMarkAsComplete = async (jobId: string) => {
    setIsUpdating(jobId);
    try {
        const updatedJob = await completeJob(jobId);
        setAllJobs(prevJobs => 
            prevJobs.map(job => (job.id === jobId ? updatedJob : job))
        );
        addToast("Job marked as complete!", "success");
    } catch (error) {
        console.error("Failed to mark job as complete:", error);
        addToast((error as Error).message || "Could not mark job as complete. Please try again.", "error");
    } finally {
        setIsUpdating(null);
    }
  };

  const { availableJobs, myBids, inProgressJobs, completedJobs, disputedJobs } = useMemo(() => {
    const available = allJobs.filter(job =>
      job.status === JobStatus.Open &&
      !job.bids.some(bid => bid.artisanId === artisan.id) &&
      job.category === artisan.specialization // Only show relevant jobs
    );
    const bids = allJobs.filter(job =>
      (job.status === JobStatus.Open && job.bids.some(b => b.artisanId === artisan.id)) ||
      (job.status === JobStatus.AwaitingPayment && job.acceptedArtisanId === artisan.id)
    );
    const inProgress = allJobs.filter(job =>
      job.status === JobStatus.InProgress &&
      job.acceptedArtisanId === artisan.id
    );
    const completed = allJobs.filter(job =>
        job.status === JobStatus.Completed &&
        job.acceptedArtisanId === artisan.id
    );
    const disputed = allJobs.filter(job =>
        job.status === JobStatus.Disputed &&
        job.acceptedArtisanId === artisan.id
    );
    return { availableJobs: available, myBids: bids, inProgressJobs: inProgress, completedJobs: completed, disputedJobs: disputed };
  }, [allJobs, artisan.id, artisan.specialization]);

  const filteredAndSortedJobs = useMemo(() => {
    let jobs = [...availableJobs];
    if (categoryFilter) {
      jobs = jobs.filter(job => job.category === categoryFilter);
    }
    jobs.sort((a, b) => {
      if (sortOrder === 'priceHigh') {
        return b.proposedPrice - a.proposedPrice;
      }
      return b.createdAt - a.createdAt;
    });
    return jobs;
  }, [availableJobs, categoryFilter, sortOrder]);

  const SimpleJobItem: React.FC<{ job: JobRequest; children: React.ReactNode; actions?: React.ReactNode }> = ({ job, children, actions }) => (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
      <div className="flex-grow">
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cyan-600 bg-cyan-200 mb-2">
          {job.category}
        </span>
        <p className="font-bold text-slate-800">{job.description}</p>
        <div className="mt-1 flex items-center text-sm text-slate-500">
          <Icon name="location" className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
        </div>
      </div>
      <div className="text-left sm:text-right flex-shrink-0 flex flex-col items-start sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
        <div>{children}</div>
        {actions && <div className="mt-2">{actions}</div>}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'available':
        return (
          <>
            <div className="bg-slate-50 p-4 rounded-lg mb-6 flex flex-col sm:flex-row gap-4">
               <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Category</p>
                <p className="font-semibold text-lg text-cyan-600">{artisan.specialization}</p>
              </div>
              <div className="flex-1">
                <label htmlFor="sort-order" className="block text-sm font-medium text-slate-700">Sort by</label>
                <select id="sort-order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as 'newest' | 'priceHigh')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm rounded-md">
                  <option value="newest">Newest First</option>
                  <option value="priceHigh">Price: High to Low</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedJobs.length > 0 ? (
                filteredAndSortedJobs.map(job => (
                  <JobCard key={job.id} jobRequest={job} artisanId={artisan.id} onBidPlaced={handleBidPlaced} />
                ))
              ) : (
                <div className="col-span-full text-center py-10"><p className="text-slate-500">No new job requests for your specialization. Check back later!</p></div>
              )}
            </div>
          </>
        );
      case 'bids':
        return (
          <div className="space-y-4">
            {myBids.length > 0 ? (
              myBids.map(job => {
                const myBid = job.bids.find(b => b.artisanId === artisan.id);
                return (
                  <SimpleJobItem key={job.id} job={job}>
                    <p className="text-sm text-slate-500">Customer's Price</p>
                    <p className="font-bold text-slate-700">{job.proposedPrice} MAD</p>
                    <p className="text-sm text-cyan-600 mt-2">Your Bid</p>
                    <p className="font-bold text-cyan-600">{myBid?.amount} MAD</p>
                    {job.status === JobStatus.AwaitingPayment && (
                       <div className="mt-2 text-xs font-semibold inline-flex items-center py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                           Waiting for Payment
                       </div>
                    )}
                  </SimpleJobItem>
                );
              })
            ) : (<div className="text-center py-10"><p className="text-slate-500">You haven't placed any bids on open jobs.</p></div>)}
          </div>
        );
      case 'inProgress':
        return (
          <div className="space-y-4">
            {inProgressJobs.length > 0 ? (
              inProgressJobs.map(job => {
                const customer = customers.find(c => c.id === job.customerId);
                return (
                  <div key={job.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-grow">
                          <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 mb-2">{job.category}</span>
                          <p className="font-bold text-slate-800">{job.description}</p>
                           {job.paymentStatus === 'paid' &&
                                <div className="mt-2 inline-flex items-center gap-2 text-sm text-green-700 bg-green-100 font-semibold py-1 px-3 rounded-full">
                                    <Icon name="lock-closed" className="h-4 w-4" />
                                    <span>Payment Secured</span>
                                </div>
                            }
                          {customer && (
                              <div className="mt-4 pt-4 border-t border-slate-200">
                                  <h4 className="font-semibold text-slate-600 text-sm">Customer Information</h4>
                                  <p className="text-sm text-slate-500"><strong>Name:</strong> {customer.name}</p>
                                  <p className="text-sm text-slate-500"><strong>Email:</strong> {customer.email}</p>
                                  <p className="text-sm text-slate-500"><strong>Phone:</strong> {customer.phone}</p>
                              </div>
                          )}
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                          <p className="text-sm text-slate-500">Agreed Price</p>
                          <p className="font-bold text-2xl text-green-600">{job.escrowAmount} MAD</p>
                          <div className="mt-4">
                              <button onClick={() => handleMarkAsComplete(job.id)} disabled={isUpdating === job.id} className="w-full sm:w-auto bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 shadow-sm disabled:bg-slate-300 flex items-center justify-center">
                                {isUpdating === job.id ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Mark as Complete'}
                              </button>
                          </div>
                      </div>
                  </div>
                );
              })
            ) : (<div className="text-center py-10"><p className="text-slate-500">You have no jobs currently in progress.</p></div>)}
          </div>
        );
      case 'completed':
        return (
            <div className="space-y-4">
              {completedJobs.length > 0 ? (
                completedJobs.map(job => {
                  return (
                    <SimpleJobItem key={job.id} job={job}>
                      <p className="text-sm text-slate-500">Final Price</p>
                      <p className="font-bold text-slate-700">{job.escrowAmount} MAD</p>
                       <div className="mt-2 text-xs font-semibold inline-flex items-center py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                          <Icon name="check-verified" className="h-4 w-4 mr-1" />
                          Work Completed
                       </div>
                       {job.paymentStatus === 'released' && (
                         <div className="mt-2 text-xs font-semibold inline-flex items-center py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                           <Icon name="check-circle" className="h-4 w-4 mr-1" />
                           Paid Out
                         </div>
                       )}
                    </SimpleJobItem>
                  );
                })
              ) : (<div className="text-center py-10"><p className="text-slate-500">You have no completed jobs yet.</p></div>)}
            </div>
          );
        case 'disputed':
            return (
                <div className="space-y-4">
                    {disputedJobs.length > 0 ? (
                        disputedJobs.map(job => {
                            const customer = customers.find(c => c.id === job.customerId);
                            return (
                                <div key={job.id} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200 mb-2">{job.category}</span>
                                            <p className="font-bold text-slate-800">{job.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-red-700">{job.escrowAmount} MAD</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-red-200">
                                        <h4 className="font-semibold text-red-800">Dispute Information</h4>
                                        <p className="text-sm text-slate-600 mt-1"><strong>Customer:</strong> {customer?.name || 'N/A'}</p>
                                        <blockquote className="mt-2 p-3 bg-white text-sm text-slate-700 border-l-4 border-slate-300 italic">
                                            "{job.dispute?.reason}"
                                        </blockquote>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10"><p className="text-slate-500">You have no disputed jobs.</p></div>
                    )}
                </div>
            );
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: 'available' | 'bids' | 'inProgress' | 'completed' | 'disputed'; label: string; count: number }> = ({ tabName, label, count }) => {
    const isActive = activeTab === tabName;
    const isDisputed = tabName === 'disputed';
    let activeClasses = 'bg-cyan-500 text-white shadow-md';
    let inactiveClasses = 'bg-slate-200 text-slate-600 hover:bg-slate-300';

    if (isDisputed) {
        activeClasses = 'bg-red-500 text-white shadow-md';
        inactiveClasses = 'bg-red-100 text-red-700 hover:bg-red-200';
    }

    return (
      <button onClick={() => setActiveTab(tabName)} className={`w-full text-center p-3 rounded-md transition-all font-semibold flex items-center justify-center gap-2 ${isActive ? activeClasses : inactiveClasses}`}>
        {label}
        <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${isActive ? 'bg-white ' + (isDisputed ? 'text-red-600' : 'text-cyan-600') : (isDisputed ? 'bg-red-200 text-red-800' : 'bg-slate-300 text-slate-700')}`}>{count}</span>
      </button>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Welcome back, {artisan.name}!</h2>
        <p className="text-slate-500">Here's an overview of your jobs.</p>
      </div>
      <div className="mb-6 grid grid-cols-2 md:grid-cols-5 gap-2 bg-slate-100 p-1 rounded-lg">
        <TabButton tabName="available" label="Available" count={availableJobs.length} />
        <TabButton tabName="bids" label="My Bids" count={myBids.length} />
        <TabButton tabName="inProgress" label="In Progress" count={inProgressJobs.length} />
        <TabButton tabName="completed" label="Completed" count={completedJobs.length} />
        <TabButton tabName="disputed" label="Disputed" count={disputedJobs.length} />
      </div>
      {renderContent()}
    </div>
  );
};

export default ArtisanDashboard;
