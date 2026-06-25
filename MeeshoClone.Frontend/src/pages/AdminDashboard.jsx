import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { productAPI, vendorAPI, orderAPI, seedAPI, siteConfigAPI, categoryAPI, subCategoryAPI, userAPI, validationRulesAPI } from '../services/api';
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
  Database,
  X,
  Folder,
  FolderOpen,
  UserCheck,
  Shield,
  Power,
  Eye,
  Camera,
  CreditCard,
  MapPin,
  Building,
  FileText
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
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [categoryFilter, setCategoryFilter] = useState({ search: '', status: '' });
  const [subCategoryFilter, setSubCategoryFilter] = useState({ search: '', categoryId: '', status: '' });
  const [productFilter, setProductFilter] = useState({ search: '', category: '', status: '' });
  const [vendorFilter, setVendorFilter] = useState({ search: '', status: '' });
  const [orderFilter, setOrderFilter] = useState({ search: '', status: '' });
  const [userFilter, setUserFilter] = useState({ search: '', role: '', status: '' });
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingVendor, setEditingVendor] = useState(null);
  
  // Form data
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    displayName: '',
    icon: '',
    image: '',
    imageBase64: '',
    description: '',
    isFeatured: false,
    displayOrder: 0,
    isActive: true,
  });
  
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    displayName: '',
    categoryId: '',
    image: '',
    imageBase64: '',
    description: '',
    isFeatured: false,
    displayOrder: 0,
    isActive: true,
  });
  
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategory: '',
    stock: '',
    imageUrls: [],
    imageBase64: [],
    isActive: true,
    isFeatured: false,
    isTrending: false,
  });

  const [vendorForm, setVendorForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    businessName: '',
    businessType: '',
    description: '',
    isActive: true,
    isVerified: false,
  });
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState({});
  
  // Validation rules from backend
  const [backendValidationRules, setBackendValidationRules] = useState({});
  
  // Default validation rules (fallback if backend not available)
  const defaultValidationRules = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    phone: {
      pattern: /^[0-9]{10}$/,
      message: 'Please enter a valid 10-digit phone number'
    },
    required: {
      message: 'This field is required'
    },
    minLength: (min) => ({
      message: `Minimum length is ${min} characters`
    }),
    maxLength: (max) => ({
      message: `Maximum length is ${max} characters`
    })
  };
  
  // Load validation rules from backend
  const loadValidationRules = async () => {
    try {
      const response = await validationRulesAPI.getAll();
      if (response.data.success) {
        const rules = {};
        response.data.validationRules.forEach(rule => {
          rules[rule.entity] = rule.fields;
        });
        setBackendValidationRules(rules);
        console.log('Loaded validation rules from backend:', rules);
      }
    } catch (error) {
      console.warn('Could not load validation rules from backend, using defaults:', error.message);
    }
  };
  
  // Validation function
  const validateField = (fieldName, value, rules) => {
    const errors = { ...validationErrors };
    let error = '';
    
    if (rules.required && !value) {
      error = defaultValidationRules.required.message;
    } else if (rules.pattern && value && !rules.pattern.test(value)) {
      error = rules.pattern.message || defaultValidationRules[rules.patternType]?.message;
    } else if (rules.minLength && value && value.length < rules.minLength) {
      error = defaultValidationRules.minLength(rules.minLength).message;
    } else if (rules.maxLength && value && value.length > rules.maxLength) {
      error = defaultValidationRules.maxLength(rules.maxLength).message;
    }
    
    if (error) {
      errors[fieldName] = error;
    } else {
      delete errors[fieldName];
    }
    
    setValidationErrors(errors);
    return !error;
  };
  
  // Validate entire form
  const validateForm = (form, rules) => {
    let isValid = true;
    const errors = {};
    
    Object.keys(rules).forEach(fieldName => {
      const fieldRules = rules[fieldName];
      const value = form[fieldName];
      let error = '';
      
      if (fieldRules.required && !value) {
        error = defaultValidationRules.required.message;
      } else if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
        error = fieldRules.message || 'Invalid format';
      } else if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
        error = `Minimum length is ${fieldRules.minLength} characters`;
      } else if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
        error = `Maximum length is ${fieldRules.maxLength} characters`;
      }
      
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });
    
    setValidationErrors(errors);
    return isValid;
  };
  
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

  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSubCategories: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
    activeProducts: 0,
    featuredProducts: 0,
    activeVendors: 0,
    verifiedVendors: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
    topProducts: [],
  });

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    loadDashboardData();
    loadValidationRules();
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      const [productsRes, vendorsRes, configRes, categoriesRes, subCategoriesRes, ordersRes] = await Promise.all([
        productAPI.getAll(),
        vendorAPI.getAll(),
        siteConfigAPI.getConfiguration(),
        categoryAPI.getAll(),
        subCategoryAPI.getAll(),
        orderAPI.getAll()
      ]);
      
      // Try to load users separately to handle 404 gracefully
      let usersRes;
      try {
        usersRes = await userAPI.getAll();
      } catch (userError) {
        console.warn('User API not available:', userError.message);
        usersRes = { data: { success: false, users: [] } };
      }
      
      console.log('Categories response:', categoriesRes.data);
      console.log('SubCategories response:', subCategoriesRes.data);
      
      if (productsRes.data.success) {
        setProducts(productsRes.data.products);
        const products = productsRes.data.products;
        const activeProducts = products.filter(p => p.isActive).length;
        const featuredProducts = products.filter(p => p.isFeatured).length;
        setDashboardStats(prev => ({
          ...prev,
          totalProducts: products.length,
          activeProducts,
          featuredProducts,
        }));
      }
      
      if (vendorsRes.data.success) {
        setVendors(vendorsRes.data.vendors);
        const vendors = vendorsRes.data.vendors;
        const activeVendors = vendors.filter(v => v.isActive).length;
        const verifiedVendors = vendors.filter(v => v.isVerified).length;
        setDashboardStats(prev => ({
          ...prev,
          totalVendors: vendors.length,
          activeVendors,
          verifiedVendors,
        }));
      }

      if (configRes.data.success) {
        setConfig(configRes.data.configuration);
      }
      
      if (categoriesRes.data.success) {
        console.log('Setting categories:', categoriesRes.data.categories);
        setCategories(categoriesRes.data.categories);
        setDashboardStats(prev => ({
          ...prev,
          totalCategories: categoriesRes.data.categories.length,
        }));
      } else {
        console.error('Categories API returned success=false');
      }
      
      if (subCategoriesRes.data.success) {
        console.log('Setting subCategories:', subCategoriesRes.data.subCategories);
        setSubCategories(subCategoriesRes.data.subCategories);
        setDashboardStats(prev => ({
          ...prev,
          totalSubCategories: subCategoriesRes.data.subCategories.length,
        }));
      } else {
        console.error('SubCategories API returned success=false');
      }

      if (ordersRes.data.success) {
        setOrders(ordersRes.data.orders);
        const orders = ordersRes.data.orders;
        const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'completed').length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        setDashboardStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          pendingOrders,
          completedOrders,
          totalRevenue,
        }));
      }

      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
        setDashboardStats(prev => ({
          ...prev,
          totalUsers: usersRes.data.users.length,
        }));
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

  // Category handlers
  const handleOpenCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        displayName: category.displayName,
        icon: category.icon,
        image: category.image,
        imageBase64: category.imageBase64 || '',
        description: category.description,
        isFeatured: category.isFeatured,
        displayOrder: category.displayOrder,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        displayName: '',
        icon: '',
        image: '',
        imageBase64: '',
        description: '',
        isFeatured: false,
        displayOrder: 0,
        isActive: true,
      });
    }
    setShowCategoryModal(true);
  };

  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      displayName: '',
      icon: '',
      image: '',
      description: '',
      isFeatured: false,
      displayOrder: 0,
      isActive: true,
    });
    setValidationErrors({});
  };

  const handleSaveCategory = async () => {
    // Validate form before submission
    const categoryRules = {
      name: { required: true, minLength: 2, maxLength: 50 },
      displayName: { required: true, minLength: 2, maxLength: 100 },
      icon: { required: true },
      description: { maxLength: 500 }
    };
    
    if (!validateForm(categoryForm, categoryRules)) {
      alert('Please fix the validation errors before saving');
      return;
    }
    
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, categoryForm);
        // Update dependent subcategories when category name changes
        if (categoryForm.name !== editingCategory.name) {
          await updateSubcategoriesOnCategoryChange(editingCategory.id, categoryForm.name);
        }
      } else {
        await categoryAPI.create(categoryForm);
      }
      alert(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      handleCloseCategoryModal();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category');
    }
  };

  const updateSubcategoriesOnCategoryChange = async (categoryId, newCategoryName) => {
    try {
      const subCategoriesRes = await subCategoryAPI.getByCategory(categoryId);
      if (subCategoriesRes.data.success && subCategoriesRes.data.subcategories) {
        for (const subCategory of subCategoriesRes.data.subcategories) {
          await subCategoryAPI.update(subCategory.id, {
            ...subCategory,
            categoryName: newCategoryName
          });
        }
      }
    } catch (error) {
      console.error('Error updating subcategories on category change:', error);
    }
  };

  const handleDeleteCategory = (category) => {
    setDeleteTarget({
      type: 'category',
      id: category.id,
      name: category.displayName || category.name
    });
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteTarget.type === 'category') {
        await categoryAPI.delete(deleteTarget.id);
      } else if (deleteTarget.type === 'subcategory') {
        await subCategoryAPI.delete(deleteTarget.id);
      } else if (deleteTarget.type === 'product') {
        await productAPI.delete(deleteTarget.id);
      } else if (deleteTarget.type === 'vendor') {
        await vendorAPI.delete(deleteTarget.id);
      }
      alert(`${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted successfully!`);
      loadDashboardData();
    } catch (error) {
      console.error(`Error deleting ${deleteTarget.type}:`, error);
      alert(`Error deleting ${deleteTarget.type}`);
    }
    setShowDeleteModal(false);
    setDeleteTarget({ type: '', id: '', name: '' });
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteTarget({ type: '', id: '', name: '' });
  };

  // SubCategory handlers
  const handleOpenSubCategoryModal = (subCategory = null) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setSubCategoryForm({
        name: subCategory.name,
        displayName: subCategory.displayName,
        categoryId: subCategory.categoryId,
        image: subCategory.image,
        imageBase64: subCategory.imageBase64 || '',
        description: subCategory.description,
        isFeatured: subCategory.isFeatured,
        displayOrder: subCategory.displayOrder,
        isActive: subCategory.isActive,
      });
    } else {
      setEditingSubCategory(null);
      setSubCategoryForm({
        name: '',
        displayName: '',
        categoryId: '',
        image: '',
        imageBase64: '',
        description: '',
        isFeatured: false,
        displayOrder: 0,
        isActive: true,
      });
    }
    setShowSubCategoryModal(true);
  };

  const handleCloseSubCategoryModal = () => {
    setShowSubCategoryModal(false);
    setEditingSubCategory(null);
    setSubCategoryForm({
      name: '',
      displayName: '',
      categoryId: '',
      image: '',
      description: '',
      isFeatured: false,
      displayOrder: 0,
      isActive: true,
    });
    setValidationErrors({});
  };

  const handleSaveSubCategory = async () => {
    try {
      if (editingSubCategory) {
        await subCategoryAPI.update(editingSubCategory.id, subCategoryForm);
        // Update dependent products when subcategory name changes
        if (subCategoryForm.name !== editingSubCategory.name) {
          await updateProductsOnSubcategoryChange(editingSubCategory.id, subCategoryForm.name);
        }
      } else {
        await subCategoryAPI.create(subCategoryForm);
      }
      alert(editingSubCategory ? 'SubCategory updated successfully!' : 'SubCategory created successfully!');
      handleCloseSubCategoryModal();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      alert('Error saving subcategory');
    }
  };

  const updateProductsOnSubcategoryChange = async (subCategoryId, newSubCategoryName) => {
    try {
      const productsRes = await productAPI.getAll();
      if (productsRes.data.success && productsRes.data.products) {
        const productsToUpdate = productsRes.data.products.filter(
          p => p.subCategory === editingSubCategory.name
        );
        for (const product of productsToUpdate) {
          await productAPI.update(product.id, {
            ...product,
            subCategory: newSubCategoryName
          });
        }
      }
    } catch (error) {
      console.error('Error updating products on subcategory change:', error);
    }
  };

  const handleDeleteSubCategory = (subCategory) => {
    setDeleteTarget({
      type: 'subcategory',
      id: subCategory.id,
      name: subCategory.displayName || subCategory.name
    });
    setShowDeleteModal(true);
  };

  // Product handlers
  const handleOpenProductModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.originalPrice,
        category: product.category,
        subCategory: product.subCategory,
        stock: product.stock,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isTrending: product.isTrending,
        imageUrls: product.imageUrls || [],
        imageBase64: product.imageBase64 || [],
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        subCategory: '',
        stock: '',
        imageUrls: [],
        imageBase64: [],
        isActive: true,
        isFeatured: false,
        isTrending: false,
      });
    }
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      subCategory: '',
      stock: '',
      isActive: true,
      isFeatured: false,
      isTrending: false,
      imageUrls: [],
    });
    setValidationErrors({});
  };

  const handleSaveProduct = async () => {
    try {
      const productData = {
        ...productForm,
        price: parseFloat(productForm.price),
        originalPrice: parseFloat(productForm.originalPrice),
        stock: parseInt(productForm.stock),
        vendorId: 'admin',
        companyId: 'admin',
        discountPercentage: productForm.originalPrice 
          ? Math.round(((parseFloat(productForm.originalPrice) - parseFloat(productForm.price)) / parseFloat(productForm.originalPrice)) * 100)
          : 0,
      };
      
      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData);
      } else {
        await productAPI.create(productData);
      }
      alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      handleCloseProductModal();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    }
  };

  const handleDeleteProduct = (product) => {
    setDeleteTarget({
      type: 'product',
      id: product.id,
      name: product.name
    });
    setShowDeleteModal(true);
  };

  // Vendor handlers
  const handleOpenVendorModal = (vendor = null) => {
    if (vendor) {
      setEditingVendor(vendor);
      setVendorForm({
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        businessName: vendor.businessName,
        businessType: vendor.businessType,
        description: vendor.description,
        isActive: vendor.isActive,
        isVerified: vendor.isVerified,
      });
    } else {
      setEditingVendor(null);
      setVendorForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        businessName: '',
        businessType: '',
        description: '',
        isActive: true,
        isVerified: false,
      });
    }
    setShowVendorModal(true);
  };

  const handleCloseVendorModal = () => {
    setShowVendorModal(false);
    setEditingVendor(null);
    setVendorForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      businessName: '',
      businessType: '',
      description: '',
      isActive: true,
      isVerified: false,
    });
    setValidationErrors({});
  };

  const handleSaveVendor = async () => {
    // Validate form before submission
    const vendorRules = {
      name: { required: true, minLength: 2, maxLength: 100 },
      email: { required: true, pattern: defaultValidationRules.email },
      phone: { required: true, pattern: defaultValidationRules.phone },
      businessName: { required: true, minLength: 2, maxLength: 200 },
      businessType: { required: true },
      address: { maxLength: 500 },
      description: { maxLength: 1000 }
    };
    
    if (!validateForm(vendorForm, vendorRules)) {
      alert('Please fix the validation errors before saving');
      return;
    }
    
    try {
      if (editingVendor) {
        await vendorAPI.update(editingVendor.id, vendorForm);
        alert('Vendor updated successfully!');
      } else {
        await vendorAPI.create(vendorForm);
        alert('Vendor created successfully!');
      }
      handleCloseVendorModal();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor');
    }
  };

  const handleDeleteVendor = (vendor) => {
    setDeleteTarget({
      type: 'vendor',
      id: vendor.id,
      name: vendor.name || vendor.businessName
    });
    setShowDeleteModal(true);
  };

  // Image upload handlers
  const handleImageUpload = (e, formType) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (formType === 'product') {
        for (const file of files) {
          convertToBase64(file, formType);
        }
      } else {
        const file = files[0];
        convertToBase64(file, formType);
      }
    }
  };

  const handleImageDrop = (e, formType) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (formType === 'product') {
        for (const file of files) {
          convertToBase64(file, formType);
        }
      } else {
        const file = files[0];
        convertToBase64(file, formType);
      }
    }
  };

  const convertToBase64 = (file, formType) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      if (formType === 'category') {
        setCategoryForm({ ...categoryForm, imageBase64: base64, image: file.name });
      } else if (formType === 'subcategory') {
        setSubCategoryForm({ ...subCategoryForm, imageBase64: base64, image: file.name });
      } else if (formType === 'product') {
        setProductForm(prev => ({
          ...prev,
          imageBase64: [...prev.imageBase64, base64],
          imageUrls: [...prev.imageUrls, file.name]
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (e, formType, index = null) => {
    e.preventDefault();
    e.stopPropagation();
    if (formType === 'category') {
      setCategoryForm({ ...categoryForm, imageBase64: '', image: '' });
    } else if (formType === 'subcategory') {
      setSubCategoryForm({ ...subCategoryForm, imageBase64: '', image: '' });
    } else if (formType === 'product' && index !== null) {
      setProductForm(prev => ({
        ...prev,
        imageBase64: prev.imageBase64.filter((_, i) => i !== index),
        imageUrls: prev.imageUrls.filter((_, i) => i !== index)
      }));
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
    { id: 'categories', label: 'Categories', icon: Folder, section: 'management' },
    { id: 'subcategories', label: 'SubCategories', icon: FolderOpen, section: 'management' },
    { id: 'vendors', label: 'Vendors', icon: Users, section: 'management' },
    { id: 'orders', label: 'Order Management', icon: ShoppingCart, section: 'management' },
    { id: 'users', label: 'Users', icon: UserCheck, section: 'management' },
    { id: 'profile', label: 'My Profile', icon: Users, section: 'personal' },
    { id: 'settings', label: 'My Settings', icon: Settings, section: 'personal' },
    { id: 'configuration', label: 'Site Configuration', icon: Settings, section: 'configuration' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 sm:py-6">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">Admin Dashboard</h1>
              <p className="opacity-90 text-sm sm:text-base">Welcome back, {user?.fullName}</p>
            </div>
            <button
              onClick={handleSeedDatabase}
              className="bg-white text-purple-600 px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-pink-100 transition-colors flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
            >
              <Database size={16} />
              <span className="hidden sm:inline">Seed Database</span>
              <span className="sm:hidden">Seed</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0 w-full">
            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 sticky top-4 sm:top-20">
              <nav className="space-y-4 sm:space-y-6">
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
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">My Profile</h2>
                
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-4 sm:p-6 mb-6 text-white">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-4 border-white/30">
                        {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <button className="absolute bottom-0 right-0 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-xl sm:text-2xl font-bold">{user?.fullName || 'Admin'}</h3>
                      <p className="opacity-90 text-sm sm:text-base">{user?.email || 'admin@meesho.com'}</p>
                      <div className="flex gap-2 mt-2 justify-center sm:justify-start">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                          Administrator
                        </span>
                        <span className="bg-green-400/20 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Personal Information</h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user?.fullName || ''}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        defaultValue={user?.email || ''}
                        disabled
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-100 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                      <input
                        type="tel"
                        defaultValue={user?.phone || ''}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                      <textarea
                        defaultValue={user?.address || ''}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                      <CreditCard size={18} />
                      Payment Methods
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-blue-600" />
                            <span className="font-semibold text-gray-800">Visa Card</span>
                          </div>
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Default</span>
                        </div>
                        <p className="text-sm text-gray-600">**** **** **** 4242</p>
                        <p className="text-xs text-gray-500">Expires: 12/25</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard size={16} className="text-gray-600" />
                            <span className="font-semibold text-gray-800">MasterCard</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">**** **** **** 5555</p>
                        <p className="text-xs text-gray-500">Expires: 08/26</p>
                      </div>
                      <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} />
                        Add Payment Method
                      </button>
                    </div>
                  </div>

                  {/* Addresses */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                      <MapPin size={18} />
                      Addresses
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">Home Address</span>
                          <span className="text-xs bg-green-500 text-white px-2 py-1 rounded">Default</span>
                        </div>
                        <p className="text-sm text-gray-600">123 Main Street</p>
                        <p className="text-sm text-gray-600">Mumbai, Maharashtra 400001</p>
                        <p className="text-xs text-gray-500">India</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-800">Office Address</span>
                        </div>
                        <p className="text-sm text-gray-600">456 Business Park</p>
                        <p className="text-sm text-gray-600">Bangalore, Karnataka 560001</p>
                        <p className="text-xs text-gray-500">India</p>
                      </div>
                      <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} />
                        Add Address
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bank Details & Tax Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t">
                  {/* Bank Details */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                      <Building size={18} />
                      Bank Details
                    </h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter bank name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number</label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter IFSC code"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Account Type</label>
                      <select className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all">
                        <option value="">Select account type</option>
                        <option value="savings">Savings Account</option>
                        <option value="current">Current Account</option>
                      </select>
                    </div>
                  </div>

                  {/* Tax Information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                      <FileText size={18} />
                      Tax Information
                    </h4>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">PAN Number</label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter PAN number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">GST Number</label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Tax ID</label>
                      <input
                        type="text"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter tax ID"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked={false} className="w-4 h-4" />
                        <span className="text-sm text-gray-700">I am tax-exempt</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2 mb-4">
                    <Shield size={18} />
                    Security Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                      Change Password
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                    Update Profile
                  </button>
                  <button className="flex-1 border-2 border-purple-600 text-purple-600 px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-purple-50 transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <Package className="text-blue-600" size={20} sm:size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={16} sm:size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{dashboardStats.totalProducts}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Total Products</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="text-green-600">{dashboardStats.activeProducts} active</span> • 
                      <span className="text-purple-600"> {dashboardStats.featuredProducts} featured</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Users className="text-purple-600" size={20} sm:size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={16} sm:size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{dashboardStats.totalVendors}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Total Vendors</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="text-green-600">{dashboardStats.activeVendors} active</span> • 
                      <span className="text-blue-600"> {dashboardStats.verifiedVendors} verified</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <ShoppingCart className="text-green-600" size={20} sm:size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={16} sm:size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{dashboardStats.totalOrders}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Total Orders</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <span className="text-yellow-600">{dashboardStats.pendingOrders} pending</span> • 
                      <span className="text-green-600"> {dashboardStats.completedOrders} completed</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <DollarSign className="text-yellow-600" size={20} sm:size={24} />
                      </div>
                      <TrendingUp className="text-green-600" size={16} sm:size={20} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">₹{dashboardStats.totalRevenue.toLocaleString()}</h3>
                    <p className="text-gray-600 text-sm sm:text-base">Total Revenue</p>
                  </div>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <Folder size={20} sm:size={24} />
                      </div>
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm">Total Categories</p>
                        <h3 className="text-2xl sm:text-3xl font-bold">{dashboardStats.totalCategories}</h3>
                      </div>
                    </div>
                    <p className="text-white/70 text-xs">{dashboardStats.totalSubCategories} subcategories</p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <UserCheck size={20} sm:size={24} />
                      </div>
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm">Total Users</p>
                        <h3 className="text-2xl sm:text-3xl font-bold">{dashboardStats.totalUsers}</h3>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg p-4 sm:p-6 text-white">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-white/20 p-2 rounded-lg">
                        <TrendingUp size={20} sm:size={24} />
                      </div>
                      <div>
                        <p className="text-white/80 text-xs sm:text-sm">Growth Rate</p>
                        <h3 className="text-2xl sm:text-3xl font-bold">+12.5%</h3>
                      </div>
                    </div>
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
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Products Management</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleOpenProductModal()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base justify-center"
                    >
                      <Plus size={16} sm:size={18} />
                      <span>Add Product</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={productFilter.search}
                      onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
                      className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <select 
                      value={productFilter.category}
                      onChange={(e) => setProductFilter({ ...productFilter, category: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.displayName || cat.name}</option>
                      ))}
                    </select>
                    <select 
                      value={productFilter.status}
                      onChange={(e) => setProductFilter({ ...productFilter, status: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="featured">Featured</option>
                      <option value="trending">Trending</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Product</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Price</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Stock</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Category</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(product => {
                          const matchesSearch = product.name?.toLowerCase().includes(productFilter.search.toLowerCase()) || 
                                              product.description?.toLowerCase().includes(productFilter.search.toLowerCase());
                          const matchesCategory = productFilter.category === '' || product.category === productFilter.category;
                          const matchesStatus = productFilter.status === '' || 
                                              (productFilter.status === 'active' && product.isActive) ||
                                              (productFilter.status === 'inactive' && !product.isActive) ||
                                              (productFilter.status === 'featured' && product.isFeatured) ||
                                              (productFilter.status === 'trending' && product.isTrending);
                          return matchesSearch && matchesCategory && matchesStatus;
                        })
                        .map(product => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <img 
                                src={product.imageUrls?.[0] || product.imageBase64?.[0] || 'https://via.placeholder.com/50'} 
                                alt={product.name}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg"
                              />
                              <div>
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">{product.name}</p>
                                <p className="text-xs sm:text-sm text-gray-600">{product.category}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="font-semibold text-sm sm:text-base">₹{product.price?.toLocaleString()}</p>
                            <p className="text-xs sm:text-sm text-gray-600 line-through">₹{product.originalPrice?.toLocaleString()}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="font-semibold text-sm sm:text-base">{product.stock}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{product.category}</p>
                            <p className="text-xs sm:text-sm text-gray-500">{product.subCategory}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {product.isFeatured && (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                  Featured
                                </span>
                              )}
                              {product.isTrending && (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700">
                                  Trending
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleOpenProductModal(product)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit size={16} sm:size={18} className="text-blue-600" />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} sm:size={18} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {products.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No products found. Click "Add Product" to create one.
                    </div>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500">Showing {products.length} products</p>
              </div>
            )}

            {activeTab === 'categories' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Categories Management</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={categoryFilter.search}
                      onChange={(e) => setCategoryFilter({ ...categoryFilter, search: e.target.value })}
                      className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <select 
                      value={categoryFilter.status}
                      onChange={(e) => setCategoryFilter({ ...categoryFilter, status: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {categories
                    .filter(cat => {
                      const matchesSearch = cat.displayName?.toLowerCase().includes(categoryFilter.search.toLowerCase()) || 
                                          cat.name?.toLowerCase().includes(categoryFilter.search.toLowerCase());
                      const matchesStatus = categoryFilter.status === '' || 
                                          (categoryFilter.status === 'active' && cat.isActive) ||
                                          (categoryFilter.status === 'inactive' && !cat.isActive) ||
                                          (categoryFilter.status === 'featured' && cat.isFeatured);
                      return matchesSearch && matchesStatus;
                    })
                    .map((category) => (
                    <div key={category.id} className="border rounded-xl p-3 sm:p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-2xl sm:text-3xl">{category.icon || '📦'}</span>
                          <div>
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{category.displayName || category.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">{category.productCount || 0} products</p>
                          </div>
                        </div>
                        {category.isFeatured && (
                          <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleOpenCategoryModal(category)}
                          className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category)}
                          className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="col-span-3 text-center py-12 text-gray-500">
                      No categories found. Click "Add Category" to create one.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'subcategories' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">SubCategories Management</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search subcategories..."
                      value={subCategoryFilter.search}
                      onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, search: e.target.value })}
                      className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <select 
                      value={subCategoryFilter.categoryId}
                      onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, categoryId: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.displayName || cat.name}</option>
                      ))}
                    </select>
                    <select 
                      value={subCategoryFilter.status}
                      onChange={(e) => setSubCategoryFilter({ ...subCategoryFilter, status: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="featured">Featured</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">SubCategory</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Parent Category</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Products</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subCategories
                        .filter(sub => {
                          const matchesSearch = sub.displayName?.toLowerCase().includes(subCategoryFilter.search.toLowerCase()) || 
                                              sub.name?.toLowerCase().includes(subCategoryFilter.search.toLowerCase());
                          const matchesCategory = subCategoryFilter.categoryId === '' || sub.categoryId === subCategoryFilter.categoryId;
                          const matchesStatus = subCategoryFilter.status === '' || 
                                              (subCategoryFilter.status === 'active' && sub.isActive) ||
                                              (subCategoryFilter.status === 'inactive' && !sub.isActive) ||
                                              (subCategoryFilter.status === 'featured' && sub.isFeatured);
                          return matchesSearch && matchesCategory && matchesStatus;
                        })
                        .map((subCategory) => {
                          const parentCategory = categories.find(c => c.id === subCategory.categoryId);
                          return (
                          <tr key={subCategory.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div>
                                <p className="font-semibold text-gray-800 text-sm sm:text-base">{subCategory.displayName || subCategory.name}</p>
                                <p className="text-xs sm:text-sm text-gray-600">{subCategory.description}</p>
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <p className="text-gray-700 text-sm sm:text-base">{parentCategory?.displayName || parentCategory?.name || 'N/A'}</p>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <p className="font-semibold text-sm sm:text-base">{subCategory.productCount || 0}</p>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="flex flex-wrap gap-1 sm:gap-2">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                  subCategory.isActive 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {subCategory.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {subCategory.isFeatured && (
                                  <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-2 sm:py-3 px-2 sm:px-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleOpenSubCategoryModal(subCategory)}
                                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Edit size={16} sm:size={18} className="text-blue-600" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteSubCategory(subCategory)}
                                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <Trash2 size={16} sm:size={18} className="text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {subCategories.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No subcategories found. Click "Add SubCategory" to create one.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'configuration' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Site Configuration</h2>
                  <p className="text-sm text-gray-600 mt-1">Customize your website appearance and settings</p>
                </div>
                
                {/* Site Information Card */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Settings className="text-white" size={20} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Site Information</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Site Name</label>
                      <input
                        type="text"
                        value={config.siteName}
                        onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Enter site name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Site Description</label>
                      <textarea
                        value={config.siteDescription}
                        onChange={(e) => setConfig({ ...config, siteDescription: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        rows={3}
                        placeholder="Enter site description"
                      />
                    </div>
                  </div>
                </div>

                {/* Header Configuration Card */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 sm:p-6 mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <LayoutDashboard className="text-white" size={20} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Header Configuration</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Logo Image</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center">
                          {config.header?.logo ? (
                            <img src={config.header.logo} alt="Logo" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <span className="text-gray-400 text-xs">Logo</span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={config.header?.logo || ''}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, logo: e.target.value } })}
                          className="flex-1 px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="Logo URL"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Background Gradient</label>
                      <input
                        type="text"
                        value={config.header?.backgroundColor}
                        onChange={(e) => setConfig({ ...config, header: { ...config.header, backgroundColor: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="e.g., from-purple-600 to-pink-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Text Color</label>
                      <input
                        type="text"
                        value={config.header?.textColor}
                        onChange={(e) => setConfig({ ...config, header: { ...config.header, textColor: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                        placeholder="e.g., white or #ffffff"
                      />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <label className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="checkbox"
                          checked={config.header?.showSearch}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, showSearch: e.target.checked } })}
                          className="w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Search</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="checkbox"
                          checked={config.header?.showCart}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, showCart: e.target.checked } })}
                          className="w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Cart</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="checkbox"
                          checked={config.header?.showWishlist}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, showWishlist: e.target.checked } })}
                          className="w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">Wishlist</span>
                      </label>
                      <label className="flex items-center gap-2 p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                        <input
                          type="checkbox"
                          checked={config.header?.showDownloadApp}
                          onChange={(e) => setConfig({ ...config, header: { ...config.header, showDownloadApp: e.target.checked } })}
                          className="w-4 h-4"
                        />
                        <span className="text-xs sm:text-sm font-medium text-gray-700">App</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Footer Configuration Card */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Database className="text-white" size={20} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Footer Configuration</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Footer Text</label>
                      <input
                        type="text"
                        value={config.footer?.text || ''}
                        onChange={(e) => setConfig({ ...config, footer: { ...config.footer, text: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        placeholder="Footer copyright text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={config.footer?.email || ''}
                        onChange={(e) => setConfig({ ...config, footer: { ...config.footer, email: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        placeholder="contact@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Social Links</label>
                      <input
                        type="text"
                        value={config.footer?.socialLinks || ''}
                        onChange={(e) => setConfig({ ...config, footer: { ...config.footer, socialLinks: e.target.value } })}
                        className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                        placeholder="Comma-separated social media links"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSaveConfiguration}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    Save Configuration
                  </button>
                  <button className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                    Reset to Default
                  </button>
                </div>
              </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-4 sm:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                          <Folder size={20} sm:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">
                            {editingCategory ? 'Edit Category' : 'Add Category'}
                          </h3>
                          <p className="text-purple-100 text-xs sm:text-sm">
                            {editingCategory ? 'Update category details' : 'Create a new category'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseCategoryModal}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
                      >
                        <X size={18} sm:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Category Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          onBlur={() => validateField('name', categoryForm.name, { required: true, minLength: 2, maxLength: 50 })}
                          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="e.g., fashion"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📝</span>
                      </div>
                      {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                      )}
                    </div>

                    {/* Display Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Display Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={categoryForm.displayName}
                          onChange={(e) => setCategoryForm({ ...categoryForm, displayName: e.target.value })}
                          onBlur={() => validateField('displayName', categoryForm.displayName, { required: true, minLength: 2, maxLength: 100 })}
                          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.displayName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="e.g., Fashion"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✨</span>
                      </div>
                      {validationErrors.displayName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.displayName}</p>
                      )}
                    </div>

                    {/* Icon Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Icon (Emoji)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={categoryForm.icon}
                          onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                          className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="e.g., 👗"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🎨</span>
                      </div>
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Category Image
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleImageDrop(e, 'category')}
                      >
                        {categoryForm.imageBase64 ? (
                          <div className="relative">
                            <img
                              src={categoryForm.imageBase64}
                              alt="Category preview"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(e, 'category')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="text-4xl mb-2 block">📷</span>
                            <p className="text-gray-600 mb-2">Drag & drop an image here</p>
                            <p className="text-gray-400 text-sm">or click to select a file</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'category')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Description
                      </label>
                      <textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        onBlur={() => validateField('description', categoryForm.description, { maxLength: 500 })}
                        className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all resize-none ${validationErrors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                        rows={3}
                        placeholder="Category description"
                      />
                      {validationErrors.description && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
                      )}
                    </div>

                    {/* Display Order Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Display Order
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={categoryForm.displayOrder}
                          onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="0"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔢</span>
                      </div>
                    </div>

                    {/* Toggle Switches */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all border-2 border-transparent hover:border-purple-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={categoryForm.isFeatured}
                            onChange={(e) => setCategoryForm({ ...categoryForm, isFeatured: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Featured</span>
                          <p className="text-xs text-gray-500">Show on homepage</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={categoryForm.isActive}
                            onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Active</span>
                          <p className="text-xs text-gray-500">Visible to users</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                      onClick={handleCloseCategoryModal}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCategory}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {editingCategory ? <Edit size={18} /> : <Plus size={18} />}
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* SubCategory Modal */}
            {showSubCategoryModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-4 sm:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                          <FolderOpen size={20} sm:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">
                            {editingSubCategory ? 'Edit SubCategory' : 'Add SubCategory'}
                          </h3>
                          <p className="text-purple-100 text-xs sm:text-sm">
                            {editingSubCategory ? 'Update subcategory details' : 'Create a new subcategory'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseSubCategoryModal}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
                      >
                        <X size={18} sm:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Parent Category Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Parent Category
                      </label>
                      <div className="relative">
                        <select
                          value={subCategoryForm.categoryId}
                          onChange={(e) => setSubCategoryForm({ ...subCategoryForm, categoryId: e.target.value })}
                          className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none bg-white"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.displayName || category.name}
                            </option>
                          ))}
                        </select>
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📁</span>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
                      </div>
                    </div>

                    {/* Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={subCategoryForm.name}
                          onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                          className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="e.g., men-clothing"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📝</span>
                      </div>
                    </div>

                    {/* Display Name Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Display Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={subCategoryForm.displayName}
                          onChange={(e) => setSubCategoryForm({ ...subCategoryForm, displayName: e.target.value })}
                          className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="e.g., Men's Clothing"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">✨</span>
                      </div>
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        SubCategory Image
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleImageDrop(e, 'subcategory')}
                      >
                        {subCategoryForm.imageBase64 ? (
                          <div className="relative">
                            <img
                              src={subCategoryForm.imageBase64}
                              alt="SubCategory preview"
                              className="max-h-48 mx-auto rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={(e) => handleRemoveImage(e, 'subcategory')}
                              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="text-4xl mb-2 block">📷</span>
                            <p className="text-gray-600 mb-2">Drag & drop an image here</p>
                            <p className="text-gray-400 text-sm">or click to select a file</p>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'subcategory')}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Description Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Description
                      </label>
                      <textarea
                        value={subCategoryForm.description}
                        onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        rows={3}
                        placeholder="Subcategory description"
                      />
                    </div>

                    {/* Display Order Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Display Order
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={subCategoryForm.displayOrder}
                          onChange={(e) => setSubCategoryForm({ ...subCategoryForm, displayOrder: parseInt(e.target.value) })}
                          className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="0"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔢</span>
                      </div>
                    </div>

                    {/* Toggle Switches */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all border-2 border-transparent hover:border-purple-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={subCategoryForm.isFeatured}
                            onChange={(e) => setSubCategoryForm({ ...subCategoryForm, isFeatured: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Featured</span>
                          <p className="text-xs text-gray-500">Show on homepage</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={subCategoryForm.isActive}
                            onChange={(e) => setSubCategoryForm({ ...subCategoryForm, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Active</span>
                          <p className="text-xs text-gray-500">Visible to users</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                      onClick={handleCloseSubCategoryModal}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveSubCategory}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {editingSubCategory ? <Edit size={18} /> : <Plus size={18} />}
                      {editingSubCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-4 sm:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                          <Package size={20} sm:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                          </h3>
                          <p className="text-purple-100 text-xs sm:text-sm">
                            {editingProduct ? 'Update product details' : 'Create a new product'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseProductModal}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
                      >
                        <X size={18} sm:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Product Name & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                          Product Name
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={productForm.name}
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="Product name"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📦</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                          Category
                        </label>
                        <div className="relative">
                          <select
                            value={productForm.category}
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all appearance-none bg-white"
                          >
                            <option value="">Select a category</option>
                            {categories.map((category) => (
                              <option key={category.id} value={category.name}>
                                {category.displayName || category.name}
                              </option>
                            ))}
                          </select>
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📁</span>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">▼</span>
                        </div>
                      </div>
                    </div>

                    {/* SubCategory & Stock */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                          SubCategory
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={productForm.subCategory}
                            onChange={(e) => setProductForm({ ...productForm, subCategory: e.target.value })}
                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="Subcategory name"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📂</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                          Stock
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="0"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📊</span>
                        </div>
                      </div>
                    </div>

                    {/* Price & Original Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                          Price (₹)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="0"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">💰</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                          Original Price (₹)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={productForm.originalPrice}
                            onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                            className="w-full px-4 py-3 pl-11 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            placeholder="0"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🏷️</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Description
                      </label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        rows={4}
                        placeholder="Product description"
                      />
                    </div>

                    {/* Image Upload Field */}
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Product Images
                      </label>
                      <div
                        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleImageDrop(e, 'product')}
                      >
                        <div>
                          <span className="text-4xl mb-2 block">📷</span>
                          <p className="text-gray-600 mb-2">Drag & drop images here</p>
                          <p className="text-gray-400 text-sm">or click to select files</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => {
                            for (const file of e.target.files) {
                              convertToBase64(file, 'product');
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                      {productForm.imageBase64.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                          {productForm.imageBase64.map((img, index) => (
                            <div key={index} className="relative">
                              <img
                                src={img}
                                alt={`Product preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={(e) => handleRemoveImage(e, 'product', index)}
                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Toggle Switches */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={productForm.isActive}
                            onChange={(e) => setProductForm({ ...productForm, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Active</span>
                          <p className="text-xs text-gray-500">Visible to users</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl cursor-pointer hover:from-purple-100 hover:to-pink-100 transition-all border-2 border-transparent hover:border-purple-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={productForm.isFeatured}
                            onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Featured</span>
                          <p className="text-xs text-gray-500">Show on homepage</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl cursor-pointer hover:from-orange-100 hover:to-amber-100 transition-all border-2 border-transparent hover:border-orange-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={productForm.isTrending}
                            onChange={(e) => setProductForm({ ...productForm, isTrending: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-amber-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Trending</span>
                          <p className="text-xs text-gray-500">Popular items</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                      onClick={handleCloseProductModal}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProduct}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {editingProduct ? <Edit size={18} /> : <Plus size={18} />}
                      {editingProduct ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 p-4 sm:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                          <Trash2 size={20} sm:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">Confirm Delete</h3>
                          <p className="text-red-100 text-xs sm:text-sm">
                            This action cannot be undone
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseDeleteModal}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
                      >
                        <X size={18} sm:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 space-y-4">
                    {/* Warning Message */}
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <p className="font-semibold text-red-800">You are about to delete:</p>
                          <p className="text-red-700 font-medium mt-1">
                            {deleteTarget.type === 'category' && `Category: "${deleteTarget.name}"`}
                            {deleteTarget.type === 'subcategory' && `SubCategory: "${deleteTarget.name}"`}
                            {deleteTarget.type === 'product' && `Product: "${deleteTarget.name}"`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Consequence Message */}
                    <div className="text-sm text-gray-600 space-y-2">
                      <p className="font-medium text-gray-800">This will permanently delete the {deleteTarget.type}.</p>
                      {deleteTarget.type === 'category' && (
                        <p className="text-gray-500">All subcategories and products in this category will also be affected.</p>
                      )}
                      {deleteTarget.type === 'subcategory' && (
                        <p className="text-gray-500">Products in this subcategory will also be affected.</p>
                      )}
                      <p className="text-gray-500">Are you sure you want to continue?</p>
                    </div>
                  </div>

                  {/* Footer Buttons */}
                  <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                      onClick={handleCloseDeleteModal}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmDelete}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Vendor Modal */}
            {showVendorModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 mx-2 sm:mx-0">
                  <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-4 sm:p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                          <Users size={20} sm:size={24} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-white">
                            {editingVendor ? 'Edit Vendor' : 'Add Vendor'}
                          </h3>
                          <p className="text-purple-100 text-xs sm:text-sm">
                            {editingVendor ? 'Update vendor details' : 'Create a new vendor'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={handleCloseVendorModal}
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-xl backdrop-blur-sm transition-all"
                      >
                        <X size={18} sm:size={20} className="text-white" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Contact Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={vendorForm.name}
                          onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                          onBlur={() => validateField('name', vendorForm.name, { required: true, minLength: 2, maxLength: 100 })}
                          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="Contact name"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                      </div>
                      {validationErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Business Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={vendorForm.businessName}
                          onChange={(e) => setVendorForm({ ...vendorForm, businessName: e.target.value })}
                          onBlur={() => validateField('businessName', vendorForm.businessName, { required: true, minLength: 2, maxLength: 200 })}
                          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.businessName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="Business name"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🏢</span>
                      </div>
                      {validationErrors.businessName && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.businessName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={vendorForm.email}
                          onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                          onBlur={() => validateField('email', vendorForm.email, { required: true, pattern: defaultValidationRules.email })}
                          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="Email address"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                      </div>
                      {validationErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.email}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Phone
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={vendorForm.phone}
                          onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                          onBlur={() => validateField('phone', vendorForm.phone, { required: true, pattern: defaultValidationRules.phone })}
                          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="Phone number"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                      </div>
                      {validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Business Type
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={vendorForm.businessType}
                          onChange={(e) => setVendorForm({ ...vendorForm, businessType: e.target.value })}
                          onBlur={() => validateField('businessType', vendorForm.businessType, { required: true })}
                          className={`w-full px-4 py-3 pl-11 border-2 rounded-xl focus:outline-none focus:ring-2 transition-all ${validationErrors.businessType ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-purple-500 focus:ring-purple-500/20'}`}
                          placeholder="Business type"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🏷️</span>
                      </div>
                      {validationErrors.businessType && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.businessType}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Address
                      </label>
                      <textarea
                        value={vendorForm.address}
                        onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        rows={3}
                        placeholder="Business address"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <span className="w-1 h-4 bg-gradient-to-b from-purple-600 to-pink-500 rounded-full"></span>
                        Description
                      </label>
                      <textarea
                        value={vendorForm.description}
                        onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                        rows={3}
                        placeholder="Vendor description"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl cursor-pointer hover:from-green-100 hover:to-emerald-100 transition-all border-2 border-transparent hover:border-green-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={vendorForm.isActive}
                            onChange={(e) => setVendorForm({ ...vendorForm, isActive: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Active</span>
                          <p className="text-xs text-gray-500">Visible to users</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl cursor-pointer hover:from-blue-100 hover:to-cyan-100 transition-all border-2 border-transparent hover:border-blue-300">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={vendorForm.isVerified}
                            onChange={(e) => setVendorForm({ ...vendorForm, isVerified: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500"></div>
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-700">Verified</span>
                          <p className="text-xs text-gray-500">Trusted vendor</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 p-4 sm:p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button
                      onClick={handleCloseVendorModal}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveVendor}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      {editingVendor ? <Edit size={18} /> : <Plus size={18} />}
                      {editingVendor ? 'Update' : 'Create'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vendors' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Vendors Management</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleOpenVendorModal()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold flex items-center gap-2 text-sm sm:text-base justify-center"
                    >
                      <Plus size={16} sm:size={18} />
                      <span>Add Vendor</span>
                    </button>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={vendorFilter.search}
                      onChange={(e) => setVendorFilter({ ...vendorFilter, search: e.target.value })}
                      className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <select 
                      value={vendorFilter.status}
                      onChange={(e) => setVendorFilter({ ...vendorFilter, status: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Vendor</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Business Type</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Email</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendors
                        .filter(vendor => {
                          const matchesSearch = vendor.name?.toLowerCase().includes(vendorFilter.search.toLowerCase()) || 
                                              vendor.businessName?.toLowerCase().includes(vendorFilter.search.toLowerCase()) ||
                                              vendor.email?.toLowerCase().includes(vendorFilter.search.toLowerCase());
                          const matchesStatus = vendorFilter.status === '' || 
                                              (vendorFilter.status === 'active' && vendor.isActive) ||
                                              (vendorFilter.status === 'inactive' && !vendor.isActive) ||
                                              (vendorFilter.status === 'verified' && vendor.isVerified) ||
                                              (vendorFilter.status === 'pending' && !vendor.isVerified);
                          return matchesSearch && matchesStatus;
                        })
                        .map((vendor) => (
                        <tr key={vendor.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm sm:text-base">{vendor.name}</p>
                              <p className="text-xs sm:text-sm text-gray-600">{vendor.businessName}</p>
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{vendor.businessType}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{vendor.email}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                vendor.isActive 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {vendor.isActive ? 'Active' : 'Inactive'}
                              </span>
                              {vendor.isVerified && (
                                <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                  Verified
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleOpenVendorModal(vendor)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Edit size={16} sm:size={18} className="text-blue-600" />
                              </button>
                              <button 
                                onClick={() => handleDeleteVendor(vendor)}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} sm:size={18} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {vendors.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No vendors found. Click "Add Vendor" to create one.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Orders Management</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search orders..."
                      className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500">
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Order ID</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Customer</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Items</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Total</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Date</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">#{order.id}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{order.customerName || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{order.customerEmail || ''}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{order.items?.length || 0} items</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base">₹{order.totalAmount?.toLocaleString() || 0}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {order.status || 'pending'}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex gap-2">
                              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Eye size={16} sm:size={18} className="text-blue-600" />
                              </button>
                              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Edit size={16} sm:size={18} className="text-green-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No orders found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">Users Management</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userFilter.search}
                      onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                      className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    />
                    <select 
                      value={userFilter.role}
                      onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="vendor">Vendor</option>
                      <option value="user">User</option>
                      <option value="premier">Premier</option>
                    </select>
                    <select 
                      value={userFilter.status}
                      onChange={(e) => setUserFilter({ ...userFilter, status: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                    >
                      <option value="">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">User</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Email</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Role</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Status</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Joined</th>
                        <th className="text-left py-2 sm:py-3 px-2 sm:px-4 font-semibold text-gray-700 text-xs sm:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(user => {
                          const matchesSearch = user.fullName?.toLowerCase().includes(userFilter.search.toLowerCase()) || 
                                              user.email?.toLowerCase().includes(userFilter.search.toLowerCase());
                          const matchesRole = userFilter.role === '' || user.role === userFilter.role;
                          const matchesStatus = userFilter.status === '' || 
                                              (userFilter.status === 'active' && user.isActive) ||
                                              (userFilter.status === 'inactive' && !user.isActive);
                          return matchesSearch && matchesRole && matchesStatus;
                        })
                        .map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm sm:text-base">{user.fullName || 'N/A'}</p>
                              <p className="text-xs text-gray-500">{user.phone || ''}</p>
                            </div>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{user.email}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'vendor' ? 'bg-blue-100 text-blue-700' :
                              user.role === 'premier' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {user.role || 'user'}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <p className="text-gray-700 text-sm sm:text-base">{new Date(user.createdAt).toLocaleDateString()}</p>
                          </td>
                          <td className="py-2 sm:py-3 px-2 sm:px-4">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => {
                                  const newRole = user.role === 'admin' ? 'user' : 'admin';
                                  userAPI.updateRole(user.id, { role: newRole }).then(() => {
                                    setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
                                    alert(`User role updated to ${newRole}`);
                                  });
                                }}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Toggle Admin Role"
                              >
                                <Shield size={16} sm:size={18} className="text-purple-600" />
                              </button>
                              <button 
                                onClick={() => {
                                  userAPI.toggleActive(user.id).then(() => {
                                    setUsers(users.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
                                    alert(`User ${user.isActive ? 'deactivated' : 'activated'}`);
                                  });
                                }}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Toggle Active Status"
                              >
                                <Power size={16} sm:size={18} className={user.isActive ? "text-yellow-600" : "text-green-600"} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Are you sure you want to delete user ${user.fullName}?`)) {
                                    userAPI.delete(user.id).then(() => {
                                      setUsers(users.filter(u => u.id !== user.id));
                                      alert('User deleted successfully');
                                    });
                                  }
                                }}
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Delete User"
                              >
                                <Trash2 size={16} sm:size={18} className="text-red-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {users.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      No users found.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">My Settings</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your account preferences and settings</p>
                </div>
                
                {/* Account Preferences */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 sm:p-6 mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="bg-blue-600 p-2 rounded-lg">
                      <Settings className="text-white" size={20} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Account Preferences</h3>
                  </div>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">Email Notifications</p>
                        <p className="text-xs sm:text-sm text-gray-600">Receive email updates about your account</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="w-5 h-5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">SMS Notifications</p>
                        <p className="text-xs sm:text-sm text-gray-600">Receive SMS updates about orders</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="w-5 h-5"
                      />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-blue-500 transition-colors">
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">Two-Factor Authentication</p>
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
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 mb-6">
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
                        <button className="flex-1 p-3 bg-white border-2 border-gray-200 rounded-lg text-gray-600 font-semibold hover:border-gray-300">
                          Auto
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Accent Color</label>
                      <div className="flex gap-2">
                        <button className="w-10 h-10 rounded-full bg-purple-500 border-4 border-purple-300"></button>
                        <button className="w-10 h-10 rounded-full bg-blue-500 border-2 border-gray-200"></button>
                        <button className="w-10 h-10 rounded-full bg-green-500 border-2 border-gray-200"></button>
                        <button className="w-10 h-10 rounded-full bg-pink-500 border-2 border-gray-200"></button>
                        <button className="w-10 h-10 rounded-full bg-orange-500 border-2 border-gray-200"></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Language & Region */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 mb-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="bg-green-600 p-2 rounded-lg">
                      <Database className="text-white" size={20} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Language & Region</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
                      <select className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all">
                        <option value="en">English</option>
                        <option value="hi">Hindi</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Timezone</label>
                      <select className="w-full px-3 sm:px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all">
                        <option value="IST">India Standard Time (IST)</option>
                        <option value="UTC">Coordinated Universal Time (UTC)</option>
                        <option value="EST">Eastern Standard Time (EST)</option>
                        <option value="PST">Pacific Standard Time (PST)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="bg-red-600 p-2 rounded-lg">
                      <Trash2 className="text-white" size={20} />
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">Danger Zone</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border-2 border-red-200">
                      <div>
                        <p className="font-medium text-gray-800 text-sm sm:text-base">Delete Account</p>
                        <p className="text-xs sm:text-sm text-gray-600">Permanently delete your account and all data</p>
                      </div>
                      <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors whitespace-nowrap">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t">
                  <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                    Save Settings
                  </button>
                  <button className="flex-1 border-2 border-gray-300 text-gray-700 px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all">
                    Reset to Default
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
