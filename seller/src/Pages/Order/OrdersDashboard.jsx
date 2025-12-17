// src/components/orders/OrdersDashboard.jsx
import React, { useState, useEffect } from 'react';

// Brick's Kart specific sample data for construction materials
const sampleOrders = [
  {
    id: 1,
    productName: 'Premium Cement Bag (OPC 53 Grade)',
    orderId: 'BK-ORD-23001',
    subOrderId: 'BK-SUB-23001',
    skuId: 'BK-CMT-OPC53-50KG',
    meeshoId: 'BK-ID-001',
    quantity: 50,
    size: '50kg',
    orderDate: '2025-09-18',
    dispatchDate: '2025-09-25',
    status: 'onHold',
    imageUrl: 'https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=400&h=400&fit=crop',
    deliveryPartner: 'Brick\'s Kart Logistics',
    materialType: 'Cement',
    customerName: 'Sharma Construction',
    customerPhone: '+91 98765 43210',
    shippingAddress: 'Site No. 45, Industrial Area, Delhi'
  },
  {
    id: 2,
    productName: 'TMT Steel Rods (12mm Grade)',
    orderId: 'BK-ORD-23002',
    subOrderId: 'BK-SUB-23002',
    skuId: 'BK-STL-TMT12-6M',
    meeshoId: 'BK-ID-002',
    quantity: 100,
    size: '12mm x 6m',
    orderDate: '2025-09-19',
    dispatchDate: '2025-09-26',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
    deliveryPartner: 'Brick\'s Kart Logistics',
    materialType: 'Steel',
    customerName: 'Gupta Builders',
    customerPhone: '+91 87654 32109',
    shippingAddress: 'Plot No. 12, Sector 62, Noida'
  },
  {
    id: 3,
    productName: 'Ceramic Floor Tiles (Wooden Finish)',
    orderId: 'BK-ORD-23003',
    subOrderId: 'BK-SUB-23003',
    skuId: 'BK-TIL-CRM24-WD',
    meeshoId: 'BK-ID-003',
    quantity: 200,
    size: '24x24 inch',
    orderDate: '2025-09-17',
    dispatchDate: '2025-09-24',
    status: 'readyToShip',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    deliveryPartner: 'DTDC Express',
    materialType: 'Tiles',
    customerName: 'Modern Interiors',
    customerPhone: '+91 76543 21098',
    shippingAddress: 'Shop No. 5, Mall Road, Gurugram'
  },
  {
    id: 4,
    productName: 'PVC Plumbing Pipes',
    orderId: 'BK-ORD-23004',
    subOrderId: 'BK-SUB-23004',
    skuId: 'BK-PIP-PVC4-3M',
    meeshoId: 'BK-ID-004',
    quantity: 75,
    size: '4 inch x 3m',
    orderDate: '2025-09-15',
    dispatchDate: '2025-09-22',
    status: 'shipped',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop',
    deliveryPartner: 'Delhivery',
    materialType: 'Pipes',
    customerName: 'Water Works Ltd.',
    customerPhone: '+91 65432 10987',
    shippingAddress: 'Industrial Estate, Faridabad'
  },
  {
    id: 5,
    productName: 'Bathroom Fittings Set (Chrome Finish)',
    orderId: 'BK-ORD-23005',
    subOrderId: 'BK-SUB-23005',
    skuId: 'BK-FIT-BTH-CRM-STD',
    meeshoId: 'BK-ID-005',
    quantity: 25,
    size: 'Standard Set',
    orderDate: '2025-09-10',
    dispatchDate: '2025-09-17',
    status: 'cancelled',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop',
    deliveryPartner: '',
    materialType: 'Fittings',
    customerName: 'Luxury Bathrooms',
    customerPhone: '+91 54321 09876',
    shippingAddress: 'Showroom No. 8, Connaught Place, Delhi'
  },
  {
    id: 6,
    productName: 'Birla Putty (White)',
    orderId: 'BK-ORD-23006',
    subOrderId: 'BK-SUB-23006',
    skuId: 'BK-PTY-BIR-WHT-20KG',
    meeshoId: 'BK-ID-006',
    quantity: 80,
    size: '20kg',
    orderDate: '2025-09-20',
    dispatchDate: '2025-09-27',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1528323273322-d81458248d40?w=400&h=400&fit=crop',
    deliveryPartner: 'Blue Dart',
    materialType: 'Putty',
    customerName: 'Paint Masters',
    customerPhone: '+91 98765 12340',
    shippingAddress: 'Near Metro Station, Ghaziabad'
  },
  {
    id: 7,
    productName: 'Asian Paints Weatherproof',
    orderId: 'BK-ORD-23007',
    subOrderId: 'BK-SUB-23007',
    skuId: 'BK-PNT-ASN-WTH-20L',
    meeshoId: 'BK-ID-007',
    quantity: 40,
    size: '20 liters',
    orderDate: '2025-09-21',
    dispatchDate: '2025-09-28',
    status: 'readyToShip',
    imageUrl: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&h=400&fit=crop',
    deliveryPartner: 'Ecom Express',
    materialType: 'Paint',
    customerName: 'Color World',
    customerPhone: '+91 87654 32101',
    shippingAddress: 'Main Market, Jaipur'
  }
];

// Reusable Tab Content Component
const TabContent = ({ 
  children, 
  filters = {}, 
  onClearFilters,
  showClearButton = true 
}) => {
  const hasActiveFilters = Object.values(filters).some(filter => 
    filter && (typeof filter === 'string' ? filter.trim() !== '' : 
    typeof filter === 'object' ? Object.values(filter).some(val => val) : false)
  );

  return (
    <div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Filter Orders</h3>
        {children}
        {showClearButton && hasActiveFilters && (
          <button
            className="mt-5 text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors px-4 py-2 border border-orange-200 rounded-lg hover:bg-orange-50"
            onClick={onClearFilters}
          >
            <i className="fas fa-times mr-2"></i>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

// DateFilterDropdown Component
const DateFilterDropdown = ({ label, dateRange, onDateChange, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateDates = () => {
    if (dateRange.start && dateRange.end) {
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      if (start > end) {
        setError('Start date cannot be after end date');
        return false;
      }
    }
    setError('');
    return true;
  };

  const handleApply = () => {
    if (validateDates()) {
      onApply();
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onDateChange({ start: '', end: '' });
    setError('');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-white border border-gray-300 hover:border-orange-400 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Toggle ${label} date filter`}
        aria-expanded={isOpen}
      >
        <i className="far fa-calendar-alt mr-2 text-gray-400"></i>
        {label}
        {(dateRange.start || dateRange.end) && (
          <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72 transition-all duration-200 ease-out opacity-0 translate-y-2 animate-dropdown">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Start Date
            </label>
            <input
              type="date"
              className={`w-full p-2.5 border rounded-lg text-sm ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
              value={dateRange.start || ''}
              onChange={(e) => onDateChange({ ...dateRange, start: e.target.value })}
              aria-label={`${label} start date`}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              className={`w-full p-2.5 border rounded-lg text-sm ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-orange-500 focus:border-orange-500'}`}
              value={dateRange.end || ''}
              onChange={(e) => onDateChange({ ...dateRange, end: e.target.value })}
              aria-label={`${label} end date`}
            />
          </div>
          
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 flex items-center">
                <i className="fas fa-exclamation-circle mr-1.5"></i>
                {error}
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleApply}
              disabled={!!error}
              aria-label={`Apply ${label} date filter`}
            >
              Apply Filter
            </button>
            <button
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={handleClear}
              aria-label={`Clear ${label} date filter`}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// SKU Filter Component
const SkuFilterDropdown = ({ skuId, onSkuIdChange, onApply }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-white border border-gray-300 hover:border-orange-400 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-barcode mr-2 text-gray-400"></i>
        Product SKU
        {skuId && (
          <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72 transition-all duration-200 ease-out opacity-0 translate-y-2 animate-dropdown">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Search Product SKU
            </label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full p-2.5 pl-10 border border-gray-300 rounded-lg text-sm focus:ring-orange-500 focus:border-orange-500"
                value={skuId}
                onChange={(e) => onSkuIdChange(e.target.value)}
                placeholder="Enter SKU (e.g., BK-CMT-OPC53)"
                aria-label="Search Product SKU"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Format: BK-[Material]-[Type]-[Size]
            </p>
          </div>
          <button 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            onClick={() => {
              onApply();
              setIsOpen(false);
            }}
            aria-label="Apply SKU filter"
          >
            Apply Filter
          </button>
        </div>
      )}
    </div>
  );
};

// Material Type Filter Component
const MaterialTypeFilter = ({ materialType, onMaterialTypeChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const materialTypes = [
    'All Materials',
    'Cement',
    'Steel',
    'Tiles',
    'Pipes',
    'Fittings',
    'Paint',
    'Putty',
    'Bricks',
    'Sand',
    'Aggregates'
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="bg-white border border-gray-300 hover:border-orange-400 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="fas fa-layer-group mr-2 text-gray-400"></i>
        Material Type
        {materialType && materialType !== 'All Materials' && (
          <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></span>
        )}
      </button>
      
      {isOpen && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-64 transition-all duration-200 ease-out opacity-0 translate-y-2 animate-dropdown">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Material Type
            </label>
            <div className="max-h-60 overflow-y-auto">
              {materialTypes.map((type) => (
                <div
                  key={type}
                  className={`flex items-center px-3 py-2 rounded-lg cursor-pointer mb-1 ${materialType === type ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    onMaterialTypeChange(type === 'All Materials' ? '' : type);
                    setIsOpen(false);
                  }}
                >
                  <div className={`w-3 h-3 rounded-full mr-3 ${materialType === type ? 'bg-orange-500' : 'border border-gray-300'}`}></div>
                  <span className="text-sm">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// OrdersTable Component
const OrdersTable = ({ orders, status, showActions = false, onUpdateStatus }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fas fa-box-open text-3xl text-gray-400"></i>
          </div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">No orders found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {status === 'cancelled' 
              ? 'No cancelled orders to display' 
              : status === 'shipped'
              ? 'No shipped orders yet'
              : 'No orders in this status. Check back soon!'
            }
          </p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      onHold: {
        title: 'On Hold',
        color: 'yellow',
        icon: 'fas fa-pause-circle',
        badgeClass: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      },
      pending: {
        title: 'Pending',
        color: 'orange',
        icon: 'fas fa-clock',
        badgeClass: 'bg-orange-100 text-orange-800 border border-orange-200'
      },
      readyToShip: {
        title: 'Ready to Ship',
        color: 'blue',
        icon: 'fas fa-shipping-fast',
        badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200'
      },
      shipped: {
        title: 'Shipped',
        color: 'green',
        icon: 'fas fa-check-circle',
        badgeClass: 'bg-green-100 text-green-800 border border-green-200'
      },
      cancelled: {
        title: 'Cancelled',
        color: 'red',
        icon: 'fas fa-ban',
        badgeClass: 'bg-red-100 text-red-800 border border-red-200'
      }
    };
    return configs[status] || {};
  };

  const config = getStatusConfig(status);

  const renderHeaders = () => {
    const baseHeaders = [
      { label: 'Product Details', key: 'product' },
      { label: 'Order ID', key: 'orderId' },
      { label: 'Customer Info', key: 'customer' },
      { label: 'Material Type', key: 'materialType' },
      { label: 'Quantity', key: 'quantity' },
      { label: 'Size', key: 'size' },
    ];

    if (status === 'shipped') {
      return [...baseHeaders, { label: 'Delivery Partner', key: 'deliveryPartner' }];
    }

    if (showActions) {
      return [...baseHeaders, { label: 'Actions', key: 'actions' }];
    }

    return baseHeaders;
  };

  const renderRow = (order) => {
    const statusActions = {
      onHold: (
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center"
            onClick={() => onUpdateStatus(order.id, 'pending')}
            aria-label="Release order from hold"
          >
            <i className="fas fa-play mr-1"></i> Release
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center"
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            aria-label="Cancel order"
          >
            <i className="fas fa-times mr-1"></i> Cancel
          </button>
        </div>
      ),
      pending: (
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center"
            onClick={() => onUpdateStatus(order.id, 'readyToShip')}
            aria-label="Accept order"
          >
            <i className="fas fa-check mr-1"></i> Accept
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center"
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            aria-label="Cancel order"
          >
            <i className="fas fa-times mr-1"></i> Cancel
          </button>
        </div>
      ),
      readyToShip: (
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center"
            onClick={() => {
              if (!order.labelDownloaded) {
                onUpdateStatus(order.id, 'shipped');
              }
            }}
            aria-label="Generate shipping label"
          >
            <i className="fas fa-truck-loading mr-1"></i> Ship Now
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center"
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            aria-label="Cancel order"
          >
            <i className="fas fa-times mr-1"></i> Cancel
          </button>
        </div>
      )
    };

    return (
      <tr key={order.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
        <td className="px-6 py-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={order.imageUrl}
                alt={order.productName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-900 line-clamp-2">{order.productName}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 mr-2">SKU:</span>
                <span className="text-xs font-medium text-gray-700 font-mono">{order.skuId}</span>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${config.badgeClass}`}>
                  <i className={`${config.icon} mr-1`}></i>
                  {config.title}
                </span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900 font-mono">{order.orderId}</div>
            <div className="text-xs text-gray-500 font-mono">{order.subOrderId}</div>
            <div className="text-xs text-gray-500">
              <i className="far fa-calendar mr-1"></i>
              {order.orderDate}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
            <div className="text-xs text-gray-600">{order.customerPhone}</div>
            <div className="text-xs text-gray-500 line-clamp-2">{order.shippingAddress}</div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center">
            <span className={`text-xs px-3 py-1.5 rounded-full ${getMaterialTypeBadgeClass(order.materialType)}`}>
              {order.materialType}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-semibold text-gray-900">{order.quantity}</div>
          <div className="text-xs text-gray-500">units</div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-700">{order.size}</div>
        </td>
        
        {status === 'shipped' && (
          <td className="px-6 py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                <i className="fas fa-truck text-blue-600 text-sm"></i>
              </div>
              <span className="text-sm font-medium text-gray-900">{order.deliveryPartner}</span>
            </div>
          </td>
        )}
        
        {showActions && status !== 'shipped' && status !== 'cancelled' && (
          <td className="px-6 py-4">
            {statusActions[status]}
          </td>
        )}
      </tr>
    );
  };

  const getMaterialTypeBadgeClass = (materialType) => {
    const classes = {
      'Cement': 'bg-gray-100 text-gray-800 border border-gray-200',
      'Steel': 'bg-red-100 text-red-800 border border-red-200',
      'Tiles': 'bg-blue-100 text-blue-800 border border-blue-200',
      'Pipes': 'bg-green-100 text-green-800 border border-green-200',
      'Fittings': 'bg-purple-100 text-purple-800 border border-purple-200',
      'Paint': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'Putty': 'bg-indigo-100 text-indigo-800 border border-indigo-200'
    };
    return classes[materialType] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              {renderHeaders().map((header) => (
                <th
                  key={header.key}
                  className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {orders.map((order) => renderRow(order))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0">
            Showing <span className="font-semibold">{orders.length}</span> orders
            <span className="ml-1 text-gray-400">({status})</span>
          </div>
          <div className="text-sm text-gray-500">
            <i className="fas fa-info-circle mr-1.5 text-orange-500"></i>
            Click on actions to update order status
          </div>
        </div>
      </div>
    </div>
  );
};

// Tab Components
const OnHoldTab = ({ orders, updateOrderStatus }) => {
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    skuId: '',
    materialType: ''
  });

  const filteredOrders = orders.filter(order => {
    let match = true;
    
    if (filters.orderDate.start && filters.orderDate.end) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(filters.orderDate.start);
      const endDate = new Date(filters.orderDate.end);
      match = match && (orderDate >= startDate && orderDate <= endDate);
    }
    
    if (filters.skuId) {
      match = match && order.skuId.toLowerCase().includes(filters.skuId.toLowerCase());
    }
    
    if (filters.materialType) {
      match = match && order.materialType === filters.materialType;
    }
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      skuId: '',
      materialType: ''
    });
  };

  return (
    <>
      <TabContent filters={filters} onClearFilters={clearFilters}>
        <div className="flex flex-wrap gap-3">
          <DateFilterDropdown
            label="Order Date"
            dateRange={filters.orderDate}
            onDateChange={(orderDate) => setFilters(prev => ({ ...prev, orderDate }))}
            onApply={() => {}}
          />
          <SkuFilterDropdown
            skuId={filters.skuId}
            onSkuIdChange={(skuId) => setFilters(prev => ({ ...prev, skuId }))}
            onApply={() => {}}
          />
          <MaterialTypeFilter
            materialType={filters.materialType || 'All Materials'}
            onMaterialTypeChange={(type) => setFilters(prev => ({ ...prev, materialType: type }))}
          />
        </div>
      </TabContent>
      
      <OrdersTable
        orders={filteredOrders}
        status="onHold"
        showActions={true}
        onUpdateStatus={updateOrderStatus}
      />
    </>
  );
};

const PendingTab = ({ orders, updateOrderStatus }) => {
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    dispatchDate: { start: '', end: '' },
    skuId: '',
    materialType: ''
  });

  const filteredOrders = orders.filter(order => {
    let match = true;
    
    if (filters.orderDate.start && filters.orderDate.end) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(filters.orderDate.start);
      const endDate = new Date(filters.orderDate.end);
      match = match && (orderDate >= startDate && orderDate <= endDate);
    }
    
    if (filters.dispatchDate.start && filters.dispatchDate.end) {
      const dispatchDate = new Date(order.dispatchDate);
      const startDate = new Date(filters.dispatchDate.start);
      const endDate = new Date(filters.dispatchDate.end);
      match = match && (dispatchDate >= startDate && dispatchDate <= endDate);
    }
    
    if (filters.skuId) {
      match = match && order.skuId.toLowerCase().includes(filters.skuId.toLowerCase());
    }
    
    if (filters.materialType) {
      match = match && order.materialType === filters.materialType;
    }
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      dispatchDate: { start: '', end: '' },
      skuId: '',
      materialType: ''
    });
  };

  return (
    <>
      <TabContent filters={filters} onClearFilters={clearFilters}>
        <div className="flex flex-wrap gap-3">
          <DateFilterDropdown
            label="Order Date"
            dateRange={filters.orderDate}
            onDateChange={(orderDate) => setFilters(prev => ({ ...prev, orderDate }))}
            onApply={() => {}}
          />
          <DateFilterDropdown
            label="Dispatch Date"
            dateRange={filters.dispatchDate}
            onDateChange={(dispatchDate) => setFilters(prev => ({ ...prev, dispatchDate }))}
            onApply={() => {}}
          />
          <SkuFilterDropdown
            skuId={filters.skuId}
            onSkuIdChange={(skuId) => setFilters(prev => ({ ...prev, skuId }))}
            onApply={() => {}}
          />
          <MaterialTypeFilter
            materialType={filters.materialType || 'All Materials'}
            onMaterialTypeChange={(type) => setFilters(prev => ({ ...prev, materialType: type }))}
          />
        </div>
      </TabContent>
      
      <OrdersTable
        orders={filteredOrders}
        status="pending"
        showActions={true}
        onUpdateStatus={updateOrderStatus}
      />
    </>
  );
};

const ReadyToShipTab = ({ orders, updateOrderStatus }) => {
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    dispatchDate: { start: '', end: '' },
    skuId: '',
    materialType: ''
  });

  const filteredOrders = orders.filter(order => {
    let match = true;
    
    if (filters.orderDate.start && filters.orderDate.end) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(filters.orderDate.start);
      const endDate = new Date(filters.orderDate.end);
      match = match && (orderDate >= startDate && orderDate <= endDate);
    }
    
    if (filters.dispatchDate.start && filters.dispatchDate.end) {
      const dispatchDate = new Date(order.dispatchDate);
      const startDate = new Date(filters.dispatchDate.start);
      const endDate = new Date(filters.dispatchDate.end);
      match = match && (dispatchDate >= startDate && dispatchDate <= endDate);
    }
    
    if (filters.skuId) {
      match = match && order.skuId.toLowerCase().includes(filters.skuId.toLowerCase());
    }
    
    if (filters.materialType) {
      match = match && order.materialType === filters.materialType;
    }
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      dispatchDate: { start: '', end: '' },
      skuId: '',
      materialType: ''
    });
  };

  return (
    <>
      <TabContent filters={filters} onClearFilters={clearFilters}>
        <div className="flex flex-wrap gap-3">
          <DateFilterDropdown
            label="Order Date"
            dateRange={filters.orderDate}
            onDateChange={(orderDate) => setFilters(prev => ({ ...prev, orderDate }))}
            onApply={() => {}}
          />
          <DateFilterDropdown
            label="Dispatch Date"
            dateRange={filters.dispatchDate}
            onDateChange={(dispatchDate) => setFilters(prev => ({ ...prev, dispatchDate }))}
            onApply={() => {}}
          />
          <SkuFilterDropdown
            skuId={filters.skuId}
            onSkuIdChange={(skuId) => setFilters(prev => ({ ...prev, skuId }))}
            onApply={() => {}}
          />
          <MaterialTypeFilter
            materialType={filters.materialType || 'All Materials'}
            onMaterialTypeChange={(type) => setFilters(prev => ({ ...prev, materialType: type }))}
          />
        </div>
      </TabContent>
      
      <OrdersTable
        orders={filteredOrders}
        status="readyToShip"
        showActions={true}
        onUpdateStatus={updateOrderStatus}
      />
    </>
  );
};

const ShippedTab = ({ orders }) => {
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    materialType: ''
  });

  const filteredOrders = orders.filter(order => {
    let match = true;
    
    if (filters.orderDate.start && filters.orderDate.end) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(filters.orderDate.start);
      const endDate = new Date(filters.orderDate.end);
      match = match && (orderDate >= startDate && orderDate <= endDate);
    }
    
    if (filters.materialType) {
      match = match && order.materialType === filters.materialType;
    }
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      materialType: ''
    });
  };

  return (
    <>
      <TabContent filters={filters} onClearFilters={clearFilters}>
        <div className="flex flex-wrap gap-3">
          <DateFilterDropdown
            label="Shipped Date"
            dateRange={filters.orderDate}
            onDateChange={(orderDate) => setFilters(prev => ({ ...prev, orderDate }))}
            onApply={() => {}}
          />
          <MaterialTypeFilter
            materialType={filters.materialType || 'All Materials'}
            onMaterialTypeChange={(type) => setFilters(prev => ({ ...prev, materialType: type }))}
          />
        </div>
      </TabContent>
      
      <OrdersTable orders={filteredOrders} status="shipped" showActions={false} />
    </>
  );
};

const CancelledTab = ({ orders }) => {
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    materialType: ''
  });

  const filteredOrders = orders.filter(order => {
    let match = true;
    
    if (filters.orderDate.start && filters.orderDate.end) {
      const orderDate = new Date(order.orderDate);
      const startDate = new Date(filters.orderDate.start);
      const endDate = new Date(filters.orderDate.end);
      match = match && (orderDate >= startDate && orderDate <= endDate);
    }
    
    if (filters.materialType) {
      match = match && order.materialType === filters.materialType;
    }
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      materialType: ''
    });
  };

  return (
    <>
      <TabContent filters={filters} onClearFilters={clearFilters}>
        <div className="flex flex-wrap gap-3">
          <DateFilterDropdown
            label="Cancelled Date"
            dateRange={filters.orderDate}
            onDateChange={(orderDate) => setFilters(prev => ({ ...prev, orderDate }))}
            onApply={() => {}}
          />
          <MaterialTypeFilter
            materialType={filters.materialType || 'All Materials'}
            onMaterialTypeChange={(type) => setFilters(prev => ({ ...prev, materialType: type }))}
          />
        </div>
      </TabContent>
      
      <OrdersTable orders={filteredOrders} status="cancelled" showActions={false} />
    </>
  );
};

// Main OrdersDashboard Component
const OrdersDashboard = () => {
  const [activeTab, setActiveTab] = useState('onHold');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    onHold: 0,
    pending: 0,
    readyToShip: 0,
    shipped: 0,
    cancelled: 0
  });

  // Initialize orders
  useEffect(() => {
    setOrders(sampleOrders);
  }, []);

  // Update stats whenever orders change
  useEffect(() => {
    const stats = {
      total: orders.length,
      onHold: orders.filter(o => o.status === 'onHold').length,
      pending: orders.filter(o => o.status === 'pending').length,
      readyToShip: orders.filter(o => o.status === 'readyToShip').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    setStats(stats);
  }, [orders]);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const renderTabContent = () => {
    const tabOrders = orders.filter(order => order.status === activeTab);
    
    switch(activeTab) {
      case 'onHold':
        return <OnHoldTab orders={tabOrders} updateOrderStatus={updateOrderStatus} />;
      case 'pending':
        return <PendingTab orders={tabOrders} updateOrderStatus={updateOrderStatus} />;
      case 'readyToShip':
        return <ReadyToShipTab orders={tabOrders} updateOrderStatus={updateOrderStatus} />;
      case 'shipped':
        return <ShippedTab orders={tabOrders} />;
      case 'cancelled':
        return <CancelledTab orders={tabOrders} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'onHold', label: 'On Hold', count: stats.onHold, icon: 'fas fa-pause-circle', color: 'yellow' },
    { id: 'pending', label: 'Pending', count: stats.pending, icon: 'fas fa-clock', color: 'orange' },
    { id: 'readyToShip', label: 'Ready to Ship', count: stats.readyToShip, icon: 'fas fa-shipping-fast', color: 'blue' },
    { id: 'shipped', label: 'Shipped', count: stats.shipped, icon: 'fas fa-check-circle', color: 'green' },
    { id: 'cancelled', label: 'Cancelled', count: stats.cancelled, icon: 'fas fa-ban', color: 'red' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-boxes text-white"></i>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Orders Management</h1>
          </div>
          <p className="text-gray-600 ml-13">Manage and track all your construction material orders from one place</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <i className="fas fa-boxes text-blue-600 text-lg"></i>
              </div>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              <i className="fas fa-building mr-1"></i>
              Construction Materials
            </div>
          </div>
          
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer transition-all duration-200 hover:shadow-md ${
                activeTab === tab.id 
                  ? `border-${tab.color}-500 bg-${tab.color}-50` 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{tab.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  activeTab === tab.id ? `bg-${tab.color}-100` : 'bg-gray-100'
                }`}>
                  <i className={`${tab.icon} ${activeTab === tab.id ? `text-${tab.color}-600` : 'text-gray-600'} text-lg`}></i>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Delivery Status Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                  <i className="fas fa-truck text-blue-600"></i>
                </div>
                <h2 className="text-lg md:text-xl font-semibold text-blue-900">Bulk Delivery Status</h2>
              </div>
              <p className="text-blue-700 text-sm md:text-base">
                Heavy construction materials require special handling. Our logistics team will coordinate bulk deliveries directly with customers.
              </p>
              <div className="flex items-center mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm text-blue-600">Delivery tracking available for all orders</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg flex items-center transition-colors text-sm md:text-base">
                <i className="fas fa-phone-alt mr-2"></i>
                Contact Logistics
              </button>
            </div>
          </div>
        </div>

        {/* Packaging Requirements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between">
            <div className="mb-4 lg:mb-0">
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Construction Material Packaging</h3>
              <p className="text-gray-600 text-sm md:text-base">
                All construction materials must be properly packaged as per industry standards. 
                Cement in waterproof bags, steel with anti-rust coating, tiles in protective crates.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 rounded-lg flex items-center transition-colors text-sm md:text-base">
                <i className="fas fa-box mr-2"></i>
                Packaging Guidelines
              </button>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-lg flex items-center transition-colors text-sm md:text-base">
                <i className="fas fa-file-download mr-2"></i>
                Download Checklist
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex overflow-x-auto -mb-px" aria-label="Tabs">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`
                    flex-shrink-0 px-5 py-4 font-medium text-sm md:text-base border-b-2 flex items-center transition-colors
                    ${activeTab === tab.id 
                      ? `border-${tab.color}-500 text-${tab.color}-600` 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`${tab.icon} mr-3 ${activeTab === tab.id ? `text-${tab.color}-600` : 'text-gray-400'}`}></i>
                  {tab.label}
                  <span className={`
                    ml-3 px-2.5 py-1 rounded-full text-xs font-semibold
                    ${activeTab === tab.id 
                      ? `bg-${tab.color}-100 text-${tab.color}-600` 
                      : 'bg-gray-100 text-gray-600'
                    }
                  `}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {renderTabContent()}
        </div>

        {/* Footer Note */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
              <i className="fas fa-info-circle text-gray-600"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Note:</span> For bulk orders exceeding 5 tons, please contact our logistics team for special handling arrangements. Quality inspection is mandatory before shipping.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-dropdown {
          animation: dropdownFade 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default OrdersDashboard;