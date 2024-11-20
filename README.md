# TeleClinix - Backend API

TeleClinix is a telemedicine application that connects patients and healthcare professionals for virtual consultations. This repository contains the backend services built using **FastAPI** and **Node.js**.

## Table of Contents

- [Installation](#installation)
- [Setup](#setup)
- [Running the Project](#running-the-project)
- [Endpoints](#endpoints)
- [Testing](#testing)


## Installation

### Prerequisites

Ensure the following dependencies are installed:

- Python 3.8+ (for FastAPI)
- Node.js 14+ (for backend services built with Node.js)
- PostgreSQL (or any preferred database)
- pip (Python package manager)
- npm (Node.js package manager)

### 1. FastAPI Backend Setup

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
4. Set up the environment variables by creating a .env file (use the .env.sample file as a reference):
   ```bash
   cp .env.sample .env
Update the .env file with your database credentials, secret keys, and other configurations.
