import { Plus, Edit, Trash2, Shield, Power, Users, Search, Filter, MoreVertical, Crown, UserCheck, UserX, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

const UsersSection = ({ users, userFilter, setUserFilter, userModalRef, onDeleteUser }) => {
  const [statsExpanded, setStatsExpanded] = useState(true);
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName?.toLowerCase().includes(userFilter.search.toLowerCase()) ||
                        user.email?.toLowerCase().includes(userFilter.search.toLowerCase());
    const matchesRole = userFilter.role === '' || user.role === userFilter.role;
    const matchesStatus = userFilter.status === '' ||
                        (userFilter.status === 'active' && user.isActive) ||
                        (userFilter.status === 'inactive' && !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = () => {
    if (userModalRef?.current?.openModal) {
      userModalRef.current.openModal(null);
    }
  };

  const handleEditUser = (user) => {
    if (userModalRef?.current?.openModal) {
      userModalRef.current.openModal(user);
    }
  };

  const handleDeleteUser = (user) => {
    if (onDeleteUser) {
      onDeleteUser(user);
    }
  };

  const handleToggleUserActive = (user) => {
    if (userModalRef?.current?.handleToggleActive) {
      userModalRef.current.handleToggleActive(user);
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin': return 'from-purple-500 to-indigo-600';
      case 'Vendor': return 'from-blue-500 to-cyan-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'Admin': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Vendor': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6 md:p-8 relative overflow-hidden">
        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="bg-white/20 p-3 sm:p-4 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg shrink-0">
                <Users size={24} sm:size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">Users Management</h2>
                <p className="text-purple-100 text-xs sm:text-sm md:text-base mt-1">Manage platform users and permissions</p>
              </div>
            </div>
            <button
              onClick={handleAddUser}
              className="bg-white text-purple-600 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 text-sm sm:text-base transform hover:scale-105 duration-200 w-full sm:w-auto justify-center"
            >
              <Plus size={18} sm:size={20} />
              <span className="hidden sm:inline">Add User</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-gradient-to-b from-purple-50 to-white border-b border-purple-100">
        <button
          onClick={() => setStatsExpanded(!statsExpanded)}
          className="w-full p-3 sm:p-4 sm:hidden flex items-center justify-between text-left"
        >
          <span className="font-bold text-gray-700 text-sm">User Statistics</span>
          {statsExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </button>
        <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 ${statsExpanded ? 'block' : 'hidden sm:block'}`}>
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-purple-100 p-2 rounded-xl shrink-0">
                <Users size={18} sm:size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{users.length}</p>
                <p className="text-xs text-gray-500">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-green-100 p-2 rounded-xl shrink-0">
                <UserCheck size={18} sm:size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{users.filter(u => u.isActive).length}</p>
                <p className="text-xs text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-red-100 p-2 rounded-xl shrink-0">
                <UserX size={18} sm:size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{users.filter(u => !u.isActive).length}</p>
                <p className="text-xs text-gray-500">Inactive</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-purple-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-yellow-100 p-2 rounded-xl shrink-0">
                <Crown size={18} sm:size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-gray-800">{users.filter(u => u.isPremier).length}</p>
                <p className="text-xs text-gray-500">Premier</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-100">
        <button
          onClick={() => setFiltersExpanded(!filtersExpanded)}
          className="w-full p-3 sm:p-4 sm:hidden flex items-center justify-between text-left"
        >
          <span className="font-bold text-gray-700 text-sm flex items-center gap-2">
            <Filter size={16} className="text-purple-600" />
            Filters
          </span>
          {filtersExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </button>
        <div className={`p-4 sm:p-6 ${filtersExpanded ? 'block' : 'hidden sm:block'}`}>
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} sm:size={20} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userFilter.search}
                onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm sm:text-base bg-gray-50 focus:bg-white"
              />
            </div>
            <div className="flex gap-2 sm:gap-3">
              <select
                value={userFilter.role}
                onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
                className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm sm:text-base bg-gray-50 focus:bg-white font-medium flex-1 sm:flex-none"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Vendor">Vendor</option>
                <option value="Normal">Normal</option>
              </select>
              <select
                value={userFilter.status}
                onChange={(e) => setUserFilter({ ...userFilter, status: e.target.value })}
                className="px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-sm sm:text-base bg-gray-50 focus:bg-white font-medium flex-1 sm:flex-none"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider">User</th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider hidden md:table-cell">Email</th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider hidden lg:table-cell">Phone</th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider">Role</th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider">Status</th>
              <th className="text-left py-3 sm:py-4 px-3 sm:px-6 font-bold text-gray-700 text-xs sm:text-sm uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? filteredUsers.map((user, index) => (
              <tr
                key={user._id || user.Id || user.id}
                className="border-b border-gray-100 hover:bg-purple-50/30 transition-all duration-200 group"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br ${getRoleColor(user.role)} rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-200 shrink-0`}>
                      {user.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-800 text-sm sm:text-base truncate">{user.fullName}</p>
                      <p className="text-gray-500 text-xs sm:text-sm md:hidden truncate">{user.email}</p>
                      {user.isPremier && (
                        <span className="inline-flex items-center gap-1 text-xs text-yellow-600 font-semibold mt-1 bg-yellow-50 px-2 py-0.5 rounded-full">
                          <Crown size={10} sm:size={12} />
                          Premier
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 hidden md:table-cell">
                  <p className="text-gray-700 text-sm sm:text-base font-medium truncate">{user.email}</p>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6 hidden lg:table-cell">
                  <p className="text-gray-700 text-sm sm:text-base font-medium">{user.phoneNumber || 'N/A'}</p>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold border-2 ${getRoleBadgeColor(user.role)}`}>
                    {user.role === 'Admin' && <Shield size={10} sm:size={12} />}
                    {user.role === 'Vendor' && <Crown size={10} sm:size={12} />}
                    {user.role}
                  </span>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <button
                    onClick={() => handleToggleUserActive(user)}
                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all border-2 transform hover:scale-105 duration-200 ${
                      user.isActive
                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
                        : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
                    }`}
                  >
                    {user.isActive ? <UserCheck size={10} sm:size={12} /> : <UserX size={10} sm:size={12} />}
                    <span className="hidden sm:inline">{user.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </td>
                <td className="py-3 sm:py-4 px-3 sm:px-6">
                  <div className="flex gap-1.5 sm:gap-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="p-2 sm:p-2.5 hover:bg-purple-100 rounded-xl transition-all group/btn border border-transparent hover:border-purple-200"
                      title="Edit User"
                    >
                      <Edit size={16} sm:size={18} className="text-purple-600 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 sm:p-2.5 hover:bg-red-100 rounded-xl transition-all group/btn border border-transparent hover:border-red-200"
                      title="Delete User"
                    >
                      <Trash2 size={16} sm:size={18} className="text-red-600 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="py-12 sm:py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-4">
                    <div className="bg-purple-100 p-4 sm:p-6 rounded-full">
                      <Users size={48} sm:size={64} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold text-base sm:text-lg">No users found</p>
                      <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new user</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm text-gray-600">
            Showing <span className="font-bold text-purple-600">{filteredUsers.length}</span> of <span className="font-bold text-gray-800">{users.length}</span> users
          </p>
          {filteredUsers.length !== users.length && (
            <button
              onClick={() => setUserFilter({ search: '', role: '', status: '' })}
              className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-all"
            >
              <Filter size={14} sm:size={16} />
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersSection;
