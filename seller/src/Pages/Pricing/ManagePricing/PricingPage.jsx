import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
const PricingPage = () => {
  const [activeTab, setActiveTab] = useState('All Products');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Pricing</h1>
      
      <Overview />
      <Banner />
      
      <div className="bg-white rounded-lg shadow mt-6 p-4">
        <div className="flex border-b mb-4">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'All Products' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('All Products')}
          >
            All Products
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'Losing View' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Losing View')}
          >
            Losing View
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'Best Price' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Best Price')}
          >
            Best Price
          </button>
        </div>

        <div className="mb-4">
          <select
            className="border rounded-md p-2 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Perfume">Perfume</option>
            <option value="Clothing">Clothing</option>
            <option value="Accessories">Accessories</option>
          </select>
        </div>
        
        <Table activeTab={activeTab} categoryFilter={categoryFilter} setShowModal={setShowModal} setSelectedProduct={setSelectedProduct} />
        <BulkPriceUpdate />
      </div>

      {showModal && <EditModal product={selectedProduct} setShowModal={setShowModal} />}
    </div>
  );
};

const Overview = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium mb-2">Price Performance</h2>
        <p className="text-xl font-bold">0</p>
        <p className="text-xs text-gray-500">Last 30 days</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-sm font-medium mb-2">Order Growth</h2>
        <p className="text-xl font-bold">0</p>
        <p className="text-xs text-gray-500">Last 30 days</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span>Reduce RTO 20%</span>
            <span className="text-green-500">+4%</span>
          </div>
          <p className="text-xs text-gray-500">Add Prepaid Discount (COD Order → Prepaid)</p>
          <div className="flex items-center justify-between text-xs">
            <span>Reduce Returns 7%</span>
            <span className="text-green-500">+3%</span>
          </div>
          <p className="text-xs text-gray-500">Add WDRP Discount (Unwanted → Genuine Returns)</p>
        <Link to={"/seller/discount"}><button className="bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium">
            Reduce RTO & Returns
          </button></Link>
        </div>
      </div>
    </div>
  );
};

const Banner = () => {
  return (
    <div className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293m0 0a1 1 0 010 1.414l1.414 1.414m-1.414-1.414L7 21m0 0h12v-2H7v2zm8-6H7" />
        </svg>
        <div>
          <h3 className="font-bold text-orange-600">GST Rate Change Update</h3>
          <p className="text-sm">GST Price Drop will be Applied - Effective from 22 Sep 2025</p>
          <p className="text-xs text-gray-500">Updated prices will help you stay competitive & increase visibility</p>
        </div>
      </div>
      <button className="bg-indigo-600 text-white py-2 px-4 rounded-md text-sm">
        View Updated Prices
      </button>
    </div>
  );
};

const BulkPriceUpdate = () => {
  return (
    <div className="mt-4">
      <button className="bg-indigo-100 text-indigo-600 py-2 px-4 rounded-md text-sm flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16h16V4H4zm4 4h8v2H8V8zm0 4h8v2H8v-2zm0 4h4v2H8v-2z" />
        </svg>
        Bulk Price Update
      </button>
    </div>
  );
};

const Table = ({ activeTab, categoryFilter, setShowModal, setSelectedProduct }) => {
  const products = useMemo(() => [
    {
      image: "https://via.placeholder.com/40",
      name: "LuvDrop Premium Unisex Perfume / Pack O...",
      category: "Perfume",
      catalogId: "203305190",
      styleId: "Luv-Pack-01",
      size: "Free Size",
      stock: 50,
      growth: "-",
      currentPrice: "₹232",
      payment: "Bank Transfer ₹240",
      recommendedPrice: "-",
      insights: "Best Price",
    },
    {
      image: "https://via.placeholder.com/40",
      name: "Unique Perfumes Long Lasting and Attracti...",
      category: "Perfume",
      catalogId: "202045476",
      styleId: "P-K4",
      size: "Free Size",
      stock: 97,
      growth: "-",
      currentPrice: "₹234",
      payment: "Bank Transfer ₹248",
      recommendedPrice: "₹291",
      insights: "Losing View",
    },
    {
      image: "https://via.placeholder.com/40",
      name: "Elegant Floral Dress",
      category: "Clothing",
      catalogId: "203305191",
      styleId: "Floral-D01",
      size: "Free Size",
      stock: 30,
      growth: "+5%",
      currentPrice: "₹1500",
      payment: "Bank Transfer ₹1550",
      recommendedPrice: "₹1400",
      insights: "Best Price",
    },
    {
      image: "https://via.placeholder.com/40",
      name: "Classic Leather Wallet",
      category: "Accessories",
      catalogId: "202045477",
      styleId: "Leath-W01",
      size: "One Size",
      stock: 120,
      growth: "-2%",
      currentPrice: "₹999",
      payment: "Bank Transfer ₹1050",
      recommendedPrice: "₹1200",
      insights: "Losing View",
    },
    // Add more products to reach 20-25
  ], []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesTab = activeTab === 'All Products' || product.insights === activeTab;
      return matchesCategory && matchesTab;
    });
  }, [activeTab, categoryFilter, products]);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left border-b">
          <th className="p-2"><input type="checkbox" /></th>
          <th className="p-2">Product Details</th>
          <th className="p-2">Stock</th>
          <th className="p-2">Growth in 30 days</th>
          <th className="p-2">Current Customer Price</th>
          <th className="p-2">Recommended Customer Price</th>
          <th className="p-2">Insights</th>
          <th className="p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        {filteredProducts.map((product, index) => (
          <tr key={index} className="border-b">
            <td className="p-2"><input type="checkbox" /></td>
            <td className="p-2 flex items-center gap-2">
              <img src={product.image} alt={product.name} className="w-10 h-10" />
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">Catalog ID: {product.catalogId}</p>
                <p className="text-xs text-gray-500">Style ID: {product.styleId}</p>
                <p className="text-xs text-gray-500">Size: {product.size}</p>
              </div>
            </td>
            <td className="p-2">{product.stock}</td>
            <td className="p-2">{product.growth}</td>
            <td className="p-2">{product.currentPrice}</td>
            <td className="p-2">{product.recommendedPrice}</td>
            <td className="p-2">
              <span className={`flex items-center gap-1 ${product.insights === "Best Price" ? "text-green-600" : "text-orange-600"}`}>
                <svg className="w-4 h-4" fill={product.insights === "Best Price" ? "green" : "orange"} viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
                {product.insights}
              </span>
            </td>
            <td className="p-2">
              <button className="bg-indigo-600 text-white py-1 px-3 rounded-md text-xs" onClick={() => handleEditClick(product)}>
                Accept/Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const EditModal = ({ product, setShowModal }) => {
  const [currentPrice, setCurrentPrice] = useState(product ? product.currentPrice : '');
  const [recommendedPrice, setRecommendedPrice] = useState(product ? product.recommendedPrice : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here (e.g., API call)
    console.log('Updated prices:', { currentPrice, recommendedPrice });
    setShowModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Accept Price</h2>
          <button onClick={() => setShowModal(false)}>X</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Current Customer Price</label>
            <input
              type="text"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Wrong Effective Customer Price</label>
            <input
              type="text"
              value="₹217"
              readOnly
              className="w-full border rounded-md p-2 bg-gray-100"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Recommended Customer Price</label>
            <input
              type="text"
              value={recommendedPrice}
              onChange={(e) => setRecommendedPrice(e.target.value)}
              className="w-full border rounded-md p-2"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Wrong Effective Customer Price</label>
            <input
              type="text"
              value="₹273"
              readOnly
              className="w-full border rounded-md p-2 bg-gray-100"
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white py-2 px-4 rounded-md w-full">
            Confirm and Accept
          </button>
        </form>
      </div>
    </div>
  );
};

export default PricingPage;