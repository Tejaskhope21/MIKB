// src/components/orders/OrdersDashboard.jsx
import React, { useState, useEffect } from 'react';
import OrdersTable from './OrdersTable';
import DateFilterDropdown from './DateFilterDropdown';
import SkuFilterDropdown from './SkuFilterDropdown';

// Sample data for demonstration
const sampleOrders = [
  {
    id: 1,
    productName: 'Premium Cement Bag',
    orderId: 'ORD-001',
    subOrderId: 'SUB-001',
    skuId: 'SKU-CEMENT-001',
    meeshoId: 'MEE-001',
    quantity: 50,
    size: '50kg',
    orderDate: '2025-09-18',
    dispatchDate: '2025-09-25',
    status: 'onHold',
    imageUrl: 'https://images.unsplash.com/photo-1592503254549-d83d24a4dfab?w=400&h=400&fit=crop',
    deliveryPartner: 'Delhivery'
  },
  {
    id: 2,
    productName: 'Steel Rods',
    orderId: 'ORD-002',
    subOrderId: 'SUB-002',
    skuId: 'SKU-STEEL-001',
    meeshoId: 'MEE-002',
    quantity: 100,
    size: '12mm',
    orderDate: '2025-09-19',
    dispatchDate: '2025-09-26',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=400&fit=crop',
    deliveryPartner: 'Blue Dart'
  },
  {
    id: 3,
    productName: 'Ceramic Tiles',
    orderId: 'ORD-003',
    subOrderId: 'SUB-003',
    skuId: 'SKU-TILE-001',
    meeshoId: 'MEE-003',
    quantity: 200,
    size: '2x2 ft',
    orderDate: '2025-09-17',
    dispatchDate: '2025-09-24',
    status: 'readyToShip',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w-400&h=400&fit=crop',
    deliveryPartner: 'FedEx',
    labelDownloaded: false
  },
  {
    id: 4,
    productName: 'PVC Pipes',
    orderId: 'ORD-004',
    subOrderId: 'SUB-004',
    skuId: 'SKU-PIPE-001',
    meeshoId: 'MEE-004',
    quantity: 75,
    size: '4 inch',
    orderDate: '2025-09-15',
    dispatchDate: '2025-09-22',
    status: 'shipped',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop',
    deliveryPartner: 'DTDC'
  },
  {
    id: 5,
    productName: 'Bathroom Fittings',
    orderId: 'ORD-005',
    subOrderId: 'SUB-005',
    skuId: 'SKU-FITTING-001',
    meeshoId: 'MEE-005',
    quantity: 25,
    size: 'Standard',
    orderDate: '2025-09-10',
    dispatchDate: '2025-09-17',
    status: 'cancelled',
    imageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop',
    deliveryPartner: ''
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 text-sm md:text-base">Filter by:</h3>
        {children}
        {showClearButton && hasActiveFilters && (
          <button
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
            onClick={onClearFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  );
};

// Tab Components
const OnHoldTab = ({ orders, updateOrderStatus }) => {
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    skuId: ''
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
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      skuId: ''
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
    skuId: ''
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
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      dispatchDate: { start: '', end: '' },
      skuId: ''
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
    skuId: ''
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
    
    return match;
  });

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      dispatchDate: { start: '', end: '' },
      skuId: ''
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
  return (
    <>
      <TabContent showClearButton={false}>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <i className="fas fa-truck text-blue-500 mr-2"></i>
          Showing all shipped products with delivery partner information
        </div>
      </TabContent>
      
      <OrdersTable orders={orders} status="shipped" showActions={false} />
    </>
  );
};

const CancelledTab = ({ orders }) => {
  return (
    <>
      <TabContent showClearButton={false}>
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <i className="fas fa-ban text-red-500 mr-2"></i>
          Showing cancelled products only
        </div>
      </TabContent>
      
      <OrdersTable orders={orders} status="cancelled" showActions={false} />
    </>
  );
};

// Main Orders Dashboard Component


// src/components/orders/DateFilterDropdown.jsx
import React, { useState, useEffect, useRef } from 'react';



// src/components/orders/SkuFilterDropdown.jsx


// src/components/orders/OrdersTable.jsx
import React from 'react';

const OrdersTable = ({ orders, status, showActions = false, onUpdateStatus }) => {
  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg">
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
              : 'Keep checking this section for new orders'
            }
          </p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status) => {
    const configs = {
      onHold: {
        title: 'On Hold Products',
        color: 'yellow',
        icon: 'fas fa-pause-circle',
        badgeClass: 'bg-yellow-100 text-yellow-800'
      },
      pending: {
        title: 'Pending Products',
        color: 'orange',
        icon: 'fas fa-clock',
        badgeClass: 'bg-orange-100 text-orange-800'
      },
      readyToShip: {
        title: 'Ready to Ship',
        color: 'blue',
        icon: 'fas fa-shipping-fast',
        badgeClass: 'bg-blue-100 text-blue-800'
      },
      shipped: {
        title: 'Shipped Products',
        color: 'green',
        icon: 'fas fa-check-circle',
        badgeClass: 'bg-green-100 text-green-800'
      },
      cancelled: {
        title: 'Cancelled Products',
        color: 'red',
        icon: 'fas fa-ban',
        badgeClass: 'bg-red-100 text-red-800'
      }
    };
    return configs[status] || {};
  };

  const config = getStatusConfig(status);

  const renderHeaders = () => {
    const baseHeaders = [
      { label: 'Product Details', key: 'product', width: 'w-1/4' },
      { label: 'Sub-order ID', key: 'subOrderId', width: 'w-1/6' },
      { label: 'SKU ID', key: 'skuId', width: 'w-1/6' },
      { label: 'Meesho ID', key: 'meeshoId', width: 'w-1/6' },
      { label: 'Quantity', key: 'quantity', width: 'w-1/12' },
      { label: 'Size', key: 'size', width: 'w-1/12' },
    ];

    if (status === 'shipped') {
      return [...baseHeaders, { label: 'Delivery Partner', key: 'deliveryPartner', width: 'w-1/6' }];
    }

    if (showActions) {
      return [...baseHeaders, { label: 'Actions', key: 'actions', width: 'w-1/6' }];
    }

    return baseHeaders;
  };

  const renderRow = (order) => {
    const statusActions = {
      onHold: (
        <>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors mr-2"
            onClick={() => onUpdateStatus(order.id, 'pending')}
            aria-label="Release order from hold"
          >
            <i className="fas fa-play mr-1"></i> Release
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            aria-label="Cancel order"
          >
            <i className="fas fa-times mr-1"></i> Cancel
          </button>
        </>
      ),
      pending: (
        <>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors mr-2"
            onClick={() => onUpdateStatus(order.id, 'readyToShip')}
            aria-label="Accept order"
          >
            <i className="fas fa-check mr-1"></i> Accept
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            aria-label="Cancel order"
          >
            <i className="fas fa-times mr-1"></i> Cancel
          </button>
        </>
      ),
      readyToShip: (
        <>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors mr-2"
            onClick={() => {
              if (!order.labelDownloaded) {
                onUpdateStatus(order.id, 'shipped');
              }
            }}
            aria-label="Download label"
          >
            <i className="fas fa-download mr-1"></i> Label
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            onClick={() => onUpdateStatus(order.id, 'cancelled')}
            aria-label="Cancel order"
          >
            <i className="fas fa-times mr-1"></i> Cancel
          </button>
        </>
      )
    };

    return (
      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={order.imageUrl}
                alt={order.productName}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{order.productName}</p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-500 mr-2">Order ID:</span>
                <span className="text-xs font-medium text-gray-700">{order.orderId}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeClass}`}>
                  <i className={`${config.icon} mr-1`}></i>
                  {config.title.split(' ')[0]}
                </span>
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900 font-mono">{order.subOrderId}</div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm text-gray-700 font-mono">{order.skuId}</div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm text-gray-700 font-mono">{order.meeshoId}</div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm font-medium text-gray-900">{order.quantity}</div>
          <div className="text-xs text-gray-500">units</div>
        </td>
        <td className="px-4 py-4">
          <div className="text-sm text-gray-700">{order.size}</div>
        </td>
        
        {status === 'shipped' && (
          <td className="px-4 py-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2">
                <i className="fas fa-truck text-blue-600 text-sm"></i>
              </div>
              <span className="text-sm font-medium text-gray-900">{order.deliveryPartner}</span>
            </div>
          </td>
        )}
        
        {showActions && status !== 'shipped' && status !== 'cancelled' && (
          <td className="px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {statusActions[status]}
            </div>
          </td>
        )}
      </tr>
    );
  };

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {renderHeaders().map((header) => (
                <th
                  key={header.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => renderRow(order))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Footer */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div className="text-sm text-gray-500 mb-2 sm:mb-0">
            Showing <span className="font-medium">{orders.length}</span> orders
            {status !== 'all' && (
              <span className="ml-1">({status.replace(/([A-Z])/g, ' $1').toLowerCase()})</span>
            )}
          </div>
          <div className="text-sm text-gray-500">
            <i className="fas fa-info-circle mr-1 text-gray-400"></i>
            Click on actions to update order status
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersTable;