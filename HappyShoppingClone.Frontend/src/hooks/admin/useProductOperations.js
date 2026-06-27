import { useState } from 'react';
import { productAPI } from '../../services/api';

export const useProductOperations = (loadDashboardData, categories, setDeleteTarget, setShowDeleteModal) => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
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
  const [validationErrors, setValidationErrors] = useState({});

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
        imageUrls: product.imageUrls || [],
        imageBase64: product.imageBase64 || [],
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        isTrending: product.isTrending,
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

  return {
    showProductModal,
    editingProduct,
    productForm,
    setProductForm,
    validationErrors,
    setValidationErrors,
    handleOpenProductModal,
    handleCloseProductModal,
    handleSaveProduct,
    handleDeleteProduct
  };
};
