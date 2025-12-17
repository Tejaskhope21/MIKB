import React from 'react';
import OrdersTable from './OrdersTable';

const ShippedTab = ({ orders }) => {
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="text-sm text-gray-500">
          Showing all shipped products
        </div>
      </div>
      
      <OrdersTable orders={orders} status="shipped" showActions={false} />
    </div>
  );
};

export default ShippedTab;