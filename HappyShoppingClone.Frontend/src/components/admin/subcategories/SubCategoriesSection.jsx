import { FolderOpen, Search, Grid3X3, Edit2, Trash2, Star, Eye, EyeOff, Plus, Package, LayoutGrid, TrendingUp, Layers } from 'lucide-react';

const SubCategoriesSection = ({ 
  subCategories, 
  subCategoryFilter, 
  setSubCategoryFilter, 
  handleOpenSubCategoryModal, 
  handleDeleteSubCategory,
  categories,
  showToast
}) => {
  const activeCount = subCategories.filter(c => c.isActive).length;
  const featuredCount = subCategories.filter(c => c.isFeatured).length;
  
  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 rounded-3xl shadow-2xl border border-slate-200/70 p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      {/* Header Section */}
      <div className="relative mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 w-full xl:w-auto">
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-3 sm:p-4 rounded-xl shadow-xl shadow-indigo-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                <Layers size={24} sm:size={28} className="text-white relative z-10" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent">
                SubCategories Management
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm md:text-base mt-1">
                {subCategories.length} {subCategories.length === 1 ? 'subcategory' : 'subcategories'} available
              </p>
            </div>
          </div>
          <button
            onClick={() => handleOpenSubCategoryModal(null)}
            className="w-full xl:w-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-4 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 transition-all flex items-center justify-center gap-2 hover:scale-105 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
            <Plus size={18} sm:size={20} className="relative z-10" />
            <span className="text-sm sm:text-base relative z-10">Add SubCategory</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-3 md:gap-4 mb-5 sm:mb-7 relative">
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 transition-all hover:-translate-y-1 hover:border-indigo-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-2.5 sm:p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                <LayoutGrid size={16} sm:size={18} md:size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-indigo-700 bg-clip-text text-transparent">{subCategories.length}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500 font-medium">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1 hover:border-emerald-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-emerald-500 via-green-500 to-teal-500 p-2.5 sm:p-2.5 rounded-xl shadow-lg shadow-emerald-500/30">
                <Eye size={16} sm:size={18} md:size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-emerald-700 bg-clip-text text-transparent">{activeCount}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500 font-medium">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 shadow-lg hover:shadow-xl hover:shadow-amber-500/20 transition-all hover:-translate-y-1 hover:border-amber-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 p-2.5 sm:p-2.5 rounded-xl shadow-lg shadow-amber-500/30">
                <Star size={16} sm:size={18} md:size={20} className="text-white" fill="currentColor" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-amber-700 bg-clip-text text-transparent">{featuredCount}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500 font-medium">Featured</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-3 sm:p-3 md:p-4 shadow-lg hover:shadow-xl hover:shadow-slate-500/20 transition-all hover:-translate-y-1 hover:border-slate-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-500 p-2.5 sm:p-2.5 rounded-xl shadow-lg shadow-slate-500/30">
                <Package size={16} sm:size={18} md:size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-700 bg-clip-text text-transparent">{subCategories.reduce((sum, cat) => sum + (cat.productCount || 0), 0)}</p>
                <p className="text-xs sm:text-xs md:text-sm text-slate-500 font-medium">Products</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 md:gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors duration-300" size={18} sm:size={18} />
            <input
              type="text"
              placeholder="Search subcategories by name..."
              value={subCategoryFilter.search}
              onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, search: e.target.value })}
              className="relative w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm sm:text-sm md:text-base bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
            />
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <select 
              value={subCategoryFilter.categoryId}
              onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, categoryId: e.target.value })}
              className="relative w-full sm:w-auto px-4 sm:px-4 py-2.5 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm sm:text-sm md:text-base bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md cursor-pointer appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.displayName || cat.name}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <select 
              value={subCategoryFilter.status}
              onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, status: e.target.value })}
              className="relative w-full sm:w-auto px-4 sm:px-4 py-2.5 sm:py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all text-sm sm:text-sm md:text-base bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md cursor-pointer appearance-none"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* SubCategories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-2 md:gap-3 relative">
        {subCategories
          .filter(subCat => {
            const matchesSearch = subCat.displayName?.toLowerCase().includes(subCategoryFilter.search.toLowerCase()) || 
                                subCat.name?.toLowerCase().includes(subCategoryFilter.search.toLowerCase());
            const matchesCategory = subCategoryFilter.categoryId === '' || subCat.categoryId === subCategoryFilter.categoryId;
            const matchesStatus = subCategoryFilter.status === '' || 
                                (subCategoryFilter.status === 'active' && subCat.isActive) ||
                                (subCategoryFilter.status === 'inactive' && !subCat.isActive) ||
                                (subCategoryFilter.status === 'featured' && subCat.isFeatured);
            return matchesSearch && matchesCategory && matchesStatus;
          })
          .map((subCategory) => (
          <div 
            key={subCategory.id} 
            className="group bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-400 transition-all duration-300 overflow-hidden hover:-translate-y-1 relative"
          >
            {/* Card shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"></div>
            
            {/* SubCategory Image/Icon Header */}
            <div className="relative h-36 sm:h-40 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
              {/* Animated pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' viewBox=\'0 0 40 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%236366f1\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M0 0h40L0 40z\'/%3E%3C/g%3E%3C/svg%3E')]"></div>
              </div>
              {subCategory.image ? (
                <img 
                  src={subCategory.image} 
                  alt={subCategory.displayName || subCategory.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 relative z-10"
                />
              ) : (
                <span className="text-6xl sm:text-7xl text-indigo-400 group-hover:scale-110 transition-transform duration-300 relative z-10">📁</span>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Status Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-20">
                {subCategory.isFeatured && (
                  <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg shadow-amber-500/30 animate-pulse">
                    <Star size={11} fill="currentColor" />
                    Featured
                  </div>
                )}
                <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm ${subCategory.isActive ? 'bg-emerald-500/90 text-white shadow-emerald-500/30' : 'bg-slate-600/90 text-white shadow-slate-500/30'}`}>
                  {subCategory.isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                  {subCategory.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              {/* Display Order Badge */}
              <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold text-slate-700 border border-slate-200 shadow-lg z-20">
                #{subCategory.displayOrder || 0}
              </div>
            </div>

            {/* SubCategory Details */}
            <div className="p-4 sm:p-4 bg-gradient-to-b from-white to-slate-50/50">
              <div className="mb-3">
                <h3 className="font-bold text-slate-800 text-base sm:text-base mb-1.5 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {subCategory.displayName || subCategory.name}
                </h3>
                <p className="text-slate-500 text-xs sm:text-xs line-clamp-2 min-h-[2.5rem] leading-relaxed">
                  {subCategory.description || 'No description available'}
                </p>
              </div>

              {/* Category Info */}
              <div className="flex items-center gap-1.5 mb-3 text-xs text-indigo-600 bg-indigo-50 rounded-lg p-2">
                <FolderOpen size={12} />
                <span className="font-medium">{categories.find(c => c.id === subCategory.categoryId)?.displayName || 'Unknown Category'}</span>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4 text-xs sm:text-xs bg-gradient-to-r from-indigo-50/50 via-purple-50/50 to-pink-50/50 rounded-lg p-2.5 border border-indigo-100">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-1 rounded-md">
                    <Package size={11} className="text-white" />
                  </div>
                  <span className="font-semibold text-indigo-700">{subCategory.productCount || 0} products</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className="text-slate-500">ID:</span>
                  <span className="text-slate-600 font-mono text-xs bg-white px-1.5 rounded border border-slate-200">{subCategory.name}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => handleOpenSubCategoryModal(subCategory)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105"
                >
                  <Edit2 size={13} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteSubCategory(subCategory)}
                  className="flex-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/50 hover:scale-105"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {subCategories.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 lg:py-20 text-center relative">
            {/* Animated background circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-indigo-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-2xl animate-pulse delay-100"></div>
            </div>
            
            <div className="relative mb-6">
              <div className="bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-6 sm:p-8 rounded-full shadow-2xl shadow-indigo-500/20 border border-indigo-200/50">
                <FolderOpen size={48} sm:size={56} className="text-indigo-500" />
              </div>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 via-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2 relative">
              No SubCategories Found
            </h3>
            <p className="text-slate-500 text-xs sm:text-sm md:text-base mb-5 sm:mb-6 max-w-md px-4 relative">
              {subCategoryFilter.search || subCategoryFilter.categoryId || subCategoryFilter.status 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by creating your first subcategory'}
            </p>
            <button
              onClick={() => handleOpenSubCategoryModal(null)}
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/50 hover:scale-105 transition-all flex items-center gap-2 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              <Plus size={18} sm:size={20} className="relative z-10" />
              <span className="text-sm sm:text-base relative z-10">Add Your First SubCategory</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategoriesSection;
