# CUSTOMER - Full-Stack Application

Full-stack application with complete authentication built with **Django REST Framework** and **React (Vite)**.

## Features

1. **Authentication**
   - **Login with Google** (via Google Identity Services & OAuth 2.0)
   - **Sign up with Google**
   - **Email and Password Login**
   - **Forgot Password** (6-digit recovery code sent via email)
   - **Email Verification** (6-digit OTP verification upon registration)
   - **Logout** (Client cleanup + JWT token blacklisting on the server)
   - **Customer Dashboard** (Displays verified customer details, auth method, JWT status)

## Credentials & Environment Configuration

### Backend (`backend/.env`)
```env
DEBUG=True
SECRET_KEY=your-django-secret-key-here
APP_NAME=ZELORA
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:5173
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
DEFAULT_FROM_EMAIL=your_email@gmail.com
```

> [!NOTE]
> Ensure valid Google OAuth and SMTP credentials are provided in `backend/.env` for live authentication.

## Running the Project

### 1. Start the Backend Server (Django)
```powershell
cd backend\zelora
..\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

### 2. Start the Frontend Dev Server (React + Vite)
```powershell
cd frontend-zelora
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Google Cloud Console Configuration

Ensure `http://localhost:5173` and `http://127.0.0.1:5173` are added under:
- **Authorized JavaScript origins** in your Google Cloud Console OAuth 2.0 Client credentials:
  - `Client ID: your-google-client-id.apps.googleusercontent.com`
