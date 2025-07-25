# React MySQL Application

This project is a full-stack web application built with React and MySQL. It demonstrates how to connect a React frontend to a MySQL database using a Node.js/Express backend.

## Project Structure

- `/src` - React frontend application
- `/server` - Node.js/Express backend

## Features

- Product management (CRUD operations)
- Dashboard with database statistics
- Responsive design
- Error handling and form validation
- Real-time database connection status

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- MySQL Server

### Database Setup

1. Create a MySQL database named `product_db`
2. Update the database connection details in the `.env` file

```
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=product_db
```

### Installation

1. Install dependencies:

```
npm install
```

2. Start the backend server:

```
npm run server
```

3. In a new terminal, start the frontend development server:

```
npm run dev
```

4. To run both frontend and backend concurrently:

```
npm run dev:full
```

## API Endpoints

- `GET /api/health` - Check database connection
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a product by ID
- `POST /api/products` - Create a new product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Technologies Used

- **Frontend:**
  - React
  - React Router
  - Tailwind CSS
  - Axios
  - React Hot Toast

- **Backend:**
  - Node.js
  - Express
  - MySQL2
  - CORS
  - Dotenv