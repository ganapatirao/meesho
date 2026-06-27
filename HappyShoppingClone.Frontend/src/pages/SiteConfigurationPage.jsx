import { useState, useEffect } from 'react';
import { siteConfigAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings, Palette, Layout, Image as ImageIcon, Save, X, Plus, Trash2 } from 'lucide-react';
import Toast from '../components/Toast';

const SiteConfigurationPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [config, setConfig] = useState({
    siteName: 'HappyShopping Clone',
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
    footer: {
      companyName: 'HappyShopping Clone',
      description: 'Your trusted e-commerce platform',
      email: 'support@happyshopping.com',
      phone: '+91 1234567890',
      address: '123 Business Street, City, State, India',
      sections: [],
      paymentMethods: [],
      copyrightText: '© 2024 HappyShopping Clone. All rights reserved.',
    },
    theme: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      accentColor: '#F59E0B',
      backgroundGradient: 'from-blue-50 to-purple-50',
      darkModeEnabled: false,
    },
  });

  useEffect(() => {
    if (!isAdmin) return;
    loadConfiguration();
  }, [isAdmin]);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      const response = await siteConfigAPI.getConfiguration();
      if (response.data.success) {
        setConfig(response.data.configuration);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (section) => {
    try {
      setSaving(true);
      let response;

      switch (section) {
        case 'general':
          response = await siteConfigAPI.updateConfiguration(config);
          break;
        case 'header':
          response = await siteConfigAPI.updateHeader(config.header);
          break;
        case 'footer':
          response = await siteConfigAPI.updateFooter(config.footer);
          break;
        case 'theme':
          response = await siteConfigAPI.updateTheme(config.theme);
          break;
        default:
          response = await siteConfigAPI.updateConfiguration(config);
      }

      if (response.data.success) {
        setToast({
          show: true,
          message: 'Configuration saved successfully!',
          type: 'success'
        });
        loadConfiguration();
      }
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to save configuration',
        type: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setConfig({
          ...config,
          header: {
            ...config.header,
            logoBase64: base64,
          },
        });
      };
      reader.readAsDataURL(file);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Settings size={32} />
            <h1 className="text-2xl font-bold">Site Configuration</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-20">
              <nav className="space-y-2">
                {['general', 'header', 'footer', 'theme'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tab === 'general' && <Settings size={20} />}
                    {tab === 'header' && <Layout size={20} />}
                    {tab === 'footer' && <Layout size={20} />}
                    {tab === 'theme' && <Palette size={20} />}
                    <span className="font-medium capitalize">{tab}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {activeTab === 'general' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">General Settings</h2>
                  <button
                    onClick={() => handleSave('general')}
                    disabled={saving}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                <div className="space-y-4">
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
                </div>
              </div>
            )}

            {activeTab === 'header' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Header Configuration</h2>
                  <button
                    onClick={() => handleSave('header')}
                    disabled={saving}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Logo (Base64)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {config.header.logoBase64 && (
                      <img src={config.header.logoBase64} alt="Logo" className="mt-2 h-12 object-contain" />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Background Color Gradient</label>
                    <input
                      type="text"
                      value={config.header.backgroundColor}
                      onChange={(e) => setConfig({ ...config, header: { ...config.header, backgroundColor: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'showSearch', label: 'Show Search' },
                      { key: 'showCart', label: 'Show Cart' },
                      { key: 'showWishlist', label: 'Show Wishlist' },
                      { key: 'showDownloadApp', label: 'Show Download App' },
                      { key: 'showBecomeSupplier', label: 'Show Become Supplier' },
                    ].map((item) => (
                      <label key={item.key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={config.header[item.key]}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, [item.key]: e.target.checked } })}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'footer' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Footer Configuration</h2>
                  <button
                    onClick={() => handleSave('footer')}
                    disabled={saving}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name</label>
                    <input
                      type="text"
                      value={config.footer.companyName}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, companyName: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                    <textarea
                      value={config.footer.description}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, description: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={config.footer.email}
                        onChange={(e) => setConfig({ ...config, footer: { ...config.footer, email: e.target.value } })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <input
                        type="text"
                        value={config.footer.phone}
                        onChange={(e) => setConfig({ ...config, footer: { ...config.footer, phone: e.target.value } })}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                    <textarea
                      value={config.footer.address}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, address: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Copyright Text</label>
                    <input
                      type="text"
                      value={config.footer.copyrightText}
                      onChange={(e) => setConfig({ ...config, footer: { ...config.footer, copyrightText: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'theme' && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Theme Configuration</h2>
                  <button
                    onClick={() => handleSave('theme')}
                    disabled={saving}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Primary Color</label>
                    <input
                      type="color"
                      value={config.theme.primaryColor}
                      onChange={(e) => setConfig({ ...config, theme: { ...config.theme, primaryColor: e.target.value } })}
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Secondary Color</label>
                    <input
                      type="color"
                      value={config.theme.secondaryColor}
                      onChange={(e) => setConfig({ ...config, theme: { ...config.theme, secondaryColor: e.target.value } })}
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Accent Color</label>
                    <input
                      type="color"
                      value={config.theme.accentColor}
                      onChange={(e) => setConfig({ ...config, theme: { ...config.theme, accentColor: e.target.value } })}
                      className="w-full h-10 border rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Background Gradient</label>
                    <input
                      type="text"
                      value={config.theme.backgroundGradient}
                      onChange={(e) => setConfig({ ...config, theme: { ...config.theme, backgroundGradient: e.target.value } })}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.theme.darkModeEnabled}
                      onChange={(e) => setConfig({ ...config, theme: { ...config.theme, darkModeEnabled: e.target.checked } })}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                    <span className="text-gray-700">Enable Dark Mode</span>
                  </label>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default SiteConfigurationPage;
