import { Settings, TrendingUp, Shield, Power, CheckCircle, XCircle } from 'lucide-react';

const SettingsSection = ({ 
  user, 
  logout 
}) => {
  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="bg-purple-600 p-2 rounded-lg">
            <Settings className="text-white" size={20} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Profile Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{user?.fullName || 'Admin User'}</p>
              <p className="text-sm text-gray-600">{user?.email || 'admin@happyshopping.com'}</p>
              <span className="inline-block mt-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                {user?.role || 'Admin'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Shield className="text-white" size={20} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Security Settings</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
            <div>
              <p className="font-medium text-gray-800 text-xs sm:text-sm md:text-base">Two-Factor Authentication</p>
              <p className="text-xs sm:text-sm text-gray-600">Add an extra layer of security</p>
            </div>
            <input
              type="checkbox"
              defaultChecked={false}
              className="w-5 h-5"
            />
          </label>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="bg-purple-600 p-2 rounded-lg">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Theme Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Theme Mode</label>
            <div className="flex gap-3">
              <button className="flex-1 p-3 bg-white border-2 border-purple-500 rounded-lg text-purple-600 font-semibold">
                Light
              </button>
              <button className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-lg text-gray-600 font-semibold hover:border-gray-300">
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <div className="bg-red-600 p-2 rounded-lg">
            <Power className="text-white" size={20} />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Account Actions</h3>
        </div>
        <button
          onClick={logout}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default SettingsSection;
