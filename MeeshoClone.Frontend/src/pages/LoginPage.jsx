import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [captchaText, setCaptchaText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const generateCaptcha = async () => {
    try {
      const response = await authAPI.generateCaptcha();
      if (response.data.success) {
        setCaptchaText(response.data.captchaText);
      }
    } catch (error) {
      console.error('Error generating captcha:', error);
      const simpleCaptcha = Math.random().toString(36).substring(2, 8).toUpperCase();
      setCaptchaText(simpleCaptcha);
    }
  };

  useEffect(() => {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-sm sm:text-base text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Enter your password"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">Captcha</label>
            <div className="flex gap-2 sm:gap-4">
              <div className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-center font-mono text-sm sm:text-lg tracking-wider">
                {captchaText}
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm"
              >
                Refresh
              </button>
            </div>
            <input
              type="text"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
              className="w-full mt-2 sm:mt-3 px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
              placeholder="Enter captcha"
            />
          </div>

          <div className="flex items-center justify-between">
            <a href="/forgot-password" className="text-xs sm:text-sm text-purple-600 hover:text-purple-800">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 sm:py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600">
            Don't have an account?{' '}
            <a href="/register" className="text-purple-600 hover:text-purple-800 font-semibold">
              Sign up
            </a>
          </p>
        </div>

        <div className="mt-3 sm:mt-4 text-center">
          <a href="/" className="text-xs sm:text-sm text-gray-500 hover:text-gray-700">
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
