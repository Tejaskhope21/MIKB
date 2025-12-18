import React from 'react';
import OrdersTable from './OrdersTable';

const CancelledTab = ({ orders }) => {
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="text-sm text-gray-500">
          Showing cancelled products only
        </div>
      </div>
      
      <OrdersTable orders={orders} status="cancelled" showActions={false} />
    </div>
  );
};

export default CancelledTab;