import { useState } from 'react';
import { subCategoryAPI, productAPI } from '../../services/api';

export const useSubCategoryOperations = (loadDashboardData, categories) => {
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false);
  const [editingSubCategory, setEditingSubCategory] = useState(null);
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    displayName: '',
    categoryId: '',
    image: '',
    description: '',
    isFeatured: false,
    displayOrder: 0,
    isActive: true,
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleOpenSubCategoryModal = (subCategory = null) => {
    if (subCategory) {
      setEditingSubCategory(subCategory);
      setSubCategoryForm({
        name: subCategory.name,
        displayName: subCategory.displayName,
        categoryId: subCategory.categoryId,
        image: subCategory.image,
        imageBase64: subCategory.imageBase64 || '',
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
    }
  };

  const handleSaveSubCategory = async () => {
    try {
      if (editingSubCategory) {
        await subCategoryAPI.update(editingSubCategory.id, subCategoryForm);
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
      alert('Error saving subcategory');
    }
  };

  const handleDeleteSubCategory = (subCategory) => {
    return {
      type: 'subcategory',
      id: subCategory.id,
      name: subCategory.displayName || subCategory.name
    };
  };

  return {
    showSubCategoryModal,
    editingSubCategory,
    subCategoryForm,
    setSubCategoryForm,
    validationErrors,
    setValidationErrors,
    handleOpenSubCategoryModal,
    handleCloseSubCategoryModal,
    handleSaveSubCategory,
    handleDeleteSubCategory
  };
};
