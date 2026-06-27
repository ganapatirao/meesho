import { useState, useEffect } from 'react';
import { Search, ShoppingBag, User, Menu, Heart, Download, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { siteConfigAPI } from '../services/api';
import SearchAutocomplete from './SearchAutocomplete';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const [config, setConfig] = useState({
    site: {
      name: 'HappyShopping Clone',
      description: 'Your one-stop shop for everything you need'
    },
    header: {
      logoBase64: '',
      logoText: 'HappyShopping',
      backgroundColor: '#EC4899',
      backgroundColorEnd: '#8B5CF6',
      textColor: '#FFFFFF',
      showSearchIcon: false,
      showLoginIcon: false,
      customIcons: [],
      logoBrandingOrder: 1,
      searchSettingsOrder: 2,
      customIconsOrder: 4
    }
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
    <header className={`sticky top-0 z-50 shadow-xl backdrop-blur-md bg-opacity-95`} style={{ background: `linear-gradient(to right, ${config.header?.backgroundColor || '#EC4899'}, ${config.header?.backgroundColorEnd || '#8B5CF6'})` }}>
      <div className="container mx-auto px-4">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between py-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`${config.header?.textColor || '#FFFFFF'} p-2 rounded-lg hover:bg-white/10 transition-all`}
            style={{ color: config.header?.textColor || '#FFFFFF' }}
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            {config.header?.logoBase64 && (
              <img src={config.header.logoBase64} alt={config.site?.name || 'HappyShopping'} className="h-10 object-contain" />
            )}
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: config.header?.textColor || '#FFFFFF' }}>{config.header?.logoText || config.site?.name || 'HappyShopping'}</h1>
          </div>
          <div className="flex items-center gap-2">
            {config.header?.showSearchIcon && (
              <button 
                onClick={() => setMobileSearchOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-all"
                style={{ color: config.header?.textColor || '#FFFFFF' }}
              >
                <Search size={20} />
              </button>
            )}
            {config.header?.showLoginIcon && (
              <a href={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'} className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: config.header?.textColor || '#FFFFFF' }}>
                <User size={20} />
              </a>
            )}
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between py-4">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              {config.header?.logoBase64 && (
                <img src={config.header.logoBase64} alt={config.site?.name || 'HappyShopping'} className="h-12 object-contain" />
              )}
              <h1 className="text-3xl font-bold tracking-tight" style={{ color: config.header?.textColor || '#FFFFFF' }}>{config.header?.logoText || config.site?.name || 'HappyShopping'}</h1>
            </div>
            {config.header?.showSearchIcon && (
              <div className="relative w-[450px]">
                <SearchAutocomplete onSearch={handleSearchButtonClick} />
              </div>
            )}
          </div>

          <nav className="flex items-center gap-4">
            {config.header?.showLoginIcon && (
              isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <a href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: config.header?.textColor || '#FFFFFF' }}>
                      <User size={22} />
                    </a>
                  ) : (
                    <a href="/dashboard" className="p-2 rounded-lg hover:bg-white/10 transition-all" style={{ color: config.header?.textColor || '#FFFFFF' }}>
                      <User size={22} />
                    </a>
                  )}
                  {user?.isPremier && (
                    <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Premier
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      logout();
                      window.location.href = '/';
                    }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-all"
                    style={{ color: config.header?.textColor || '#FFFFFF' }}
                  >
                    <LogOut size={22} />
                  </button>
                </div>
              ) : (
                <a href="/login" className="bg-white text-purple-600 px-6 py-2.5 rounded-xl font-bold hover:bg-pink-100 transition-all shadow-lg hover:shadow-xl">
                  Login
                </a>
              )
            )}
          </nav>
        </div>

        {/* Mobile Search Overlay */}
        {mobileSearchOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white rounded-xl mt-2 p-4 shadow-2xl z-50 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Search size={18} className="text-white" />
                </div>
                <span className="font-bold text-gray-800 text-lg">Search</span>
              </div>
              <button 
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <SearchAutocomplete onSearch={handleSearchButtonClick} />
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white rounded-lg mt-2 p-4 shadow-lg">
            <div className="flex flex-col gap-4">
              
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
