import { useState, useEffect } from 'react';
import { productAPI, seedAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Sparkles, TrendingUp, Star, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isPremier } = useAuth();

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      if (response.data.success) {
        const productsData = response.data.products;
        setProducts(productsData);
        setAllProducts(productsData);
      }
    } catch (error) {
      console.error('Error loading products:', error);
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
      console.error('Error loading categories:', error);
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory(null);
      setProducts(allProducts);
    } else {
      setSelectedCategory(categoryName);
      const filtered = allProducts.filter(p => p.category === categoryName);
      setProducts(filtered);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      const response = await seedAPI.seedDatabase();
      if (response.data.success) {
        alert('Database seeded successfully!');
        loadProducts();
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  };

  const featuredProducts = products.filter(p => p.isFeatured);
  const trendingProducts = products.filter(p => p.isTrending);
  const premierProducts = products.filter(p => p.isPremierExclusive);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Welcome to Meesho Clone</h1>
            <p className="text-lg md:text-xl mb-6 opacity-90">Your one-stop shop for everything you need</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleSeedDatabase}
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-100 transition-colors shadow-lg"
              >
                Seed Database
              </button>
              <a href="/shopping" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors text-center">
                Shop Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section - Mobile Horizontal Scroll */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        {selectedCategory && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-purple-600 font-semibold">Filtered by: {selectedCategory}</span>
            <button onClick={() => handleCategoryClick(selectedCategory)} className="text-red-500 hover:text-red-700 text-sm">Clear Filter</button>
          </div>
        )}
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-6 md:overflow-visible md:pb-0 md:snap-none">
          {categories.slice(0, 12).map((category) => (
            <div 
              key={category.id} 
              onClick={() => handleCategoryClick(category.name)}
              className={`flex-shrink-0 w-24 md:w-auto rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all cursor-pointer snap-start ${
                selectedCategory === category.name ? 'bg-purple-600 text-white' : 'bg-white'
              }`}
            >
              <div className="text-3xl md:text-4xl mb-2">{category.icon || '📦'}</div>
              <p className="text-xs md:text-sm font-semibold">{category.displayName || category.name}</p>
            </div>
          ))}
        </div>
        
        {/* Subcategories Section */}
        {selectedCategory && (
          <div className="mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Subcategories</h3>
            <div className="flex flex-wrap gap-2">
              {[...new Set(products.filter(p => p.category === selectedCategory).map(p => p.subCategory))].map((subCategory) => (
                <button
                  key={subCategory}
                  className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold hover:bg-purple-200 transition-colors"
                >
                  {subCategory}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Premier Section */}
      {isPremier && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles size={32} className="text-white" />
                <h2 className="text-2xl font-bold text-white">Premier Exclusive Deals</h2>
              </div>
              <span className="bg-white text-orange-600 px-4 py-2 rounded-full font-bold text-sm">
                ⭐ Your Benefits
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {premierProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products - Mobile Horizontal Scroll */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>
          <a href="/shopping" className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold">
            View All <ArrowRight size={16} />
          </a>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:pb-0 md:snap-none">
          {featuredProducts.slice(0, 10).map((product) => (
            <div key={product.id} className="flex-shrink-0 w-44 md:w-auto snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Trending Products - Mobile Horizontal Scroll */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={24} className="text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-800">Trending Now</h2>
          </div>
          <a href="/shopping" className="text-purple-600 hover:text-purple-700 flex items-center gap-1 font-semibold">
            View All <ArrowRight size={16} />
          </a>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-4 lg:grid-cols-5 md:overflow-visible md:pb-0 md:snap-none">
          {trendingProducts.slice(0, 10).map((product) => (
            <div key={product.id} className="flex-shrink-0 w-44 md:w-auto snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* Premier Benefits Banner */}
      {!isPremier && (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 shadow-xl text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Upgrade to Premier Membership</h3>
                <p className="opacity-90">Get exclusive deals, free shipping, and priority support</p>
              </div>
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-pink-100 transition-colors shadow-lg whitespace-nowrap">
                Upgrade Now ⭐
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trust Badges */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">🚚</div>
            <h4 className="font-semibold text-gray-800">Free Delivery</h4>
            <p className="text-sm text-gray-600">On orders above ₹499</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">💯</div>
            <h4 className="font-semibold text-gray-800">7 Day Returns</h4>
            <p className="text-sm text-gray-600">Easy return policy</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">🔒</div>
            <h4 className="font-semibold text-gray-800">Secure Payment</h4>
            <p className="text-sm text-gray-600">100% secure checkout</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center shadow-md">
            <div className="text-3xl mb-2">💬</div>
            <h4 className="font-semibold text-gray-800">24/7 Support</h4>
            <p className="text-sm text-gray-600">Dedicated support team</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
