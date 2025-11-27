import React, { useEffect } from 'react';
import { CheckCircle } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgClass = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`fixed bottom-4 right-4 ${bgClass} text-white px-6 py-3 rounded-lg shadow-xl flex items-center space-x-2 animate-bounce-in z-50`}>
      {type === 'success' && <CheckCircle size={20} />}
      <span>{message}</span>
    </div>
  );
};

export default Toast;
