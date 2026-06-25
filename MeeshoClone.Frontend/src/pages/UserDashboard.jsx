import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Heart, User, Settings, Package, LogOut, Truck, CreditCard } from 'lucide-react';

const UserDashboard = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">My Account</h1>
              <p className="text-purple-200">Welcome back, {user?.fullName || 'User'}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-100 transition-colors flex items-center gap-2"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-20">
              {/* User Info */}
              <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                  {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{user?.fullName || 'User'}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{user?.email || ''}</p>
                  {user?.isPremier && (
                    <span className="inline-block mt-1 bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-semibold">
                      ⭐ Premier Member
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'orders', label: 'My Orders', icon: ShoppingBag },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'addresses', label: 'Addresses', icon: Truck },
                  { id: 'payment', label: 'Payment Methods', icon: CreditCard },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <tab.icon size={18} className="sm:size-20" />
                    <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Total Orders</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">{user?.orderCount || 0}</p>
                      </div>
                      <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                        <ShoppingBag size={20} className="sm:size-24 text-blue-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Total Spent</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">₹{(user?.totalSpent || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                        <Package size={20} className="sm:size-24 text-green-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Wishlist</p>
                        <p className="text-xl sm:text-2xl font-bold text-gray-800">{user?.wishlist?.length || 0}</p>
                      </div>
                      <div className="bg-red-100 p-2 sm:p-3 rounded-full">
                        <Heart size={20} className="sm:size-24 text-red-600" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600">Membership</p>
                        <p className="text-base sm:text-lg font-bold text-gray-800">{user?.isPremier ? 'Premier' : 'Normal'}</p>
                      </div>
                      <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                        <User size={20} className="sm:size-24 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Recent Activity</h2>
                  <div className="space-y-3 sm:space-y-4">
                    {[
                      { action: 'Order #12345 placed', date: '2 hours ago', status: 'Processing' },
                      { action: 'Added 3 items to wishlist', date: '1 day ago', status: 'Completed' },
                      { action: 'Order #12344 delivered', date: '3 days ago', status: 'Delivered' },
                    ].map((activity, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                        <div>
                          <p className="font-semibold text-gray-800 text-sm sm:text-base">{activity.action}</p>
                          <p className="text-xs sm:text-sm text-gray-600">{activity.date}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit ${
                          activity.status === 'Processing' ? 'bg-yellow-100 text-yellow-700' :
                          activity.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">My Orders</h2>
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <ShoppingBag size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No orders yet</p>
                  <a href="/shopping" className="text-purple-600 hover:text-purple-800 font-semibold mt-2 inline-block text-sm sm:text-base">
                    Start Shopping
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">My Wishlist</h2>
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Heart size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">Your wishlist is empty</p>
                  <a href="/shopping" className="text-purple-600 hover:text-purple-800 font-semibold mt-2 inline-block text-sm sm:text-base">
                    Explore Products
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Saved Addresses</h2>
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <Truck size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No saved addresses</p>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold mt-2 text-sm sm:text-base">
                    Add New Address
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Payment Methods</h2>
                <div className="text-center py-8 sm:py-12 text-gray-500">
                  <CreditCard size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No payment methods saved</p>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold mt-2 text-sm sm:text-base">
                    Add Payment Method
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Account Settings</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.fullName || ''}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue={user?.phoneNumber || ''}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    />
                  </div>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base">
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
