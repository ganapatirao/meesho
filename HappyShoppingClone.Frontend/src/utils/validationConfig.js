// Dynamic validation configuration fetched from backend
let validationConfig = null;

export const setValidationConfig = (config) => {
  validationConfig = config;
};

export const getValidationConfig = () => {
  return validationConfig || {
    address: {
      fullNameMinLength: 2,
      fullNameMaxLength: 100,
      fullNamePattern: /^[a-zA-Z\s\-']+$/,
      phoneNumberMinLength: 10,
      phoneNumberMaxLength: 10,
      phoneNumberPattern: /^[6-9]\d{9}$/,
      addressLine1MinLength: 5,
      addressLine1MaxLength: 200,
      addressLine2MaxLength: 200,
      cityMinLength: 2,
      cityMaxLength: 50,
      cityPattern: /^[a-zA-Z\s\-']+$/,
      stateMinLength: 2,
      stateMaxLength: 50,
      statePattern: /^[a-zA-Z\s\-']+$/,
      pinCodeMinLength: 6,
      pinCodeMaxLength: 6,
      pinCodePattern: /^\d{6}$/,
      addressTypes: ['Home', 'Office', 'Other']
    },
    payment: {
      upiIdPattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/,
      cardNumberMinLength: 16,
      cardNumberMaxLength: 16,
      cardNumberPattern: /^\d{16}$/,
      cardHolderNameMinLength: 2,
      cardHolderNameMaxLength: 100,
      cardHolderNamePattern: /^[a-zA-Z\s\-']+$/,
      cardExpiryPattern: /^(0[1-9]|1[0-2])\/\d{2}$/,
      bankNames: ['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'Other']
    }
  };
};

export const getAddressValidation = () => {
  const config = getValidationConfig();
  return config.address;
};

export const getPaymentValidation = () => {
  const config = getValidationConfig();
  return config.payment;
};
