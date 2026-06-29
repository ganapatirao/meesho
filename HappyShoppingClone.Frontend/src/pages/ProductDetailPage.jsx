import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../services/api';
import { useCart } from '../context/CartContext';
import Toast from '../components/Toast';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RefreshCw,
  ArrowLeft,
  Minus,
  Plus,
  MessageCircle,
  Check
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadProduct();
    loadReviews();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      if (response.data.success) {
        setProduct(response.data.product);
        // Set default variant if available
        if (response.data.product.variants && response.data.product.variants.length > 0) {
          setSelectedVariant(response.data.product.variants[0]);
          setSelectedColor(response.data.product.variants[0].color);
          if (response.data.product.variants[0].sizes && response.data.product.variants[0].sizes.length > 0) {
            setSelectedSize(response.data.product.variants[0].sizes[0]);
          }
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/review/product/${id}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.reviews);
      }
      
      const summaryResponse = await fetch(`${API_BASE_URL}/review/product/${id}/summary`);
      const summaryData = await summaryResponse.json();
      if (summaryData.success) {
        setReviewSummary(summaryData.summary);
      }
    } catch (error) {
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      setToast({ show: true, message: 'Please select a variant', type: 'error' });
      return;
    }

    const productWithVariant = {
      ...product,
      selectedVariant,
      selectedColor,
      selectedSize,
      quantity
    };

    const result = await addToCart(productWithVariant, quantity);
    if (result.success) {
      setToast({ show: true, message: 'Added to cart successfully!', type: 'success' });
    } else {
      setToast({ show: true, message: 'Failed to add to cart', type: 'error' });
    }
  };

  const handleColorSelect = (variant) => {
    setSelectedVariant(variant);
    setSelectedColor(variant.color);
    if (variant.sizes && variant.sizes.length > 0) {
      setSelectedSize(variant.sizes[0]);
    }
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const currentPrice = selectedVariant?.price || product?.price || 0;
  const currentOriginalPrice = product?.originalPrice || 0;
  const discountPercentage = currentOriginalPrice > 0 ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-16 z-40 bg-white shadow-md p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-700"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <img
                src={(product.imageBase64 || product.imageUrls)?.[selectedImage] || 'https://via.placeholder.com/600?text=Product'}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {(product.imageBase64 || product.imageUrls)?.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {(product.imageBase64 || product.imageUrls).map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-purple-600' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${index + 1}`} className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              {/* Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center bg-green-600 text-white px-3 py-1 rounded-lg">
                  <Star size={16} fill="currentColor" />
                  <span className="ml-1 font-semibold">{product.rating?.toFixed(1) || 0}</span>
                </div>
                <span className="text-gray-600">{product.reviewCount || 0} reviews</span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">₹{currentPrice.toLocaleString()}</span>
                <span className="text-xl text-gray-500 line-through">₹{currentOriginalPrice.toLocaleString()}</span>
                {discountPercentage > 0 && (
                  <span className="text-lg text-green-600 font-semibold">{discountPercentage}% off</span>
                )}
              </div>

              {/* Color Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-800 mb-2">Color: <span className="text-purple-600">{selectedColor}</span></p>
                  <div className="flex gap-2 flex-wrap">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => handleColorSelect(variant)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === variant.color ? 'border-purple-600 ring-2 ring-purple-300' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: variant.colorCode }}
                        title={variant.color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {selectedVariant?.sizes && selectedVariant.sizes.length > 0 && (
                <div className="mb-4">
                  <p className="font-semibold text-gray-800 mb-2">Size: <span className="text-purple-600">{selectedSize}</span></p>
                  <div className="flex gap-2 flex-wrap">
                    {selectedVariant.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSizeSelect(size)}
                        className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${
                          selectedSize === size 
                            ? 'border-purple-600 bg-purple-50 text-purple-600' 
                            : 'border-gray-300 hover:border-purple-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Premier Badge */}
              {product.isPremierExclusive && (
                <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <span className="font-semibold">Premier Exclusive</span>
                </div>
              )}
            </div>

            {/* Quantity & Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="px-4 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 hover:bg-gray-100 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  <span>Add to Cart</span>
                </button>
              </div>
              
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                  isWishlisted
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
                <span>{isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}</span>
              </button>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Delivery Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Truck className="text-green-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Free Delivery</p>
                    <p className="text-sm text-gray-600">Estimated delivery in 5-7 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <ShieldCheck className="text-blue-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure payment with SSL encryption</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="text-purple-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-gray-800">Easy Returns</p>
                    <p className="text-sm text-gray-600">7 days return policy with free pickup</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-800 mb-4">Share this product</h3>
              <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Specifications */}
        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">{spec.key}</span>
                  <span className="font-semibold text-gray-800">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Reviews & Ratings</h3>
            <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
              <MessageCircle size={20} />
              <span>Write a Review</span>
            </button>
          </div>
          
          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800">{reviewSummary?.averageRating?.toFixed(1) || product.rating?.toFixed(1) || 0}</div>
              <div className="flex text-yellow-400 justify-center my-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={20} fill={star <= Math.round(reviewSummary?.averageRating || product.rating || 0) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <p className="text-gray-600">{reviewSummary?.totalReviews || product.reviewCount || 0} reviews</p>
            </div>
            <div className="flex-1">
              {reviewSummary?.ratingDistribution && (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-8">5 ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.fiveStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.fiveStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-8">4 ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.fourStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.fourStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-8">3 ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.threeStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.threeStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-8">2 ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.twoStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.twoStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-8">1 ★</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400" 
                        style={{ width: `${reviewSummary.totalReviews > 0 ? (reviewSummary.ratingDistribution.oneStar / reviewSummary.totalReviews * 100) : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{reviewSummary.totalReviews > 0 ? Math.round(reviewSummary.ratingDistribution.oneStar / reviewSummary.totalReviews * 100) : 0}%</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                      {review.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{review.userName}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={14} fill={star <= review.rating ? 'currentColor' : 'none'} />
                          ))}
                        </div>
                        {review.isVerifiedPurchase && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check size={10} />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {review.title && <p className="font-semibold text-gray-800 mb-1">{review.title}</p>}
                  <p className="text-gray-600">{review.comment}</p>
                  {review.color && (
                    <p className="text-sm text-gray-500 mt-2">Color: {review.color} {review.size && `| Size: ${review.size}`}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                    <button className="text-purple-600 hover:text-purple-700">Helpful ({review.helpfulCount})</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
    <Toast
      show={toast.show}
      onClose={() => setToast({ ...toast, show: false })}
      message={toast.message}
      type={toast.type}
    />
    </>
  );
};

export default ProductDetailPage;
