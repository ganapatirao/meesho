// Validation utility functions matching backend validation rules
import { getAddressValidation, getPaymentValidation } from './validationConfig';

export const validationRules = {
  // Address validation rules
  fullName: {
    required: true,
    get minLength() { return getAddressValidation().fullNameMinLength; },
    get maxLength() { return getAddressValidation().fullNameMaxLength; },
    get pattern() { return new RegExp(getAddressValidation().fullNamePattern); }
  },
  phoneNumber: {
    required: true,
    get pattern() { return new RegExp(getAddressValidation().phoneNumberPattern); },
    message: 'Must be 10 digits starting with 6-9'
  },
  addressLine1: {
    required: true,
    get minLength() { return getAddressValidation().addressLine1MinLength; },
    get maxLength() { return getAddressValidation().addressLine1MaxLength; }
  },
  addressLine2: {
    required: false,
    get maxLength() { return getAddressValidation().addressLine2MaxLength; }
  },
  city: {
    required: true,
    get minLength() { return getAddressValidation().cityMinLength; },
    get maxLength() { return getAddressValidation().cityMaxLength; },
    get pattern() { return new RegExp(getAddressValidation().cityPattern); }
  },
  state: {
    required: true,
    get minLength() { return getAddressValidation().stateMinLength; },
    get maxLength() { return getAddressValidation().stateMaxLength; },
    get pattern() { return new RegExp(getAddressValidation().statePattern); }
  },
  pinCode: {
    required: true,
    get pattern() { return new RegExp(getAddressValidation().pinCodePattern); },
    message: 'Must be 6 digits'
  },
  addressType: {
    required: true,
    get allowedValues() { return getAddressValidation().addressTypes; }
  },
  // Payment validation rules
  upiId: {
    required: false,
    get pattern() { return new RegExp(getPaymentValidation().upiIdPattern); },
    message: 'Invalid UPI ID format'
  },
  cardNumber: {
    required: false,
    get pattern() { return new RegExp(getPaymentValidation().cardNumberPattern); },
    message: 'Must be 16 digits'
  },
  cardHolderName: {
    required: false,
    get minLength() { return getPaymentValidation().cardHolderNameMinLength; },
    get maxLength() { return getPaymentValidation().cardHolderNameMaxLength; },
    get pattern() { return new RegExp(getPaymentValidation().cardHolderNamePattern); }
  },
  cardExpiry: {
    required: false,
    get pattern() { return new RegExp(getPaymentValidation().cardExpiryPattern); },
    message: 'Must be MM/YY format'
  },
  bankName: {
    required: false,
    get allowedValues() { return getPaymentValidation().bankNames; }
  }
};

export const validateField = (fieldName, value, rules = validationRules[fieldName]) => {
  if (!rules) return { isValid: true, error: '' };

  const fieldRules = rules;
  
  // Required check
  if (fieldRules.required && (!value || value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  // Skip other validations if field is empty and not required
  if (!value || value.trim() === '') {
    return { isValid: true, error: '' };
  }

  // Min length check
  if (fieldRules.minLength && value.length < fieldRules.minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${fieldRules.minLength} characters` };
  }

  // Max length check
  if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
    return { isValid: false, error: `${fieldName} must not exceed ${fieldRules.maxLength} characters` };
  }

  // Pattern check
  if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
    return { isValid: false, error: fieldRules.message || `Invalid ${fieldName} format` };
  }

  // Allowed values check
  if (fieldRules.allowedValues && !fieldRules.allowedValues.includes(value)) {
    return { isValid: false, error: `Invalid ${fieldName}` };
  }

  return { isValid: true, error: '' };
};

export const validateAddress = (address, prefix = '') => {
  const errors = {};

  const fullName = validateField('Full name', address.fullName, validationRules.fullName);
  if (!fullName.isValid) errors[`${prefix}fullName`] = fullName.error;

  const phoneNumber = validateField('Phone number', address.phoneNumber, validationRules.phoneNumber);
  if (!phoneNumber.isValid) errors[`${prefix}phoneNumber`] = phoneNumber.error;

  const addressLine1 = validateField('Address line 1', address.addressLine1, validationRules.addressLine1);
  if (!addressLine1.isValid) errors[`${prefix}addressLine1`] = addressLine1.error;

  const addressLine2 = validateField('Address line 2', address.addressLine2, validationRules.addressLine2);
  if (!addressLine2.isValid) errors[`${prefix}addressLine2`] = addressLine2.error;

  const city = validateField('City', address.city, validationRules.city);
  if (!city.isValid) errors[`${prefix}city`] = city.error;

  const state = validateField('State', address.state, validationRules.state);
  if (!state.isValid) errors[`${prefix}state`] = state.error;

  const pinCode = validateField('PIN code', address.pinCode, validationRules.pinCode);
  if (!pinCode.isValid) errors[`${prefix}pinCode`] = pinCode.error;

  const addressType = validateField('Address type', address.addressType, validationRules.addressType);
  if (!addressType.isValid) errors[`${prefix}addressType`] = addressType.error;

  return errors;
};

export const validatePaymentDetails = (paymentMethod, paymentDetails) => {
  const errors = {};

  if (paymentMethod === 'PhonePe') {
    const upiId = validateField('UPI ID', paymentDetails.upiId, { ...validationRules.upiId, required: true });
    if (!upiId.isValid) errors.upiId = upiId.error;
  }

  if (paymentMethod === 'CreditCard') {
    const cardNumber = validateField('Card number', paymentDetails.cardNumber?.replace(/\s/g, ''), { ...validationRules.cardNumber, required: true });
    if (!cardNumber.isValid) errors.cardNumber = cardNumber.error;

    const cardHolderName = validateField('Card holder name', paymentDetails.cardHolderName, { ...validationRules.cardHolderName, required: true });
    if (!cardHolderName.isValid) errors.cardHolderName = cardHolderName.error;

    const cardExpiry = validateField('Card expiry', paymentDetails.cardExpiry, { ...validationRules.cardExpiry, required: true });
    if (!cardExpiry.isValid) errors.cardExpiry = cardExpiry.error;
  }

  if (paymentMethod === 'NetBanking') {
    if (!paymentDetails.bankName) {
      errors.bankName = 'Bank name is required';
    }
  }

  return errors;
};

export const validateCheckout = (shippingAddress, billingAddress, paymentMethod, paymentDetails, sameAsShipping) => {
  const errors = {};

  // Validate shipping address
  const shippingErrors = validateAddress(shippingAddress, 'shipping_');
  Object.assign(errors, shippingErrors);

  // Validate billing address if different from shipping
  if (!sameAsShipping && billingAddress) {
    const billingErrors = validateAddress(billingAddress, 'billing_');
    Object.assign(errors, billingErrors);
  }

  // Validate payment method
  if (!paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  } else if (!['COD', 'WhatsApp', 'PhonePe', 'CreditCard', 'NetBanking'].includes(paymentMethod)) {
    errors.paymentMethod = 'Invalid payment method';
  }

  // Validate payment details
  const paymentErrors = validatePaymentDetails(paymentMethod, paymentDetails);
  Object.assign(errors, paymentErrors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
