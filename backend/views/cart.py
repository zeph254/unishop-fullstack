from flask import Blueprint, jsonify, request
from models import CartItem, Product, db  # Import the necessary models and db instance
from flask_jwt_extended import jwt_required, get_jwt_identity

cart_bp = Blueprint('cart_bp', __name__)

@cart_bp.route('/cart', methods=['GET'])
@jwt_required()
def view_cart():
    """View all items in the cart for the current user."""
    user_id = get_jwt_identity()
    cart_items = CartItem.query.filter_by(user_id=user_id).all()

    cart = []
    for item in cart_items:
        product = Product.query.get(item.product_id)
        cart.append({
            "product": {
                "id": product.id,
                "name": product.name,
                "price": product.price,
                "image_url": product.image_url  # Ensure this is included
            },
            "quantity": item.quantity
        })

    return jsonify(cart)

@cart_bp.route('/cart/add', methods=['POST'])
@jwt_required()  # Require authentication to add to the cart
def add_to_cart():
    """Add a product to the cart."""
    data = request.json
    product_id = data.get('product_id')
    quantity = int(data.get('quantity', 1))

    if not product_id:
        return jsonify({"error": "Product ID is required"}), 400

    user_id = get_jwt_identity()  # Get the current user's ID from the JWT token

    # Check if the product exists
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Check if the product is already in the user's cart
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()

    if cart_item:
        # Update the quantity if the product is already in the cart
        cart_item.quantity += quantity
    else:
        # Add a new item to the cart
        cart_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
        db.session.add(cart_item)

    db.session.commit()
    return jsonify({"message": "Product added to cart", "cart_item": {
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity
    }})

@cart_bp.route('/cart/update/<int:product_id>', methods=['PUT'])
@jwt_required()  # Require authentication to update the cart
def update_cart(product_id):
    """Update quantity of an item in the cart."""
    data = request.json
    quantity = int(data.get('quantity', 1))

    if quantity < 1:
        return jsonify({"error": "Quantity must be at least 1"}), 400

    user_id = get_jwt_identity()  # Get the current user's ID from the JWT token

    # Check if the product is in the user's cart
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not cart_item:
        return jsonify({"error": "Product not found in cart"}), 404

    # Update the quantity
    cart_item.quantity = quantity
    db.session.commit()

    return jsonify({"message": "Cart updated", "cart_item": {
        "product_id": cart_item.product_id,
        "quantity": cart_item.quantity
    }})

@cart_bp.route('/cart/remove/<int:product_id>', methods=['DELETE'])
@jwt_required()  # Require authentication to remove from the cart
def remove_from_cart(product_id):
    """Remove a product from the cart."""
    user_id = get_jwt_identity()  # Get the current user's ID from the JWT token

    # Check if the product is in the user's cart
    cart_item = CartItem.query.filter_by(user_id=user_id, product_id=product_id).first()
    if not cart_item:
        return jsonify({"error": "Product not found in cart"}), 404

    # Remove the item from the cart
    db.session.delete(cart_item)
    db.session.commit()

    return jsonify({"message": "Product removed from cart"})

@cart_bp.route('/cart/clear', methods=['DELETE'])
@jwt_required()  # Require authentication to clear the cart
def clear_cart():
    """Clear the entire cart for the current user."""
    user_id = get_jwt_identity()  # Get the current user's ID from the JWT token

    # Delete all cart items for the user
    CartItem.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    return jsonify({"message": "Cart cleared"})