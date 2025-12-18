import React, { useState, useEffect } from 'react';
import OrdersTable from './OrdersTable';
import DateFilterDropdown from './DateFilterDropdown ';
import SkuFilterDropdown from './SkuFilterDropdown';


const ReadyToShipTab = ({ orders, updateOrderStatus }) => {
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [filters, setFilters] = useState({
    orderDate: { start: '', end: '' },
    dispatchDate: { start: '', end: '' },
    skuId: '',
  });

  useEffect(() => {
    let result = orders;

    // Apply order date filter
    if (filters.orderDate.start && filters.orderDate.end) {
      result = result.filter((order) => {
        const orderDate = new Date(order.orderDate);
        const startDate = new Date(filters.orderDate.start);
        const endDate = new Date(filters.orderDate.end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Apply dispatch date filter
    if (filters.dispatchDate.start && filters.dispatchDate.end) {
      result = result.filter((order) => {
        const dispatchDate = new Date(order.dispatchDate);
        const startDate = new Date(filters.dispatchDate.start);
        const endDate = new Date(filters.dispatchDate.end);
        return dispatchDate >= startDate && dispatchDate <= endDate;
      });
    }

    // Apply SKU ID filter
    if (filters.skuId) {
      result = result.filter((order) =>
        order.skuId.toLowerCase().includes(filters.skuId.toLowerCase())
      );
    }

    setFilteredOrders(result);
  }, [orders, filters]);

  const handleOrderDateChange = (orderDate) => {
    setFilters((prev) => ({ ...prev, orderDate }));
  };

  const handleDispatchDateChange = (dispatchDate) => {
    setFilters((prev) => ({ ...prev, dispatchDate }));
  };

  const handleSkuIdChange = (skuId) => {
    setFilters((prev) => ({ ...prev, skuId }));
  };

  const clearFilters = () => {
    setFilters({
      orderDate: { start: '', end: '' },
      dispatchDate: { start: '', end: '' },
      skuId: '',
    });
  };

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">Filter by:</h3>
        <div className="flex flex-wrap gap-4">
          <DateFilterDropdown
            label="Order Date"
            dateRange={filters.orderDate}
            onDateChange={handleOrderDateChange}
            onApply={() => {}}
          />
          <DateFilterDropdown
            label="Dispatch Date"
            dateRange={filters.dispatchDate}
            onDateChange={handleDispatchDateChange}
            onApply={() => {}}
          />
          <SkuFilterDropdown
            skuId={filters.skuId}
            onSkuIdChange={handleSkuIdChange}
            onApply={() => {}}
          />
        </div>

        {(filters.orderDate.start || filters.dispatchDate.start || filters.skuId) && (
          <button
            className="mt-3 text-blue-600 text-sm font-medium"
            onClick={clearFilters}
          >
            Clear All Filters
          </button>
        )}
      </div>
      
      {/* Orders table */}
      <OrdersTable 
        orders={filteredOrders} 
        status="readyToShip"
        showActions={true} 
        onUpdateStatus={updateOrderStatus}
      />
      {/* Bottom message area - will be updated by OrdersTable */}
      <div id="statusMessage" className="mt-4 p-2 bg-gray-100 text-center rounded"></div>
    </div>
  );
};

export default ReadyToShipTab;