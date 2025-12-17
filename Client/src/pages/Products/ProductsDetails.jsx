import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { products, categories } from '../../data/buildersmartData';
import { useCart } from "../../context/CartContext";

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { addToCart, openCart } = useCart();

    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('description');

    // Find product
    const product = products.find(p => p.id === parseInt(productId));

    // Find category
    const category = product ? categories.find(c => c.id === product.categoryId) : null;

    // Find subcategory
    const subcategory = category?.subcategories?.find(s => s.id === product.subcategoryId);

    // Related products (same category, excluding current product)
    const relatedProducts = product ? products.filter(p =>
        p.categoryId === product.categoryId &&
        p.id !== product.id
    ).slice(0, 4) : [];

    const handleAddToCart = () => {
        addToCart(product, quantity);
        openCart();
        alert(`Added ${quantity} ${product.unit}(s) of ${product.name} to cart!`);
    };

    const handleBuyNow = () => {
        addToCart(product, quantity);
        navigate('/cart');
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Product Not Found</h2>
                    <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
                    <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const getColorClasses = (color) => {
        const colorMap = {
            blue: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
            gray: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200', hover: 'hover:bg-gray-100' },
            yellow: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
            cyan: { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', hover: 'hover:bg-cyan-100' },
            orange: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', hover: 'hover:bg-orange-100' },
            purple: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
            red: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', hover: 'hover:bg-red-100' },
            pink: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', hover: 'hover:bg-pink-100' }
        };
        return colorMap[color] || colorMap.blue;
    };

    const colorClass = category ? getColorClasses(category.color) : getColorClasses('blue');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Breadcrumb Navigation */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <Link to="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link to={`/products/category/${category?.id}`} className="hover:text-blue-600">
                            {category?.name}
                        </Link>
                        {subcategory && (
                            <>
                                <span className="mx-2">/</span>
                                <span className="text-gray-500">{subcategory.name}</span>
                            </>
                        )}
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="md:flex">
                        {/* Left Column - Product Images */}
                        <div className="md:w-1/2 p-6">
                            {/* Main Image */}
                            <div className="mb-6">
                                <div className="relative h-96 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                        src={product.images?.[selectedImage] || product.image}
                                        alt={product.name}
                                        className="w-full h-full object-contain bg-white p-4"
                                    />
                                    {product.discount && (
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-3 rounded-lg shadow-lg">
                                                <div className="font-bold text-2xl">{product.discount}%</div>
                                                <div className="text-sm">OFF</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Images */}
                            {product.images && product.images.length > 1 && (
                                <div className="flex gap-3 overflow-x-auto pb-4">
                                    {product.images.map((img, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${selectedImage === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <img
                                                src={img}
                                                alt={`${product.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Product Tags */}
                            {product.tags && product.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {product.tags.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Column - Product Details */}
                        <div className="md:w-1/2 p-6">
                            {/* Category & Brand */}
                            <div className="flex items-center gap-3 mb-4">
                                <Link
                                    to={`/products/category/${category?.id}`}
                                    className={`${colorClass.bg} ${colorClass.text} px-4 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition`}
                                >
                                    {category?.icon} {category?.name}
                                </Link>
                                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm">
                                    {product.brand}
                                </div>
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

                            {/* Rating and Reviews */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center">
                                    <div className="flex text-yellow-400 text-xl mr-2">
                                        {'★'.repeat(Math.floor(product.rating))}
                                        {'☆'.repeat(5 - Math.floor(product.rating))}
                                    </div>
                                    <span className="text-gray-700 font-bold text-lg">{product.rating}</span>
                                    <span className="text-gray-500 ml-2">/ 5</span>
                                </div>
                                {product.reviews && (
                                    <span className="text-gray-500">
                                        ({product.reviews.length} reviews)
                                    </span>
                                )}
                                <div className="flex items-center text-green-600 font-medium">
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                                </div>
                            </div>

                            {/* Price Section */}
                            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-end gap-4 mb-2">
                                    <div className="flex items-baseline">
                                        <span className="text-4xl font-bold text-gray-900">
                                            ₹{product.price.toLocaleString()}
                                        </span>
                                        <span className="text-gray-500 text-xl ml-2">/{product.unit}</span>
                                    </div>
                                    {product.originalPrice && (
                                        <>
                                            <span className="text-gray-500 text-xl line-through">
                                                ₹{product.originalPrice.toLocaleString()}
                                            </span>
                                            {product.discount && (
                                                <span className="text-green-600 font-bold text-xl">
                                                    Save {product.discount}%
                                                </span>
                                            )}
                                        </>
                                    )}
                                </div>
                                <div className="text-gray-600">
                                    Min. Order: {product.minOrder} {product.unit}(s)
                                </div>
                            </div>

                            {/* Quantity Selector */}
                            <div className="mb-8">
                                <label className="block text-gray-700 font-medium mb-3 text-lg">Quantity:</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center border-2 border-gray-300 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => setQuantity(Math.max(product.minOrder, quantity - 1))}
                                            className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold transition"
                                            disabled={quantity <= product.minOrder}
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            min={product.minOrder}
                                            value={quantity}
                                            onChange={(e) => {
                                                const value = Math.max(product.minOrder, parseInt(e.target.value) || product.minOrder);
                                                setQuantity(value);
                                            }}
                                            className="w-20 text-center text-xl font-bold border-x border-gray-300 py-3"
                                        />
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 text-xl font-bold transition"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-gray-600 text-lg">
                                        {product.unit}(s)
                                    </span>
                                </div>
                                <div className="text-gray-500 text-sm mt-2">
                                    Minimum order quantity is {product.minOrder} {product.unit}(s)
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center ${product.inStock
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </button>
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!product.inStock}
                                    className={`flex-1 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center ${product.inStock
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    Buy Now
                                </button>
                            </div>

                            {/* Product Info Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {product.warranty && (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center text-blue-600 mb-2">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                            </svg>
                                            <span className="font-medium">Warranty</span>
                                        </div>
                                        <span className="text-gray-700">{product.warranty}</span>
                                    </div>
                                )}
                                {product.deliveryTime && (
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center text-green-600 mb-2">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                            </svg>
                                            <span className="font-medium">Delivery</span>
                                        </div>
                                        <span className="text-gray-700">{product.deliveryTime}</span>
                                    </div>
                                )}
                                {product.quantity && (
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="flex items-center text-purple-600 mb-2">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                            </svg>
                                            <span className="font-medium">Stock</span>
                                        </div>
                                        <span className="text-gray-700">{product.quantity} units</span>
                                    </div>
                                )}
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <div className="flex items-center text-yellow-600 mb-2">
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Support</span>
                                    </div>
                                    <span className="text-gray-700">24/7 Available</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Information Tabs */}
                    <div className="border-t border-gray-200">
                        <div className="px-6">
                            {/* Tab Navigation */}
                            <div className="flex border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`px-6 py-4 font-medium text-lg ${activeTab === 'description'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Description
                                </button>
                                <button
                                    onClick={() => setActiveTab('specifications')}
                                    className={`px-6 py-4 font-medium text-lg ${activeTab === 'specifications'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Specifications
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`px-6 py-4 font-medium text-lg ${activeTab === 'reviews'
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Reviews
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="py-8">
                                {activeTab === 'description' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
                                        <div className="prose max-w-none">
                                            <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                                                {product.detailedDescription || product.description}
                                            </p>

                                            {product.features && product.features.length > 0 && (
                                                <div className="mt-8">
                                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Key Features</h4>
                                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {product.features.map((feature, index) => (
                                                            <li key={index} className="flex items-start">
                                                                <svg className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                                <span className="text-gray-700">{feature}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'specifications' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                                        <div className="bg-gray-50 rounded-xl overflow-hidden">
                                            <table className="w-full">
                                                <tbody>
                                                    {product.specs && product.specs.map((spec, index) => (
                                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                            <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                                Specification {index + 1}
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600">
                                                                {spec}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-white">
                                                        <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                            Brand
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {product.brand}
                                                        </td>
                                                    </tr>
                                                    <tr className="bg-gray-50">
                                                        <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                            Unit
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-600">
                                                            {product.unit}
                                                        </td>
                                                    </tr>
                                                    {product.warranty && (
                                                        <tr className="bg-white">
                                                            <td className="px-6 py-4 text-gray-700 font-medium border-r border-gray-200">
                                                                Warranty
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-600">
                                                                {product.warranty}
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h3>
                                        {product.reviews && product.reviews.length > 0 ? (
                                            <div className="space-y-6">
                                                {product.reviews.map(review => (
                                                    <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <div className="flex items-center">
                                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                                                    <span className="text-blue-600 font-bold text-lg">
                                                                        {review.user.charAt(0)}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <div className="font-bold text-gray-900">{review.user}</div>
                                                                    <div className="text-gray-500 text-sm">{review.date}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex text-yellow-400">
                                                                {'★'.repeat(review.rating)}
                                                                {'☆'.repeat(5 - review.rating)}
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600">{review.comment}</p>
                                                    </div>
                                                ))}

                                                {/* Add Review Button */}
                                                <div className="mt-8">
                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition">
                                                        Write a Review
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <div className="text-6xl mb-4 text-gray-300">💬</div>
                                                <h4 className="text-xl font-medium text-gray-700 mb-2">No Reviews Yet</h4>
                                                <p className="text-gray-500 mb-6">Be the first to review this product!</p>
                                                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition">
                                                    Write First Review
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">Related Products</h2>
                            <Link
                                to={`/products/category/${category?.id}`}
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                            >
                                View All
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(relatedProduct => (
                                <Link
                                    key={relatedProduct.id}
                                    to={`/product/${relatedProduct.id}`}
                                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow border border-gray-100"
                                >
                                    <div className="h-48 overflow-hidden">
                                        <img
                                            src={relatedProduct.image}
                                            alt={relatedProduct.name}
                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                        />
                                        {relatedProduct.discount && (
                                            <div className="absolute top-3 right-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                                                {relatedProduct.discount}% OFF
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`${colorClass.bg} ${colorClass.text} px-2 py-1 rounded text-xs font-semibold`}>
                                                {relatedProduct.brand}
                                            </span>
                                            <div className="flex items-center text-yellow-400 text-sm">
                                                {'★'.repeat(Math.floor(relatedProduct.rating))}
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 h-12">
                                            {relatedProduct.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    ₹{relatedProduct.price.toLocaleString()}
                                                </div>
                                                {relatedProduct.originalPrice && (
                                                    <div className="text-gray-500 line-through text-sm">
                                                        ₹{relatedProduct.originalPrice.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-blue-600 font-medium">View →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetailsPage;