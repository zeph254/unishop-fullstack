import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Invoice() {
  const { orderId } = useParams(); // Get orderId from the URL
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch invoice data from the backend
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/payment/invoice/${orderId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.data) {
          setInvoice(response.data);
        }
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError('Failed to fetch invoice. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [orderId]);

  // Show loading spinner while fetching data
  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Invoice</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  // Show error message if there's an error
  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Invoice</h1>
        <div className="text-center p-8">
          <p className="text-lg font-semibold mb-2 text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  // Render the invoice details
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoice</h1>
      {invoice && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Invoice ID: {invoice.invoice_id}</h2>
            <p className="text-gray-500">Order ID: {invoice.order_id}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">User Details</h3>
            <p>Username: {invoice.user.username}</p>
            <p>Email: {invoice.user.email}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">Payment Details</h3>
            <p>Payment ID: {invoice.payment_id}</p>
            <p>Payment Method: {invoice.payment_method}</p>
            <p>Payment Date: {new Date(invoice.payment_date).toLocaleDateString()}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">Items</h3>
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 text-left">Product Name</th>
                  <th className="p-2 text-left">Quantity</th>
                  <th className="p-2 text-left">Price</th>
                  <th className="p-2 text-left">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2">{item.product_name}</td>
                    <td className="p-2">{item.quantity}</td>
                    <td className="p-2">Ksh{item.price.toFixed(2)}</td>
                    <td className="p-2">Ksh{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">Total Price</h3>
            <p className="text-xl font-bold">Ksh{invoice.total_price.toFixed(2)}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold">Billing Address</h3>
            <p>{invoice.billing_address}</p>
          </div>


          <div className="mb-6">
            <h3 className="text-lg font-semibold">Shipping Address</h3>
            <p>{invoice.shipping_address}</p>
          </div>
        </div>
        
      )}
         <Link
        to="/orders"
        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
        Back to Orders
        </Link>
    </div>
  );

}