import unittest
from flask import Flask
from flask.testing import FlaskClient
from flask_jwt_extended import JWTManager, create_access_token
from models import db, CartItem, Product, User  # Assuming you have a User model for authentication
from app import cart_bp

class CartTestCase(unittest.TestCase):

    def setUp(self):
        """Set up test environment."""
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['JWT_SECRET_KEY'] = 'testsecretkey'

        # Initialize the database and JWT manager
        db.init_app(self.app)
        jwt = JWTManager(self.app)  # Initialize JWTManager

        self.app.register_blueprint(cart_bp)

        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            # Create a test user with email, username, and password
            user = User(username='testuser', email='testuser@example.com', password='testpass')
            db.session.add(user)
            # Create a test product with category
            product = Product(name='Test Product', price=10.0, category='Electronics')  # Category added
            db.session.add(product)
            db.session.commit()

    def tearDown(self):
        """Clean up after each test."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def get_auth_headers(self, user_id):
        """Helper method to get headers with a valid JWT token."""
        with self.app.app_context():
            access_token = create_access_token(identity=user_id)
            return {'Authorization': f'Bearer {access_token}'}

    def test_view_cart(self):
        """Test viewing the cart."""
        headers = self.get_auth_headers(1)
        response = self.client.get('/cart', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, [])

    def test_add_to_cart(self):
        """Test adding a product to the cart."""
        headers = self.get_auth_headers(1)
        data = {'product_id': 1, 'quantity': 2}
        response = self.client.post('/cart/add', json=data, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json)
        self.assertIn('cart_item', response.json)

    def test_update_cart(self):
        """Test updating a product quantity in the cart."""
        headers = self.get_auth_headers(1)
        # First, add a product to the cart
        self.client.post('/cart/add', json={'product_id': 1, 'quantity': 2}, headers=headers)
        # Then, update the quantity
        response = self.client.put('/cart/update/1', json={'quantity': 5}, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json)
        self.assertIn('cart_item', response.json)

    def test_remove_from_cart(self):
        """Test removing a product from the cart."""
        headers = self.get_auth_headers(1)
        # First, add a product to the cart
        self.client.post('/cart/add', json={'product_id': 1, 'quantity': 2}, headers=headers)
        # Then, remove it
        response = self.client.delete('/cart/remove/1', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json)

    def test_clear_cart(self):
        """Test clearing the cart."""
        headers = self.get_auth_headers(1)
        # First, add a product to the cart
        self.client.post('/cart/add', json={'product_id': 1, 'quantity': 2}, headers=headers)
        # Then, clear the cart
        response = self.client.delete('/cart/clear', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn('message', response.json)

if __name__ == '__main__':
    unittest.main()