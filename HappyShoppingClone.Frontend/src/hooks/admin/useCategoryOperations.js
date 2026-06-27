import { useState, useEffect } from 'react';
import { categoryAPI, subCategoryAPI } from '../../services/api';

export const useCategoryOperations = (loadDashboardData, validateForm, defaultValidationRules) => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
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
  const [validationErrors, setValidationErrors] = useState({});
  const [categoryValidationRules, setCategoryValidationRules] = useState(null);

  useEffect(() => {
    fetchCategoryValidationRules();
  }, []);

  const fetchCategoryValidationRules = async () => {
    try {
      const response = await categoryAPI.getValidationRules();
      if (response.data.success) {
        setCategoryValidationRules(response.data.rules);
      }
    } catch (error) {
    }
  };

  const fetchMaxDisplayOrder = async () => {
    try {
      const response = await categoryAPI.getMaxDisplayOrder();
      if (response.data.success) {
        return response.data.maxDisplayOrder;
      }
    } catch (error) {
    }
    return 0;
  };

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
    }
  };

  const handleSaveCategory = async () => {
    // Validate image/icon exclusivity
    if (categoryForm.image && categoryForm.icon) {
      setValidationErrors({ image: 'Only one of Image or Icon can be set, not both' });
      alert('Only one of Image or Icon can be set, not both');
      return;
    }

    // Use backend validation rules if available, otherwise use fallback rules
    const categoryRules = categoryValidationRules || {
      name: { required: true, minLength: 2, maxLength: 50 },
      displayName: { required: true, minLength: 2, maxLength: 100 },
      icon: { required: false, maxLength: 2 },
      description: { required: false, maxLength: 500 }
    };
    
    if (!validateForm(categoryForm, categoryRules)) {
      alert('Please fix the validation errors before saving');
      return;
    }
    
    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, categoryForm);
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
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        const errorMap = {};
        backendErrors.forEach(err => {
          // Map error messages to fields
          if (err.toLowerCase().includes('name')) errorMap.name = err;
          else if (err.toLowerCase().includes('display')) errorMap.displayName = err;
          else if (err.toLowerCase().includes('icon')) errorMap.icon = err;
          else if (err.toLowerCase().includes('image')) errorMap.image = err;
          else if (err.toLowerCase().includes('description')) errorMap.description = err;
          else errorMap.general = err;
        });
        setValidationErrors(errorMap);
      }
      alert('Error saving category: ' + (error.response?.data?.errors?.[0] || error.message));
    }
  };

  const handleDeleteCategory = (category) => {
    return {
      type: 'category',
      id: category.id,
      name: category.displayName || category.name
    };
  };

  return {
    showCategoryModal,
    editingCategory,
    categoryForm,
    setCategoryForm,
    validationErrors,
    setValidationErrors,
    categoryValidationRules,
    handleOpenCategoryModal,
    handleCloseCategoryModal,
    handleSaveCategory,
    handleDeleteCategory
  };
};
