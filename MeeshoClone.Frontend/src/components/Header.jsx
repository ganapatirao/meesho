import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, Heart, Download, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { siteConfigAPI } from '../services/api';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [config, setConfig] = useState({
    siteName: 'Meesho',
    header: {
      backgroundColor: 'from-pink-500 to-purple-600',
      textColor: 'white',
      showSearch: true,
      showCart: true,
      showWishlist: true,
      showDownloadApp: true,
      showBecomeSupplier: true,
    },
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await siteConfigAPI.getConfiguration();
      if (response.data.success) {
        setConfig(response.data.configuration);
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/shopping?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleMobileSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.location.href = `/shopping?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleSearchButtonClick = () => {
    if (searchQuery.trim()) {
      window.location.href = `/shopping?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className={`bg-gradient-to-r ${config.header?.backgroundColor || 'from-pink-500 to-purple-600'} sticky top-0 z-50 shadow-lg`}>
      <div className="container mx-auto px-4">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between py-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${config.header?.textColor || 'text-white'} p-2`}
          >
            <Menu size={24} />
          </button>
          <h1 className={`text-xl font-bold ${config.header?.textColor || 'text-white'}`}>{config.siteName || 'Meesho'}</h1>
          <div className="flex items-center gap-3">
            {config.header?.showSearch && (
              <button 
                onClick={() => {
                  const searchInput = document.querySelector('.mobile-search-input');
                  if (searchInput) {
                    searchInput.focus();
                  } else {
                    handleSearchButtonClick();
                  }
                }}
                className={`${config.header?.textColor || 'text-white'} p-2`}
              >
                <Search size={22} />
              </button>
            )}
            {config.header?.showCart && (
              <a href="/cart" className={`${config.header?.textColor || 'text-white'} p-2 relative`}>
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </a>
            )}
            {!isAuthenticated && (
              <a href="/login" className={`${config.header?.textColor || 'text-white'} p-2`}>
                <User size={22} />
              </a>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <h1 className={`text-2xl font-bold ${config.header?.textColor || 'text-white'}`}>{config.siteName || 'Meesho'}</h1>
            {config.header?.showSearch && (
              <div className="relative w-96">
                <input
                  type="text"
                  placeholder="Search for products, brands and more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                  className="w-full px-4 py-2 pl-10 pr-12 rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <button
                  onClick={handleSearchButtonClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-1 rounded hover:bg-purple-700 transition-colors"
                >
                  <Search size={16} />
                </button>
              </div>
            )}
          </div>

          <nav className="flex items-center gap-6">
            {config.header?.showDownloadApp && (
              <a href="#" className={`${config.header?.textColor || 'text-white'} hover:text-pink-200 transition-colors flex items-center gap-2`}>
                <Download size={18} />
                <span>Download App</span>
              </a>
            )}
            {config.header?.showBecomeSupplier && (
              <a href="#" className={`${config.header?.textColor || 'text-white'} hover:text-pink-200 transition-colors`}>
                Become a Supplier
              </a>
            )}
            {config.header?.showWishlist && (
              <a href="/dashboard?tab=wishlist" className={`${config.header?.textColor || 'text-white'} p-2`}>
                <Heart size={22} />
              </a>
            )}
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {isAdmin ? (
                  <a href="/admin" className={`${config.header?.textColor || 'text-white'} p-2`}>
                    <User size={22} />
                  </a>
                ) : (
                  <a href="/dashboard" className={`${config.header?.textColor || 'text-white'} p-2`}>
                    <User size={22} />
                  </a>
                )}
                {user?.isPremier && (
                  <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ Premier
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    logout();
                    window.location.href = '/';
                  }}
                  className={`${config.header?.textColor || 'text-white'} p-2`}
                >
                  <LogOut size={22} />
                </button>
              </div>
            ) : (
              <a href="/login" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-100 transition-colors">
                Login
              </a>
            )}
            {config.header?.showCart && (
              <a href="/cart" className={`${config.header?.textColor || 'text-white'} p-2 relative`}>
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </a>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white rounded-lg mt-2 p-4 shadow-lg">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mobile-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleMobileSearch}
              />
              <button
                onClick={handleSearchButtonClick}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Search
              </button>
              {isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-800">{user?.fullName || 'User'}</span>
                      <p className="text-xs text-gray-600">{user?.email || ''}</p>
                      {user?.isPremier && (
                        <span className="inline-block mt-1 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-xs font-semibold">
                          ⭐ Premier
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin ? (
                    <a href="/admin" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                      <User size={18} />
                      <span>Admin Dashboard</span>
                    </a>
                  ) : (
                    <a href="/dashboard" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                      <User size={18} />
                      <span>My Dashboard</span>
                    </a>
                  )}
                  {!isAdmin && (
                    <>
                      <a href="/dashboard?tab=orders" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                        <ShoppingBag size={18} />
                        <span>My Orders</span>
                      </a>
                      <a href="/dashboard?tab=wishlist" className="flex items-center gap-2 text-gray-700 hover:text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-50">
                        <Heart size={18} />
                        <span>Wishlist</span>
                      </a>
                    </>
                  )}
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      setMobileMenuOpen(false);
                      window.location.href = '/';
                    }}
                    className="flex items-center gap-2 text-red-600 font-semibold py-2 px-3 rounded-lg hover:bg-red-50"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <a href="/login" className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold">
                  Login / Register
                </a>
              )}
              <a href="#" className="text-gray-700 hover:text-purple-600">Download App</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Become a Supplier</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">Wishlist</a>
              <a href="#" className="text-gray-700 hover:text-purple-600">My Orders</a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
