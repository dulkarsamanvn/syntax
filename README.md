Syntax — Coding Challenge Platform

Syntax is a full-stack web application for coding challenges, learning, and collaboration. It allows users to solve coding problems, track progress, and upgrade to premium plans for exclusive features.

Features

User Features

Sign Up / Login: Email verification with OTP and Google OAuth2 login.

Challenge Platform: Solve coding challenges, submit solutions, and view others’ solutions.

Premium Subscription: Upgrade to premium for exclusive content.

Profile Management: View progress, solutions, and subscription details.

Real-time Chat: One-to-one and group chats including sending media (images, files), and emoji reactions.

Password Reset: Secure OTP-based password reset functionality.

Admin Features

User Management: View, search, and block/unblock users.

Challenge Management: Create, update, and manage coding challenges.

Premium Plans: Create, update, or deactivate subscription plans.

Analytics Dashboard: Track users, challenges, revenue, and more.

Chat Management: Monitor group chats and manage membership if needed.

Tech Stack

Frontend: React, Tailwind CSS, Vite

Backend: Django, Django REST Framework

Authentication: JWT, Google OAuth2

Database: PostgreSQL

Payments: Razorpay

Deployment: Vercel (frontend), AWS EC2 (backend)

Real-time features: Django Channels, WebSockets

Installation

Backend

Clone the repository:

git clone https://github.com/dulkarsamanvn/syntax.git
cd syntax/backend


Create a virtual environment:

python -m venv env
source env/bin/activate  # Linux/Mac
env\Scripts\activate     # Windows


Install dependencies:

pip install -r requirements.txt


Apply migrations:

python manage.py migrate


Run the server:

python manage.py runserver

Frontend

Navigate to frontend folder:

cd syntax/frontend/syntax


Install dependencies:

npm install


Start the development server:

npm run dev

Environment Variables

Create a .env file in both backend and frontend as needed.

Backend

SECRET_KEY = ------your secret key

EMAIL_BACKEND = ------email backend
EMAIL_HOST = ------email host
EMAIL_PORT = ------email port
EMAIL_USE_TLS = True
EMAIL_HOST_USER = ------host user
EMAIL_HOST_PASSWORD = ------host pass  

GOOGLE_CLIENT_ID =------google cliend id

CLOUDINARY_CLOUD_NAME=------cloud name
CLOUDINARY_API_KEY=-------cloudinary key
CLOUDINARY_API_SECRET=-----cloudinary secret

RAZORPAY_KEY_ID=------key id
RAZORPAY_KEY_SECRET=------ key secret
POSTGRES_DB=------database name
POSTGRES_USER=------- database user
POSTGRES_PASSWORD=------ database password
POSTGRES_HOST= ----- database host
POSTGRES_PORT=5432
DEBUG=True

Frontend

VITE_API_BASE_URL=https://your-backend-url.com


To run the backend with Docker:

docker-compose build
docker-compose up