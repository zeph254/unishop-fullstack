import unittest
from flask import Flask
from flask_jwt_extended import create_access_token, JWTManager
from models import db, Product, User
from app import product_bp

class ProductTestCase(unittest.TestCase):

    def setUp(self):
        # Create a test Flask application
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['JWT_SECRET_KEY'] = 'test_secret_key'  # Ensure secret key is set

        # Initialize the database and JWTManager
        db.init_app(self.app)
        jwt = JWTManager(self.app)  # Initialize JWTManager

        self.app.register_blueprint(product_bp)

        # Create the database and tables
        with self.app.app_context():
            db.create_all()

        # Create a test client
        self.client = self.app.test_client()

        # Add test data
        with self.app.app_context():
            # Create an admin user (first user will automatically be admin)
            self.admin_user = User(
                username='admin',
                email='admin@example.com',
                password='adminpassword'  # Password is hashed in the model
            )
            db.session.add(self.admin_user)
            db.session.commit()

            # Create a regular user (second user will automatically be customer)
            self.regular_user = User(
                username='user',
                email='user@example.com',
                password='userpassword'  # Password is hashed in the model
            )
            db.session.add(self.regular_user)
            db.session.commit()

            # Generate JWT tokens for the test users
            self.admin_token = create_access_token(identity=self.admin_user.id)
            self.regular_token = create_access_token(identity=self.regular_user.id)

    def tearDown(self):
        # Clean up the database after each test
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_create_product_as_admin(self):
        # Test creating a product as an admin
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        data = {
            "name": "Test Product",
            "description": "A test product",
            "price": 100.0,
            "stock": 10,
            "category": "Test Category",
            "image_url": "http://example.com/image.jpg"
        }
        response = self.client.post('/products/', json=data, headers=headers)
        self.assertEqual(response.status_code, 201)
        self.assertIn("Product created successfully", response.json['message'])

    def test_create_product_as_regular_user(self):
        # Test creating a product as a regular user (should fail)
        headers = {
            'Authorization': f'Bearer {self.regular_token}'
        }
        data = {
            "name": "Test Product",
            "description": "A test product",
            "price": 100.0,
            "stock": 10,
            "category": "Test Category",
            "image_url": "http://example.com/image.jpg"
        }
        response = self.client.post('/products/', json=data, headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized access", response.json['error'])

    def test_create_product_missing_fields(self):
        # Test creating a product with missing required fields
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        data = {
            "description": "A test product",
            "price": 100.0,
            "stock": 10,
            "category": "Test Category",
            "image_url": "http://example.com/image.jpg"
        }
        response = self.client.post('/products/', json=data, headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Name, price, and category are required", response.json['error'])

    def test_get_all_products(self):
        # Test retrieving all products (public access)
        response = self.client.get('/products/')
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)

    def test_get_single_product(self):
        # Test retrieving a single product (public access)
        # First, create a product
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        data = {
            "name": "Test Product",
            "description": "A test product",
            "price": 100.0,
            "stock": 10,
            "category": "Test Category",
            "image_url": "http://example.com/image.jpg"
        }
        self.client.post('/products/', json=data, headers=headers)

        # Now, retrieve the product
        response = self.client.get('/products/1')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['name'], "Test Product")

    def test_get_nonexistent_product(self):
        # Test retrieving a product that doesn't exist
        response = self.client.get('/products/999')
        self.assertEqual(response.status_code, 404)
        self.assertIn("Product not found", response.json['error'])

    def test_update_product_as_admin(self):
        # Test updating a product as an admin
        # First, create a product
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        data = {
            "name": "Test Product",
            "description": "A test product",
            "price": 100.0,
            "stock": 10,
            "category": "Test Category",
            "image_url": "http://example.com/image.jpg"
        }
        self.client.post('/products/', json=data, headers=headers)

        # Now, update the product
        update_data = {
            "name": "Updated Product",
            "price": 150.0
        }
        response = self.client.put('/products/1', json=update_data, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Product updated successfully", response.json['message'])

    def test_update_product_as_regular_user(self):
        # Test updating a product as a regular user (should fail)
        headers = {
            'Authorization': f'Bearer {self.regular_token}'
        }
        update_data = {
            "name": "Updated Product",
            "price": 150.0
        }
        response = self.client.put('/products/1', json=update_data, headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized access", response.json['error'])

    def test_update_nonexistent_product(self):
        # Test updating a product that doesn't exist
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        update_data = {
            "name": "Updated Product",
            "price": 150.0
        }
        response = self.client.put('/products/999', json=update_data, headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("Product not found", response.json['error'])

    def test_delete_product_as_admin(self):
        # Test deleting a product as an admin
        # First, create a product
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        data = {
            "name": "Test Product",
            "description": "A test product",
            "price": 100.0,
            "stock": 10,
            "category": "Test Category",
            "image_url": "http://example.com/image.jpg"
        }
        self.client.post('/products/', json=data, headers=headers)

        # Now, delete the product
        response = self.client.delete('/products/1', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Product deleted successfully", response.json['message'])

    def test_delete_product_as_regular_user(self):
        # Test deleting a product as a regular user (should fail)
        headers = {
            'Authorization': f'Bearer {self.regular_token}'
        }
        response = self.client.delete('/products/1', headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized access", response.json['error'])

    def test_delete_nonexistent_product(self):
        # Test deleting a product that doesn't exist
        headers = {
            'Authorization': f'Bearer {self.admin_token}'
        }
        response = self.client.delete('/products/999', headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("Product not found", response.json['error'])

if __name__ == '__main__':
    unittest.main()