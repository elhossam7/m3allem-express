
import React, { useState } from 'react';
import { JobRequest, Artisan } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import Icon from '../Icon';

interface DisputeFormProps {
    job: JobRequest;
    artisan: Artisan;
    onClose: () => void;
    onSubmit: (reason: string) => Promise<void>;
}

const DisputeForm: React.FC<DisputeFormProps> = ({ job, artisan, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reason.trim().length < 20) {
            addToast('Please provide a detailed reason for the dispute (at least 20 characters).', 'error');
            return;
        }
        setIsLoading(true);
        try {
            await onSubmit(reason);
            addToast('Dispute raised successfully. We will investigate and get back to you.', 'success');
        } catch (error) {
            addToast((error as Error).message, 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex items-center gap-4">
                            <Icon name="shield-exclamation" className="h-10 w-10 text-red-500" />
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Raise a Dispute</h2>
                                <p className="text-slate-500 mt-1">Job: <span className="font-semibold">{job.category}</span> with <span className="font-semibold">{artisan.name}</span>.</p>
                            </div>
                        </div>
                        
                        <div className="my-6">
                            <label htmlFor="reason" className="block text-sm font-medium text-slate-700">Reason for Dispute</label>
                            <textarea
                                id="reason"
                                rows={5}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                                placeholder="Please describe the issue in detail. What went wrong? What was the expected outcome?"
                                required
                            />
                            <p className="text-xs text-slate-400 mt-2">Our team will review this dispute and mediate between you and the artisan.</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 flex justify-end space-x-3 rounded-b-xl">
                        <button type="button" onClick={onClose} disabled={isLoading} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition duration-300 disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading || !reason} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300 shadow-md disabled:bg-slate-300 flex items-center">
                            {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                            Submit Dispute
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DisputeForm;
