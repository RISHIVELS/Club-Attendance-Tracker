# Club Attendance System

This is a full-stack web application designed to manage club attendance efficiently. The system allows for the creation of events, registration of coordinators and teams, and tracking of attendance through QR code scanning.

## Features

- **Event Management:** Create, view, and manage events.
- **User Authentication:** Secure registration and login for coordinators.
- **Team Registration:** Register teams for specific events.
- **QR Code Attendance:** Generate and scan QR codes for marking attendance.
- **Real-time Analytics:** View attendance analytics for each event.

## Tech Stack

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Vite:** A fast build tool for modern web development.
- **Redux Toolkit:** For efficient state management.
- **React Router:** For declarative routing in React.
- **Axios:** A promise-based HTTP client for the browser and Node.js.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **DaisyUI:** A component library for Tailwind CSS.
- **Recharts:** A composable charting library built on React components.
- **qr-code:** A library for QR code scanning.

### Backend

- **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
- **MongoDB:** A cross-platform document-oriented database program.
- **Mongoose:** An elegant MongoDB object modeling tool for Node.js.
- **JWT (JSON Web Tokens):** For secure authentication.
- **Bcrypt.js:** A library for hashing passwords.
- **CORS:** A package for providing a Connect/Express middleware that can be used to enable CORS with various options.
- **Morgan:** An HTTP request logger middleware for Node.js.

## Project Structure

```
ClubAttendanceSystem/
├── backend/
│   ├── app.js
│   ├── controllers/
│   ├── db/
│   ├── model/
│   ├── routes/
│   └── ...
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── feature/
    │   ├── pages/
    │   └── ...
    └── ...
```

## Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    MONGO_URI=<YOUR_MONGODB_CONNECTION_STRING>
    JWT_SECRET=<YOUR_JWT_SECRET>
    ```
4.  Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```

## API Endpoints

### Authentication

- `POST /api/v1/coordinators/register`: Register a new coordinator.
- `POST /api/v1/coordinators/login`: Login a coordinator.
- `GET /api/v1/coordinators/logout`: Logout a coordinator.

### Events

- `POST /api/v1/events`: Create a new event.
- `GET /api/v1/events`: Get all events.
- `GET /api/v1/events/:id`: Get a single event by ID.

### Teams

- `POST /api/v1/teams/event/:eventId`: Register a new team for an event.
- `GET /api/v1/teams`: Get all teams.
- `GET /api/v1/teams/:id`: Get a single team by ID.

### Attendance

- `POST /api/v1/attendance/scan/:currentEventId`: Mark attendance by scanning a QR code.

### Analytics

- `GET /api/v1/analytics/:eventId`: Get attendance analytics for an event.
