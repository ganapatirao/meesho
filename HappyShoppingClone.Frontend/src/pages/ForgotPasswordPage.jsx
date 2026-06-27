import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Mail, Shield, RefreshCw, ArrowLeft, Sparkles, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [validationRules, setValidationRules] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    email: ''
  });
  const navigate = useNavigate();

  const loadValidationRules = async () => {
    try {
      setRulesLoading(true);
      const response = await authAPI.getValidationRules();
      if (response.data.success) {
        setValidationRules(response.data.rules);
      }
    } catch (error) {
    } finally {
      setRulesLoading(false);
    }
  };

  const validateField = (fieldName, value) => {
    if (!validationRules) return '';

    const rules = validationRules[fieldName];
    if (!rules) return '';

    // Check required
    if (rules.required && !value) {
      return rules.requiredMessage || `${fieldName} is required`;
    }

    // Check min length
    if (rules.minLength && value.length < rules.minLength) {
      return rules.minLengthMessage || `${fieldName} must be at least ${rules.minLength} characters`;
    }

    // Check max length
    if (rules.maxLength && value.length > rules.maxLength) {
      return rules.maxLengthMessage || `${fieldName} must not exceed ${rules.maxLength} characters`;
    }

    // Check pattern
    if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
      return rules.patternMessage || `${fieldName} format is invalid`;
    }

    return '';
  };

  const handleFieldBlur = (fieldName, value) => {
    if (rulesLoading) return;
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFieldMouseOut = (fieldName, value) => {
    if (rulesLoading) return;
    if (value && !fieldErrors[fieldName]) {
      const error = validateField(fieldName, value);
      setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleFieldChange = (fieldName, value) => {
    // Clear error when user starts typing
    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    
    if (fieldName === 'email') setEmail(value);
  };

  const validateAllFields = () => {
    const errors = {
      email: validateField('email', email)
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  useEffect(() => {
    loadValidationRules();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields before submission
    if (!validateAllFields()) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.forgotPassword({ email });
      if (response.data.success) {
        setSuccess(true);
      } else {
        setError(response.data.error || 'Failed to send reset link');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-8 px-4 sm:px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Back to Home Link - Top */}
      <div className="absolute top-4 left-4 z-20">
        <a href="/" className="inline-flex items-center gap-2 text-white hover:text-white transition-colors bg-white/20 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-white/30 text-xs sm:text-sm font-medium shadow-lg border border-white/30">
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Home</span>
        </a>
      </div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Forgot Password?
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Enter your email to receive a password reset link</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm flex items-start gap-2">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm flex items-start gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Password reset link has been sent to your email. Please check your inbox.</span>
          </div>
        )}

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  onBlur={() => handleFieldBlur('email', email)}
                  onMouseOut={() => handleFieldMouseOut('email', email)}
                  required
                  maxLength={validationRules?.email?.maxLength || 100}
                  className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all ${
                    fieldErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <button
              onClick={() => {
                setSuccess(false);
                setEmail('');
                navigate('/login');
              }}
              className="text-purple-600 hover:text-purple-800 font-semibold transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Remember your password?{' '}
            <a href="/login" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
