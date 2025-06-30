# TeleClinix(Health Management Solution) - Backend API

TeleClinix is a tele-medicine solution, which connects patients and healthcare professionals for virtual consultations. This repository contains the backend API built using **FastAPI** and **Python**. It is a Restful API which allows CRUD operations for both Patients and Doctors, with proper roles and authentication for secure access.

## Table of Contents

- [Features](#features)
- [Installation & Setup](#installation)
- [Environment Configuration](#environment-configuration)
- [API Testing](#apitesting)
- [Endpoints Overview](#endpointsoverview)

---

## Features

- 🔐 User Authentication & Authorization using JWT

- 💬 Chat: Patients and Doctors can securely chat

- 📅 Appointments: Schedule and manage appointments

- 👥 Role-Based Access: Secure endpoints based on user roles(Patients or Doctors)

- 📫 Fully tested using Postman & Swagger Documentation

---

## ⚙️ Installation & Setup

### Pre-requisites

Ensure the following dependencies are installed:

- Python 3.8+ (for FastAPI)
- PostgreSQL (or any preferred database)
- pip (Python package manager)


1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/TeleClinix-backend.git
   cd TeleClinix-backend
   ```
2. Set up a Python Virtual Environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required Python Dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up the environment variables by creating a .env file (use the .env.sample file as a reference):

   ```bash
   cp .env.sample .env
   Update the .env file with your database credentials, secret keys, and other configurations.
   ```

5. Run the Server:
   ```bash
   uvicorn main.py --reload
   ```
---

## 📁 Environment Configuration

Create a .env file in the root directory and add the following:

```ini
GOOGLE_CLIENT_ID=your_google_client_id
DATABASE_URL=your_database_url
ACCESS_TOKEN_SECRET=your_secret_key
```

🔒 **Note: .env and python_virtual_env files are excluded from the GitHub repository via .gitignore**

---

## 🧪 API Testing

All endpoints were tested using Postman or Swagger Documentation by navigating to /docs. After starting the server with ***uvicorn main.py --reload***, you can make requests to:

```bash
http://localhost:8000/api/...
```
## 🚧 Endpoints Overview

| Feature      | Endpoints                                           |
| ------------ | --------------------------------------------------- |
| JWT Auth     | `/api/login/`, `/api/register/`, `/api/logout/` |
| Google Auth  | `/api/auth/google`, `/api/auth/google/callback`|
| Chat         | `/api/chat`                                       |
| Doctors      | `/api/doctors/`, `/api/doctors/{id}`    |
| Patients     | `/api/patients/`, `/api/patients/{id}`    |

---

## 📌 Notes

- Make sure PostgreSQL is running or hosted if using SQL or MongoDB Atlas, if using NoSQL.

- Tokens must be sent via headers for authenticated routes:

```http
Authorization: Bearer <token>
```
---
