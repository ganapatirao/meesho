import { X, Plus, Edit, FolderOpen, Image as ImageIcon, Sparkles, Hash, AlignLeft, Layers, Star, CheckCircle2, Folder } from 'lucide-react';

const SubCategoryModal = ({ 
  show, 
  onClose, 
  onSave, 
  editingSubCategory, 
  subCategoryForm, 
  setSubCategoryForm, 
  categories,
  handleImageDrop,
  handleImageUpload,
  handleRemoveImage,
  validationErrors,
  subCategoryValidationRules,
  onFieldValidate
}) => {
  if (!show) return null;

  const validateField = (fieldName, value) => {
    if (!subCategoryValidationRules) return null;
    
    const rules = subCategoryValidationRules[fieldName];
    if (!rules) return null;

    let error = null;

    if (rules.Required && (!value || value.trim() === '')) {
      error = rules.ErrorMessage || `${fieldName} is required`;
    } else if (value) {
      if (rules.MinLength && value.length < rules.MinLength) {
        error = rules.ErrorMessage || `${fieldName} must be at least ${rules.MinLength} characters`;
      }
      if (rules.MaxLength && value.length > rules.MaxLength) {
        error = rules.ErrorMessage || `${fieldName} cannot exceed ${rules.MaxLength} characters`;
      }
      if (rules.Regex && !new RegExp(rules.Regex).test(value)) {
        error = rules.ErrorMessage || `${fieldName} format is invalid`;
      }
    }

    return error;
  };

  const handleFieldBlur = (fieldName, value) => {
    const error = validateField(fieldName, value);
    if (onFieldValidate) {
      onFieldValidate(fieldName, error);
    }
  };

  const handleFieldChange = (fieldName, value) => {
    setSubCategoryForm({ ...subCategoryForm, [fieldName]: value });
    // Clear error when user starts typing
    if (validationErrors[fieldName] && onFieldValidate) {
      onFieldValidate(fieldName, null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300 mx-2 sm:mx-0 border border-slate-200/50">
        {/* Header with gradient */}
        <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-4 sm:p-6 rounded-t-3xl relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-lg">
                <FolderOpen size={24} sm:size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {editingSubCategory ? 'Edit SubCategory' : 'Add SubCategory'}
                </h3>
                <p className="text-violet-100 text-sm sm:text-base mt-1">
                  {editingSubCategory ? 'Update subcategory details' : 'Create a new subcategory'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl backdrop-blur-sm transition-all hover:scale-110"
            >
              <X size={20} sm:size={24} className="text-white" />
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
          {/* Parent Category Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Folder size={16} className="text-violet-600" />
              Parent Category
            </label>
            <div className="relative">
              <select
                value={subCategoryForm.categoryId}
                onChange={(e) => handleFieldChange('categoryId', e.target.value)}
                onBlur={(e) => handleFieldBlur('categoryId', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm sm:text-base bg-slate-50/50 appearance-none cursor-pointer ${
                  validationErrors.categoryId 
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
                    : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/20'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.displayName || category.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {validationErrors.categoryId && (
                <p className="text-red-500 text-xs mt-1">{validationErrors.categoryId}</p>
              )}
            </div>
          </div>

          {/* Two-column layout for name and display name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Hash size={16} className="text-violet-600" />
                SubCategory Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subCategoryForm.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  onBlur={(e) => handleFieldBlur('name', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm sm:text-base bg-slate-50/50 ${
                    validationErrors.name 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                  placeholder="e.g., men-clothing"
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                )}
              </div>
            </div>

            {/* Display Name Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Sparkles size={16} className="text-violet-600" />
                Display Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subCategoryForm.displayName}
                  onChange={(e) => handleFieldChange('displayName', e.target.value)}
                  onBlur={(e) => handleFieldBlur('displayName', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm sm:text-base bg-slate-50/50 ${
                    validationErrors.displayName 
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
                      : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/20'
                  }`}
                  placeholder="e.g., Men's Clothing"
                />
                {validationErrors.displayName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.displayName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Icon and Display Order in one row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Icon Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Layers size={16} className="text-violet-600" />
                Icon (Emoji)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={subCategoryForm.icon}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, icon: e.target.value, image: '' })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all text-sm sm:text-base bg-slate-50/50 text-center text-2xl"
                  placeholder="📦"
                  maxLength={2}
                />
              </div>
            </div>

            {/* Display Order Field */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Hash size={16} className="text-violet-600" />
                Display Order
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={subCategoryForm.displayOrder}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all text-sm sm:text-base bg-slate-50/50"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <ImageIcon size={16} className="text-violet-600" />
              SubCategory Image
            </label>
            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative overflow-hidden ${
                validationErrors.image 
                  ? 'border-red-400 bg-red-50/50' 
                  : subCategoryForm.image 
                  ? 'border-violet-300 bg-violet-50/50' 
                  : subCategoryForm.icon
                  ? 'border-slate-300 bg-slate-100 cursor-not-allowed'
                  : 'border-slate-300 hover:border-violet-400 hover:bg-violet-50/30'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => !subCategoryForm.icon && handleImageDrop(e, 'subcategory')}
            >
              {subCategoryForm.image ? (
                <div className="relative inline-block">
                  <img
                    src={subCategoryForm.image}
                    alt="SubCategory preview"
                    className="max-h-48 mx-auto rounded-xl shadow-lg object-contain"
                    style={{ maxWidth: '100%' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveImage(e, 'subcategory')}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all hover:scale-110 shadow-lg z-10"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <div className={`bg-gradient-to-br w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    subCategoryForm.icon ? 'from-slate-100 to-slate-200' : 'from-violet-100 to-purple-100'
                  }`}>
                    <ImageIcon size={32} className={subCategoryForm.icon ? 'text-slate-400' : 'text-violet-600'} />
                  </div>
                  <p className={`font-medium mb-1 ${subCategoryForm.icon ? 'text-slate-500' : 'text-slate-700'}`}>
                    {subCategoryForm.icon ? 'Image disabled when icon is set' : 'Drag & drop an image here'}
                  </p>
                  <p className="text-slate-500 text-sm">or click to select a file</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => !subCategoryForm.icon && handleImageUpload(e, 'subcategory')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={!!subCategoryForm.icon}
              />
            </div>
            {validationErrors.image && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.image}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <AlignLeft size={16} className="text-violet-600" />
              Description
            </label>
            <textarea
              value={subCategoryForm.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              onBlur={(e) => handleFieldBlur('description', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all resize-none text-sm sm:text-base bg-slate-50/50 ${
                validationErrors.description 
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' 
                  : 'border-slate-200 focus:border-violet-500 focus:ring-violet-500/20'
              }`}
              rows={4}
              placeholder="Subcategory description..."
            />
            {validationErrors.description && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <label className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl cursor-pointer hover:from-amber-100 hover:to-orange-100 transition-all border-2 border-transparent hover:border-amber-300 group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={subCategoryForm.isFeatured}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, isFeatured: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-amber-500 peer-checked:to-orange-500 shadow-inner"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-600" />
                  <span className="text-sm font-semibold text-slate-700">Featured</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Show on homepage</p>
              </div>
              {subCategoryForm.isFeatured && (
                <CheckCircle2 size={20} className="text-amber-600" />
              )}
            </label>
            <label className="flex items-center gap-4 p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl cursor-pointer hover:from-emerald-100 hover:to-green-100 transition-all border-2 border-transparent hover:border-emerald-300 group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={subCategoryForm.isActive}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-500 peer-checked:to-green-500 shadow-inner"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">Active</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Visible to users</p>
              </div>
              {subCategoryForm.isActive && (
                <CheckCircle2 size={20} className="text-emerald-600" />
              )}
            </label>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 rounded-b-3xl">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 hover:border-slate-400 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <X size={18} />
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 sm:px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {editingSubCategory ? <Edit size={18} /> : <Plus size={18} />}
            {editingSubCategory ? 'Update SubCategory' : 'Create SubCategory'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubCategoryModal;
