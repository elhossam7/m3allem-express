
import React, { useState, useEffect } from 'react';
import { ToastMessage } from '../../types';
import Icon from '../Icon';

interface ToastProps extends Omit<ToastMessage, 'id'> {
  onClose: () => void;
}

const toastDetails = {
  success: {
    icon: 'check-circle' as const,
    bgClass: 'bg-green-500',
    iconClass: 'text-green-500',
  },
  error: {
    icon: 'x-circle' as const,
    bgClass: 'bg-red-500',
    iconClass: 'text-red-500',
  },
  info: {
    icon: 'information-circle' as const,
    bgClass: 'bg-blue-500',
    iconClass: 'text-blue-500',
  },
};

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    setIsVisible(true);

    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for animation to finish before calling onClose
    setTimeout(() => {
      onClose();
    }, 400); 
  };
  
  const details = toastDetails[type];

  return (
      <div
        role="alert"
        className={`
            flex items-start w-full max-w-sm p-4 text-slate-800 bg-white rounded-lg shadow-lg relative overflow-hidden
            transition-all duration-300 ease-in-out
            ${isVisible && !isExiting ? 'transform translate-x-0 opacity-100' : 'transform translate-x-full opacity-0'}
        `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${details.bgClass}`}></div>
      <div className={`flex-shrink-0 ml-3 ${details.iconClass}`}>
        <Icon name={details.icon} className="h-6 w-6" />
      </div>
      <div className="ml-3 mr-6 w-0 flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={handleClose}
        aria-label="Close"
        className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <Icon name="x-mark" className="h-5 w-5" />
      </button>
    </div>
  );
};

export default Toast;
