import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ProductContext = createContext();

export const useProduct = () => useContext(ProductContext);

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all products from the backend
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('https://unishop-fullstack-1.onrender.com/products/');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data); // Initialize filtered products with all products
      extractCategories(data); // Extract categories from the products
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  }, []);

  // Extract unique categories from products
  const extractCategories = (products) => {
    const uniqueCategories = [...new Set(products.map((product) => product.category))];
    setCategories(uniqueCategories);
  };

  // Filter products by category
  const filterByCategory = useCallback(
    (category) => {
      if (category === 'all') {
        setFilteredProducts(products);
      } else {
        const filtered = products.filter((product) => product.category === category);
        setFilteredProducts(filtered);
      }
    },
    [products]
  );

  // Search products by name or description
  const searchProducts = useCallback(
    (query) => {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    },
    [products]
  );

  // Add a new product (Admin Only)
  const addProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://unishop-fullstack-1.onrender.com/products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) {
        throw new Error('Failed to add product');
      }
      const newProduct = await response.json();
      setProducts((prevProducts) => [...prevProducts, newProduct]);
      setFilteredProducts((prevFiltered) => [...prevFiltered, newProduct]);
      extractCategories([...products, newProduct]); // Update categories
      return newProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Update an existing product (Admin Only)
  const updateProduct = async (productId, updatedData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://unishop-fullstack-1.onrender.com/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        throw new Error('Failed to update product');
      }
      const updatedProduct = await response.json();
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.id === productId ? updatedProduct : product))
      );
      setFilteredProducts((prevFiltered) =>
        prevFiltered.map((product) => (product.id === productId ? updatedProduct : product))
      );
      return updatedProduct;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Delete a product (Admin Only)
  const deleteProduct = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://unishop-fullstack-1.onrender.com/products/${productId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete product');
      }
      setProducts((prevProducts) => prevProducts.filter((product) => product.id !== productId));
      setFilteredProducts((prevFiltered) => prevFiltered.filter((product) => product.id !== productId));
      extractCategories(products.filter((product) => product.id !== productId)); // Update categories
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Provide context values
  const value = {
    products: filteredProducts,
    categories,
    loading,
    error,
    filterByCategory,
    searchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    fetchProducts, // Allow manual refresh of products
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};