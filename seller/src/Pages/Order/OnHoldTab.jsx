import React, { useState, useEffect } from 'react';
import DateFilterDropdown from './DateFilterDropdown ';
import SkuFilterDropdown from './SkuFilterDropdown';
import OrdersTable from './OrdersTable';

const OnHoldTab = ({ orders, updateOrderStatus }) => {
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    skuId: ''
  });

  useEffect(() => {
    let result = orders;
    
    if (filters.orderDate.start && filters.orderDate.end) {
      result = result.filter(order => {
        const orderDate = new Date(order.orderDate);
        const startDate = new Date(filters.orderDate.start);
        const endDate = new Date(filters.orderDate.end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    
    if (filters.skuId) {
      result = result.filter(order => 
        order.skuId.toLowerCase().includes(filters.skuId.toLowerCase())
      );
    }
    
    setFilteredOrders(result);
  }, [orders, filters]);

  const handleOrderDateChange = (orderDate) => {
    setFilters(prev => ({ ...prev, orderDate }));
  };

  const handleSkuIdChange = (skuId) => {
    setFilters(prev => ({ ...prev, skuId }));
  };

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      skuId: ''
    });
  };

  const applyFilters = () => {
    // Optional: Add validation or logging before applying filters
    console.log('Applying filters:', filters);
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Filter by:</h3>
        <div className="flex flex-wrap gap-4">
          <DateFilterDropdown
            label="Order Date"
            dateRange={filters.orderDate}
            onDateChange={handleOrderDateChange}
            onApply={applyFilters}
          />
          <SkuFilterDropdown
            skuId={filters.skuId}
            onSkuIdChange={handleSkuIdChange}
            onApply={applyFilters}
          />
        </div>
        
        {(filters.orderDate.start || filters.skuId) && (
          <button 
            className="mt-3 text-blue-600 text-sm font-medium"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
      
     <OrdersTable
  orders={filteredOrders}
  status="onHold"
  showActions={true}
  onUpdateStatus={updateOrderStatus}
/>
    </div>
  );
};

export default OnHoldTab;
