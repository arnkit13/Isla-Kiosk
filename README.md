# Isla Kiosk

A complete point-of-sale and ordering kiosk system with a Spring Boot backend and React (Vite) frontend.

## Project Structure

- **`backend/`**: Java Spring Boot REST API for managing orders, order status, and transactions.
- **`frontend/`**: React application built with Vite, Lucide icons, SheetJS (xlsx), and Canvas Confetti for an interactive ordering experience and customer display.

## Getting Started

### Prerequisites

- **Java**: JDK 17 or later
- **Node.js**: v18 or later
- **npm** or **yarn**

### Backend Setup

```bash
cd backend
./mvnw spring-boot:run
```

The backend server runs on `http://localhost:8080`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend development server typically runs on `http://localhost:5173`.
