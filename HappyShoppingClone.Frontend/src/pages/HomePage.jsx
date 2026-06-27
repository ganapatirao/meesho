import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productAPI, categoryAPI, siteConfigAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../context/AuthContext';
import { Sparkles, TrendingUp, Star, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteConfig, setSiteConfig] = useState({
    site: {
      name: 'HappyShopping Clone',
      description: 'Your one-stop shop for everything you need',
      heroImageBase64: '',
      slideshowImages: [],
      enableSlideshow: false
    }
  });
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const { user, isPremier } = useAuth();

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadSiteConfiguration();
  }, []);

  const loadSiteConfiguration = async () => {
    try {
      const response = await siteConfigAPI.getConfiguration();
      if (response.data.success) {
        setSiteConfig(response.data.configuration);
      }
    } catch (error) {
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll();
      if (response.data.success) {
        const productsData = response.data.products;
        setProducts(productsData);
        setAllProducts(productsData);
      }
    } catch (error) {
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
  const handleCategoryClick = (categoryId) => {
    navigate(`/shopping?categoryId=${encodeURIComponent(categoryId)}`);
  };


  const nextSlide = () => {
    if (siteConfig.site?.slideshowImages?.length > 0) {
      setCurrentSlideIndex((prev) => (prev + 1) % siteConfig.site.slideshowImages.length);
    }
  };

  const prevSlide = () => {
    if (siteConfig.site?.slideshowImages?.length > 0) {
      setCurrentSlideIndex((prev) => (prev - 1 + siteConfig.site.slideshowImages.length) % siteConfig.site.slideshowImages.length);
    }
  };

  useEffect(() => {
    if (siteConfig.site?.enableSlideshow && siteConfig.site?.slideshowImages?.length > 0) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [siteConfig.site?.enableSlideshow, siteConfig.site?.slideshowImages]);

  const featuredProducts = allProducts.filter(p => p.isFeatured);
  const trendingProducts = allProducts.filter(p => p.isTrending);
  const premierProducts = allProducts.filter(p => p.isPremierExclusive);

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
      {siteConfig.site?.enableSlideshow && siteConfig.site?.slideshowImages?.length > 0 ? (
        <div className="relative">
          <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
            {siteConfig.site.slideshowImages.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentSlideIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white px-4 w-full max-w-2xl">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">{siteConfig.site?.name || 'HappyShopping Clone'}</h1>
                    <p className="text-lg md:text-xl mb-6 opacity-90">{siteConfig.site?.description || 'Your one-stop shop for everything you need'}</p>
                    <a href="/shopping" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-100 transition-colors shadow-lg inline-block">
                      Shop Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transition-all"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {siteConfig.site.slideshowImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlideIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlideIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : siteConfig.site?.heroImageBase64 ? (
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          <img
            src={siteConfig.site.heroImageBase64}
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="text-center text-white px-4 w-full max-w-2xl">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{siteConfig.site?.name || 'HappyShopping Clone'}</h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">{siteConfig.site?.description || 'Your one-stop shop for everything you need'}</p>
              <a href="/shopping" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-100 transition-colors shadow-lg inline-block">
                Shop Now
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center w-full max-w-2xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">{siteConfig.site?.name || 'Welcome to HappyShopping Clone'}</h1>
              <p className="text-lg md:text-xl mb-6 opacity-90">{siteConfig.site?.description || 'Your one-stop shop for everything you need'}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/shopping" className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-pink-100 transition-colors shadow-lg text-center">
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Section - Mobile Horizontal Scroll */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-6 md:overflow-visible md:pb-0 md:snap-none">
          {categories.slice(0, 12).map((category) => (
            <div 
              key={category.id} 
              onClick={() => handleCategoryClick(category.id)}
              className="flex-shrink-0 w-24 md:w-auto rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all cursor-pointer snap-start bg-white hover:bg-purple-50"
            >
              {category.image ? (
                <img src={category.image} alt={category.displayName || category.name} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg mx-auto mb-2" />
              ) : (
                <div className="text-3xl md:text-4xl mb-2">{category.icon || '📦'}</div>
              )}
              <p className="text-xs md:text-sm font-semibold">{category.displayName || category.name}</p>
            </div>
          ))}
        </div>
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
