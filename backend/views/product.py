from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Product, db, User
from models import OrderItem
from sqlalchemy import func, desc

product_bp = Blueprint('product_bp', __name__, url_prefix='/products')

@product_bp.route('/most-sold', methods=['GET'])
def get_most_sold_products():
    most_sold = (
        db.session.query(
            Product.id,
            Product.name,
            Product.price,
            Product.image_url,
            func.sum(OrderItem.quantity).label('total_sold')
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.id, Product.name, Product.price, Product.image_url)
        .order_by(desc('total_sold'))
        .limit(6)  # Fetch top 6 most sold products
        .all()
    )

    result = [
        {
            "id": product_id,
            "name": name,
            "price": price,
            "image_url": image_url,
            "total_sold": total_sold,
        }
        for product_id, name, price, image_url, total_sold in most_sold
    ]

    return jsonify(result), 200

# Create a new product (Admin Only)
@product_bp.route('/', methods=['POST'])
@jwt_required()
def create_product():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.role != 'admin':
            return jsonify({"error": "Unauthorized access"}), 403

        data = request.get_json()
        print("Received Data:", data)  # Log request payload

        required_fields = ["name", "price", "category"]
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"Missing required field: {field}"}), 400

        new_product = Product(
            name=data["name"],
            description=data.get("description"),
            price=float(data["price"]),
            stock=int(data.get("stock", 0)),  # Ensure valid int
            category=data["category"],
            image_url=data.get("image_url")
        )

        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product created successfully", "product_id": new_product.id}), 201

    except Exception as e:
        db.session.rollback()
        print("Product Creation Error:", str(e))  # Log error
        return jsonify({"error": str(e)}), 500
# Get all products (Public Access)
@product_bp.route('/', methods=['GET'])
def get_products():
    products = Product.query.all()
    product_list = [{
        "id": p.id,
        "name": p.name,
        "description": p.description,
        "price": p.price,
        "stock": p.stock,
        "category": p.category,
        "image_url": p.image_url,
        "created_at": p.created_at
    } for p in products]
    return jsonify(product_list), 200

# Get a single product (Public Access)
@product_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify({
        "id": product.id,
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "stock": product.stock,
        "category": product.category,
        "image_url": product.image_url,
        "created_at": product.created_at
    }), 200

# Update a product (Admin Only)
@product_bp.route('/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product(product_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user or current_user.role != 'admin':
            return jsonify({"error": "Unauthorized access"}), 403

        product = Product.query.get(product_id)
        if not product:
            return jsonify({"error": "Product not found"}), 404

        data = request.get_json()
        print("Received Data:", data)  # Log request payload

        if "name" in data:
            product.name = data["name"]
        if "description" in data:
            product.description = data["description"]
        if "price" in data:
            product.price = float(data["price"])  # Ensure price is a float
        if "stock" in data:
            product.stock = int(data["stock"])  # Ensure stock is an integer
        if "category" in data:
            product.category = data["category"]
        if "image_url" in data:
            product.image_url = data["image_url"]

        db.session.commit()
        return jsonify({"message": "Product updated successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("Product Update Error:", str(e))  # Log error
        return jsonify({"error": str(e)}), 500

# Delete a product (Admin Only)
@product_bp.route('/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product(product_id):
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)

    # Only admins can delete products
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    product = Product.query.get(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Delete associated order_items
    OrderItem.query.filter_by(product_id=product_id).delete()

    # Delete the product
    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted successfully"}), 200