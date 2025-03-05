import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from "./context/OrderContext";
import { WishlistProvider } from './context/WishlistContext';


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="587185143160-oc5gioqh3cr6nbntie6nv25tfg0ki2nt.apps.googleusercontent.com">
  <StrictMode>
    <UserProvider>
    <ProductProvider>
    <CartProvider>
    <OrderProvider>
    <WishlistProvider>
      <App />
      </WishlistProvider>
      </OrderProvider>
    </CartProvider>
  </ProductProvider>
    </UserProvider>
  </StrictMode>
  </GoogleOAuthProvider>
);