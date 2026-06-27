import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
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
  MessageCircle
} from 'lucide-react';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await productAPI.getById(id);
      if (response.data.success) {
        setProduct(response.data.product);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const discountPercentage = product ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

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
                <span className="text-3xl font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                <span className="text-xl text-gray-500 line-through">₹{product.originalPrice?.toLocaleString()}</span>
                {discountPercentage > 0 && (
                  <span className="text-lg text-green-600 font-semibold">{discountPercentage}% off</span>
                )}
              </div>

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
                <button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2">
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
            <h3 className="text-xl font-bold text-gray-800">Reviews</h3>
            <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold">
              <MessageCircle size={20} />
              <span>Write a Review</span>
            </button>
          </div>
          
          {/* Rating Summary */}
          <div className="flex flex-col md:flex-row gap-8 mb-6">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-800">{product.rating?.toFixed(1) || 0}</div>
              <div className="flex text-yellow-400 justify-center my-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={20} fill={star <= Math.round(product.rating || 0)} />
                ))}
              </div>
              <p className="text-gray-600">{product.reviewCount || 0} reviews</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-2 mb-2">
                  <span className="text-sm w-8">{star} ★</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400" style={{ width: '70%' }}></div>
                  </div>
                  <span className="text-sm text-gray-600">70%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review List */}
          <div className="space-y-4">
            <div className="border-b pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                  J
                </div>
                <div>
                  <p className="font-semibold text-gray-800">John Doe</p>
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} size={14} fill={star <= 5} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">Great product! Exactly as described. Fast delivery and excellent quality.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
