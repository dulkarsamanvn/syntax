# Syntax — Coding Challenge Platform

Syntax is a full-stack web application designed for coding challenges, learning, and collaboration. It provides users with an interactive platform to solve coding problems, track their progress, and upgrade to premium plans for exclusive features.

## 🚀 Features

### User Features
- **Authentication**: Email verification with OTP and Google OAuth2 login
- **Challenge Platform**: Solve coding challenges, submit solutions, and view community solutions
- **Premium Subscription**: Access exclusive content with premium plans
- **Profile Management**: Track progress, view solutions, and manage subscription details
- **Real-time Chat**: One-to-one and group chats with media sharing (images, files) and emoji reactions
- **Password Reset**: Secure OTP-based password recovery

### Admin Features
- **User Management**: View, search, and manage user accounts (block/unblock functionality)
- **Challenge Management**: Create, update, and manage coding challenges
- **Premium Plans**: Create, update, or deactivate subscription plans
- **Analytics Dashboard**: Comprehensive tracking of users, challenges, revenue, and platform metrics
- **Chat Management**: Monitor group chats and manage membership

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React, Tailwind CSS, Vite |
| **Backend** | Django, Django REST Framework |
| **Authentication** | JWT, Google OAuth2 |
| **Database** | PostgreSQL |
| **Payments** | Razorpay |
| **Deployment** | Vercel (Frontend), AWS EC2 (Backend) |
| **Real-time** | Django Channels, WebSockets |

## 📦 Installation

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/dulkarsamanvn/syntax.git
   cd syntax/backend
   ```

2. **Create and activate virtual environment**
   ```bash
   # Linux/Mac
   python -m venv env
   source env/bin/activate
   
   # Windows
   python -m venv env
   env\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply database migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd syntax/frontend/syntax
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

## ⚙️ Environment Variables

### Backend (.env)
```env
# Django Settings
SECRET_KEY=your-secret-key
DEBUG=True

# Email Configuration
EMAIL_BACKEND=your-email-backend
EMAIL_HOST=your-email-host
EMAIL_PORT=your-email-port
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-host-user
EMAIL_HOST_PASSWORD=your-host-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# Razorpay
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Database
POSTGRES_DB=your-database-name
POSTGRES_USER=your-database-user
POSTGRES_PASSWORD=your-database-password
POSTGRES_HOST=your-database-host
POSTGRES_PORT=5432
```

### Frontend (.env)
```env
VITE_API_BASE_URL=https://your-backend-url.com
```

## 🐳 Docker Setup

To run the backend with Docker:

```bash
docker-compose build
docker-compose up
```

## 📁 Project Structure

```
syntax/
├── backend/
│   ├── syntax/
│       ├── manage.py
│       ├── requirements.txt
│       ├── docker-compose.yml
│       └── ...
├── frontend/
│   ├── syntax/
│       ├── package.json
│       ├── vite.config.js
│       └── ...
└── README.md
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Dulkar Saman**
- GitHub: [@dulkarsamanvn](https://github.com/dulkarsamanvn)

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub or contact the development team.