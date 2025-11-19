# Authentication API

Node.js + Express authentication API with Prisma, MongoDB Atlas, and JWT.

## Project Structure

```
├── prisma/
│   └── schema.prisma          # Prisma schema for MongoDB
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client configuration
│   │   └── jwt.js             # JWT token utilities
│   ├── controllers/
│   │   └── authController.js  # Authentication logic
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication middleware
│   │   └── validate.js        # Request validation middleware
│   ├── routes/
│   │   └── authRoutes.js      # Authentication routes
│   ├── utils/
│   │   ├── hashPassword.js    # Password hashing utilities
│   │   └── response.js        # Response formatting utilities
│   ├── app.js                 # Express app configuration
│   └── server.js              # Server entry point
├── .env.example               # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate Prisma Client:**
   ```bash
   npm run prisma:generate
   ```

3. **Push schema to database:**
   ```bash
   npm run prisma:push
   ```

4. **Start the server:**
   ```bash
   npm run dev
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
4. Get your connection string and update `DATABASE_URL` in `.env`

## Environment Variables

- `DATABASE_URL` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - Token expiration time (e.g., 7d)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
