import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI, categoryAPI, subCategoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, X, ChevronDown, Star, Minus, Plus } from 'lucide-react';

const ShoppingPage = () => {
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    subcategories: true,
    price: true,
    rating: true,
    sort: true
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSubCategories();
  }, [category, search]);

  useEffect(() => {
    if (products.length > 0) {
      const prices = products.map(p => p.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setMinPrice(Math.floor(min));
      setMaxPrice(Math.ceil(max));
      setPriceRange([Math.floor(min), Math.ceil(max)]);
    }
  }, [products]);

  useEffect(() => {
    // Pre-select filters from URL params
    const categoryId = searchParams.get('categoryId');
    const subcategoryId = searchParams.get('subcategoryId');
    
    if (categoryId) {
      setSelectedCategories([categoryId]);
    }
    if (subcategoryId) {
      setSelectedSubCategories([subcategoryId]);
    }
  }, [searchParams]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let response;
      
      // Load all products and let filters handle the filtering
      response = await productAPI.getAll();
      
      if (response.data.success) {
        let products = response.data.products || [];
        
        // Apply search filtering client-side for comprehensive search
        if (search && search.trim()) {
          const searchLower = search.toLowerCase().trim();
          products = products.filter(product => {
            return (
              product.name?.toLowerCase().includes(searchLower) ||
              product.category?.toLowerCase().includes(searchLower) ||
              product.subCategory?.toLowerCase().includes(searchLower) ||
              product.brand?.toLowerCase().includes(searchLower) ||
              product.description?.toLowerCase().includes(searchLower) ||
              product.tags?.some(tag => tag.toLowerCase().includes(searchLower))
            );
          });
        }
        
        setProducts(products);
      } else {
        setProducts([]);
      }
    } catch (error) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      if (response.data.success) {
        setCategories(response.data.categories);
      }
    } catch (error) {
    }
  };

  const loadSubCategories = async () => {
    try {
      const response = await subCategoryAPI.getAll();
      if (response.data.success) {
        setSubCategories(response.data.subCategories);
      }
    } catch (error) {
    }
  };

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
    // Clear subcategories when category changes
    setSelectedSubCategories([]);
  };

  const toggleSubCategory = (subCatId) => {
    setSelectedSubCategories(prev =>
      prev.includes(subCatId) ? prev.filter(c => c !== subCatId) : [...prev, subCatId]
    );
  };

  const getSubCategoriesForCategories = () => {
    if (selectedCategories.length === 0) {
      return subCategories;
    }
    return subCategories.filter(sc => selectedCategories.includes(sc.categoryId));
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.categoryId)) {
      return false;
    }
    if (selectedSubCategories.length > 0 && !selectedSubCategories.includes(product.subCategoryId)) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    if (selectedRating > 0 && (product.rating || 0) < selectedRating) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low': return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating': return (b.rating || 0) - (a.rating || 0);
      case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
      default: return (b.isFeatured === a.isFeatured) ? 0 : b.isFeatured ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Mobile Filter Button */}
      <div className="md:hidden sticky top-16 z-40 bg-white shadow-md p-4">
        <button
          onClick={() => setFiltersOpen(true)}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <SlidersHorizontal size={20} />
          <span>Filters</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sticky top-20 border border-purple-100/50 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <SlidersHorizontal size={20} className="text-white" />
                </div>
                Filters
              </h3>
              
              {/* Categories Accordion */}
              <div className="mb-4 overflow-hidden rounded-2xl border border-purple-100 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <button
                  onClick={() => toggleSection('categories')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">{selectedCategories.length}</span>
                    </div>
                    <span className="font-semibold text-gray-700">Categories</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-purple-600 transition-transform duration-300 ${expandedSections.categories ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.categories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group relative">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                            className="w-6 h-6 text-purple-600 rounded-xl focus:ring-purple-500 focus:ring-2 appearance-none checked:bg-gradient-to-br checked:from-purple-500 checked:to-pink-500 checked:border-transparent transition-all duration-300 shadow-sm"
                          />
                          {selectedCategories.includes(cat.id) && (
                            <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none animate-pulse">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-700 group-hover:text-purple-600 transition-colors font-medium">{cat.displayName || cat.name}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Subcategories Accordion */}
              {getSubCategoriesForCategories().length > 0 && (
                <div className="mb-4 overflow-hidden rounded-2xl border border-pink-100 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
                  <button
                    onClick={() => toggleSection('subcategories')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-bold">{selectedSubCategories.length}</span>
                      </div>
                      <span className="font-semibold text-gray-700">Subcategories</span>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`text-pink-600 transition-transform duration-300 ${expandedSections.subcategories ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${expandedSections.subcategories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                      {getSubCategoriesForCategories().map(subCat => (
                        <label key={subCat.id} className="flex items-center gap-3 cursor-pointer group relative">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedSubCategories.includes(subCat.id)}
                              onChange={() => toggleSubCategory(subCat.id)}
                              className="w-6 h-6 text-pink-600 rounded-xl focus:ring-pink-500 focus:ring-2 appearance-none checked:bg-gradient-to-br checked:from-pink-500 checked:to-rose-500 checked:border-transparent transition-all duration-300 shadow-sm"
                            />
                            {selectedSubCategories.includes(subCat.id) && (
                              <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none animate-pulse">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-gray-700 group-hover:text-pink-600 transition-colors font-medium">{subCat.displayName || subCat.name}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Price Range Accordion */}
              <div className="mb-4 overflow-hidden rounded-2xl border border-blue-100 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">₹</span>
                    </div>
                    <span className="font-semibold text-gray-700">Price Range</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-blue-600 transition-transform duration-300 ${expandedSections.price ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.price ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 relative">
                        <label className="text-xs text-gray-500 mb-1 block font-medium">Min Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setPriceRange([Math.min(val, priceRange[1] - 1), priceRange[1]]);
                            }}
                            min={minPrice}
                            max={maxPrice}
                            className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-gradient-to-br from-white to-gray-50 shadow-sm transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        <label className="text-xs text-gray-500 mb-1 block font-medium">Max Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || maxPrice;
                              setPriceRange([priceRange[0], Math.max(val, priceRange[0] + 1)]);
                            }}
                            min={minPrice}
                            max={maxPrice}
                            className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-gradient-to-br from-white to-gray-50 shadow-sm transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative pt-4 pb-2">
                      <div className="h-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full relative">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 animate-pulse"
                          style={{
                            left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-4 z-10"
                        style={{ pointerEvents: 'none' }}
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-4"
                      />
                      <div className="flex justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md animate-bounce"></div>
                          <span className="text-xs text-gray-500 font-medium">₹{minPrice}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-medium">₹{maxPrice}</span>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rating Accordion */}
              <div className="mb-4 overflow-hidden rounded-2xl border border-yellow-100 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                <button
                  onClick={() => toggleSection('rating')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">{selectedRating > 0 ? selectedRating : '★'}</span>
                    </div>
                    <span className="font-semibold text-gray-700">Customer Rating</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-yellow-600 transition-transform duration-300 ${expandedSections.rating ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.rating ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 border-2 group ${
                          selectedRating === rating
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 text-yellow-700 font-semibold shadow-lg shadow-yellow-500/20 transform scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-300 hover:scale-102'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < rating ? 'fill-yellow-500 text-yellow-500 drop-shadow-sm animate-spin-slow' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{rating} & up</span>
                      </button>
                    ))}
                    {selectedRating > 0 && (
                      <button
                        onClick={() => setSelectedRating(0)}
                        className="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium py-2 hover:bg-red-50 rounded-lg transition-colors animate-pulse"
                      >
                        Clear Rating
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sort By Accordion */}
              <div className="overflow-hidden rounded-2xl border border-green-100 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
                <button
                  onClick={() => toggleSection('sort')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">↕</span>
                    </div>
                    <span className="font-semibold text-gray-700">Sort By</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-green-600 transition-transform duration-300 ${expandedSections.sort ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.sort ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-gradient-to-br from-white to-gray-50 font-medium text-gray-700 shadow-sm"
                    >
                      <option value="featured">⭐ Featured</option>
                      <option value="price-low">💰 Price: Low to High</option>
                      <option value="price-high">💎 Price: High to Low</option>
                      <option value="rating">⭐ Top Rated</option>
                      <option value="newest">🆕 Newest First</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {category ? category : search ? `Search: "${search}"` : 'All Products'}
                </h1>
                <p className="text-gray-600">{filteredProducts.length} products found</p>
              </div>
              
              {/* Mobile Sort */}
              <div className="md:hidden">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setFiltersOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                  <SlidersHorizontal size={16} className="text-white" />
                </div>
                Filters
              </h3>
              <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={24} className="text-gray-600" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* Mobile Categories Accordion */}
              <div className="overflow-hidden rounded-2xl border border-purple-100 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                <button
                  onClick={() => toggleSection('categories')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">{selectedCategories.length}</span>
                    </div>
                    <span className="font-semibold text-gray-700">Categories</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-purple-600 transition-transform duration-300 ${expandedSections.categories ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.categories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                    {categories.map(cat => (
                      <label key={cat.id} className="flex items-center gap-3 cursor-pointer group relative">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                            className="w-6 h-6 text-purple-600 rounded-xl focus:ring-purple-500 focus:ring-2 appearance-none checked:bg-gradient-to-br checked:from-purple-500 checked:to-pink-500 checked:border-transparent transition-all duration-300 shadow-sm"
                          />
                          {selectedCategories.includes(cat.id) && (
                            <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none animate-pulse">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className="text-gray-700 group-hover:text-purple-600 transition-colors font-medium">{cat.displayName || cat.name}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Subcategories Accordion */}
              {getSubCategoriesForCategories().length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-pink-100 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10">
                  <button
                    onClick={() => toggleSection('subcategories')}
                    className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white text-sm font-bold">{selectedSubCategories.length}</span>
                      </div>
                      <span className="font-semibold text-gray-700">Subcategories</span>
                    </div>
                    <ChevronDown 
                      size={20} 
                      className={`text-pink-600 transition-transform duration-300 ${expandedSections.subcategories ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${expandedSections.subcategories ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
                      {getSubCategoriesForCategories().map(subCat => (
                        <label key={subCat.id} className="flex items-center gap-3 cursor-pointer group relative">
                          <div className="relative">
                            <input
                              type="checkbox"
                              checked={selectedSubCategories.includes(subCat.id)}
                              onChange={() => toggleSubCategory(subCat.id)}
                              className="w-6 h-6 text-pink-600 rounded-xl focus:ring-pink-500 focus:ring-2 appearance-none checked:bg-gradient-to-br checked:from-pink-500 checked:to-rose-500 checked:border-transparent transition-all duration-300 shadow-sm"
                            />
                            {selectedSubCategories.includes(subCat.id) && (
                              <div className="absolute inset-0 flex items-center justify-center text-white pointer-events-none animate-pulse">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <span className="text-gray-700 group-hover:text-pink-600 transition-colors font-medium">{subCat.displayName || subCat.name}</span>
                          <div className="absolute inset-0 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Price Range Accordion */}
              <div className="overflow-hidden rounded-2xl border border-blue-100 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">₹</span>
                    </div>
                    <span className="font-semibold text-gray-700">Price Range</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-blue-600 transition-transform duration-300 ${expandedSections.price ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.price ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 relative">
                        <label className="text-xs text-gray-500 mb-1 block font-medium">Min Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setPriceRange([Math.min(val, priceRange[1] - 1), priceRange[1]]);
                            }}
                            min={minPrice}
                            max={maxPrice}
                            className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-gradient-to-br from-white to-gray-50 shadow-sm transition-all duration-300"
                          />
                        </div>
                      </div>
                      <div className="flex-1 relative">
                        <label className="text-xs text-gray-500 mb-1 block font-medium">Max Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || maxPrice;
                              setPriceRange([priceRange[0], Math.max(val, priceRange[0] + 1)]);
                            }}
                            min={minPrice}
                            max={maxPrice}
                            className="w-full pl-8 pr-3 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold bg-gradient-to-br from-white to-gray-50 shadow-sm transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="relative pt-4 pb-2">
                      <div className="h-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full relative">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-300 animate-pulse"
                          style={{
                            left: `${((priceRange[0] - minPrice) / (maxPrice - minPrice)) * 100}%`,
                            right: `${100 - ((priceRange[1] - minPrice) / (maxPrice - minPrice)) * 100}%`
                          }}
                        ></div>
                      </div>
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                        className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-4 z-10"
                        style={{ pointerEvents: 'none' }}
                      />
                      <input
                        type="range"
                        min={minPrice}
                        max={maxPrice}
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer absolute top-4"
                      />
                      <div className="flex justify-between mt-3">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md animate-bounce"></div>
                          <span className="text-xs text-gray-500 font-medium">₹{minPrice}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-500 font-medium">₹{maxPrice}</span>
                          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 shadow-md animate-bounce"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Rating Accordion */}
              <div className="overflow-hidden rounded-2xl border border-yellow-100 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/10">
                <button
                  onClick={() => toggleSection('rating')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
                      <span className="text-white text-sm font-bold">{selectedRating > 0 ? selectedRating : '★'}</span>
                    </div>
                    <span className="font-semibold text-gray-700">Customer Rating</span>
                  </div>
                  <ChevronDown 
                    size={20} 
                    className={`text-yellow-600 transition-transform duration-300 ${expandedSections.rating ? 'rotate-180' : ''}`} 
                  />
                </button>
                <div className={`transition-all duration-300 ease-in-out ${expandedSections.rating ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-300 border-2 group ${
                          selectedRating === rating
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 text-yellow-700 font-semibold shadow-lg shadow-yellow-500/20 transform scale-105'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 hover:border-yellow-300 hover:scale-102'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < rating ? 'fill-yellow-500 text-yellow-500 drop-shadow-sm' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{rating} & up</span>
                      </button>
                    ))}
                    {selectedRating > 0 && (
                      <button
                        onClick={() => setSelectedRating(0)}
                        className="w-full text-center text-sm text-red-600 hover:text-red-700 font-medium py-2 hover:bg-red-50 rounded-lg transition-colors animate-pulse"
                      >
                        Clear Rating
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all transform hover:scale-105"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingPage;
