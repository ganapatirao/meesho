import { useState, useEffect, useRef } from 'react';

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

  Menu,

  X,

  CheckCircle,

  XCircle,

  Database,

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



import OverviewStats from '../components/admin/OverviewStats';

import ProductsSection from '../components/admin/ProductsSection';

import CategoriesSection from '../components/admin/categories/CategoriesSection';

import SubCategoriesSection from '../components/admin/subcategories/SubCategoriesSection';

import VendorsSection from '../components/admin/VendorsSection';

import OrdersSection from '../components/admin/OrdersSection';

import UsersSection from '../components/admin/users/UsersSection';

import SiteConfiguration from '../components/admin/site-config/SiteConfiguration';

import SettingsSection from '../components/admin/SettingsSection';

import ProductModal from '../components/admin/ProductModal';

import CategoryModal from '../components/admin/categories/CategoryModal';

import SubCategoryModal from '../components/admin/subcategories/SubCategoryModal';

import VendorModal from '../components/admin/VendorModal';

import UserModal from '../components/admin/users/UserModal';

import DeleteConfirmationModal from '../components/admin/DeleteConfirmationModal';

import Toast from '../components/Toast';



const AdminDashboard = () => {

  const { user, isAdmin, logout } = useAuth();

  const navigate = useNavigate();

  const userModalRef = useRef(null);
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState({ type: '', id: '', name: '' });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  

  // Filter states

  const [categoryFilter, setCategoryFilter] = useState({ search: '', status: '' });

  const [subCategoryFilter, setSubCategoryFilter] = useState({ search: '', categoryId: '', status: '' });

  const [productFilter, setProductFilter] = useState({ search: '', category: '', status: '' });

  const [vendorFilter, setVendorFilter] = useState({ search: '', status: '' });

  const [orderFilter, setOrderFilter] = useState({ search: '', status: '' });

  const [userFilter, setUserFilter] = useState({ search: '', role: '', status: '' });

  

  // Validation rules

  const defaultValidationRules = {

    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    phone: /^[0-9]{10}$/,

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

  

  const [validationErrors, setValidationErrors] = useState({});

  

  // Validation rules from backend

  const [backendValidationRules, setBackendValidationRules] = useState({});

  const [categoryValidationRules, setCategoryValidationRules] = useState({});

  const [subCategoryValidationRules, setSubCategoryValidationRules] = useState({});

  

  // Modal states

  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);

  const [showProductModal, setShowProductModal] = useState(false);

  const [showVendorModal, setShowVendorModal] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);

  const [editingSubCategory, setEditingSubCategory] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);

  const [editingVendor, setEditingVendor] = useState(null);

  

  // Form states

  const [categoryForm, setCategoryForm] = useState({

    name: '',

    displayName: '',

    icon: '',

    image: '',

    description: '',

    isFeatured: false,

    displayOrder: 0,

    isActive: true,

  });

  const [subCategoryForm, setSubCategoryForm] = useState({

    name: '',

    displayName: '',

    categoryId: '',

    icon: '',

    image: '',

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

  const onFieldValidate = (fieldName, error) => {
    const errors = { ...validationErrors };
    if (error) {
      errors[fieldName] = error;
    } else {
      delete errors[fieldName];
    }
    setValidationErrors(errors);
  };

  const fetchCategoryValidationRules = async () => {
    try {
      const response = await categoryAPI.getValidationRules();
      if (response.data.success) {
        setCategoryValidationRules(response.data.rules);
      }
    } catch (error) {
      console.error('Error fetching category validation rules:', error);
    }
  };

  const fetchSubCategoryValidationRules = async () => {
    try {
      const response = await subCategoryAPI.getValidationRules();
      if (response.data.success) {
        setSubCategoryValidationRules(response.data.rules);
      }
    } catch (error) {
      console.error('Error fetching subcategory validation rules:', error);
    }
  };

  const fetchMaxDisplayOrder = async () => {
    try {
      const response = await categoryAPI.getMaxDisplayOrder();
      if (response.data.success) {
        return response.data.maxDisplayOrder;
      }
    } catch (error) {
      console.error('Error fetching max display order:', error);
    }
    return 0;
  };

  useEffect(() => {
    fetchCategoryValidationRules();
    fetchSubCategoryValidationRules();
  }, []);

  

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
    site: {
      name: 'HappyShopping Clone',
      description: 'Your one-stop shop for everything you need',
      heroImageBase64: '',
      slideshowImages: [],
      enableSlideshow: false,
      basicInfoOrder: 1,
      heroImageOrder: 2,
      slideshowOrder: 3
    },
    header: {
      logoBase64: '',
      logoText: 'HappyShopping',
      backgroundColor: '#EC4899',
      backgroundColorEnd: '#8B5CF6',
      textColor: '#FFFFFF',
      showSearchIcon: false,
      showLoginIcon: false,
      customIcons: [],
      logoBrandingOrder: 1,
      searchSettingsOrder: 2,
      customIconsOrder: 4
    },
    footer: {
      companyName: 'HappyShopping Clone',
      companyDescription: 'Your trusted e-commerce platform',
      socialLinks: [],
      companyInfoOrder: 1,
      businessLinks: [],
      businessLinksOrder: 2,
      contactFields: [],
      contactUsOrder: 3,
      copyrightText: '© 2024 HappyShopping Clone. All rights reserved.',
      copyrightLinks: [],
      copyrightSectionOrder: 4,
      backgroundColor: '#1F2937',
      backgroundColorEnd: '#111827',
      textColor: '#FFFFFF'
    }
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

        setToast({
          show: true,
          message: 'Configuration saved successfully!',
          type: 'success'
        });

      }

    } catch (error) {

      console.error('Error saving configuration:', error);

      setToast({
        show: true,
        message: 'Failed to save configuration',
        type: 'error'
      });

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

  const handleOpenCategoryModal = async (category = null) => {

    if (category) {

      setEditingCategory(category);

      setCategoryForm({

        name: category.name,

        displayName: category.displayName,

        icon: category.icon,

        image: category.image,

        description: category.description,

        isFeatured: category.isFeatured,

        displayOrder: category.displayOrder,

        isActive: category.isActive,

      });

    } else {

      const maxDisplayOrder = await fetchMaxDisplayOrder();

      setEditingCategory(null);

      setCategoryForm({

        name: '',

        displayName: '',

        icon: '',

        image: '',

        description: '',

        isFeatured: false,

        displayOrder: maxDisplayOrder,

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
    // Validate image/icon exclusivity
    if (categoryForm.image && categoryForm.icon) {
      setValidationErrors({ image: 'Only one of Image or Icon can be set, not both' });
      alert('Only one of Image or Icon can be set, not both');
      return;
    }

    console.log('Saving category:', categoryForm);
    console.log('Image length:', categoryForm.image?.length);

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
      console.error('Error response:', error.response?.data);
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        console.log('Backend errors type:', typeof backendErrors);
        console.log('Backend errors:', backendErrors);
        const errorMap = {};
        
        // Handle both array and object errors
        if (Array.isArray(backendErrors)) {
          backendErrors.forEach(err => {
            if (err.toLowerCase().includes('name')) errorMap.name = err;
            else if (err.toLowerCase().includes('display')) errorMap.displayName = err;
            else if (err.toLowerCase().includes('icon')) errorMap.icon = err;
            else if (err.toLowerCase().includes('image')) errorMap.image = err;
            else if (err.toLowerCase().includes('description')) errorMap.description = err;
            else errorMap.general = err;
          });
        } else {
          // Handle object errors
          Object.keys(backendErrors).forEach(key => {
            const field = key.charAt(0).toLowerCase() + key.slice(1);
            errorMap[field] = Array.isArray(backendErrors[key]) ? backendErrors[key][0] : backendErrors[key];
          });
        }
        setValidationErrors(errorMap);
      }
      alert('Error saving category: ' + (error.response?.data?.errors?.[0] || error.message));
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



  const handleDeleteUser = (user) => {

    setDeleteTarget({

      type: 'user',

      id: user._id || user.Id || user.id,

      name: user.fullName || user.email

    });

    setShowDeleteModal(true);

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

      } else if (deleteTarget.type === 'user') {

        await userAPI.delete(deleteTarget.id);

      }

      setToast({
        show: true,
        message: `${deleteTarget.type.charAt(0).toUpperCase() + deleteTarget.type.slice(1)} deleted successfully!`,
        type: 'success'
      });

      loadDashboardData();

    } catch (error) {

      console.error(`Error deleting ${deleteTarget.type}:`, error);

      const errorMessage = error.response?.data?.error || error.response?.data?.message || `Error deleting ${deleteTarget.type}`;
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });

    }

    setShowDeleteModal(false);

    setDeleteTarget({ type: '', id: '', name: '' });

  };



  const handleCloseDeleteModal = () => {

    setShowDeleteModal(false);

    setDeleteTarget({ type: '', id: '', name: '' });

  };



  // SubCategory handlers

  const handleOpenSubCategoryModal = async (subCategory = null) => {
    try {
      if (subCategory) {
        setEditingSubCategory(subCategory);
        setSubCategoryForm({
          name: subCategory.name,
          displayName: subCategory.displayName,
          categoryId: subCategory.categoryId,
          icon: subCategory.icon || '',
          image: subCategory.image,
          description: subCategory.description,
          isFeatured: subCategory.isFeatured,
          displayOrder: subCategory.displayOrder,
          isActive: subCategory.isActive,
        });
      } else {
        setEditingSubCategory(null);
        try {
          const maxDisplayOrder = await subCategoryAPI.getMaxDisplayOrder();
          const nextDisplayOrder = maxDisplayOrder.data.success ? maxDisplayOrder.data.maxDisplayOrder : 0;
          setSubCategoryForm({
            name: '',
            displayName: '',
            categoryId: '',
            image: '',
            description: '',
            isFeatured: false,
            displayOrder: nextDisplayOrder,
            isActive: true,
          });
        } catch (error) {
          console.error('Error fetching max display order:', error);
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
        }
      }
      setShowSubCategoryModal(true);
    } catch (error) {
      console.error('Error opening subcategory modal:', error);
    }
  };



  const handleCloseSubCategoryModal = () => {

    setShowSubCategoryModal(false);

    setEditingSubCategory(null);

    setSubCategoryForm({

      name: '',

      displayName: '',

      categoryId: '',

      icon: '',

      image: '',

      description: '',

      isFeatured: false,

      displayOrder: 0,

      isActive: true,

    });

    setValidationErrors({});

  };



  const handleSaveSubCategory = async () => {
    // Validate image/icon exclusivity
    if (subCategoryForm.image && subCategoryForm.icon) {
      setValidationErrors({ image: 'Only one of Image or Icon can be set, not both' });
      setToast({
        show: true,
        message: 'Only one of Image or Icon can be set, not both',
        type: 'error'
      });
      return;
    }

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
      setToast({
        show: true,
        message: editingSubCategory ? 'SubCategory updated successfully!' : 'SubCategory created successfully!',
        type: 'success'
      });
      handleCloseSubCategoryModal();
      loadDashboardData();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      console.error('Error response:', error.response?.data);
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        console.log('Backend errors type:', typeof backendErrors);
        console.log('Backend errors:', backendErrors);
        const errorMap = {};
        
        // Handle both array and object errors
        if (Array.isArray(backendErrors)) {
          backendErrors.forEach(err => {
            if (err.toLowerCase().includes('name')) errorMap.name = err;
            else if (err.toLowerCase().includes('display')) errorMap.displayName = err;
            else if (err.toLowerCase().includes('category')) errorMap.categoryId = err;
            else if (err.toLowerCase().includes('icon')) errorMap.icon = err;
            else if (err.toLowerCase().includes('image')) errorMap.image = err;
            else if (err.toLowerCase().includes('description')) errorMap.description = err;
            else if (err.toLowerCase().includes('order')) errorMap.displayOrder = err;
          });
        } else {
          // Handle object errors
          Object.keys(backendErrors).forEach(key => {
            errorMap[key] = backendErrors[key];
          });
        }
        
        setValidationErrors(errorMap);
        setToast({
          show: true,
          message: 'Validation failed. Please check the form for errors.',
          type: 'error'
        });
      } else {
        const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Unknown error';
        setToast({
          show: true,
          message: 'Error saving subcategory: ' + errorMessage,
          type: 'error'
        });
      }
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

        setCategoryForm({ ...categoryForm, image: base64 });

      } else if (formType === 'subcategory') {

        setSubCategoryForm({ ...subCategoryForm, image: base64 });

      } else if (formType === 'product') {

        setProductForm(prev => ({

          ...prev,

          imageUrls: [...prev.imageUrls, base64]

        }));

      }

    };

    reader.readAsDataURL(file);

  };



  const handleRemoveImage = (e, formType, index = null) => {

    e.preventDefault();

    e.stopPropagation();

    if (formType === 'category') {

      setCategoryForm({ ...categoryForm, image: '' });

    } else if (formType === 'subcategory') {

      setSubCategoryForm({ ...subCategoryForm, image: '' });

    } else if (formType === 'product' && index !== null) {

      setProductForm(prev => ({

        ...prev,

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

      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 sm:py-4 md:py-6 sticky top-0 z-40">

        <div className="container mx-auto px-3 sm:px-4">

          <div className="flex items-center justify-between gap-3">

            <div className="flex items-center gap-2 sm:gap-3">

              <button

                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}

                className="lg:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"

              >

                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}

              </button>

              <div>

                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Admin Dashboard</h1>

                <p className="opacity-90 text-xs sm:text-sm md:text-base">Welcome back, {user?.fullName}</p>

              </div>

            </div>

            <button

              onClick={handleSeedDatabase}

              className="bg-white text-purple-600 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg font-semibold hover:bg-pink-100 transition-colors flex items-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base"

            >

              <Database size={14} sm:size={16} />

              <span className="hidden sm:inline">Seed Database</span>

              <span className="sm:hidden">Seed</span>

            </button>

          </div>

        </div>

      </div>



      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">

        <div className="flex flex-col lg:flex-row gap-2 sm:gap-3 md:gap-4 sm:gap-6">

          {/* Mobile Sidebar */}

          {mobileMenuOpen && (

            <div className="lg:hidden fixed inset-0 z-50 pt-16">

              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>

              <div className="relative bg-white rounded-xl shadow-lg p-4 m-2 max-w-sm max-h-[80vh] overflow-y-auto">

                <nav className="space-y-4">

                  {/* Management Section */}

                  <div>

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Management</h3>

                    <div className="space-y-2">

                      {tabs.filter(tab => tab.section === 'management').map(tab => (

                        <button

                          key={tab.id}

                          onClick={() => {

                            setActiveTab(tab.id);

                            setMobileMenuOpen(false);

                          }}

                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${

                            activeTab === tab.id

                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                              : 'hover:bg-gray-100 text-gray-700'

                          }`}

                        >

                          <tab.icon size={18} />

                          <span className="font-medium text-sm">{tab.label}</span>

                        </button>

                      ))}

                    </div>

                  </div>



                  {/* Personal Section */}

                  <div>

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Personal</h3>

                    <div className="space-y-2">

                      {tabs.filter(tab => tab.section === 'personal').map(tab => (

                        <button

                          key={tab.id}

                          onClick={() => {

                            setActiveTab(tab.id);

                            setMobileMenuOpen(false);

                          }}

                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${

                            activeTab === tab.id

                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                              : 'hover:bg-gray-100 text-gray-700'

                          }`}

                        >

                          <tab.icon size={18} />

                          <span className="font-medium text-sm">{tab.label}</span>

                        </button>

                      ))}

                    </div>

                  </div>



                  {/* Configuration Section */}

                  <div>

                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Configuration</h3>

                    <div className="space-y-2">

                      {tabs.filter(tab => tab.section === 'configuration').map(tab => (

                        <button

                          key={tab.id}

                          onClick={() => {

                            setActiveTab(tab.id);

                            setMobileMenuOpen(false);

                          }}

                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${

                            activeTab === tab.id

                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                              : 'hover:bg-gray-100 text-gray-700'

                          }`}

                        >

                          <tab.icon size={18} />

                          <span className="font-medium text-sm">{tab.label}</span>

                        </button>

                      ))}

                    </div>

                  </div>

                </nav>

              </div>

            </div>

          )}



          {/* Desktop Sidebar */}

          <aside className="hidden lg:block lg:w-64 flex-shrink-0">

            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 sticky top-24">

              <nav className="space-y-4 sm:space-y-6">

                {/* Management Section */}

                <div>

                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Management</h3>

                  <div className="space-y-2">

                    {tabs.filter(tab => tab.section === 'management').map(tab => (

                      <button

                        key={tab.id}

                        onClick={() => setActiveTab(tab.id)}

                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${

                          activeTab === tab.id

                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                            : 'hover:bg-gray-100 text-gray-700'

                        }`}

                      >

                        <tab.icon size={16} sm:size={18} md:size={20} />

                        <span className="font-medium text-xs sm:text-sm md:text-base">{tab.label}</span>

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

                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${

                          activeTab === tab.id

                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                            : 'hover:bg-gray-100 text-gray-700'

                        }`}

                      >

                        <tab.icon size={16} sm:size={18} md:size={20} />

                        <span className="font-medium text-xs sm:text-sm md:text-base">{tab.label}</span>

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

                        className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${

                          activeTab === tab.id

                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'

                            : 'hover:bg-gray-100 text-gray-700'

                        }`}

                      >

                        <tab.icon size={16} sm:size={18} md:size={20} />

                        <span className="font-medium text-xs sm:text-sm md:text-base">{tab.label}</span>

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

              <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6">

                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">My Profile</h2>

                

                {/* Profile Header */}

                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-3 sm:p-4 md:p-6 mb-6 text-white">

                  <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-4 sm:gap-6">

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

                      <p className="opacity-90 text-xs sm:text-sm md:text-base">{user?.email || 'admin@happyshopping.com'}</p>

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

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">

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

              <OverviewStats dashboardStats={dashboardStats} />

            )}



            {activeTab === 'products' && (

              <ProductsSection products={products} productFilter={productFilter} setProductFilter={setProductFilter} categories={categories} handleOpenProductModal={handleOpenProductModal} handleDeleteProduct={handleDeleteProduct} />

            )}



            {activeTab === 'categories' && (

              <CategoriesSection categories={categories} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} handleOpenCategoryModal={handleOpenCategoryModal} handleDeleteCategory={handleDeleteCategory} showToast={(message, type) => setToast({ show: true, message, type })} />

            )}



            {activeTab === 'subcategories' && (

              <SubCategoriesSection subCategories={subCategories} subCategoryFilter={subCategoryFilter} setSubCategoryFilter={setSubCategoryFilter} categories={categories} handleOpenSubCategoryModal={handleOpenSubCategoryModal} handleDeleteSubCategory={handleDeleteSubCategory} showToast={(message, type) => setToast({ show: true, message, type })} />

            )}



            {activeTab === 'configuration' && (

              <SiteConfiguration config={config} setConfig={setConfig} handleSaveConfiguration={handleSaveConfiguration} />

            )}



            {/* Category Modal */}

            <CategoryModal
              show={showCategoryModal}
              onClose={handleCloseCategoryModal}
              onSave={handleSaveCategory}
              editingCategory={editingCategory}
              categoryForm={categoryForm}
              setCategoryForm={setCategoryForm}
              handleImageDrop={handleImageDrop}
              handleImageUpload={handleImageUpload}
              handleRemoveImage={handleRemoveImage}
              validationErrors={validationErrors}
              categoryValidationRules={categoryValidationRules}
              onFieldValidate={onFieldValidate}
            />


            {/* SubCategory Modal */}

            <SubCategoryModal

              show={showSubCategoryModal}

              onClose={handleCloseSubCategoryModal}

              onSave={handleSaveSubCategory}

              editingSubCategory={editingSubCategory}

              subCategoryForm={subCategoryForm}

              setSubCategoryForm={setSubCategoryForm}

              categories={categories}

              handleImageDrop={handleImageDrop}

              handleImageUpload={handleImageUpload}

              handleRemoveImage={handleRemoveImage}

              validationErrors={validationErrors}

              subCategoryValidationRules={subCategoryValidationRules}

              onFieldValidate={onFieldValidate}

            />



            {/* Product Modal */}

            <ProductModal

              show={showProductModal}

              onClose={handleCloseProductModal}

              onSave={handleSaveProduct}

              editingProduct={editingProduct}

              productForm={productForm}

              setProductForm={setProductForm}

              categories={categories}

              handleImageDrop={handleImageDrop}

              convertToBase64={convertToBase64}

              handleRemoveImage={handleRemoveImage}

            />



            {/* Delete Confirmation Modal */}

            <DeleteConfirmationModal

              show={showDeleteModal}

              onClose={handleCloseDeleteModal}

              onConfirm={handleConfirmDelete}

              deleteTarget={deleteTarget}

            />

            {/* Toast Notification */}
            <Toast
              show={toast.show}
              onClose={() => setToast({ ...toast, show: false })}
              message={toast.message}
              type={toast.type}
            />



            {/* Vendor Modal */}

            {/* User Modal */}

            <UserModal

              ref={userModalRef}

              onSuccess={loadDashboardData}

              showToast={(message, type) => setToast({ show: true, message, type })}

            />



            <VendorModal

              show={showVendorModal}

              onClose={handleCloseVendorModal}

              onSave={handleSaveVendor}

              editingVendor={editingVendor}

              vendorForm={vendorForm}

              setVendorForm={setVendorForm}

              validationErrors={validationErrors}

              validateField={validateField}

              defaultValidationRules={defaultValidationRules}

            />



            {activeTab === 'vendors' && (

              <VendorsSection vendors={vendors} vendorFilter={vendorFilter} setVendorFilter={setVendorFilter} handleOpenVendorModal={handleOpenVendorModal} handleDeleteVendor={handleDeleteVendor} />

            )}



            {activeTab === 'orders' && (

              <OrdersSection orders={orders} />

            )}



            {activeTab === 'users' && (

              <UsersSection

                users={users}

                userFilter={userFilter}

                setUserFilter={setUserFilter}

                userModalRef={userModalRef}

                onDeleteUser={handleDeleteUser}

              />

            )}



            {activeTab === 'settings' && (

              <SettingsSection />

            )}

          </main>

        </div>

      </div>

    </div>

  );

};



export default AdminDashboard;

