import { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';

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

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      loadCart(user.id);
    }
  }, []);

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
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        alert('Please login to add items to cart');
        return { success: false };
      }

      const user = JSON.parse(storedUser);
      const cartItem = {
        productId: product.id,
        variantId: product.variants?.[0]?.id || null,
        quantity,
        price: product.price
      };

      const cartData = {
        userId: user.id,
        items: [cartItem],
        totalAmount: product.price * quantity
      };

      const response = await cartAPI.addToCart(cartData);
      if (response.data.success) {
        setCart(response.data.cart);
        setCartCount(response.data.cart.items?.length || 0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      if (!cart) return { success: false };
      
      const response = await cartAPI.removeFromCart(cart.id, productId);
      if (response.data.success) {
        setCart(response.data.cart);
        setCartCount(response.data.cart.items?.length || 0);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      if (!cart) return { success: false };

      const updatedItems = cart.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      );

      const updatedCart = {
        ...cart,
        items: updatedItems,
        totalAmount: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      const response = await cartAPI.updateCart(cart.id, updatedCart);
      if (response.data.success) {
        setCart(response.data.cart);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
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
