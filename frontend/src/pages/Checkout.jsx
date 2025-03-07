import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import "../App.css";

const Checkout = () => {
  const { cartItems = [], getCartTotalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);

  const total = getCartTotalPrice();
  const deliveryFee = cartItems?.length > 0 ? 180 : 0;
  const grandTotal = total + deliveryFee;

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Dynamically load the Paystack script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      setPaystackLoaded(true); // Set Paystack as loaded
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script); // Cleanup script on unmount
    };
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!paystackLoaded) {
      setError('Paystack is still loading. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');

      // Step 1: Prepare cart_items for the request body
      const cart_items = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        product: {
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
        },
      }));

      // Step 2: Create an order
      const orderResponse = await fetch('https://unishop-fullstack-1.onrender.com/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_items: cart_items, // Include cart_items in the request body
        }),
      });

      const orderData = await orderResponse.json();
      console.log('Order Data:', orderData); // Log the order data for debugging

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Step 3: Process payment with Paystack
      const email = document.getElementById("email-address").value;
      const amount = grandTotal * 100; // Convert to kobo

      let handler = window.PaystackPop.setup({
        key: 'pk_test_1312315a496cf9321f6632340095df68df7b0fc0', // Replace with your public key
        email: email,
        amount: amount,
        currency: 'KES',
        ref: '' + Math.floor((Math.random() * 1000000000) + 1), // generates a pseudo-unique reference
        onClose: function () {
          alert('Window closed.');
        },
        callback: function (response) {
          fetch('http://127.0.0.1:5000/payment/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              order_id: orderData.order_id, // Use the order ID from the created order
            }),
          })
            .then((response) => {
              console.log('Payment Process Response:', response);
              return response.json();
            })
            .then((data) => {
              console.log('Payment Process Data:', data);
              if (response.ok) {
                clearCart(); // Clear the cart
                navigate('/cart'); // Navigate to the cart page
              } else {
                alert('Payment successful! Thank you for your purchase.');
                clearCart(); // Clear the cart
                navigate('/cart'); 
              }
            })
            .catch((error) => {
              setError(error.message);
              console.error('Payment Error:', error);
            });
        }
      });

      handler.openIframe();
    } catch (error) {
      setError(error.message);
      console.error('Payment Error:', error); // Log the error for debugging
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
        <div className="space-y-3 mb-6">
          {cartItems.map((item) => (
            <div key={item.product.id} className="flex justify-between">
              <span>{item.product.name} (x{item.quantity})</span>
              <span>${item.product.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>KES{deliveryFee}</span>
          </div>
          <div className="flex justify-between border-t pt-3">
            <span className="font-bold">Total:</span>
            <span className="font-bold">${grandTotal}</span>
          </div>
        </div>
        <form id="paymentForm" onSubmit={handlePayment}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email-address" required />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input type="tel" id="amount" value={grandTotal} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor="first-name">First Name</label>
            <input type="text" id="first-name" />
          </div>
          <div className="form-group">
            <label htmlFor="last-name">Last Name</label>
            <input type="text" id="last-name" />
          </div>
          <div className="form-submit">
            <button type="submit" disabled={loading || !paystackLoaded} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
          </div>
        </form>
        {error && <div className="mt-4 text-red-600">{error}</div>}
      </div>
    </div>
  );
};

export default Checkout;