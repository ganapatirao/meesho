import { useState } from 'react';
import { vendorAPI } from '../../services/api';

export const useVendorOperations = (loadDashboardData, validateForm, defaultValidationRules, setDeleteTarget, setShowDeleteModal) => {
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
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
  const [validationErrors, setValidationErrors] = useState({});

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

  return {
    showVendorModal,
    editingVendor,
    vendorForm,
    setVendorForm,
    validationErrors,
    setValidationErrors,
    handleOpenVendorModal,
    handleCloseVendorModal,
    handleSaveVendor,
    handleDeleteVendor
  };
};
