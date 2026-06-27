import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ 
  show, 
  onClose, 
  message, 
  type = 'success', 
  duration = 3000 
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const Icon = icons[type] || CheckCircle;

  const styles = {
    success: 'bg-gradient-to-r from-emerald-600 to-green-600 border-emerald-400',
    error: 'bg-gradient-to-r from-red-600 to-orange-600 border-red-400',
    info: 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${styles[type]} border-2 rounded-xl shadow-2xl p-4 min-w-[300px] max-w-md flex items-start gap-3`}>
        <Icon size={20} className="text-white flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-white font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
