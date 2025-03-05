from flask import Blueprint, redirect, url_for, jsonify, request, session
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from requests_oauthlib import OAuth2Session
from models import User, db
import os
import cloudinary.uploader

oauth_bp = Blueprint('oauth_bp', __name__, url_prefix='/auth')


GOOGLE_REDIRECT_URI = 'http://localhost:5000/auth/google/callback'
GOOGLE_AUTHORIZATION_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v1/userinfo"

# GitHub OAuth2 configuration

GITHUB_REDIRECT_URI = 'http://localhost:5000/auth/github/callback'
GITHUB_AUTHORIZATION_BASE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USERINFO_URL = "https://api.github.com/user"

# Google OAuth2 Login
@oauth_bp.route('/google/login')
def google_login():
    try:
        # Redirect users to Google's OAuth2 login page
        google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI, scope=["openid", "email", "profile"])
        authorization_url, state = google.authorization_url(GOOGLE_AUTHORIZATION_BASE_URL, access_type="offline", prompt="select_account")
        return redirect(authorization_url)
    except Exception as e:
        return jsonify({"error": "Google login failed", "details": str(e)}), 500

# Google OAuth2 Callback
@oauth_bp.route('/google/callback')
def google_callback():
    try:
        # Handle the callback from Google
        google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI)
        token = google.fetch_token(GOOGLE_TOKEN_URL, client_secret=GOOGLE_CLIENT_SECRET, authorization_response=request.url)

        # Fetch user info
        user_info = google.get(GOOGLE_USERINFO_URL).json()
        email = user_info.get('email')
        name = user_info.get('name')

        # Check if the user already exists in the database
        user = User.query.filter_by(email=email).first()
        if not user:
            # Create a new user
            user = User(username=name, email=email, password="social_login")  # Use a dummy password
            db.session.add(user)
            db.session.commit()

        # Generate a JWT token for the user
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "message": "Google login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        })
    except Exception as e:
        return jsonify({"error": "Google callback failed", "details": str(e)}), 500

# GitHub OAuth2 Login
@oauth_bp.route('/github/login')
def github_login():
    try:
        # Redirect users to GitHub's OAuth2 login page
        github = OAuth2Session(GITHUB_CLIENT_ID, redirect_uri=GITHUB_REDIRECT_URI, scope=["user:email"])
        authorization_url, state = github.authorization_url(GITHUB_AUTHORIZATION_BASE_URL)
        return redirect(authorization_url)
    except Exception as e:
        return jsonify({"error": "GitHub login failed", "details": str(e)}), 500

# GitHub OAuth2 Callback
@oauth_bp.route('/github/callback')
def github_callback():
    try:
        # Handle the callback from GitHub
        github = OAuth2Session(GITHUB_CLIENT_ID, redirect_uri=GITHUB_REDIRECT_URI)
        token = github.fetch_token(GITHUB_TOKEN_URL, client_secret=GITHUB_CLIENT_SECRET, authorization_response=request.url)

        # Fetch user info
        user_info = github.get(GITHUB_USERINFO_URL).json()
        email = user_info.get('email')
        if not email:
            # If email is not public, fetch it from the GitHub API
            emails = github.get("https://api.github.com/user/emails").json()
            email = next((e['email'] for e in emails if e['primary']), None)
        name = user_info.get('name') or user_info.get('login')

        # Check if the user already exists in the database
        user = User.query.filter_by(email=email).first()
        if not user:
            # Create a new user
            user = User(username=name, email=email, password="social_login")  # Use a dummy password
            db.session.add(user)
            db.session.commit()

        # Generate a JWT token for the user
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "message": "GitHub login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        })
    except Exception as e:
        return jsonify({"error": "GitHub callback failed", "details": str(e)}), 500

# File Upload Endpoint
@oauth_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    try:
        # Get the file from the request
        file = request.files['file']
        if not file:
            return jsonify({"error": "No file provided"}), 400

        # Upload the file to Cloudinary
        upload_result = cloudinary.uploader.upload(file)

        # Return the uploaded file's URL
        return jsonify({
            "message": "File uploaded successfully",
            "url": upload_result['secure_url']
        }), 200
    except Exception as e:
        return jsonify({"error": "File upload failed", "details": str(e)}), 500

# Update Profile Picture Endpoint
@oauth_bp.route('/update_profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Get the file from the request
        file = request.files['file']
        if not file:
            return jsonify({"error": "No file provided"}), 400

        # Upload the file to Cloudinary
        upload_result = cloudinary.uploader.upload(file)

        # Update the user's profile picture
        user.profile_image = upload_result['secure_url']
        db.session.commit()

        return jsonify({
            "message": "Profile updated successfully",
            "profile_image": user.profile_image
        }), 200
    except Exception as e:
        return jsonify({"error": "Profile update failed", "details": str(e)}), 500