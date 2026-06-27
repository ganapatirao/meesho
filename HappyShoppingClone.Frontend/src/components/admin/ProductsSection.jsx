import { Plus, Edit, Trash2 } from 'lucide-react';

const ProductsSection = ({ 
  products, 
  productFilter, 
  setProductFilter, 
  handleOpenProductModal, 
  handleDeleteProduct, 
  categories 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Products Management</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full">
          <button 
            onClick={() => handleOpenProductModal()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold flex items-center gap-2 text-xs sm:text-sm md:text-base justify-center"
          >
            <Plus size={16} sm:size={18} />
            <span>Add Product</span>
          </button>
          <input
            type="text"
            placeholder="Search..."
            value={productFilter.search}
            onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          <select 
            value={productFilter.category}
            onChange={(e) => setProductFilter({ ...productFilter, category: e.target.value })}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.displayName || cat.name}</option>
            ))}
          </select>
          <select 
            value={productFilter.status}
            onChange={(e) => setProductFilter({ ...productFilter, status: e.target.value })}
            className="px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="featured">Featured</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Product</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Price</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Stock</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Category</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
              <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter(product => {
                const matchesSearch = product.name?.toLowerCase().includes(productFilter.search.toLowerCase()) || 
                                    product.description?.toLowerCase().includes(productFilter.search.toLowerCase());
                const category = categories.find(c => c.id === product.categoryId);
                const categoryName = category?.name || category?.displayName || '';
                const matchesCategory = productFilter.category === '' || categoryName === productFilter.category;
                const matchesStatus = productFilter.status === '' || 
                                    (productFilter.status === 'active' && product.isActive) ||
                                    (productFilter.status === 'inactive' && !product.isActive) ||
                                    (productFilter.status === 'featured' && product.isFeatured) ||
                                    (productFilter.status === 'trending' && product.isTrending);
                return matchesSearch && matchesCategory && matchesStatus;
              })
              .map(product => {
                const category = categories.find(c => c.id === product.categoryId);
                const categoryName = category?.displayName || category?.name || 'Unknown';
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img 
                          src={product.imageBase64?.[0] || product.imageUrls?.[0] || 'https://via.placeholder.com/50'} 
                          alt={product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">{product.name}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{categoryName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <p className="font-semibold text-xs sm:text-sm md:text-base">₹{product.price?.toLocaleString()}</p>
                      <p className="text-xs sm:text-sm text-gray-600 line-through">₹{product.originalPrice?.toLocaleString()}</p>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <p className="font-semibold text-xs sm:text-sm md:text-base">{product.stock}</p>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <p className="text-gray-700 text-xs sm:text-sm md:text-base">{categoryName}</p>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                          product.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {product.isFeatured && (
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                            Featured
                          </span>
                        )}
                        {product.isTrending && (
                          <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                            Trending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 sm:py-3 px-2 sm:px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenProductModal(product)}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} sm:size={18} className="text-blue-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product)}
                          className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} sm:size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No products found. Click "Add Product" to create one.
          </div>
        )}
      </div>
      <p className="mt-4 text-sm text-gray-500">Showing {products.length} products</p>
    </div>
  );
};

export default ProductsSection;
