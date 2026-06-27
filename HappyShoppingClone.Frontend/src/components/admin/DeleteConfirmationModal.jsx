import { X, Trash2 } from 'lucide-react';

const DeleteConfirmationModal = ({ 
  show, 
  onClose, 
  onConfirm, 
  deleteTarget 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                <Trash2 size={20} sm:size={24} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Confirm Delete</h3>
                <p className="text-red-100 text-xs sm:text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
            >
              <X size={18} sm:size={20} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 md:p-6 space-y-4">
          {/* Warning Message */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-red-800">You are about to delete:</p>
                <p className="text-red-700 font-medium mt-1">
                  {deleteTarget.type === 'category' && `Category: "${deleteTarget.name}"`}
                  {deleteTarget.type === 'subcategory' && `SubCategory: "${deleteTarget.name}"`}
                  {deleteTarget.type === 'product' && `Product: "${deleteTarget.name}"`}
                  {deleteTarget.type === 'vendor' && `Vendor: "${deleteTarget.name}"`}
                  {deleteTarget.type === 'user' && `User: "${deleteTarget.name}"`}
                </p>
              </div>
            </div>
          </div>

          {/* Consequence Message */}
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium text-gray-800">This will permanently delete the {deleteTarget.type}.</p>
            <p className="text-gray-500">Are you sure you want to continue?</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
