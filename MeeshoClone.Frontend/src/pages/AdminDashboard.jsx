import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productAPI, vendorAPI, orderAPI, seedAPI, siteConfigAPI } from '../services/api';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Settings, 
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Database
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVendors: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState({
    siteName: 'Meesho Clone',
    siteDescription: 'Your one-stop shop for everything you need',
    header: {
      logo: '',
      logoBase64: '',
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
    if (!isAdmin) {
      return;
    }
    loadDashboardData();
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, vendorsRes, configRes] = await Promise.all([
        productAPI.getAll(),
        vendorAPI.getAll(),
        siteConfigAPI.getConfiguration()
      ]);
      
      if (productsRes.data.success) {
        setProducts(productsRes.data.products);
        setStats(prev => ({ ...prev, totalProducts: productsRes.data.products.length }));
      }
      
      if (vendorsRes.data.success) {
        setVendors(vendorsRes.data.vendors);
        setStats(prev => ({ ...prev, totalVendors: vendorsRes.data.vendors.length }));
      }

      if (configRes.data.success) {
        setConfig(configRes.data.configuration);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfiguration = async () => {
    try {
      const response = await siteConfigAPI.updateConfiguration(config);
      if (response.data.success) {
        alert('Configuration saved successfully!');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save configuration');
    }
  };

  const handleSeedDatabase = async () => {
    try {
      const response = await seedAPI.seedDatabase();
      if (response.data.success) {
        alert('Database seeded successfully!');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Error seeding database');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard, section: 'management' },
    { id: 'products', label: 'Products', icon: Package, section: 'management' },
    { id: 'vendors', label: 'Vendors', icon: Users, section: 'management' },
    { id: 'categories', label: 'Categories', icon: Package, section: 'management' },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart, section: 'management' },
    { id: 'profile', label: 'My Profile', icon: Users, section: 'personal' },
    { id: 'settings', label: 'My Settings', icon: Settings, section: 'personal' },
    { id: 'configuration', label: 'Site Configuration', icon: Settings, section: 'configuration' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="opacity-90">Welcome back, {user?.fullName}</p>
            </div>
            <button
              onClick={handleSeedDatabase}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-pink-100 transition-colors flex items-center gap-2"
            >
              <Database size={18} />
              <span>Seed Database</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-20">
              <nav className="space-y-6">
                {/* Management Section */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Management</h3>
                  <div className="space-y-2">
                    {tabs.filter(tab => tab.section === 'management').map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <tab.icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Section */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Personal</h3>
                  <div className="space-y-2">
                    {tabs.filter(tab => tab.section === 'personal').map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <tab.icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Configuration Section */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Configuration</h3>
                  <div className="space-y-2">
                    {tabs.filter(tab => tab.section === 'configuration').map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <tab.icon size={20} />
                        <span className="font-medium">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Profile</h2>
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">{user?.fullName || 'Admin'}</h3>
                    <p className="text-gray-600">{user?.email || 'admin@meesho.com'}</p>
                    <span className="inline-block mt-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Administrator
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user?.fullName || ''}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={user?.email || ''}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      defaultValue="Admin"
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold">
                      Update Profile
                    </button>
                    <button 
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Package className="text-blue-600" size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalProducts}</h3>
                    <p className="text-gray-600">Total Products</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Users className="text-purple-600" size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalVendors}</h3>
                    <p className="text-gray-600">Total Vendors</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <ShoppingCart className="text-green-600" size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
                    <p className="text-gray-600">Total Orders</p>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <DollarSign className="text-yellow-600" size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">₹{stats.totalRevenue.toLocaleString()}</h3>
                    <p className="text-gray-600">Total Revenue</p>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CheckCircle className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">New order received</p>
                        <p className="text-sm text-gray-600">Order #12345 - ₹2,499</p>
                      </div>
                      <span className="text-sm text-gray-500 ml-auto">2 min ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <Package className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">New product added</p>
                        <p className="text-sm text-gray-600">Men's Casual Shirt by Fashion Hub</p>
                      </div>
                      <span className="text-sm text-gray-500 ml-auto">15 min ago</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Users className="text-purple-600" size={20} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">New vendor registered</p>
                        <p className="text-sm text-gray-600">Tech Store - Electronics</p>
                      </div>
                      <span className="text-sm text-gray-500 ml-auto">1 hour ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Products Management</h2>
                  <button 
                    onClick={() => alert('Product creation form coming soon')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>Add Product</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 10).map(product => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={product.imageUrls?.[0] || product.imageBase64?.[0] || 'https://via.placeholder.com/50'} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="font-semibold text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-600">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold">₹{product.price?.toLocaleString()}</p>
                            <p className="text-sm text-gray-600 line-through">₹{product.originalPrice?.toLocaleString()}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold">{product.stock}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-700">{product.category}</p>
                            <p className="text-sm text-gray-500">{product.subCategory}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {product.isFeatured && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                  Featured
                                </span>
                              )}
                              {product.isTrending && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                  Trending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => alert('Edit functionality coming soon')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit size={18} className="text-blue-600" />
                              </button>
                              <button 
                                onClick={() => alert('Delete functionality coming soon')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Trash2 size={18} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-sm text-gray-500">Showing {products.length > 10 ? 10 : products.length} of {products.length} products</p>
              </div>
            )}

            {activeTab === 'configuration' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Site Configuration</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Site Name</label>
                    <input
                      type="text"
                      value={config.siteName}
                      onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Site Description</label>
                    <textarea
                      value={config.siteDescription}
                      onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Header Settings</label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Background Color</label>
                        <input
                          type="text"
                          value={config.header?.backgroundColor}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, backgroundColor: e.target.value } })}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Text Color</label>
                        <input
                          type="text"
                          value={config.header?.textColor}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, textColor: e.target.value } })}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.header?.showSearch}
                            onChange={(e) => setConfig({ ...config, header: { ...config.header, showSearch: e.target.checked } })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Show Search</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.header?.showCart}
                            onChange={(e) => setConfig({ ...config, header: { ...config.header, showCart: e.target.checked } })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Show Cart</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={config.header?.showWishlist}
                            onChange={(e) => setConfig({ ...config, header: { ...config.header, showWishlist: e.target.checked } })}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">Show Wishlist</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveConfiguration}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold"
                  >
                    Save Configuration
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Categories Management</h2>
                  <button 
                    onClick={() => alert('Category creation form coming soon')}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>Add Category</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Fashion', icon: '👗', count: 12, featured: true },
                    { name: 'Electronics', icon: '📱', count: 8, featured: true },
                    { name: 'Home & Living', icon: '🏠', count: 6, featured: false },
                    { name: 'Beauty', icon: '💄', count: 10, featured: true },
                    { name: 'Sports', icon: '⚽', count: 5, featured: false },
                    { name: 'Books', icon: '📚', count: 4, featured: false },
                    { name: 'Jewelry', icon: '💍', count: 7, featured: true },
                    { name: 'Footwear', icon: '👟', count: 9, featured: false },
                    { name: 'Kids', icon: '👶', count: 6, featured: false },
                  ].map((category, index) => (
                    <div key={index} className="border rounded-xl p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{category.icon}</span>
                          <div>
                            <h3 className="font-semibold text-gray-800">{category.name}</h3>
                            <p className="text-sm text-gray-600">{category.count} products</p>
                          </div>
                        </div>
                        {category.featured && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => alert('Edit functionality coming soon')}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => alert('Delete functionality coming soon')}
                          className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Vendors Management</h2>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add Vendor</span>
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Business Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors.slice(0, 5).map(vendor => (
                        <tr key={vendor.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-semibold text-gray-800">{vendor.displayName}</p>
                              <p className="text-sm text-gray-600">{vendor.email}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-gray-700">{vendor.businessType}</p>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">{vendor.rating?.toFixed(1)}</span>
                              <span className="text-sm text-gray-600">({vendor.reviewCount})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {vendor.isVerified ? (
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                  <CheckCircle size={14} />
                                  Verified
                                </span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                                  Pending
                                </span>
                              )}
                              {!vendor.isActive && (
                                <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Edit size={18} className="text-blue-600" />
                              </button>
                              {!vendor.isVerified && (
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                  <CheckCircle size={18} className="text-green-600" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Orders Management</h2>
                <p className="text-gray-600">Order management features coming soon...</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Platform Settings</h2>
                <p className="text-gray-600">Settings panel coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
