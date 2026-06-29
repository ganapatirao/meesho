import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import Toast from './Toast';

const ProductCard = ({ product, onToggleWishlist }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const discountPercentage = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (onToggleWishlist) {
      onToggleWishlist(product.id);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    const result = await addToCart(product);
    if (result.success) {
      setToast({ show: true, message: 'Added to cart!', type: 'success' });
    } else {
      setToast({ show: true, message: 'Failed to add to cart. Please login first.', type: 'error' });
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group w-full cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative">
        <img
          src={product.imageBase64?.[0] || product.imageUrls?.[0] || 'https://via.placeholder.com/300?text=Product'}
          alt={product.name}
          className="w-full h-36 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 md:top-3 md:right-3 p-2 md:p-2 rounded-full shadow-lg transition-colors touch-manipulation ${
            isWishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-50'
          }`}
        >
          <Heart size={16} md:size={18} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-bold">
            {discountPercentage}% OFF
          </div>
        )}
        {/* Premier Badge */}
        {product.isPremierExclusive && (
          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 bg-yellow-400 text-black px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-bold">
            ⭐ Premier
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 md:p-4">
        <h3 className="font-semibold text-gray-800 mb-1 md:mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors text-sm md:text-base">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-1 md:mb-2">
          <div className="flex items-center bg-green-600 text-white px-1.5 py-0.5 md:px-2 md:py-0.5 rounded text-xs font-semibold">
            <Star size={10} md:size={12} fill="currentColor" />
            <span className="ml-0.5 md:ml-1">{product.rating?.toFixed(1) || 0}</span>
          </div>
          <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
          <span className="text-lg md:text-xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
          <span className="text-xs md:text-sm text-gray-500 line-through">₹{product.originalPrice?.toLocaleString()}</span>
          {discountPercentage > 0 && (
            <span className="text-xs md:text-sm text-green-600 font-semibold">{discountPercentage}% off</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 md:py-2.5 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-1 md:gap-2 shadow-md hover:shadow-lg text-sm md:text-base touch-manipulation"
        >
          <ShoppingCart size={16} md:size={18} />
          <span>Add to Cart</span>
        </button>

        {/* Stock Info */}
        <p className={`text-xs mt-1 md:mt-2 ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
          {product.stock > 10 ? `Only ${product.stock} left` : `Hurry! Only ${product.stock} left`}
        </p>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
};

export default ProductCard;
