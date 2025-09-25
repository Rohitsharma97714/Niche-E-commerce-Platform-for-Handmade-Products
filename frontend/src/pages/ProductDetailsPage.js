import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast, ToastContainer } from 'react-toastify';
import { useWishlist} from '../context/WishlistContext';
import 'react-toastify/dist/ReactToastify.css';
import '../index.css';

// RecommendedProducts component moved above ProductDetailsPage to fix component order issue
const RecommendedProducts = ({ category, currentProductId }) => {
  const [recommended, setRecommended] = React.useState([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products?category=${encodeURIComponent(category)}`);
        // Filter out current product
        const filtered = res.data.filter(p => p._id !== currentProductId);
        setRecommended(filtered); // Show all recommended products
      } catch (error) {
        console.error('Failed to fetch recommended products', error);
      }
    };
    if (category) fetchRecommended();
  }, [category, currentProductId]);

  if (recommended.length === 0) return null;

  const handleProductClick = (productId) => {
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Navigate to product after a short delay to allow scroll
    setTimeout(() => {
      navigate(`/product/${productId}`);
    }, 300);
  };

  return (
    <div className="mt-16 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-8">
      <h3 className="text-3xl font-bold mb-8 text-center text-orange-600 dark:text-orange-400">✨ You Might Also Like</h3>
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-6 pb-4" style={{ width: 'max-content' }}>
          {recommended.map(product => (
            <div
              key={product._id}
              onClick={() => handleProductClick(product._id)}
              className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-orange-100 dark:border-gray-700 flex-shrink-0 w-64"
            >
              <div className="relative overflow-hidden rounded-lg mb-3">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-40 object-contain transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h4 className="font-semibold text-lg mb-1 line-clamp-2">{product.title}</h4>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm mb-2">{product.category}</p>
              <p className="text-orange-600 dark:text-orange-400 font-bold text-lg">₹{product.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cartItems, addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Get discount from URL query parameter
  const discountPercentage = parseInt(searchParams.get('discount')) || 0;

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const alreadyInCart = cartItems.some(item => item._id === product?._id);

  const handleAddToCart = () => {
    if (!user) {
      toast.info('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (alreadyInCart) {
      toast.warn('Product already in cart');
    } else {
      const discountedPrice = discountPercentage > 0 ? Math.round(product.price * (1 - discountPercentage / 100)) : product.price;
      addToCart({
        ...product,
        quantity,
        price: discountedPrice,
        originalPrice: product.price,
        discountPercentage: discountPercentage > 0 ? discountPercentage : 0
      });
      toast.success('Added to cart');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <img
          src={product.image || 'https://via.placeholder.com/300'}
          alt={product.title}
          className="w-full h-[400px] object-contain rounded-lg border"
        />

        <div className="space-y-4">
          <h2 className="text-3xl font-bold">{product.title}</h2>
          <p className="text-indigo-600 font-medium text-lg">{product.category}</p>

          <div className="flex items-center gap-1 text-yellow-500 text-xl">
            {'⭐'.repeat(product.rating || 4)}
            <span className="text-sm text-gray-500 ml-2">
              ({product.rating?.toFixed(1) || 4}/5)
            </span>
          </div>

          {discountPercentage > 0 ? (
            <div className="flex flex-col">
              <span className="text-gray-500 dark:text-gray-400 line-through text-lg">₹{product.price}</span>
              <span className="text-red-600 font-bold text-xl">
                ₹{Math.round(product.price * (1 - discountPercentage / 100))}
              </span>
              <span className="text-green-600 text-sm font-medium">
                {discountPercentage}% OFF
              </span>
            </div>
          ) : (
            <p className="text-xl text-gray-800 font-semibold dark:text-gray-200">₹{product.price}</p>
          )}
          <p className="text-gray-700 dark:text-gray-300">{product.description}</p>

          <div className="flex items-center gap-2">
            <label htmlFor="quantity" className="font-medium">Quantity:</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max="10"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-20 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleAddToCart}
              className={`px-6 py-2 rounded text-white font-semibold transition duration-200 ${
                alreadyInCart ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {alreadyInCart ? 'Already in Cart' : 'Add to Cart 🛒'}
            </button>
              {/* Wishlist Button */}
            <button
              onClick={() => {
                if (!user) {
                  toast.info('Please login to add to wishlist');
                  navigate('/login');
                  return;
                }

                if (isInWishlist(product._id)) {
                  removeFromWishlist(product._id);
                  toast.info('Removed from Wishlist');
                } else {
                  // ✅ Pass discount information when adding to wishlist
                  const wishlistItem = {
                    ...product,
                    originalPrice: product.price,
                    discountPercentage: discountPercentage > 0 ? discountPercentage : 0,
                    price: discountPercentage > 0 ? Math.round(product.price * (1 - discountPercentage / 100)) : product.price
                  };
                  addToWishlist(wishlistItem);
                  toast.success('Added to Wishlist ❤️');
                }
              }}
              className="px-6 py-2 rounded bg-pink-500 hover:bg-pink-600 text-white font-semibold"
            >
              {isInWishlist(product._id) ? '❤️ Wishlisted' : 'Add to Wishlist'}
            </button>

            <button
              onClick={() => {
                if (!user) {
                  toast.info('Please login to continue');
                  navigate('/login');
                  return;
                }

                if (!alreadyInCart) {
                  const discountedPrice = discountPercentage > 0 ? Math.round(product.price * (1 - discountPercentage / 100)) : product.price;
                  addToCart({
                    ...product,
                    quantity,
                    price: discountedPrice,
                    originalPrice: product.price,
                    discountPercentage: discountPercentage > 0 ? discountPercentage : 0
                  });
                  toast.success('Added to cart');
                }

                navigate('/cart');
              }}
              className="px-6 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Shop Now 🛍️
            </button>
          </div>
        </div>
      </div>

      {/* Recommended Products Section */}
      <RecommendedProducts category={product.category} currentProductId={product._id} />

      </div>

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
};

export default ProductDetailsPage;
