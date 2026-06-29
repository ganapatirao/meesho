import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadCart(user.id);
    }
  }, [user]);

  const loadCart = async (userId) => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart(userId);
      if (response.data.success) {
        setCart(response.data.cart);
        setCartCount(response.data.cart.items?.length || 0);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      console.log('Current user:', user);
      const userId = user?.id || user?.Id;
      if (!userId) {
        alert('Please login to add items to cart');
        return { success: false };
      }

      const variant = product.selectedVariant || product.variants?.[0];
      
      const itemPrice = Number(variant?.price || product.price || 0);
      const originalPrice = Number(product.originalPrice || 0);
      const discountPercentage = Number(product.discountPercentage || 0);
      const stock = Number(variant?.stock || product.stock || 0);
      
      const cartItem = {
        productId: String(product.id || ''),
        productName: String(product.name || ''),
        productImage: String((product.imageBase64 || product.imageUrls)?.[0] || ''),
        variantId: String(variant?.id || ''),
        color: String(product.selectedColor || variant?.color || ''),
        colorCode: String(variant?.colorCode || ''),
        size: String(product.selectedSize || (variant?.sizes?.[0]) || ''),
        quantity: Number(quantity || 1),
        price: itemPrice,
        originalPrice: originalPrice,
        discountPercentage: discountPercentage,
        stock: stock
      };

      const cartData = {
        userId: String(userId),
        items: [cartItem],
        subtotal: itemPrice * Number(quantity || 1),
        discountAmount: 0,
        deliveryCharge: 0,
        totalAmount: itemPrice * Number(quantity || 1)
      };

      console.log('Sending cart data:', cartData);
      const response = await cartAPI.addToCart(cartData);
      console.log('Cart response:', response.data);
      if (response.data.success) {
        setCart(response.data.cart);
        setCartCount(response.data.cart.items?.length || 0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Add to cart error:', error);
      return { success: false };
    }
  };

  const removeFromCart = async (productId, variantId) => {
    try {
      if (!cart) return { success: false };
      
      const response = await cartAPI.removeFromCart(cart.id, productId, variantId);
      if (response.data.success) {
        setCart(response.data.cart);
        setCartCount(response.data.cart.items?.length || 0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Remove from cart error:', error);
      return { success: false };
    }
  };

  const updateQuantity = async (productId, variantId, quantity) => {
    try {
      if (!cart) return { success: false };

      const response = await cartAPI.updateCartItem(cart.id, productId, { variantId, quantity });
      if (response.data.success) {
        setCart(response.data.cart);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error('Update quantity error:', error);
      return { success: false };
    }
  };

  const clearCart = async () => {
    try {
      if (!cart) return { success: false };

      const response = await cartAPI.clearCart(cart.id);
      if (response.data.success) {
        setCart(null);
        setCartCount(0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  const value = {
    cart,
    cartCount,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    loadCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
