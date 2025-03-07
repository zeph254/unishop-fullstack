# 🛍️ unishop-fullstack

UniShop is a modern e-commerce platform that helps users discover and purchase products efficiently. By intelligently identifying search queries and categorizing products dynamically, UniShop enhances the user experience and search precision.


## 🚀 Features

## 🏆 MVP Features

User authentication (Login & Create an Account)

Browse products by categories

Add items to cart and view cart contents

Checkout process for purchasing orders

Simulated payment system (generating address, billing details, and invoices)

## 🛠️ Admin Features

Full CRUD operations on products

User role management for product and order handling

View analytics for product performance and customer orders

## 🔧 Tech Stack

Backend - Flask

Database - PostgreSQL & SQLalqemy

Frontend - React.js & useContext

Authentication - JWT & Social Auth (Google, GitHub)

Storage - Cloudinary (Profile Image Management)

Testing - Pytest (Backend)

CI/CD - GitHub Actions

Deployment - Render & Vercel

## 🎯 Installation & Setup

## 🔽 Prerequisites

Ensure you have the following installed:

Python 3.9+

Node.js 16+

PostgreSQL

Git

## 📌 Backend Setup (Flask API)

# Clone the repository
git clone https://github.com/your-username/unishop.git
cd unishop/backend

# Create and activate a virtual environment
install pipenv
pip install -r requirements.txt

# Set environment variables 
export FLASK_APP=app.py
export FLASK_ENV=development

# Run the database migrations
flask db upgrade

# Start the server
flask run --debug

## 🖥 Frontend Setup (React.js)

cd ../frontend

# Install dependencies
yarn install  Or use `npm install`

# Start the development server
yarn start  Or `npm run dev

## 🛠️ Development Workflow

## 📌 Git Workflow (GitFlow)

UniShop follows the GitFlow workflow for branch management and collaboration:

main – Stable production-ready code

develop – Ongoing development branch

feature/* – Feature development branches

hotfix/* – Urgent bug fixes

release/* – Release preparation branches

🔗 Learn more about GitFlow`

## ✅ Testing
Run backend tests:
pytest

Run frontend tests:
yarn test  Or `npm test`

## 🔒 Authentication

JWT Authentication for securing API endpoints

Social Login (Google, GitHub) for quick access

## 📈 Deployment & CI/CD

## 📌 CI/CD Pipeline

GitHub Actions for automated builds, tests, and deployments.

Docker for containerization.

Deployment options: Render, Vercel

🔗 CI/CD Setup Guide

## 📩 Contact
For any inquiries, reach out to:

Owuor.Z.Ulare
            📧 Email: ularezephaniah@gmail.com - fullstack developer
            📌 GitHub:zeph254 

Bradley Ochieng
            📧 Email: bradleyelvis@gmail.com - backend developer
            📌 GitHub: bradelvis

Samuel Gitau
            📧 Email: andygitau444@gmail.com - frontend developer
            📌 GitHub: Andysam254          
## backend deployed link
(https://unishop-fullstack-1.onrender.com)

## frontend deployed link
(https://run-sigma.vercel.app/)

