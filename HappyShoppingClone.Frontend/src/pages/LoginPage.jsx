import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Lock, Mail, Shield, RefreshCw, ArrowLeft, Sparkles } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rulesLoading, setRulesLoading] = useState(true);
  const [validationRules, setValidationRules] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
    captcha: ''
  });
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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
    if (rulesLoading) return; // Don't validate while rules are loading
    const error = validateField(fieldName, value);
    setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFieldMouseOut = (fieldName, value) => {
    if (rulesLoading) return; // Don't validate while rules are loading
    // Only validate if there's a value and no error currently
    if (value && !fieldErrors[fieldName]) {
      const error = validateField(fieldName, value);
      setFieldErrors(prev => ({ ...prev, [fieldName]: error }));
    }
  };

  const handleFieldChange = (fieldName, value) => {
    // Clear error when user starts typing
    setFieldErrors(prev => ({ ...prev, [fieldName]: '' }));
    
    if (fieldName === 'email') setEmail(value);
    else if (fieldName === 'password') setPassword(value);
    else if (fieldName === 'captcha') setCaptcha(value);
  };

  const validateAllFields = () => {
    const errors = {
      email: validateField('email', email),
      password: validateField('password', password),
      captcha: validateField('captcha', captcha)
    };
    setFieldErrors(errors);
    return !Object.values(errors).some(error => error !== '');
  };

  const generateCaptcha = async () => {
    try {
      const response = await authAPI.generateCaptcha();
      if (response.data.success) {
        setCaptchaText(response.data.captchaText);
      }
    } catch (error) {
      const simpleCaptcha = Math.random().toString(36).substring(2, 8).toUpperCase();
      setCaptchaText(simpleCaptcha);
    }
  };

  useEffect(() => {
    loadValidationRules();
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

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
      // Verify captcha first
      const verifyResponse = await authAPI.verifyCaptcha({ captchaText: captcha, captchaToken: 'test' });
      if (!verifyResponse.data.success) {
        setError('Invalid captcha. Please try again.');
        generateCaptcha();
        setLoading(false);
        return;
      }

      const response = await authAPI.login({ email, password, captchaToken: 'test' });
      if (response.data.success) {
        login(response.data.user);
        navigate(from, { replace: true });
      } else {
        setError(response.data.error || 'Login failed');
        generateCaptcha();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Login failed. Please try again.');
      generateCaptcha();
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
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm flex items-start gap-2">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

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

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                onBlur={() => handleFieldBlur('password', password)}
                onMouseOut={() => handleFieldMouseOut('password', password)}
                required
                maxLength={validationRules?.password?.maxLength || 50}
                className={`w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all ${
                  fieldErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
                }`}
                placeholder="Enter your password (min 8 chars, uppercase, lowercase, number, special)"
              />
            </div>
            {fieldErrors.password && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Security Check</label>
            <div className="flex gap-2 sm:gap-4 mb-2">
              <div className="flex-1 bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-center font-mono text-sm sm:text-lg tracking-wider font-bold text-purple-700 shadow-inner">
                {captchaText}
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center justify-center"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={captcha}
              onChange={(e) => handleFieldChange('captcha', e.target.value)}
              onBlur={() => handleFieldBlur('captcha', captcha)}
              onMouseOut={() => handleFieldMouseOut('captcha', captcha)}
              required
              maxLength={validationRules?.captcha?.maxLength || 6}
              className={`w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm sm:text-base transition-all ${
                fieldErrors.captcha ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'
              }`}
              placeholder="Enter the captcha above"
            />
            {fieldErrors.captcha && (
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {fieldErrors.captcha}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <a href="/forgot-password" className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 text-white py-3 sm:py-4 rounded-xl font-semibold hover:from-purple-700 hover:via-pink-600 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-purple-600 hover:text-purple-800 font-semibold transition-colors">
              Sign up now
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
