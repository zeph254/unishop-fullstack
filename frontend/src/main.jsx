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
import { BrowserRouter } from "react-router-dom";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Move to env file

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <StrictMode>
      <BrowserRouter> {/* Wrap everything inside BrowserRouter */}
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
      </BrowserRouter>
    </StrictMode>
  </GoogleOAuthProvider>
);
