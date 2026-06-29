import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Heart, User, Settings, Package, LogOut, Truck, CreditCard, MapPin, Edit, Plus, X, Bell, Shield, Globe } from 'lucide-react';

const UserDashboard = () => {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false
  });
  const [settingsForm, setSettingsForm] = useState({
    fullName: '',
    phoneNumber: ''
  });

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

  // Load saved addresses from localStorage
  useEffect(() => {
    if (user?.id) {
      const storedAddresses = localStorage.getItem(`savedAddresses_${user.id}`);
      if (storedAddresses) {
        setAddresses(JSON.parse(storedAddresses));
      }
      // Load wishlist from user data
      if (user.wishlist) {
        setWishlist(user.wishlist);
      }
      // Load orders from backend
      fetchOrders();
      // Load payment methods from localStorage
      const storedPaymentMethods = localStorage.getItem(`paymentMethods_${user.id}`);
      if (storedPaymentMethods) {
        setPaymentMethods(JSON.parse(storedPaymentMethods));
      }
      // Load settings form with user data
      setSettingsForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5041/api';
      const response = await fetch(`${API_BASE_URL}/order/user/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleOpenAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm(address);
    } else {
      setEditingAddress(null);
      setAddressForm({
        fullName: user?.fullName || '',
        phone: user?.phoneNumber || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      });
    }
    setShowAddressModal(true);
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setEditingAddress(null);
    setAddressForm({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
  };

  const handleSaveAddress = () => {
    let updatedAddresses;
    if (editingAddress) {
      updatedAddresses = addresses.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a);
    } else {
      updatedAddresses = [...addresses, { ...addressForm, id: Date.now().toString() }];
    }
    setAddresses(updatedAddresses);
    localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
    handleCloseAddressModal();
    alert(editingAddress ? 'Address updated successfully!' : 'Address added successfully!');
  };

  const handleDeleteAddress = (id) => {
    if (confirm('Are you sure you want to delete this address?')) {
      const updatedAddresses = addresses.filter(a => a.id !== id);
      setAddresses(updatedAddresses);
      localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
      alert('Address deleted successfully!');
    }
  };

  const handleOpenPaymentModal = () => {
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentForm({
      cardNumber: '',
      cardHolder: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false
    });
  };

  const handleSavePayment = () => {
    const updatedPaymentMethods = [...paymentMethods, { ...paymentForm, id: Date.now().toString(), last4: paymentForm.cardNumber.slice(-4) }];
    setPaymentMethods(updatedPaymentMethods);
    localStorage.setItem(`paymentMethods_${user.id}`, JSON.stringify(updatedPaymentMethods));
    handleClosePaymentModal();
    alert('Payment method added successfully!');
  };

  const handleSaveSettings = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5041/api';
      const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: settingsForm.fullName,
          phoneNumber: settingsForm.phoneNumber
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Settings updated successfully!');
        // Update user context if needed
      } else {
        alert('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    }
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 md:py-6 sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <User size={20} />}
              </button>
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">My Account</h1>
                <p className="text-purple-200 text-xs sm:text-sm">Welcome back, {user?.fullName || 'User'}!</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-purple-600 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-pink-100 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm"
            >
              <LogOut size={14} sm:size={16} md:size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Mobile Sidebar */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 pt-16">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
              <div className="relative bg-white rounded-xl shadow-lg p-4 m-2 max-w-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{user?.fullName || 'User'}</h3>
                    <p className="text-xs text-gray-600">{user?.email || ''}</p>
                  </div>
                </div>
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
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <tab.icon size={18} />
                      <span className="font-medium text-sm">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 sticky top-24">
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
                    className={`w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <tab.icon size={16} sm:size={18} md:size={20} />
                    <span className="font-medium text-xs sm:text-sm md:text-base">{tab.label}</span>
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
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 sm:p-4 md:p-6 border border-blue-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-blue-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
                        <ShoppingBag size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600">Total Orders</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{user?.orderCount || 0}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 sm:p-4 md:p-6 border border-green-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-green-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
                        <Package size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600">Total Spent</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">₹{(user?.totalSpent || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 sm:p-4 md:p-6 border border-red-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-red-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
                        <Heart size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600">Wishlist</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{wishlist.length}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3 sm:p-4 md:p-6 border border-yellow-200">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-yellow-600 p-1.5 sm:p-2 md:p-3 rounded-lg">
                        <User size={14} sm:size={16} md:size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm md:text-base text-gray-600">Membership</p>
                        <p className="text-base sm:text-lg md:text-2xl font-bold text-gray-800">{user?.isPremier ? 'Premier' : 'Normal'}</p>
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
                {orders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <ShoppingBag size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No orders yet</p>
                    <a href="/shopping" className="text-purple-600 hover:text-purple-800 font-semibold mt-2 inline-block text-sm sm:text-base">
                      Start Shopping
                    </a>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">Order #{order.id?.substring(0, 8).toUpperCase()}</p>
                            <p className="text-xs text-gray-600">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                            order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2 mb-3">
                          {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center gap-3 text-sm">
                              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ShoppingBag size={16} className="text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-800 text-xs line-clamp-1">{item.productName}</p>
                                <p className="text-xs text-gray-600">Qty: {item.quantity} | {item.color} {item.size && `| ${item.size}`}</p>
                              </div>
                              <p className="font-semibold text-purple-600 text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Total</span>
                          <span className="font-bold text-lg text-gray-900">₹{order.finalAmount?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">My Wishlist</h2>
                {wishlist.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <Heart size={40} className="sm:size-48 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">Your wishlist is empty</p>
                    <a href="/shopping" className="text-purple-600 hover:text-purple-800 font-semibold mt-2 inline-block text-sm sm:text-base">
                      Explore Products
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((productId) => (
                      <div key={productId} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          <ShoppingBag size={32} className="text-gray-400" />
                        </div>
                        <p className="font-semibold text-gray-800 text-sm mb-2">Product ID: {productId}</p>
                        <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-sm font-semibold transition-colors">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Saved Addresses</h2>
                  <button 
                    onClick={() => handleOpenAddressModal()}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1 w-full sm:w-auto justify-center"
                  >
                    <Plus size={14} sm:size={16} />
                    Add Address
                  </button>
                </div>
                {addresses.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <MapPin size={32} sm:size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No saved addresses</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} sm:size={16} className="text-purple-600" />
                            {address.isDefault && (
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">Default</span>
                            )}
                          </div>
                          <div className="flex gap-1 sm:gap-2">
                            <button 
                              onClick={() => handleOpenAddressModal(address)}
                              className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit size={14} sm:size={16} className="text-blue-600" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAddress(address.id)}
                              className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                              <X size={14} sm:size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">{address.fullName}</p>
                        <p className="text-gray-600 text-xs sm:text-sm">{address.phone}</p>
                        <p className="text-gray-700 text-xs sm:text-sm mt-2">{address.addressLine1}</p>
                        {address.addressLine2 && <p className="text-gray-700 text-xs sm:text-sm">{address.addressLine2}</p>}
                        <p className="text-gray-600 text-xs sm:text-sm">{address.city}, {address.state} {address.zipCode}</p>
                        <p className="text-gray-600 text-xs sm:text-sm">{address.country}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                  <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-800">Payment Methods</h2>
                  <button 
                    onClick={handleOpenPaymentModal}
                    className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1 w-full sm:w-auto justify-center"
                  >
                    <Plus size={14} sm:size={16} />
                    Add Card
                  </button>
                </div>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-gray-500">
                    <CreditCard size={32} sm:size={40} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No payment methods saved</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} sm:size={16} className="text-purple-600" />
                            {method.isDefault && (
                              <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full font-semibold">Default</span>
                            )}
                          </div>
                        </div>
                        <p className="font-semibold text-gray-800 text-xs sm:text-sm md:text-base">•••• •••• •••• {method.last4}</p>
                        <p className="text-gray-600 text-xs sm:text-sm">{method.cardHolder}</p>
                        <p className="text-gray-600 text-xs sm:text-sm">Expires: {method.expiryMonth}/{method.expiryYear}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                      value={settingsForm.fullName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, fullName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={settingsForm.phoneNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phoneNumber: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                    />
                  </div>
                  <button onClick={handleSaveSettings} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold text-sm sm:text-base">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Address Modal */}
            {showAddressModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-0 sm:mx-0">
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
                          <MapPin size={16} sm:size={20} md:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                            {editingAddress ? 'Edit Address' : 'Add Address'}
                          </h3>
                          <p className="text-purple-100 text-xs sm:text-sm">
                            {editingAddress ? 'Update saved address' : 'Add new delivery address'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseAddressModal}
                        className="bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm transition-all flex-shrink-0"
                      >
                        <X size={16} sm:size={18} md:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={addressForm.fullName}
                        onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Address Line 1</label>
                      <input
                        type="text"
                        value={addressForm.addressLine1}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="Street address, apartment, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Address Line 2</label>
                      <input
                        type="text"
                        value={addressForm.addressLine2}
                        onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="Apartment, suite, etc. (optional)"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">City</label>
                        <input
                          type="text"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">State</label>
                        <input
                          type="text"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">ZIP Code</label>
                        <input
                          type="text"
                          value={addressForm.zipCode}
                          onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={addressForm.country}
                          onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="defaultAddress"
                        checked={addressForm.isDefault}
                        onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="defaultAddress" className="text-xs sm:text-sm font-medium text-gray-700">Set as default address</label>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 border-t flex gap-2 sm:gap-3">
                    <button
                      onClick={handleCloseAddressModal}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-xs sm:text-sm"
                    >
                      {editingAddress ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-0 sm:mx-0">
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-3 sm:p-4 md:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
                          <CreditCard size={16} sm:size={20} md:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">Add Payment Method</h3>
                          <p className="text-purple-100 text-xs sm:text-sm">Add new credit or debit card</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleClosePaymentModal}
                        className="bg-white/20 hover:bg-white/30 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm transition-all flex-shrink-0"
                      >
                        <X size={16} sm:size={18} md:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardNumber: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Cardholder Name</label>
                      <input
                        type="text"
                        value={paymentForm.cardHolder}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cardHolder: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Expiry Month</label>
                        <select
                          value={paymentForm.expiryMonth}
                          onChange={(e) => setPaymentForm({ ...paymentForm, expiryMonth: e.target.value })}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        >
                          <option value="">MM</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Expiry Year</label>
                        <select
                          value={paymentForm.expiryYear}
                          onChange={(e) => setPaymentForm({ ...paymentForm, expiryYear: e.target.value })}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        >
                          <option value="">YY</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={2025 + i} value={String(2025 + i)}>{2025 + i}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">CVV</label>
                      <input
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm({ ...paymentForm, cvv: e.target.value })}
                        className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="defaultPayment"
                        checked={paymentForm.isDefault}
                        onChange={(e) => setPaymentForm({ ...paymentForm, isDefault: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor="defaultPayment" className="text-xs sm:text-sm font-medium text-gray-700">Set as default payment method</label>
                    </div>
                  </div>
                  
                  <div className="p-3 sm:p-4 md:p-6 border-t flex gap-2 sm:gap-3">
                    <button
                      onClick={handleClosePaymentModal}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSavePayment}
                      className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-xs sm:text-sm"
                    >
                      Add Card
                    </button>
                  </div>
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
