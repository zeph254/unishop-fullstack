import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token
from models import db, Order, OrderItem, CartItem, Product, User
from app import order_bp

@pytest.fixture
def app():
    app = Flask(__name__)
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['JWT_SECRET_KEY'] = 'test-secret-key'
    
    # Initialize the JWTManager here
    jwt = JWTManager(app)
    
    app.register_blueprint(order_bp)
    
    db.init_app(app)
    with app.app_context():
        db.create_all()
    
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def jwt_token(app):
    with app.app_context():
        # Provide 'email' field when creating the user
        user = User(username='testuser', email='testuser@example.com', password='testpass')
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=user.id)
        return token

def test_create_order_empty_cart(client, jwt_token):
    headers = {'Authorization': f'Bearer {jwt_token}'}
    response = client.post('/order/create', json={"cart_items": []}, headers=headers)
    assert response.status_code == 400
    assert response.json['message'] == 'Cart is empty'

def test_create_order_success(client, jwt_token):
    headers = {'Authorization': f'Bearer {jwt_token}'}
    
    # Ensure product exists before adding it to CartItem
    with client.application.app_context():
        product = Product(name='Test Product', price=10.0, category='Test Category')  # Provide category
        db.session.add(product)
        db.session.commit()  # Commit to generate id for product
        
        # Create CartItem linked to the existing product
        cart_item = CartItem(user_id=1, product_id=product.id, quantity=2)
        db.session.add(cart_item)
        db.session.commit()  # Commit to generate id for cart_item
    
    # Mock cart_items data
    cart_items = [
        {
            "product_id": product.id,
            "quantity": 2,
            "product": {
                "price": 10.0
            }
        }
    ]
    
    response = client.post('/order/create', json={"cart_items": cart_items}, headers=headers)
    assert response.status_code == 201
    assert response.json['message'] == 'Order placed successfully'
    assert 'order_id' in response.json

def test_order_history(client, jwt_token):
    headers = {'Authorization': f'Bearer {jwt_token}'}
    
    # Ensure product exists before creating order items
    with client.application.app_context():
        product = Product(name='Test Product', price=10.0, category='Test Category')  # Provide category
        db.session.add(product)
        db.session.commit()  # Commit to generate id for product
        
        # Create an order linked to the existing user
        order = Order(user_id=1, total_price=20.0, status='Pending')  
        db.session.add(order)
        db.session.commit()  # Commit to generate id for the order
        
        # Add order item linked to the created order and product
        order_item = OrderItem(order_id=order.id, product_id=product.id, quantity=2, subtotal=20.0)  
        db.session.add(order_item)
        db.session.commit()  # Commit to generate id for order_item
    
    response = client.get('/order/history', headers=headers)
    assert response.status_code == 200
    assert len(response.json) == 1
    assert response.json[0]['total_price'] == 20.0
    assert response.json[0]['status'] == 'Pending'
    assert len(response.json[0]['items']) == 1

def test_track_order_not_found(client, jwt_token):
    headers = {'Authorization': f'Bearer {jwt_token}'}
    response = client.get('/order/track/999', headers=headers)
    assert response.status_code == 404
    assert response.json['message'] == 'Order not found'

def test_track_order_success(client, jwt_token):
    headers = {'Authorization': f'Bearer {jwt_token}'}
    
    # Add an order (without 'estimated_delivery' field)
    with client.application.app_context():
        order = Order(user_id=1, total_price=20.0, status='Pending')  # Fixed: removed 'estimated_delivery' field
        db.session.add(order)
        db.session.commit()  # Commit to generate id for order
    
    response = client.get('/order/track/1', headers=headers)
    assert response.status_code == 200
    assert response.json['id'] == 1
    assert response.json['status'] == 'Pending'

def test_update_order_status_not_found(client, jwt_token):
    headers = {'Authorization': f'Bearer {jwt_token}'}
    response = client.put('/order/update/999', json={'status': 'Shipped'}, headers=headers)
    assert response.status_code == 404
    assert response.json['message'] == 'Order not found'

def test_update_order_status_success(client, jwt_token):
    headers = {'Authorization': f'Bearer {jwt_token}'}
    
    # Add an order (without 'estimated_delivery' field)
    with client.application.app_context():
        order = Order(user_id=1, total_price=20.0, status='Pending')  
        db.session.add(order)
        db.session.commit()  # Commit to generate id for order
    
    response = client.put('/order/update/1', json={'status': 'Shipped'}, headers=headers)
    assert response.status_code == 200
    assert response.json['message'] == 'Order status updated'
    assert response.json['new_status'] == 'Shipped'