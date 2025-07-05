import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { JobRequest, Bid, Artisan, Customer, JobStatus } from '../../types';
import { getArtisansByIds, acceptBid, getJobById, raiseDispute, releasePayment } from '../../services/api';
import ArtisanBidCard from './ArtisanBidCard';
import ArtisanProfilePage from '../artisan/ArtisanProfilePage';
import PaymentModal from './PaymentModal';
import DisputeForm from './DisputeForm';
import Icon from '../Icon';
import { useToast } from '../../contexts/ToastContext';

interface JobStatusViewProps {
  jobRequest: JobRequest;
  onBack: () => void;
  onRefreshJob: () => void;
  onReview?: (job: JobRequest) => void;
}

const JobStatusView: React.FC<JobStatusViewProps> = ({ jobRequest: initialJobRequest, onBack, onRefreshJob, onReview }) => {
  const [jobRequest, setJobRequest] = useState(initialJobRequest);
  const [biddingArtisans, setBiddingArtisans] = useState<Artisan[]>([]);
  const [acceptedArtisan, setAcceptedArtisan] = useState<Artisan | null>(null);
  const [viewingArtisanProfile, setViewingArtisanProfile] = useState<Artisan | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [isDisputing, setIsDisputing] = useState(false);
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);
  
  const { addToast } = useToast();
  
  const customer = useMemo(() => ({ id: jobRequest.customerId } as Customer), [jobRequest.customerId]);

  const refreshJob = useCallback(async () => {
    const freshJob = await getJobById(jobRequest.id);
    if (freshJob) {
      setJobRequest(freshJob);
    }
    onRefreshJob();
  }, [jobRequest.id, onRefreshJob]);

  useEffect(() => {
    const fetchArtisans = async () => {
      let artisanIds: string[] = [];
      if (jobRequest.bids.length > 0) {
        artisanIds.push(...jobRequest.bids.map(bid => bid.artisanId));
      }
      if (jobRequest.acceptedArtisanId) {
        artisanIds.push(jobRequest.acceptedArtisanId);
      }

      if (artisanIds.length === 0) return;
      
      const uniqueIds = [...new Set(artisanIds)];
      const fetchedArtisans = await getArtisansByIds(uniqueIds);
      
      setBiddingArtisans(fetchedArtisans.filter(a => jobRequest.bids.some(b => b.artisanId === a.id)));
      
      if (jobRequest.acceptedArtisanId) {
        setAcceptedArtisan(fetchedArtisans.find(a => a.id === jobRequest.acceptedArtisanId) || null);
      }
    };
    fetchArtisans();
  }, [jobRequest]);

  const handleAcceptBid = async (bid: Bid, artisan: Artisan) => {
    try {
      const updatedJob = await acceptBid(jobRequest.id, bid.id);
      addToast(`Offer from ${artisan.name} accepted. Please proceed to payment.`, 'success');
      
      setJobRequest(updatedJob);
      setAcceptedArtisan(artisan);
      setIsPaying(true);

    } catch (error) {
      console.error("Failed to accept bid:", error);
      addToast((error as Error).message || "There was an error accepting the bid.", "error");
    }
  };
  
  const handlePaymentSuccess = () => {
    setIsPaying(false);
    addToast('Payment successful! The artisan has been notified to start the work.', 'success');
    onBack();
  };

  const handleDisputeSubmit = async (reason: string) => {
    const updatedJob = await raiseDispute(jobRequest.id, reason);
    setJobRequest(updatedJob);
    setIsDisputing(false);
  };

  const handleReleasePayment = async () => {
    setIsReleasingPayment(true);
    try {
      const updatedJob = await releasePayment(jobRequest.id);
      setJobRequest(updatedJob);
      addToast('Payment released to artisan!', 'success');
      refreshJob();
    } catch (error: any) {
      addToast(error.message || 'Failed to release payment', 'error');
    } finally {
      setIsReleasingPayment(false);
    }
  };

  if (viewingArtisanProfile) {
    return (
      <ArtisanProfilePage 
        artisan={viewingArtisanProfile} 
        onBack={() => setViewingArtisanProfile(null)} 
      />
    );
  }

  const renderContent = () => {
    if (jobRequest.status === JobStatus.Disputed) {
      return (
        <div className="text-center py-10 bg-red-50 rounded-lg shadow border border-red-200">
          <Icon name="shield-exclamation" className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-red-800">Job Disputed</h3>
          <div className="max-w-xl mx-auto">
            <p className="text-red-700 mt-4">You raised a dispute for this job for the following reason:</p>
            <blockquote className="mt-2 text-red-600 bg-red-100 p-3 rounded-lg border-l-4 border-red-500 italic">
              "{jobRequest.dispute?.reason}"
            </blockquote>
            <p className="text-sm text-slate-500 mt-4">Our support team will review the case and contact you shortly.</p>
          </div>
        </div>
      )
    }

    if (jobRequest.status === JobStatus.AwaitingPayment && acceptedArtisan) {
      return (
        <div className="text-center py-10 bg-amber-50 rounded-lg shadow border border-amber-200">
          <Icon name="credit-card" className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-amber-800">Payment Required</h3>
          <p className="text-amber-600 mt-2">Please complete the payment of <strong>{jobRequest.escrowAmount} MAD</strong> to start the job with <strong>{acceptedArtisan.name}</strong>.</p>
          <button onClick={() => setIsPaying(true)} className="mt-6 bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md">
            Pay Now
          </button>
        </div>
      )
    }

    if ((jobRequest.status === JobStatus.InProgress || jobRequest.status === JobStatus.Completed) && acceptedArtisan) {
      return (
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Your Assigned Artisan</h3>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <img src={acceptedArtisan.avatarUrl} alt={acceptedArtisan.name} className="h-20 w-20 rounded-full object-cover"/>
              <div className="flex-grow text-center sm:text-left">
                <h4 className="text-xl font-bold text-slate-800">{acceptedArtisan.name}</h4>
                <p className="text-slate-500">{acceptedArtisan.specialization}</p>
                {jobRequest.paymentStatus === 'paid' && jobRequest.status === JobStatus.InProgress &&
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-green-700 bg-green-100 font-semibold py-1 px-3 rounded-full">
                    <Icon name="lock-closed" className="h-4 w-4" />
                    <span>Payment Secured</span>
                  </div>
                }
                {jobRequest.status === JobStatus.Completed && 
                  <div className="mt-2 inline-flex items-center gap-2 text-sm text-purple-700 bg-purple-100 font-semibold py-1 px-3 rounded-full">
                    <Icon name="check-circle" className="h-4 w-4" />
                    <span>Job Completed</span>
                  </div>
                }
              </div>
              <div className="w-full sm:w-auto text-center sm:text-right space-y-3">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-500">Agreed Price</p>
                  <p className="text-2xl font-bold text-green-600">{jobRequest.escrowAmount} <span className="text-lg font-normal">MAD</span></p>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <p><strong>Email:</strong> {acceptedArtisan.email}</p>
                  <p><strong>Phone:</strong> {acceptedArtisan.phone}</p>
                </div>
              </div>
            </div>
            {jobRequest.status === JobStatus.Completed && (
              <div className="mt-6 pt-4 border-t space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {jobRequest.paymentStatus === 'paid' && (
                    <button 
                      onClick={handleReleasePayment}
                      disabled={isReleasingPayment}
                      className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300 shadow-md flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                      {isReleasingPayment ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Icon name="check-circle" className="h-4 w-4" />
                      )}
                      {isReleasingPayment ? 'Releasing...' : 'Release Payment'}
                    </button>
                  )}
                  {jobRequest.isReviewed && (
                    <div className="flex items-center justify-center gap-2 text-green-600 bg-green-100 py-2 px-4 rounded-lg">
                      <Icon name="check-circle" className="h-4 w-4" />
                      <span className="font-semibold">Review Submitted</span>
                    </div>
                  )}
                </div>
                {/* Leave Review Button */}
                {!jobRequest.isReviewed && onReview && (
                  <div className="text-center mt-2">
                    <button
                      onClick={() => onReview(jobRequest)}
                      className="text-cyan-600 hover:text-cyan-800 font-semibold"
                    >
                      Leave a Review
                    </button>
                  </div>
                )}
                <div className="text-center">
                  <button onClick={() => setIsDisputing(true)} className="text-red-600 hover:text-red-800 font-semibold text-sm">
                    Unhappy with the result? Raise a Dispute
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }

    if (jobRequest.status === JobStatus.Open) {
      return (
        <div>
          <h3 className="text-xl font-semibold text-slate-700 mb-4">Artisan Bids ({jobRequest.bids.length})</h3>
          {jobRequest.bids.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobRequest.bids.map(bid => {
                const artisan = biddingArtisans.find(a => a.id === bid.artisanId);
                if (!artisan) return <div key={bid.id} className="bg-white rounded-lg shadow-md p-4 animate-pulse h-64"></div>;
                return (
                  <ArtisanBidCard
                    key={bid.id}
                    job={jobRequest}
                    bid={bid}
                    artisan={artisan}
                    customer={customer}
                    onAccept={handleAcceptBid}
                    onViewProfile={() => setViewingArtisanProfile(artisan)}
                    onChatClosed={refreshJob}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-slate-500 font-semibold">No bids received yet.</p>
              <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
            </div>
          )}
        </div>
      )
    }

    return null;
  }

  return (
    <>
      {isPaying && acceptedArtisan && (
        <PaymentModal
          job={jobRequest}
          artisan={acceptedArtisan}
          onClose={() => setIsPaying(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {isDisputing && acceptedArtisan && (
        <DisputeForm
          job={jobRequest}
          artisan={acceptedArtisan}
          onClose={() => setIsDisputing(false)}
          onSubmit={handleDisputeSubmit}
        />
      )}

      <div className="container mx-auto">
        <button onClick={onBack} className="mb-6 text-cyan-600 hover:text-cyan-800 font-semibold">
          &larr; Back to Dashboard
        </button>
        
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-bold text-slate-800">{jobRequest.category}</h2>
          <p className="text-slate-600 mt-2">{jobRequest.description}</p>
          {jobRequest.imageUrl && <img src={jobRequest.imageUrl} alt="Job" className="mt-4 rounded-lg max-h-80 w-full object-cover"/>}
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-slate-500 gap-2">
            <span>Your proposed price: <span className="font-bold text-slate-700">{jobRequest.proposedPrice} MAD</span></span>
            <span>Location: <span className="font-bold text-slate-700">{jobRequest.location}</span></span>
          </div>
        </div>

        <div className="mb-6">
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default JobStatusView;
