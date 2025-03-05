import React from 'react';
import { useLocation } from 'react-router-dom';

const OrderSuccess = () => {
  const location = useLocation();
  const { paymentId } = location.state || {};

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Order Successful</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg mb-4">Thank you for your purchase!</p>
        <p className="text-lg">Payment ID: {paymentId}</p>
      </div>
    </div>
  );
};

export default OrderSuccess;