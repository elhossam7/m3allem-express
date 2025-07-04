import React, { useState } from 'react';
import { JobRequest, Artisan } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import { processPayment } from '../../services/api';
import Icon from '../Icon';

interface PaymentModalProps {
  job: JobRequest;
  artisan: Artisan;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ job, artisan, onClose, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation for demo purposes
    const form = e.target as HTMLFormElement;
    const cardNumber = (form.elements.namedItem('card-number') as HTMLInputElement).value;
    const expiry = (form.elements.namedItem('expiry') as HTMLInputElement).value;
    const cvv = (form.elements.namedItem('cvv') as HTMLInputElement).value;

    if (!cardNumber || !expiry || !cvv) {
      addToast('Please fill in all card details.', 'error');
      setIsLoading(false);
      return;
    }

    try {
      await processPayment(job.id);
      onPaymentSuccess();
    } catch (error) {
      addToast((error as Error).message || 'Payment failed. Please try again.', 'error');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleFormSubmit}>
          <div className="p-6">
            <div className="text-center">
              <Icon name="lock-closed" className="h-10 w-10 text-cyan-500 mx-auto mb-3" />
              <h2 className="text-2xl font-bold text-slate-800">Secure Payment</h2>
              <p className="text-slate-500 mt-1">
                You are paying <span className="font-semibold">{artisan.name}</span> for the job: <span className="font-semibold">{job.category}</span>.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6 text-center">
              <p className="text-sm text-slate-500">Amount to Pay</p>
              <p className="text-4xl font-bold text-slate-800">{job.escrowAmount} <span className="text-2xl font-normal">MAD</span></p>
              <p className="text-xs text-slate-400 mt-1">Your payment is held securely until the job is completed.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="card-number" className="block text-sm font-medium text-slate-700">Card Number</label>
                <div className="relative mt-1">
                    <input type="text" id="card-number" name="card-number" required placeholder="0000 0000 0000 0000" className="pl-10 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Icon name="credit-card" className="h-5 w-5 text-slate-400"/>
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiry" className="block text-sm font-medium text-slate-700">Expiry Date</label>
                  <input type="text" id="expiry" name="expiry" required placeholder="MM/YY" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-slate-700">CVV</label>
                  <input type="text" id="cvv" name="cvv" required placeholder="123" className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"/>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-4 flex flex-col gap-3 rounded-b-xl">
            <button type="submit" disabled={isLoading} className="w-full bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-cyan-600 transition duration-300 shadow-md disabled:bg-slate-300 flex justify-center items-center">
              {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : `Pay ${job.escrowAmount} MAD securely`}
            </button>
            <button type="button" onClick={onClose} disabled={isLoading} className="w-full text-center text-slate-500 font-semibold py-2 rounded-lg hover:text-slate-700 transition duration-300 disabled:opacity-50">
              Cancel Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;