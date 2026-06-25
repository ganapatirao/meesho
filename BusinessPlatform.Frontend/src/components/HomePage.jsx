import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Briefcase, Calendar, Plane, Star, MapPin, ArrowRight, Sparkles, TrendingUp, Users, Zap, ChevronLeft, ChevronRight, Phone, Mail, MapPin as MapPinIcon } from 'lucide-react';
import { shoppingApi, advertisingApi, recruitmentApi, bookingApi, adminApi, publicApi } from '../services/api';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [transports, setTransports] = useState([]);
  const [packages, setPackages] = useState([]);
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [adsByCategory, setAdsByCategory] = useState({});
  const [jobsByType, setJobsByType] = useState({});
  const [transportsByType, setTransportsByType] = useState({});
  const [packagesByDestination, setPackagesByDestination] = useState({});
  const [moviesByGenre, setMoviesByGenre] = useState({});
  const [stats, setStats] = useState({ products: 0, users: 0, support: '24/7' });
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };


  const groupByCategory = (items, categoryField) => {
    const grouped = {};
    items.forEach(item => {
      const category = item[categoryField] || 'Other';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, adsRes, jobsRes, transportsRes, packagesRes, moviesRes, categoriesRes, contactRes] = await Promise.all([
        shoppingApi.getProducts(),
        advertisingApi.getAds(),
        recruitmentApi.getJobs(),
        bookingApi.getTransports(),
        bookingApi.getPackages(),
        bookingApi.getMovies(),
        shoppingApi.getCategories(),
        publicApi.getContact()
      ]);

      // Set basic data
      setProducts(productsRes.data.filter(p => p.status === 'Active').sort((a, b) => {
        const seqA = a.displaySequence === 0 || a.displaySequence === undefined ? Number.MAX_SAFE_INTEGER : a.displaySequence;
        const seqB = b.displaySequence === 0 || b.displaySequence === undefined ? Number.MAX_SAFE_INTEGER : b.displaySequence;
        return seqA - seqB;
      }).slice(0, 4));
      setAds(adsRes.data.filter(a => a.status === 'Active').slice(0, 4));
      setJobs(jobsRes.data.filter(j => j.status === 'Active').slice(0, 4));
      setTransports(transportsRes.data.filter(t => t.status === 'Active').slice(0, 3));
      setPackages(packagesRes.data.filter(p => p.status === 'Active').slice(0, 3));
      setMovies(moviesRes.data.filter(m => m.status === 'Active').slice(0, 4));

      // Set categories
      setCategories(categoriesRes.data.filter(c => c.status === 'Active'));

      // Set stats from products data (no auth required)
      setStats({
        products: productsRes.data.filter(p => p.status === 'Active').length,
        users: 1500, // Hardcoded for now
        support: '24/7'
      });

      // Set contact details
      if (contactRes.data) {
        setContact(contactRes.data);
        // Update support hours from contact if available
        if (contactRes.data.supportHours) {
          setStats(prev => ({ ...prev, support: contactRes.data.supportHours }));
        }
      }

      // Group data by category/type for horizontal scrolling
      const activeProducts = productsRes.data.filter(p => p.status === 'Active');
      const productCategories = categoriesRes.data.filter(c => c.status === 'Active');
      
      console.log('Active Products:', activeProducts.length);
      console.log('Product Categories:', productCategories.length);
      if (activeProducts.length > 0) {
        console.log('Sample Product:', activeProducts[0]);
      }
      if (productCategories.length > 0) {
        console.log('Sample Category:', productCategories[0]);
      }
      
      // Simplified: Show all items in one section per business type
      // Quadruple items for seamless infinite scrolling with more buffer
      const productsList = activeProducts.slice(0, 25);
      const adsList = adsRes.data.filter(a => a.status === 'Active').slice(0, 25);
      const jobsList = jobsRes.data.filter(j => j.status === 'Active').slice(0, 25);
      const transportsList = transportsRes.data.filter(t => t.status === 'Active').slice(0, 25);
      const packagesList = packagesRes.data.filter(p => p.status === 'Active').slice(0, 25);
      const moviesList = moviesRes.data.filter(m => m.status === 'Active').slice(0, 25);

      setProductsByCategory({ 'Products': [...productsList, ...productsList, ...productsList, ...productsList] });
      setAdsByCategory({ 'Ads': [...adsList, ...adsList, ...adsList, ...adsList] });
      setJobsByType({ 'Jobs': [...jobsList, ...jobsList, ...jobsList, ...jobsList] });
      setTransportsByType({ 'Transports': [...transportsList, ...transportsList, ...transportsList, ...transportsList] });
      setPackagesByDestination({ 'Packages': [...packagesList, ...packagesList, ...packagesList, ...packagesList] });
      setMoviesByGenre({ 'Movies': [...moviesList, ...moviesList, ...moviesList, ...moviesList] });

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 py-16 sm:py-20 md:py-28 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="text-yellow-300 w-6 h-6 sm:w-8 sm:h-8 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="text-yellow-300 text-sm sm:text-base font-medium tracking-wider uppercase">Premium Platform</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              Welcome to <span className="bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">OneApp</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-8 sm:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
              Your all-in-one platform for shopping, advertising, recruitment, and booking needs
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
              <Link to="/shopping" className="group bg-white text-purple-700 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                <span>Start Shopping</span>
              </Link>
              <Link to="/advertising" className="group bg-purple-500/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:bg-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2 text-sm sm:text-base">
                <Briefcase size={18} className="group-hover:scale-110 transition-transform" />
                <span>Post an Ad</span>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mt-12 sm:mt-16">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white">
                  <TrendingUp className="w-5 h-5 text-yellow-300" />
                  <span className="text-2xl sm:text-3xl font-bold">{stats.products > 0 ? `${(stats.products / 1000).toFixed(0)}K+` : '10K+'}</span>
                </div>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">Products</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white">
                  <Users className="w-5 h-5 text-pink-300" />
                  <span className="text-2xl sm:text-3xl font-bold">{stats.users > 0 ? `${(stats.users / 1000).toFixed(0)}K+` : '5K+'}</span>
                </div>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">Users</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-white">
                  <Zap className="w-5 h-5 text-blue-300" />
                  <span className="text-2xl sm:text-3xl font-bold">{stats.support}</span>
                </div>
                <p className="text-purple-200 text-xs sm:text-sm mt-1">Support</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products by Category */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-3 rounded-2xl shadow-lg">
                <ShoppingCart className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Shop by Category</h2>
                <p className="text-gray-500 mt-1 text-sm">Browse products by category</p>
              </div>
            </div>
            <Link to="/shopping" className="group bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
              View All <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {Object.entries(productsByCategory).map(([category, categoryProducts]) => (
            <div key={category} className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {categoryProducts.map((product) => (
                  <Link
                    key={product.id}
                    to="/shopping"
                    className="flex-shrink-0 w-44 sm:w-52 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {product.offerPercentage > 0 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          {product.offerPercentage}% OFF
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-full bg-white text-purple-600 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors shadow-lg">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem]">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{formatPrice(product.price)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({product.rating || 4.5})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          ))}

          {Object.keys(productsByCategory).length === 0 && products.length > 0 && (
            <div className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    to="/shopping"
                    className="flex-shrink-0 w-44 sm:w-52 bg-white border-2 border-gray-100 rounded-2xl hover:border-purple-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {product.offerPercentage > 0 && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          {product.offerPercentage}% OFF
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="w-full bg-white text-purple-600 py-2 rounded-lg font-semibold text-sm hover:bg-purple-50 transition-colors shadow-lg">
                          Quick View
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[2.5rem]">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">{formatPrice(product.price)}</p>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < Math.floor(product.rating || 4) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-1">({product.rating || 4.5})</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Ads by Category */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-2xl shadow-lg">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Browse Ads by Category</h2>
                <p className="text-gray-500 mt-1 text-sm">Find what you're looking for</p>
              </div>
            </div>
            <Link to="/advertising" className="group bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
              View All <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {Object.entries(adsByCategory).map(([category, categoryAds]) => (
            <div key={category} className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {categoryAds.slice(0, 6).map((ad) => (
                  <Link
                    key={ad.id}
                    to="/advertising"
                    className="flex-shrink-0 w-44 sm:w-52 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {ad.isFeatured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Star size={10} className="fill-current" /> Featured
                        </div>
                      )}
                      {ad.isUrgent && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          Urgent
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2.5rem]">{ad.title}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500 line-clamp-1">{ad.location}</span>
                      </div>
                      <p className="text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{formatPrice(ad.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          ))}

          {Object.keys(adsByCategory).length === 0 && ads.length > 0 && (
            <div className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {ads.map((ad) => (
                  <Link
                    key={ad.id}
                    to="/advertising"
                    className="flex-shrink-0 w-44 sm:w-52 bg-white border-2 border-gray-100 rounded-2xl hover:border-orange-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={ad.imageUrl} 
                        alt={ad.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      {ad.isFeatured && (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                          <Star size={10} className="fill-current" /> Featured
                        </div>
                      )}
                      {ad.isUrgent && (
                        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
                          Urgent
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[2.5rem]">{ad.title}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-500 line-clamp-1">{ad.location}</span>
                      </div>
                      <p className="text-lg font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">{formatPrice(ad.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Jobs by Type */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-green-500 to-teal-500 p-3 rounded-2xl shadow-lg">
                <Briefcase className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">Jobs by Type</h2>
                <p className="text-gray-500 mt-1 text-sm">Discover your next career opportunity</p>
              </div>
            </div>
            <Link to="/recruitment" className="group bg-gradient-to-r from-green-500 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
              View All <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {Object.entries(jobsByType).map(([type, typeJobs]) => (
            <div key={type} className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {typeJobs.slice(0, 6).map((job) => (
                  <Link
                    key={job.id}
                    to="/recruitment"
                    className="flex-shrink-0 w-72 bg-white border-2 border-gray-100 rounded-2xl hover:border-green-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2 p-5"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {job.company.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-green-600 transition-colors">{job.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-gradient-to-r from-green-100 to-teal-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">{job.type}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold">{job.location}</span>
                    </div>
                    <p className="text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">{job.salary}</p>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          ))}

          {Object.keys(jobsByType).length === 0 && jobs.length > 0 && (
            <div className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {jobs.map((job) => (
                  <Link
                    key={job.id}
                    to="/recruitment"
                    className="flex-shrink-0 w-72 bg-white border-2 border-gray-100 rounded-2xl hover:border-green-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2 p-5"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {job.company.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-green-600 transition-colors">{job.title}</h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{job.company}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-gradient-to-r from-green-100 to-teal-100 text-green-700 px-3 py-1.5 rounded-full font-semibold">{job.type}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full font-semibold">{job.location}</span>
                    </div>
                    <p className="text-lg font-bold bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">{job.salary}</p>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Transport Options by Type */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-2xl shadow-lg">
                <Calendar className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Transport by Type</h2>
                <p className="text-gray-500 mt-1 text-sm">Travel with comfort and style</p>
              </div>
            </div>
            <Link to="/booking" className="group bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
              View All <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {Object.entries(transportsByType).map(([type, typeTransports]) => (
            <div key={type} className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {typeTransports.slice(0, 6).map((transport) => (
                  <Link
                    key={transport.id}
                    to="/booking"
                    className="flex-shrink-0 w-80 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2 p-5"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">{transport.name}</h3>
                        <p className="text-sm text-gray-500">{transport.type}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3">
                      <span className="text-gray-700 text-sm font-semibold">{transport.source}</span>
                      <ArrowRight size={16} className="text-blue-400" />
                      <span className="text-gray-700 text-sm font-semibold">{transport.destination}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{formatPrice(transport.price)}</p>
                      <p className="text-xs text-gray-500">{transport.duration}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          ))}

          {Object.keys(transportsByType).length === 0 && transports.length > 0 && (
            <div className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {transports.map((transport) => (
                  <Link
                    key={transport.id}
                    to="/booking"
                    className="flex-shrink-0 w-80 bg-white border-2 border-gray-100 rounded-2xl hover:border-blue-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2 p-5"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                        <Calendar size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-blue-600 transition-colors">{transport.name}</h3>
                        <p className="text-sm text-gray-500">{transport.type}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3">
                      <span className="text-gray-700 text-sm font-semibold">{transport.source}</span>
                      <ArrowRight size={16} className="text-blue-400" />
                      <span className="text-gray-700 text-sm font-semibold">{transport.destination}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-lg font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">{formatPrice(transport.price)}</p>
                      <p className="text-xs text-gray-500">{transport.duration}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Travel Packages by Destination */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-2xl shadow-lg">
                <Plane className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">Packages by Destination</h2>
                <p className="text-gray-500 mt-1 text-sm">Explore amazing destinations</p>
              </div>
            </div>
            <Link to="/booking" className="group bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
              View All <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {Object.entries(packagesByDestination).map(([destination, destPackages]) => (
            <div key={destination} className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {destPackages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    to="/booking"
                    className="flex-shrink-0 w-72 bg-white border-2 border-gray-100 rounded-2xl hover:border-pink-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={pkg.imageUrl} 
                        alt={pkg.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <Plane size={16} className="text-pink-500" />
                        <h3 className="font-bold text-gray-900 ml-2 text-sm line-clamp-1 group-hover:text-pink-600 transition-colors">{pkg.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{pkg.duration}</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">{formatPrice(pkg.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          ))}

          {Object.keys(packagesByDestination).length === 0 && packages.length > 0 && (
            <div className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {packages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    to="/booking"
                    className="flex-shrink-0 w-72 bg-white border-2 border-gray-100 rounded-2xl hover:border-pink-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-video bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={pkg.imageUrl} 
                        alt={pkg.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-2">
                        <Plane size={16} className="text-pink-500" />
                        <h3 className="font-bold text-gray-900 ml-2 text-sm line-clamp-1 group-hover:text-pink-600 transition-colors">{pkg.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{pkg.duration}</p>
                      <p className="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">{formatPrice(pkg.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Movies by Genre */}
      <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-3 rounded-2xl shadow-lg">
                <Star className="text-white w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Movies by Genre</h2>
                <p className="text-gray-500 mt-1 text-sm">Catch the latest blockbusters</p>
              </div>
            </div>
            <Link to="/booking" className="group bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center">
              View All <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {Object.entries(moviesByGenre).map(([genre, genreMovies]) => (
            <div key={genre} className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {genreMovies.slice(0, 6).map((movie) => (
                  <Link
                    key={movie.id}
                    to="/booking"
                    className="flex-shrink-0 w-40 sm:w-44 bg-white border-2 border-gray-100 rounded-2xl hover:border-red-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={movie.imageUrl} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Star size={10} className="fill-current" /> {movie.rating}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 text-sm line-clamp-2 group-hover:text-red-600 transition-colors min-h-[2.5rem]">{movie.title}</h3>
                      <p className="text-xs text-gray-500">{movie.genre} • {movie.language}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          ))}

          {Object.keys(moviesByGenre).length === 0 && movies.length > 0 && (
            <div className="mb-10 sm:mb-12">
              <div className="infinite-scroll-wrapper">
                <div className="infinite-scroll-container pb-6">
                {movies.map((movie) => (
                  <Link
                    key={movie.id}
                    to="/booking"
                    className="flex-shrink-0 w-40 sm:w-44 bg-white border-2 border-gray-100 rounded-2xl hover:border-red-300 hover:shadow-2xl transition-all duration-300 overflow-hidden group block transform hover:-translate-y-2"
                  >
                    <div className="relative aspect-[2/3] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img 
                        src={movie.imageUrl} 
                        alt={movie.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjIwMCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                        }}
                      />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <Star size={10} className="fill-current" /> {movie.rating}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-1 text-sm line-clamp-2 group-hover:text-red-600 transition-colors min-h-[2.5rem]">{movie.title}</h3>
                      <p className="text-xs text-gray-500">{movie.genre} • {movie.language}</p>
                    </div>
                  </Link>
                ))}
              </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
