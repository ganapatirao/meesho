import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { X, Users, AlertCircle, Crown, Shield, UserCheck, UserX, Sparkles } from 'lucide-react';
import { authAPI, userAPI } from '../../../services/api';

const UserModal = forwardRef(({ onSuccess, showToast }, ref) => {
  const [show, setShow] = useState(false);
  const [validationRules, setValidationRules] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'Normal',
    isActive: true
  });

  useImperativeHandle(ref, () => ({
    openModal: (user = null) => {
      if (user) {
        console.log('UserModal received user:', user);
        console.log('UserModal - User _id:', user._id, 'User Id:', user.Id, 'User id:', user.id);
        setEditingUser(user);
        setUserForm({
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          password: '',
          role: user.role,
          isActive: user.isActive
        });
      } else {
        setEditingUser(null);
        setUserForm({
          fullName: '',
          email: '',
          phoneNumber: '',
          password: '',
          role: 'Normal',
          isActive: true
        });
      }
      setErrors({});
      setTouched({});
      setShow(true);
    },
    handleDelete,
    handleToggleActive
  }));

  useEffect(() => {
    if (show) {
      loadValidationRules();
    }
  }, [show]);

  const loadValidationRules = async () => {
    try {
      const response = await authAPI.getValidationRules();
      if (response.data.success && response.data.rules) {
        setValidationRules(response.data.rules);
      }
    } catch (error) {
      console.warn('Could not load validation rules:', error);
    }
  };

  const validateField = (fieldName, value) => {
    if (!validationRules || !validationRules[fieldName]) return '';

    const rules = validationRules[fieldName];
    let error = '';

    if (rules.required && !value) {
      error = rules.requiredMessage || 'This field is required';
    } else if (value) {
      if (rules.minLength && value.length < rules.minLength) {
        error = rules.minLengthMessage || `Minimum length is ${rules.minLength} characters`;
      }
      if (rules.maxLength && value.length > rules.maxLength) {
        error = rules.maxLengthMessage || `Maximum length is ${rules.maxLength} characters`;
      }
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        error = rules.patternMessage || 'Invalid format';
      }
    }

    return error;
  };

  const handleFieldChange = (fieldName, value) => {
    setUserForm({ ...userForm, [fieldName]: value });
    
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors({ ...errors, [fieldName]: error });
    }
  };

  const handleFieldBlur = (fieldName) => {
    setTouched({ ...touched, [fieldName]: true });
    const error = validateField(fieldName, userForm[fieldName]);
    setErrors({ ...errors, [fieldName]: error });
  };

  const handleFieldMouseOut = (fieldName) => {
    if (touched[fieldName]) {
      const error = validateField(fieldName, userForm[fieldName]);
      setErrors({ ...errors, [fieldName]: error });
    }
  };

  const validateAllFields = () => {
    const newErrors = {};
    const fieldsToValidate = ['fullName', 'email', 'phoneNumber'];
    if (!editingUser) {
      fieldsToValidate.push('password');
    }

    fieldsToValidate.forEach(fieldName => {
      const error = validateField(fieldName, userForm[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    setErrors(newErrors);
    setTouched(fieldsToValidate.reduce((acc, field) => ({ ...acc, [field]: true }), {}));
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateAllFields()) return;

    try {
      if (editingUser) {
        console.log('Editing user:', editingUser);
        console.log('User ID:', editingUser.Id, 'User id:', editingUser.id, 'User _id:', editingUser._id);
        const userId = editingUser.Id || editingUser.id || editingUser._id;
        console.log('Using userId:', userId);
        
        if (!userId) {
          if (showToast) showToast('Error: User ID is missing. Cannot update user.', 'error');
          return;
        }
        
        const userData = {
          fullName: userForm.fullName,
          email: userForm.email,
          phoneNumber: userForm.phoneNumber,
          role: userForm.role,
          isActive: userForm.isActive
        };
        // Only include password if it's provided
        if (userForm.password) {
          userData.password = userForm.password;
        }
        
        await userAPI.update(userId, userData);
        if (showToast) showToast('User updated successfully!', 'success');
      } else {
        console.log('Creating new user with form:', userForm);
        console.log('Form keys:', Object.keys(userForm));
        // Explicitly create clean object with only necessary fields to avoid duplicate key errors
        const userData = {
          fullName: userForm.fullName,
          email: userForm.email,
          phoneNumber: userForm.phoneNumber,
          password: userForm.password,
          role: userForm.role,
          isActive: userForm.isActive
        };
        console.log('Sending to API:', userData);
        await userAPI.create(userData);
        if (showToast) showToast('User created successfully!', 'success');
      }
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving user:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      if (showToast) showToast(errorMessage, 'error');
    }
  };

  const handleClose = () => {
    setEditingUser(null);
    setUserForm({
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      role: 'Normal',
      isActive: true
    });
    setErrors({});
    setTouched({});
    setShow(false);
  };

  const handleToggleActive = async (user) => {
    try {
      const userId = user.Id || user.id || user._id;
      await userAPI.toggleActive(userId);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error toggling user status:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error toggling user status';
      if (showToast) showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const userId = user.Id || user.id || user._id;
      await userAPI.delete(userId);
      if (showToast) showToast('User deleted successfully!', 'success');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Error deleting user';
      if (showToast) showToast(errorMessage, 'error');
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0 border border-purple-100">
        <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-4 sm:p-6 md:p-8 rounded-t-3xl relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-white/20 p-2 sm:p-3 rounded-2xl backdrop-blur-sm border border-white/30 shadow-lg shrink-0">
                  {editingUser ? <UserCheck size={20} sm:size={24} className="text-white" /> : <Sparkles size={20} sm:size={24} className="text-white" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                    {editingUser ? 'Edit User' : 'Add User'}
                  </h3>
                  <p className="text-purple-100 text-xs sm:text-sm mt-1">
                    {editingUser ? 'Update user information' : 'Create new user account'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all border border-white/20 hover:border-white/40 shrink-0"
              >
                <X size={18} sm:size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
              <Users size={14} sm:size={16} className="text-purple-600" />
              Full Name
            </label>
            <input
              type="text"
              value={userForm.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              onBlur={() => handleFieldBlur('fullName')}
              onMouseOut={() => handleFieldMouseOut('fullName')}
              maxLength={validationRules?.fullName?.maxLength || 100}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm sm:text-base ${
                errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/10 bg-gray-50 focus:bg-white'
              }`}
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1.5 sm:mt-2 flex items-center gap-1 font-medium">
                <AlertCircle size={10} sm:size={12} />
                {errors.fullName}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
              <Shield size={14} sm:size={16} className="text-purple-600" />
              Email
            </label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) => handleFieldChange('email', e.target.value)}
              onBlur={() => handleFieldBlur('email')}
              onMouseOut={() => handleFieldMouseOut('email')}
              maxLength={validationRules?.email?.maxLength || 100}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm sm:text-base ${
                errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/10 bg-gray-50 focus:bg-white'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1.5 sm:mt-2 flex items-center gap-1 font-medium">
                <AlertCircle size={10} sm:size={12} />
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
              <UserCheck size={14} sm:size={16} className="text-purple-600" />
              Phone Number
            </label>
            <input
              type="tel"
              value={userForm.phoneNumber}
              onChange={(e) => handleFieldChange('phoneNumber', e.target.value)}
              onBlur={() => handleFieldBlur('phoneNumber')}
              onMouseOut={() => handleFieldMouseOut('phoneNumber')}
              maxLength={validationRules?.phoneNumber?.maxLength || 10}
              className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm sm:text-base ${
                errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/10 bg-gray-50 focus:bg-white'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1.5 sm:mt-2 flex items-center gap-1 font-medium">
                <AlertCircle size={10} sm:size={12} />
                {errors.phoneNumber}
              </p>
            )}
          </div>
          {!editingUser && (
            <div>
              <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
                <Shield size={14} sm:size={16} className="text-purple-600" />
                Password
              </label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password')}
                onMouseOut={() => handleFieldMouseOut('password')}
                maxLength={validationRules?.password?.maxLength || 50}
                className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all text-sm sm:text-base ${
                  errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10 bg-red-50' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/10 bg-gray-50 focus:bg-white'
                }`}
                placeholder="Enter password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1.5 sm:mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle size={10} sm:size={12} />
                  {errors.password}
                </p>
              )}
            </div>
          )}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-1.5 sm:mb-2 flex items-center gap-2">
              <Crown size={14} sm:size={16} className="text-purple-600" />
              Role
            </label>
            <select
              value={userForm.role}
              onChange={(e) => handleFieldChange('role', e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:border-purple-500 focus:ring-purple-500/10 transition-all text-sm sm:text-base bg-gray-50 focus:bg-white font-medium"
            >
              <option value="Normal">Normal User</option>
              <option value="Admin">Admin</option>
              <option value="Vendor">Vendor</option>
            </select>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="userActive"
              checked={userForm.isActive}
              onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
              className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-offset-0 cursor-pointer shrink-0"
            />
            <label htmlFor="userActive" className="text-xs sm:text-sm font-bold text-gray-700 cursor-pointer flex items-center gap-2">
              {userForm.isActive ? <UserCheck size={14} sm:size={16} className="text-green-600" /> : <UserX size={14} sm:size={16} className="text-red-600" />}
              Active Status
            </label>
          </div>
        </div>

        <div className="p-4 sm:p-6 md:p-8 border-t border-gray-100 bg-gray-50 rounded-b-3xl flex gap-2 sm:gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all hover:border-gray-400 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 duration-200 text-sm sm:text-base"
          >
            {editingUser ? 'Update User' : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
});

UserModal.displayName = 'UserModal';

export default UserModal;
