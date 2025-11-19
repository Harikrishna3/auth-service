# Authentication API - Go

Go authentication API with Fiber, MongoDB, and JWT.

## Project Structure

```
├── config/
│   ├── database.go        # MongoDB connection
│   └── env.go             # Environment configuration
├── controllers/
│   └── auth_controller.go # Authentication logic
├── middleware/
│   ├── auth.go            # JWT authentication middleware
│   └── validate.go        # Request validation middleware
├── models/
│   └── user.go            # User model
├── routes/
│   └── auth_routes.go     # Authentication routes
├── utils/
│   ├── hash.go            # Password hashing utilities
│   ├── jwt.go             # JWT token utilities
│   └── response.go        # Response formatting utilities
├── .env.example           # Environment variables template
├── .gitignore
├── go.mod
├── go.sum
├── main.go                # Application entry point
└── README.md
```

## Setup Instructions

1. **Install Go** (version 1.21 or higher)
   Download from: https://golang.org/dl/

2. **Install dependencies:**
   ```bash
   go mod download
   ```

3. **Configure environment variables:**
   ```bash
   copy .env.example .env
   ```
   
   Update `.env` with your MongoDB Atlas connection string and JWT secret.

4. **Run the server:**
   ```bash
   go run main.go
   ```

5. **Build for production:**
   ```bash
   go build -o auth-service.exe
   ./auth-service.exe
   ```

## API Endpoints

### Authentication

- **POST** `/api/auth/signup` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }
  ```

- **POST** `/api/auth/signin` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

- **GET** `/api/auth/profile` - Get user profile (Protected)
  - Headers: `Authorization: Bearer <token>`

### Health Check

- **GET** `/health` - Check server status

## MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address
4. Get your connection string and update `MONGODB_URI` in `.env`

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - Token expiration time in hours (e.g., 168 for 7 days)
- `PORT` - Server port (default: 3000)
- `ENV` - Environment (development/production)
