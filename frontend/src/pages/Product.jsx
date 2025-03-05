import React, { useState, useEffect } from 'react';
import { useProduct } from '../context/ProductContext';
import { useUser } from '../context/UserContext';

const ProductPage = () => {
  const { products, loading, error, addProduct, updateProduct, deleteProduct, fetchProducts } = useProduct();
  const { isAuthenticated, user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    image_url: '',
  });

  useEffect(() => {
    if (currentProduct) {
      setFormData({
        name: currentProduct.name || '',
        description: currentProduct.description || '',
        price: currentProduct.price || '',
        stock: currentProduct.stock || '',
        category: currentProduct.category || '',
        image_url: currentProduct.image_url || '',
      });
    }
  }, [currentProduct]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.price < 0 || formData.stock < 0) {
      alert('Price and stock must be positive numbers.');
      return;
    }
    try {
      if (isEditing) {
        await updateProduct(currentProduct.id, formData);
      } else {
        await addProduct(formData);
      }
      setIsEditing(false);
      setCurrentProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        image_url: '',
      });
      // Refresh the product list to ensure the updated product is displayed
      await fetchProducts();
    } catch (error) {
      console.error('Failed to update/add product:', error);
      alert('Failed to update/add product. Please try again.');
    }
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
  };

  const handleDelete = async (productId) => {
    if (!productId) return;
    try {
      await deleteProduct(productId);
      // Refresh the product list after deletion
      await fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  if (loading) return <div className="text-center text-lg font-semibold">Loading...</div>;
  if (error) return <div className="text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Products</h1>
      {isAuthenticated && user.role === 'admin' && (
        <form onSubmit={handleSubmit} className="bg-white shadow-lg p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} className="input" required />
            <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} className="input" />
            <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleInputChange} className="input" required min="0" />
            <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleInputChange} className="input" min="0" />
            <input type="text" name="category" placeholder="Category" value={formData.category} onChange={handleInputChange} className="input" required />
            <input type="text" name="image_url" placeholder="Image URL" value={formData.image_url} onChange={handleInputChange} className="input" />
          </div>
          <div className="mt-4 flex gap-4">
            <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Add'}</button>
            {isEditing && <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>}
          </div>
        </form>
      )}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Product List</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <div key={product.id || `product-${index}`} className="bg-white shadow-lg rounded-lg p-4 text-center">
              <img
                src={product.image_url || 'https://dummyimage.com/150x150/000/fff&text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover mb-4 rounded-md"
                onError={(e) => {
                  e.target.src = 'https://dummyimage.com/150x150/000/fff&text=No+Image';
                }}
              />
              <h3 className="text-xl font-semibold">{product.name}</h3>
              <p className="text-gray-600">{product.description}</p>
              <p className="text-green-600 font-bold">Ksh{product.price}</p>
              <p className="text-sm text-gray-500">Stock: {product.stock}</p>
              <p className="text-sm text-gray-500">Category: {product.category}</p>
              {isAuthenticated && user.role === 'admin' && (
                <div className="mt-4 flex justify-center gap-4">
                  <button onClick={() => handleEdit(product)} className="btn-secondary">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="btn-danger">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;