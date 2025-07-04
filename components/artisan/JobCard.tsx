
import React, { useState } from 'react';
import { JobRequest } from '../../types';
import Icon from '../Icon';
import { placeBid } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface JobCardProps {
  jobRequest: JobRequest;
  artisanId: string;
  onBidPlaced: (updatedJob: JobRequest) => void;
}

const JobCard: React.FC<JobCardProps> = ({ jobRequest, artisanId, onBidPlaced }) => {
  const [showCounterOffer, setShowCounterOffer] = useState(false);
  const [counterAmount, setCounterAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handlePlaceBid = async (amount: number, message: string) => {
    setIsLoading(true);
    try {
        const updatedJob = await placeBid(jobRequest.id, artisanId, amount);
        addToast(message, 'success');
        setShowCounterOffer(false);
        onBidPlaced(updatedJob);
    } catch(error) {
        addToast((error as Error).message || "Could not place bid.", "error");
    } finally {
        setIsLoading(false);
    }
  }

  const handleAcceptPrice = () => {
    handlePlaceBid(jobRequest.proposedPrice, `You accepted the price of ${jobRequest.proposedPrice} MAD. Customer notified.`);
  };

  const handlePlaceCounterOffer = () => {
    if (!counterAmount || Number(counterAmount) <= 0) {
        addToast("Please enter a valid amount.", "error");
        return;
    }
    handlePlaceBid(Number(counterAmount), `Counter-offer of ${counterAmount} MAD sent to customer.`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform transform hover:-translate-y-1">
      <div>
        {jobRequest.imageUrl && <img src={jobRequest.imageUrl} alt="Job" className="rounded-lg h-40 w-full object-cover mb-4" />}
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-cyan-600 bg-cyan-200">
          {jobRequest.category}
        </span>
        <div className="mt-2 flex items-center text-sm text-slate-500">
            <Icon name="location" className="h-4 w-4 mr-1"/>
            <span>{jobRequest.location}</span>
        </div>
        <p className="mt-2 text-slate-600 line-clamp-3">{jobRequest.description}</p>
        <div className="mt-4 bg-slate-50 p-3 rounded-lg text-center">
            <p className="text-sm text-slate-500">Customer's Proposed Price</p>
            <p className="text-2xl font-bold text-slate-800">{jobRequest.proposedPrice} <span className="text-lg font-normal">MAD</span></p>
        </div>
      </div>
      
      {showCounterOffer ? (
        <div className="mt-4 space-y-2">
            <input 
                type="number"
                placeholder="Your price in MAD"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="w-full border rounded-md p-2 focus:ring-cyan-500 focus:border-cyan-500"
                disabled={isLoading}
            />
            <button onClick={handlePlaceCounterOffer} disabled={isLoading} className="w-full bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition disabled:bg-slate-300 flex justify-center items-center h-[42px]">
                {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Submit Offer'}
            </button>
             <button onClick={() => setShowCounterOffer(false)} className="w-full text-sm text-slate-500 hover:text-slate-700 disabled:opacity-50" disabled={isLoading}>
                Cancel
            </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col space-y-2">
            <button onClick={handleAcceptPrice} disabled={isLoading} className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition disabled:bg-slate-300 flex justify-center items-center h-[42px]">
            {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Accept Price'}
            </button>
            <button onClick={() => setShowCounterOffer(true)} disabled={isLoading} className="w-full bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition disabled:opacity-50">
            Make Counter-Offer
            </button>
        </div>
      )}
    </div>
  );
};

export default JobCard;
