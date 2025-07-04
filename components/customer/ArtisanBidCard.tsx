
import React, { useState } from 'react';
import { Artisan, Bid, Customer, JobRequest } from '../../types';
import Rating from '../shared/Rating';
import Icon from '../Icon';
import ChatWindow from '../shared/ChatWindow';

interface ArtisanBidCardProps {
  job: JobRequest;
  bid: Bid;
  artisan: Artisan;
  customer: Customer;
  onAccept: (bid: Bid, artisan: Artisan) => void;
  onViewProfile: (artisan: Artisan) => void;
  onChatClosed: () => void;
}

const ArtisanBidCard: React.FC<ArtisanBidCardProps> = ({ job, bid, artisan, customer, onAccept, onViewProfile, onChatClosed }) => {
  const [isChatting, setIsChatting] = useState(false);

  const handleCloseChat = () => {
    setIsChatting(false);
    onChatClosed();
  }

  return (
    <>
    {isChatting && <ChatWindow job={job} customer={customer} artisan={artisan} onClose={handleCloseChat} />}
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between transition-transform transform hover:-translate-y-1">
      <div>
        <button onClick={() => onViewProfile(artisan)} className="w-full text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg p-1 -m-1">
          <div className="flex items-center space-x-4">
            <img src={artisan.avatarUrl} alt={artisan.name} className="h-16 w-16 rounded-full object-cover" />
            <div>
              <h4 className="font-bold text-lg text-slate-800 hover:text-cyan-600 transition-colors">{artisan.name}</h4>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <Rating rating={artisan.rating} />
                <span>({artisan.jobsCompleted})</span>
              </div>
              {artisan.isVerified && (
                <div className="flex items-center space-x-1 mt-1 text-cyan-600 text-xs font-semibold">
                  <Icon name="check-verified" className="h-4 w-4" />
                  <span>CIN Vérifiée</span>
                </div>
              )}
            </div>
          </div>
        </button>
        <div className="mt-4 bg-slate-50 p-3 rounded-lg text-center">
            <p className="text-sm text-slate-500">Artisan's Offer</p>
            <p className="text-2xl font-bold text-slate-800">{bid.amount} <span className="text-lg font-normal">MAD</span></p>
        </div>
      </div>
      <div className="mt-4 flex flex-col space-y-2">
        <button
          onClick={() => onAccept(bid, artisan)}
          className="w-full bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition duration-300"
        >
          Accept Offer
        </button>
        <button
          onClick={() => setIsChatting(true)}
          className="w-full bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition duration-300"
        >
          Chat with Artisan
        </button>
      </div>
    </div>
    </>
  );
};

export default ArtisanBidCard;
