import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, CreditCard, MapPin, Phone, User, Package, Truck, Shield, CheckCircle, Sparkles, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { validateField, validateAddress, validatePaymentDetails, validateCheckout } from '../utils/validation';
import { setValidationConfig, getAddressValidation } from '../utils/validationConfig';
import Toast from '../components/Toast';
import DeleteConfirmationModal from '../components/admin/DeleteConfirmationModal';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, cartCount, removeFromCart, updateQuantity, clearCart, loadCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart, shipping, payment, success
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    addressType: 'Home'
  });
  const [billingAddress, setBillingAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    addressType: 'Home'
  });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [isDefaultAddress, setIsDefaultAddress] = useState(false);
  const [saveAddressChecked, setSaveAddressChecked] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [deleteModal, setDeleteModal] = useState({ show: false, type: '', id: null, name: '', productId: null, variantId: null });

  useEffect(() => {
    // Fetch validation configuration from backend
    const fetchValidationConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/siteconfiguration`);
        const data = await response.json();
        if (data.success && data.configuration?.validation) {
          setValidationConfig(data.configuration.validation);
        }
      } catch (error) {
        console.error('Failed to fetch validation config:', error);
      }
    };

    fetchValidationConfig();

    if (isAuthenticated && user?.id) {
      loadCart(user.id);
      // Pre-fill user data
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || ''
      }));
      // Load saved addresses from localStorage
      const storedAddresses = localStorage.getItem(`savedAddresses_${user.id}`);
      if (storedAddresses) {
        setSavedAddresses(JSON.parse(storedAddresses));
        // Auto-populate from default address if exists
        const addresses = JSON.parse(storedAddresses);
        const defaultAddress = addresses.find(addr => addr.isDefault);
        if (defaultAddress) {
          setShippingAddress(defaultAddress);
          setIsDefaultAddress(true);
        }
      }
    }
  }, [isAuthenticated, user]);

  const handleQuantityChange = async (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return;
    const result = await updateQuantity(productId, variantId, newQuantity);
    if (!result.success) {
      setToast({ show: true, message: 'Failed to update quantity', type: 'error' });
    }
  };

  const handleRemoveItem = (productId, variantId, productName) => {
    setDeleteModal({ 
      show: true, 
      type: 'item', 
      id: null, 
      name: productName, 
      productId, 
      variantId 
    });
  };

  const handleClearCart = () => {
    setDeleteModal({ 
      show: true, 
      type: 'cart', 
      id: null, 
      name: 'all items', 
      productId: null, 
      variantId: null 
    });
  };

  const confirmDelete = async () => {
    if (deleteModal.type === 'address') {
      confirmDeleteAddress();
    } else if (deleteModal.type === 'item') {
      const result = await removeFromCart(deleteModal.productId, deleteModal.variantId);
      if (!result.success) {
        setToast({ show: true, message: 'Failed to remove item', type: 'error' });
      } else {
        setToast({ show: true, message: 'Item removed from cart', type: 'success' });
      }
    } else if (deleteModal.type === 'cart') {
      const result = await clearCart();
      if (!result.success) {
        setToast({ show: true, message: 'Failed to clear cart', type: 'error' });
      } else {
        setToast({ show: true, message: 'Cart cleared successfully', type: 'success' });
      }
    }
    setDeleteModal({ show: false, type: '', id: null, name: '', productId: null, variantId: null });
  };

  const toggleDescription = (itemId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSaveAddress = () => {
    if (!user?.id) return;
    
    // Validate shipping address before saving
    const shippingErrors = validateAddress(shippingAddress, 'shipping_');
    if (Object.keys(shippingErrors).length > 0) {
      setValidationErrors(shippingErrors);
      // Mark all fields as touched
      Object.keys(shippingErrors).forEach(field => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
      });
      setToast({ show: true, message: 'Please fix validation errors before saving address', type: 'error' });
      return;
    }
    
    // Check if address already exists
    const addressExists = savedAddresses.some(addr => 
      addr.addressLine1 === shippingAddress.addressLine1 &&
      addr.city === shippingAddress.city &&
      addr.pinCode === shippingAddress.pinCode
    );
    
    if (addressExists) {
      setToast({ show: true, message: 'This address is already saved', type: 'info' });
      return;
    }
    
    // Check max 3 addresses limit
    if (savedAddresses.length >= 3) {
      setToast({ show: true, message: 'You can save maximum 3 addresses. Please delete an existing address first.', type: 'info' });
      return;
    }
    
    // If setting as default, remove default from other addresses
    let updatedAddresses = [...savedAddresses];
    if (isDefaultAddress) {
      updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
    }
    
    // Add new address with auto-generated label
    const addressNumber = savedAddresses.length + 1;
    const newAddress = {
      ...shippingAddress,
      id: Date.now(),
      isDefault: isDefaultAddress,
      label: `Address ${addressNumber}`,
      savedAt: new Date().toISOString()
    };
    
    updatedAddresses.push(newAddress);
    setSavedAddresses(updatedAddresses);
    localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
    setToast({ show: true, message: 'Address saved successfully!', type: 'success' });
  };

  const handleSetDefaultAddress = (addressId) => {
    if (!user?.id) return;
    
    const updatedAddresses = savedAddresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    }));
    
    setSavedAddresses(updatedAddresses);
    localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
    setToast({ show: true, message: 'Default address updated successfully!', type: 'success' });
  };

  const handleDeleteAddress = (addressId) => {
    const address = savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setDeleteModal({ 
        show: true, 
        type: 'address', 
        id: addressId, 
        name: address.fullName, 
        productId: null, 
        variantId: null 
      });
    }
  };

  const confirmDeleteAddress = () => {
    if (!user?.id) return;
    const updatedAddresses = savedAddresses.filter(addr => addr.id !== deleteModal.id);
    setSavedAddresses(updatedAddresses);
    localStorage.setItem(`savedAddresses_${user.id}`, JSON.stringify(updatedAddresses));
    setDeleteModal({ show: false, type: '', id: null, name: '', productId: null, variantId: null });
    setToast({ show: true, message: 'Address deleted successfully!', type: 'success' });
  };

  const handleSelectAddress = (address) => {
    setShippingAddress(address);
    setIsDefaultAddress(address.isDefault);
    if (sameAsShipping) {
      setBillingAddress(address);
    }
    setShowSavedAddresses(false);
    // Clear validation errors when selecting an address
    setValidationErrors({});
  };

  const handleFieldChange = (field, value, addressType = 'shipping') => {
    const setAddress = addressType === 'shipping' ? setShippingAddress : setBillingAddress;
    const prefix = addressType === 'shipping' ? 'shipping_' : 'billing_';
    
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleFieldBlur = (field, addressType = 'shipping') => {
    const prefix = addressType === 'shipping' ? 'shipping_' : 'billing_';
    const address = addressType === 'shipping' ? shippingAddress : billingAddress;
    
    // Mark field as touched
    setTouchedFields(prev => ({ ...prev, [`${prefix}${field}`]: true }));
    
    // Validate field
    const fieldRules = {
      fullName: { required: true, minLength: 2, maxLength: 100, pattern: /^[a-zA-Z\s\-']+$/ },
      phoneNumber: { required: true, pattern: /^[6-9]\d{9}$/, message: 'Must be 10 digits starting with 6-9' },
      addressLine1: { required: true, minLength: 5, maxLength: 200 },
      addressLine2: { required: false, maxLength: 200 },
      city: { required: true, minLength: 2, maxLength: 50, pattern: /^[a-zA-Z\s\-']+$/ },
      state: { required: true, minLength: 2, maxLength: 50, pattern: /^[a-zA-Z\s\-']+$/ },
      pinCode: { required: true, pattern: /^\d{6}$/, message: 'Must be 6 digits' },
      addressType: { required: true, allowedValues: ['Home', 'Office', 'Other'] }
    };
    
    const validation = validateField(field, address[field], fieldRules[field]);
    setValidationErrors(prev => ({
      ...prev,
      [`${prefix}${field}`]: validation.error
    }));
  };

  const handlePaymentFieldChange = (field, value) => {
    setPaymentDetails(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    
    // Validate payment field based on payment method
    let fieldRules;
    if (field === 'upiId') {
      fieldRules = { required: paymentMethod === 'PhonePe', pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/, message: 'Invalid UPI ID format' };
    } else if (field === 'cardNumber') {
      fieldRules = { required: paymentMethod === 'CreditCard', pattern: /^\d{16}$/, message: 'Must be 16 digits' };
    } else if (field === 'cardHolderName') {
      fieldRules = { required: paymentMethod === 'CreditCard', minLength: 2, maxLength: 100, pattern: /^[a-zA-Z\s\-']+$/ };
    } else if (field === 'cardExpiry') {
      fieldRules = { required: paymentMethod === 'CreditCard', pattern: /^(0[1-9]|1[0-2])\/\d{2}$/, message: 'Must be MM/YY format' };
    } else if (field === 'bankName') {
      fieldRules = { required: paymentMethod === 'NetBanking' };
    }
    
    if (fieldRules) {
      const validation = validateField(field, paymentDetails[field], fieldRules);
      setValidationErrors(prev => ({
        ...prev,
        [field]: validation.error
      }));
    }
  };

  const handleContinueToPayment = () => {
    // Validate user authentication
    if (!isAuthenticated) {
      setToast({ show: true, message: 'Please login to continue', type: 'error' });
      navigate('/login');
      return;
    }

    // Validate cart is not empty
    if (!cart || cartCount === 0) {
      setToast({ show: true, message: 'Your cart is empty', type: 'error' });
      return;
    }

    // Validate shipping address before proceeding
    const shippingErrors = validateAddress(shippingAddress, 'shipping_');
    if (Object.keys(shippingErrors).length > 0) {
      setValidationErrors(shippingErrors);
      // Mark all fields as touched
      Object.keys(shippingErrors).forEach(field => {
        setTouchedFields(prev => ({ ...prev, [field]: true }));
      });
      setToast({ show: true, message: 'Please fill in all required shipping address fields', type: 'error' });
      return;
    }

    // Validate billing address if different from shipping
    if (!sameAsShipping) {
      const billingErrors = validateAddress(billingAddress, 'billing_');
      if (Object.keys(billingErrors).length > 0) {
        setValidationErrors(billingErrors);
        // Mark all fields as touched
        Object.keys(billingErrors).forEach(field => {
          setTouchedFields(prev => ({ ...prev, [field]: true }));
        });
        setToast({ show: true, message: 'Please fill in all required billing address fields', type: 'error' });
        return;
      }
    }

    // Proceed to payment step
    setCheckoutStep('payment');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setCheckoutStep('shipping');
  };

  const handlePlaceOrder = async () => {
    // Validate all fields before placing order
    const validation = validateCheckout(shippingAddress, sameAsShipping ? null : billingAddress, paymentMethod, paymentDetails, sameAsShipping);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Mark all fields as touched to show errors
      const allFields = Object.keys(validation.errors);
      setTouchedFields(prev => {
        const updated = { ...prev };
        allFields.forEach(field => updated[field] = true);
        return updated;
      });
      return;
    }

    setLoading(true);
    try {
      // Clean address objects by removing saved address-specific fields
      const cleanAddress = (address) => {
        const { id, isDefault, label, savedAt, ...cleaned } = address;
        return cleaned;
      };

      const checkoutRequest = {
        userId: user.id,
        shippingAddress: cleanAddress(shippingAddress),
        billingAddress: sameAsShipping ? cleanAddress(shippingAddress) : cleanAddress(billingAddress),
        paymentMethod: paymentMethod,
        paymentDetails: paymentDetails
      };

      const response = await fetch(`${API_BASE_URL}/payment/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(checkoutRequest)
      });

      const data = await response.json();
      if (data.success) {
        setToast({ show: true, message: 'Order placed successfully!', type: 'success' });
        clearCart();
        setCheckoutStep('success');
      } else {
        setToast({ show: true, message: 'Failed to place order: ' + (data.error || 'Unknown error'), type: 'error' });
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setToast({ show: true, message: 'Failed to place order', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ShoppingBag size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">Please Login to View Cart</h1>
          <p className="text-gray-600 mb-8 text-lg">You need to be logged in to access your cart and place orders</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8 text-lg">Add some products to your cart to get started with your shopping journey</p>
          <button
            onClick={() => navigate('/shopping')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            <span className="flex items-center gap-2">
              <Sparkles size={20} />
              Start Shopping
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 py-4 md:py-8 lg:py-10">
        <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
          {/* Workflow Progress Indicator */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <ShoppingBag size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Cart</span>
              </div>
              <div className="w-8 md:w-12 h-1 bg-purple-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <MapPin size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Shipping</span>
              </div>
              <div className="w-8 md:w-12 h-1 bg-purple-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <CreditCard size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Payment</span>
              </div>
              <div className="w-8 md:w-12 h-1 bg-purple-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-xs md:text-sm font-semibold text-green-600 hidden sm:block">Complete</span>
              </div>
            </div>
          </div>

          <div className="text-center bg-white p-6 md:p-8 lg:p-12 rounded-xl shadow-md mx-2 md:mx-4">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8">
              <CheckCircle size={40} md:size={64} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3">Order Placed Successfully!</h1>
            <p className="text-gray-600 mb-6 md:mb-8 text-base md:text-lg">Thank you for your purchase. Your order will be delivered soon.</p>
            
            <div className="bg-gray-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6 text-left">
              <h3 className="font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                <Package size={18} className="text-purple-600" />
                Order Details
              </h3>
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 text-sm md:text-base">Order ID:</span>
                  <span className="font-semibold text-purple-600 text-sm md:text-base">#ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 text-sm md:text-base">Payment Method:</span>
                  <span className="font-semibold text-gray-800 text-sm md:text-base">{paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-200">
                  <span className="text-gray-600 text-sm md:text-base">Total Amount:</span>
                  <span className="font-bold text-lg md:text-2xl text-purple-600">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-600 text-sm md:text-base">Estimated Delivery:</span>
                  <span className="font-semibold text-green-600 text-sm md:text-base">{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-3 md:p-4 mb-6 md:mb-8 border border-blue-200">
              <p className="text-xs md:text-sm text-blue-800 flex items-start gap-2">
                <Shield size={14} md:size={16} className="flex-shrink-0 mt-0.5" />
                <span><strong>Order Confirmation:</strong> A confirmation email has been sent to your registered email address with all the order details.</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <button
                onClick={() => {
                  setCheckoutStep('cart');
                  clearCart();
                  navigate('/shopping');
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 md:px-6 py-2 md:py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
              >
                <Sparkles size={16} md:size={20} />
                Continue Shopping
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 bg-gray-100 text-gray-700 px-4 md:px-6 py-2 md:py-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                View Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'payment') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Fixed Header with Workflow Progress */}
        <div className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-4 max-w-6xl py-3 md:py-4">
            <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <ShoppingBag size={12} sm:size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Cart</span>
              </div>
              <div className="w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 bg-purple-600 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <MapPin size={12} sm:size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Shipping</span>
              </div>
              <div className="w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 bg-purple-600 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <CreditCard size={12} sm:size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Payment</span>
              </div>
              <div className="w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <CheckCircle size={12} sm:size={16} md:size={20} className="text-gray-400" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-400 hidden sm:block">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 md:py-6 lg:py-8">
          <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-6 text-center">
              Payment Method
            </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Payment Options */}
            <div className="space-y-4 md:space-y-6">
              {/* Cash on Delivery / WhatsApp */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <CreditCard size={18} className="text-purple-600" />
                  Easy Payment Options
                </h2>
                <div className="space-y-3">
                  <label 
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'COD' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => {
                        setPaymentMethod(e.target.value);
                        setPaymentDetails({});
                      }}
                      className="text-purple-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">Cash on Delivery</p>
                      <p className="text-xs md:text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                    <div className="text-2xl md:text-3xl">💵</div>
                  </label>
                  
                  <label 
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg cursor-not-allowed opacity-60 transition-all ${
                      paymentMethod === 'WhatsApp' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="WhatsApp"
                      checked={paymentMethod === 'WhatsApp'}
                      disabled
                      className="text-purple-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">WhatsApp Payment</p>
                      <p className="text-xs md:text-sm text-gray-600">Pay via WhatsApp for quick checkout</p>
                    </div>
                    <div className="text-2xl md:text-3xl">💬</div>
                  </label>
                </div>
              </div>

              {/* Online Payment */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <CreditCard size={18} className="text-purple-600" />
                  Online Payment
                </h2>
                <div className="space-y-3">
                  <label 
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg cursor-not-allowed opacity-60 transition-all ${
                      paymentMethod === 'PhonePe' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PhonePe"
                      checked={paymentMethod === 'PhonePe'}
                      disabled
                      className="text-purple-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">PhonePe</p>
                      <p className="text-xs md:text-sm text-gray-600">Pay using PhonePe UPI</p>
                    </div>
                    <div className="text-2xl md:text-3xl">📱</div>
                  </label>
                  
                  <label 
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg cursor-not-allowed opacity-60 transition-all ${
                      paymentMethod === 'CreditCard' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CreditCard"
                      checked={paymentMethod === 'CreditCard'}
                      disabled
                      className="text-purple-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">Credit / Debit Card</p>
                      <p className="text-xs md:text-sm text-gray-600">All major cards accepted</p>
                    </div>
                    <div className="text-2xl md:text-3xl">💳</div>
                  </label>
                  
                  <label 
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg cursor-not-allowed opacity-60 transition-all ${
                      paymentMethod === 'NetBanking' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="NetBanking"
                      checked={paymentMethod === 'NetBanking'}
                      disabled
                      className="text-purple-600 w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm md:text-base">Net Banking</p>
                      <p className="text-xs md:text-sm text-gray-600">Pay using your bank account</p>
                    </div>
                    <div className="text-2xl md:text-3xl">🏦</div>
                  </label>
                </div>
              </div>

              {/* Payment Details Form */}
              {paymentMethod === 'PhonePe' && (
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-600" />
                    PhonePe Details
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">UPI ID</label>
                    <input
                      type="text"
                      value={paymentDetails.upiId || ''}
                      onChange={(e) => handlePaymentFieldChange('upiId', e.target.value)}
                      onBlur={() => handlePaymentFieldBlur('upiId')}
                      className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors['upiId'] && touchedFields['upiId']
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      placeholder="yourname@upi"
                    />
                    {validationErrors['upiId'] && touchedFields['upiId'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['upiId']}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'CreditCard' && (
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-600" />
                    Card Details
                  </h3>
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Card Number</label>
                      <input
                        type="text"
                        value={paymentDetails.cardNumber || ''}
                        onChange={(e) => handlePaymentFieldChange('cardNumber', e.target.value)}
                        onBlur={() => handlePaymentFieldBlur('cardNumber')}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['cardNumber'] && touchedFields['cardNumber']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {validationErrors['cardNumber'] && touchedFields['cardNumber'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['cardNumber']}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Card Holder Name</label>
                      <input
                        type="text"
                        value={paymentDetails.cardHolderName || ''}
                        onChange={(e) => handlePaymentFieldChange('cardHolderName', e.target.value)}
                        onBlur={() => handlePaymentFieldBlur('cardHolderName')}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['cardHolderName'] && touchedFields['cardHolderName']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="Name on card"
                      />
                      {validationErrors['cardHolderName'] && touchedFields['cardHolderName'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['cardHolderName']}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Expiry Date</label>
                      <input
                        type="text"
                        value={paymentDetails.cardExpiry || ''}
                        onChange={(e) => handlePaymentFieldChange('cardExpiry', e.target.value)}
                        onBlur={() => handlePaymentFieldBlur('cardExpiry')}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['cardExpiry'] && touchedFields['cardExpiry']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                      {validationErrors['cardExpiry'] && touchedFields['cardExpiry'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['cardExpiry']}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NetBanking' && (
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-600" />
                    Net Banking Details
                  </h3>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Select Bank</label>
                    <select
                      value={paymentDetails.bankName || ''}
                      onChange={(e) => handlePaymentFieldChange('bankName', e.target.value)}
                      onBlur={() => handlePaymentFieldBlur('bankName')}
                      className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors['bankName'] && touchedFields['bankName']
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                    >
                      <option value="">Select your bank</option>
                      <option value="SBI">State Bank of India</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank</option>
                      <option value="Axis">Axis Bank</option>
                      <option value="Kotak">Kotak Mahindra Bank</option>
                      <option value="Other">Other</option>
                    </select>
                    {validationErrors['bankName'] && touchedFields['bankName'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['bankName']}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 sticky top-20 lg:top-24 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

                {/* Product Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 pb-3 border-b border-gray-100">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity} | {item.color} {item.size && `| ${item.size}`}</p>
                        <p className="text-purple-600 font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{cart?.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  {cart?.discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Discount</span>
                      <span className="font-medium text-green-600">-₹{cart.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Delivery</span>
                    <span className="font-medium text-gray-900">
                      {cart?.deliveryCharge > 0 ? `₹${cart.deliveryCharge.toLocaleString()}` : 'FREE'}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold text-base">Total</span>
                      <span className="text-gray-900 font-bold text-xl">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Address Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-purple-600" />
                    Shipping Address
                  </h3>
                  <p className="text-sm text-gray-600">{shippingAddress.fullName}</p>
                  <p className="text-sm text-gray-600">{shippingAddress.phoneNumber}</p>
                  <p className="text-sm text-gray-600">{shippingAddress.addressLine1}</p>
                  {shippingAddress.addressLine2 && <p className="text-sm text-gray-600">{shippingAddress.addressLine2}</p>}
                  <p className="text-sm text-gray-600">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pinCode}</p>
                </div>

                <div className="flex gap-3 md:gap-4">
                  <button
                    onClick={() => setCheckoutStep('shipping')}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 md:py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={!paymentMethod || loading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 md:py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} md:size={20} />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (checkoutStep === 'shipping') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Fixed Header with Workflow Progress */}
        <div className="bg-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-4 max-w-6xl py-3 md:py-4">
            <div className="flex items-center justify-center gap-1 sm:gap-2 md:gap-4">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <ShoppingBag size={12} sm:size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Cart</span>
              </div>
              <div className="w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 bg-purple-600 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-purple-600 rounded-full flex items-center justify-center">
                  <MapPin size={12} sm:size={16} md:size={20} className="text-white" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-purple-600 hidden sm:block">Shipping</span>
              </div>
              <div className="w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <CreditCard size={12} sm:size={16} md:size={20} className="text-gray-400" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-400 hidden sm:block">Payment</span>
              </div>
              <div className="w-4 sm:w-8 md:w-12 h-0.5 sm:h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <CheckCircle size={12} sm:size={16} md:size={20} className="text-gray-400" />
                </div>
                <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-400 hidden sm:block">Complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 md:py-6 lg:py-8">
          <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 md:mb-6 text-center">
              Shipping Information
            </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Address Forms */}
            <div className="space-y-4 md:space-y-6">
              {/* Saved Addresses Grid */}
              {savedAddresses.length > 0 && (
                <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Package size={18} className="text-purple-600" />
                      Saved Addresses
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {savedAddresses.length}/3
                      </span>
                      <button
                        onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                        className="md:hidden text-purple-600 hover:text-purple-700"
                      >
                        {showSavedAddresses ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </div>
                  </div>
                  <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${showSavedAddresses ? 'block' : 'hidden md:block'}`}>
                    {savedAddresses.map((address) => (
                      <div 
                        key={address.id}
                        onClick={() => handleSelectAddress(address)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          address.isDefault 
                            ? 'bg-purple-50 border-purple-300' 
                            : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-800 text-sm">{address.fullName}</span>
                              {address.isDefault && (
                                <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-0.5">{address.phoneNumber}</p>
                            <p className="text-xs text-gray-600 mb-0.5 truncate">{address.addressLine1}</p>
                            <p className="text-xs text-gray-600">{address.city}, {address.state}</p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSelectAddress(address); }}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                            >
                              Use
                            </button>
                            {!address.isDefault && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleSetDefaultAddress(address.id); }}
                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteAddress(address.id); }}
                              className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                <h2 className="text-lg font-bold text-gray-800 mb-4 md:mb-6 flex items-center gap-2">
                  <MapPin size={18} className="text-purple-600" />
                  Shipping Address
                </h2>
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Full Name</label>
                    <div className="relative">
                      <User size={16} md:size={18} className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value, 'shipping')}
                        onBlur={() => handleFieldBlur('fullName', 'shipping')}
                        maxLength={getAddressValidation().fullNameMaxLength}
                        className={`w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['shipping_fullName'] && touchedFields['shipping_fullName']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="Enter full name"
                      />
                    </div>
                    {validationErrors['shipping_fullName'] && touchedFields['shipping_fullName'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['shipping_fullName']}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} md:size={18} className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={shippingAddress.phoneNumber}
                        onChange={(e) => handleFieldChange('phoneNumber', e.target.value, 'shipping')}
                        onBlur={() => handleFieldBlur('phoneNumber', 'shipping')}
                        maxLength={getAddressValidation().phoneNumberMaxLength}
                        className={`w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['shipping_phoneNumber'] && touchedFields['shipping_phoneNumber']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="Enter phone number"
                      />
                    </div>
                    {validationErrors['shipping_phoneNumber'] && touchedFields['shipping_phoneNumber'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['shipping_phoneNumber']}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Address Line 1</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) => handleFieldChange('addressLine1', e.target.value, 'shipping')}
                      onBlur={() => handleFieldBlur('addressLine1', 'shipping')}
                      maxLength={getAddressValidation().addressLine1MaxLength}
                      className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors['shipping_addressLine1'] && touchedFields['shipping_addressLine1']
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      placeholder="House no, Street, Area"
                    />
                    {validationErrors['shipping_addressLine1'] && touchedFields['shipping_addressLine1'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['shipping_addressLine1']}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) => handleFieldChange('addressLine2', e.target.value, 'shipping')}
                      onBlur={() => handleFieldBlur('addressLine2', 'shipping')}
                      maxLength={getAddressValidation().addressLine2MaxLength}
                      className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors['shipping_addressLine2'] && touchedFields['shipping_addressLine2']
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      placeholder="Landmark, etc."
                    />
                    {validationErrors['shipping_addressLine2'] && touchedFields['shipping_addressLine2'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['shipping_addressLine2']}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => handleFieldChange('city', e.target.value, 'shipping')}
                        onBlur={() => handleFieldBlur('city', 'shipping')}
                        maxLength={getAddressValidation().cityMaxLength}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['shipping_city'] && touchedFields['shipping_city']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="City"
                      />
                      {validationErrors['shipping_city'] && touchedFields['shipping_city'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['shipping_city']}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">State</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => handleFieldChange('state', e.target.value, 'shipping')}
                        onBlur={() => handleFieldBlur('state', 'shipping')}
                        maxLength={getAddressValidation().stateMaxLength}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['shipping_state'] && touchedFields['shipping_state']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="State"
                      />
                      {validationErrors['shipping_state'] && touchedFields['shipping_state'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['shipping_state']}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">PIN Code</label>
                    <input
                      type="text"
                      value={shippingAddress.pinCode}
                      onChange={(e) => handleFieldChange('pinCode', e.target.value, 'shipping')}
                      onBlur={() => handleFieldBlur('pinCode', 'shipping')}
                      maxLength={getAddressValidation().pinCodeMaxLength}
                      className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                        validationErrors['shipping_pinCode'] && touchedFields['shipping_pinCode']
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                      }`}
                      placeholder="PIN Code"
                    />
                    {validationErrors['shipping_pinCode'] && touchedFields['shipping_pinCode'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['shipping_pinCode']}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 md:mb-3">Address Type</label>
                    <div className="flex gap-2 md:gap-4">
                      {['Home', 'Office', 'Other'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="addressType"
                            value={type}
                            checked={shippingAddress.addressType === type}
                            onChange={(e) => handleFieldChange('addressType', e.target.value, 'shipping')}
                            className="text-purple-600 w-4 h-4"
                          />
                          <span className="text-sm md:text-base">{type}</span>
                        </label>
                      ))}
                    </div>
                    {validationErrors['shipping_addressType'] && touchedFields['shipping_addressType'] && (
                      <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                        <AlertCircle size={12} md:size={14} />
                        <span>{validationErrors['shipping_addressType']}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Save Address Options */}
                  <div className="pt-3 md:pt-4 border-t-2 border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddressChecked}
                        onChange={(e) => {
                          setSaveAddressChecked(e.target.checked);
                          if (e.target.checked) {
                            handleSaveAddress();
                          } else {
                            setIsDefaultAddress(false);
                          }
                        }}
                        className="text-purple-600 w-4 h-4"
                      />
                      <label htmlFor="saveAddress" className="text-sm text-gray-700 cursor-pointer">Save this address</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isDefaultAddress}
                        onChange={(e) => {
                          setIsDefaultAddress(e.target.checked);
                          if (e.target.checked && !saveAddressChecked) {
                            setSaveAddressChecked(true);
                            handleSaveAddress();
                          }
                        }}
                        disabled={!saveAddressChecked}
                        className="text-purple-600 w-4 h-4 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <label className={`text-sm cursor-pointer ${!saveAddressChecked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}>Set as default address</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <MapPin size={18} className="text-purple-600" />
                    Billing Address
                  </h2>
                  <label className="flex items-center gap-2 cursor-pointer bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 hover:border-purple-400 transition-all">
                    <input
                      type="checkbox"
                      checked={sameAsShipping}
                      onChange={(e) => setSameAsShipping(e.target.checked)}
                      className="text-purple-600 w-4 h-4"
                    />
                    <span className="text-sm text-purple-700 font-medium">Same as shipping</span>
                  </label>
                </div>
                {!sameAsShipping && (
                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Full Name</label>
                      <input
                        type="text"
                        value={billingAddress.fullName}
                        onChange={(e) => handleFieldChange('fullName', e.target.value, 'billing')}
                        onBlur={() => handleFieldBlur('fullName', 'billing')}
                        maxLength={getAddressValidation().fullNameMaxLength}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['billing_fullName'] && touchedFields['billing_fullName']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="Enter full name"
                      />
                      {validationErrors['billing_fullName'] && touchedFields['billing_fullName'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['billing_fullName']}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={billingAddress.phoneNumber}
                        onChange={(e) => handleFieldChange('phoneNumber', e.target.value, 'billing')}
                        onBlur={() => handleFieldBlur('phoneNumber', 'billing')}
                        maxLength={getAddressValidation().phoneNumberMaxLength}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['billing_phoneNumber'] && touchedFields['billing_phoneNumber']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="Enter phone number"
                      />
                      {validationErrors['billing_phoneNumber'] && touchedFields['billing_phoneNumber'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['billing_phoneNumber']}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">Address Line 1</label>
                      <input
                        type="text"
                        value={billingAddress.addressLine1}
                        onChange={(e) => handleFieldChange('addressLine1', e.target.value, 'billing')}
                        onBlur={() => handleFieldBlur('addressLine1', 'billing')}
                        maxLength={getAddressValidation().addressLine1MaxLength}
                        className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                          validationErrors['billing_addressLine1'] && touchedFields['billing_addressLine1']
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                        }`}
                        placeholder="House no, Street, Area"
                      />
                      {validationErrors['billing_addressLine1'] && touchedFields['billing_addressLine1'] && (
                        <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                          <AlertCircle size={12} md:size={14} />
                          <span>{validationErrors['billing_addressLine1']}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">City</label>
                        <input
                          type="text"
                          value={billingAddress.city}
                          onChange={(e) => handleFieldChange('city', e.target.value, 'billing')}
                          onBlur={() => handleFieldBlur('city', 'billing')}
                          maxLength={getAddressValidation().cityMaxLength}
                          className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            validationErrors['billing_city'] && touchedFields['billing_city']
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                          }`}
                          placeholder="City"
                        />
                        {validationErrors['billing_city'] && touchedFields['billing_city'] && (
                          <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                            <AlertCircle size={12} md:size={14} />
                            <span>{validationErrors['billing_city']}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1 md:mb-2">PIN Code</label>
                        <input
                          type="text"
                          value={billingAddress.pinCode}
                          onChange={(e) => handleFieldChange('pinCode', e.target.value, 'billing')}
                          onBlur={() => handleFieldBlur('pinCode', 'billing')}
                          maxLength={getAddressValidation().pinCodeMaxLength}
                          className={`w-full px-4 py-2 md:py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            validationErrors['billing_pinCode'] && touchedFields['billing_pinCode']
                              ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                              : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
                          }`}
                          placeholder="PIN Code"
                        />
                        {validationErrors['billing_pinCode'] && touchedFields['billing_pinCode'] && (
                          <div className="mt-1 flex items-center gap-1 text-red-600 text-xs md:text-sm">
                            <AlertCircle size={12} md:size={14} />
                            <span>{validationErrors['billing_pinCode']}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 md:space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 sticky top-20 lg:top-24 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

                {/* Product Items */}
                <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                  {cart?.items?.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="flex gap-3 pb-3 border-b border-gray-100">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.productImage ? (
                          <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={20} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm line-clamp-1">{item.productName}</p>
                        <p className="text-xs text-gray-600">Qty: {item.quantity} | {item.color} {item.size && `| ${item.size}`}</p>
                        <p className="text-purple-600 font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Subtotal</span>
                    <span className="font-medium text-gray-900">₹{cart?.subtotal?.toLocaleString() || 0}</span>
                  </div>
                  {cart?.discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Discount</span>
                      <span className="font-medium text-green-600">-₹{cart.discountAmount?.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Delivery</span>
                    <span className="font-medium text-gray-900">
                      {cart?.deliveryCharge > 0 ? `₹${cart.deliveryCharge.toLocaleString()}` : 'FREE'}
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 font-semibold text-base">Total</span>
                      <span className="text-gray-900 font-bold text-xl">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <button
                    onClick={() => setCheckoutStep('cart')}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 md:py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-sm md:text-base"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleContinueToPayment}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 md:py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} md:size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 md:py-8 lg:py-10">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <ShoppingBag size={20} md:size={24} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
              Shopping Cart
            </h1>
          </div>
          <p className="text-gray-600 flex items-center gap-2 text-sm md:text-base ml-13">
            <Package size={16} md:size={18} className="text-purple-600" />
            {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-3 md:space-y-4">
            {cart?.items?.map((item, index) => (
              <div key={`${item.productId}-${item.variantId}`} className="bg-white rounded-xl shadow-md border border-gray-200 hover:border-purple-300 transition-all overflow-hidden">
                <div className="flex gap-3 p-3">
                  {/* Product Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {item.productImage ? (
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '';
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 md:w-12 md:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg></div>';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} md:size={40} className="text-gray-400" />
                      </div>
                    )}
                    {item.discountPercentage > 0 && (
                      <div className="absolute top-1 left-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        {item.discountPercentage}% OFF
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg line-clamp-2 mb-1">{item.productName}</h3>
                      
                      {/* Variant Info */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        {item.color && (
                          <div className="flex items-center gap-1 bg-purple-50 px-1.5 py-0.5 rounded-md border border-purple-200">
                            <div 
                              className="w-3 h-3 rounded-full border border-white shadow-sm"
                              style={{ backgroundColor: item.colorCode || item.color }}
                            />
                            <span className="text-[10px] sm:text-xs font-medium text-purple-700">{item.color}</span>
                          </div>
                        )}
                        {item.size && (
                          <span className="bg-pink-50 text-pink-700 px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-medium border border-pink-200">
                            {item.size}
                          </span>
                        )}
                      </div>
                      
                      {/* Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl font-bold text-purple-600">₹{item.price?.toLocaleString()}</span>
                        {item.originalPrice > item.price && (
                          <span className="text-gray-400 line-through text-xs sm:text-sm">₹{item.originalPrice?.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Stock Info */}
                    {item.stock > 0 && item.stock <= 5 && (
                      <p className="text-orange-600 text-[10px] sm:text-xs font-medium flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-md w-fit border border-orange-300">
                        <Truck size={10} sm:size={12} />
                        Only {item.stock} left!
                      </p>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveItem(item.productId, item.variantId, item.productName)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                {/* Quantity and Subtotal */}
                <div className="flex items-center justify-between px-3 pb-3 pt-2 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600 font-medium text-xs sm:text-sm">Qty:</span>
                    <div className="flex items-center gap-1 bg-white rounded-lg p-0.5 border border-gray-200">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={14} sm:size={16} className={item.quantity <= 1 ? 'text-gray-400' : 'text-gray-700'} />
                      </button>
                      <span className="w-8 sm:w-10 text-center font-bold text-gray-900 text-sm sm:text-base">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.variantId, item.quantity + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded flex items-center justify-center hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus size={14} sm:size={16} className={item.quantity >= item.stock ? 'text-gray-400' : 'text-gray-700'} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-xs sm:text-sm font-medium">Subtotal</p>
                    <p className="text-base sm:text-lg font-bold text-purple-600">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Clear Cart Button */}
            <button
              onClick={handleClearCart}
              className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 size={16} md:size={20} />
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 xl:w-96">
            <div className="bg-white rounded-2xl shadow-sm p-5 md:p-6 sticky top-20 lg:top-24 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-5">Order Summary</h2>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{cart?.subtotal?.toLocaleString() || 0}</span>
                </div>
                {cart?.discountAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Discount</span>
                    <span className="font-medium text-green-600">-₹{cart.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Delivery</span>
                  <span className="font-medium text-gray-900">
                    {cart?.deliveryCharge > 0 ? `₹${cart.deliveryCharge.toLocaleString()}` : 'FREE'}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-900 font-semibold text-base">Total</span>
                    <span className="text-gray-900 font-bold text-xl">₹{cart?.totalAmount?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteModal.show}
        onClose={() => setDeleteModal({ show: false, type: '', id: null, name: '', productId: null, variantId: null })}
        onConfirm={confirmDelete}
        deleteTarget={{ type: deleteModal.type, name: deleteModal.name }}
      />
    </div>
  );
};

export default CartPage;
