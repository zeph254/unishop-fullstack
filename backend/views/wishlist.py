from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from models import Wishlist, Product

wishlist_bp = Blueprint("wishlist", __name__)

@wishlist_bp.route("/wishlist", methods=["GET", "POST"])
@jwt_required()
def wishlist():
    user_id = get_jwt_identity()
    if request.method == "GET":
        # Fetch wishlist items for the user along with product details
        wishlist = Wishlist.query.filter_by(user_id=user_id).all()
        wishlist_items = []
        for item in wishlist:
            product = Product.query.get(item.product_id)
            if product:
                wishlist_items.append({
                    "id": item.id,
                    "product_id": item.product_id,
                    "product": {
                        "image_url": product.image_url,
                        "name": product.name,
                        "price": product.price
                    }
                })
        return jsonify(wishlist_items)
    elif request.method == "POST":
        # Add an item to the wishlist
        data = request.json
        product_id = data.get("product_id")
        if not product_id:
            return jsonify({"error": "Product ID is required"}), 400

        existing_item = Wishlist.query.filter_by(user_id=user_id, product_id=product_id).first()
        if existing_item:
            return jsonify({"message": "Product already in wishlist"}), 400

        new_wishlist_item = Wishlist(user_id=user_id, product_id=product_id)
        db.session.add(new_wishlist_item)
        db.session.commit()
        return jsonify({"message": "Added to wishlist"}), 201
@wishlist_bp.route("/wishlist/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_wishlist_item(id):
    user_id = get_jwt_identity()
    wishlist_item = Wishlist.query.filter_by(id=id, user_id=user_id).first()

    if not wishlist_item:
        return jsonify({"error": "Wishlist item not found"}), 404

    db.session.delete(wishlist_item)
    db.session.commit()
    return jsonify({"message": "Wishlist item removed"}), 200