---
description: How to run the fullstack application
---

This application consists of a FastAPI backend and a React frontend. You will need two terminal windows to run both simultaneously.

## 1. Run the Backend

1.  Open a terminal.
2.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
3.  Activate the virtual environment (if not already active):
    ```bash
    source ../venv/bin/activate
    ```
4.  Run the server using Uvicorn:
    ```bash
    uvicorn app.main:app --reload
    ```
    The backend will start at `http://127.0.0.1:8000`.

## 2. Run the Frontend

1.  Open a **new** terminal window.
2.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
3.  Install dependencies (only if you haven't already):
    ```bash
    npm install
    ```
4.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will typically start at `http://localhost:5173`.

## 3. Access the Application

Open your browser and navigate to the frontend URL (e.g., `http://localhost:5173`).
