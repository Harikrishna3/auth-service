# Test Suite Documentation

## Overview
This test suite covers the authentication API endpoints and utility functions.

## Test Files

### 1. auth.test.js
Tests all authentication endpoints:
- **POST /api/auth/signup** - User registration
  - Successful registration
  - Duplicate email validation
  - Required field validation
  - Email format validation
  - Password length validation

- **POST /api/auth/signin** - User login
  - Successful login
  - Invalid credentials handling
  - Required field validation

- **GET /api/auth/profile** - Get user profile
  - Successful profile retrieval with valid token
  - Unauthorized access without token
  - Invalid token handling

- **Health Check & 404 Handler**
  - Health endpoint verification
  - Non-existent route handling

### 2. utils.test.js
Tests utility functions:
- **Password Hashing**
  - Hash generation
  - Hash uniqueness
  - Password comparison
  
- **JWT Token**
  - Token generation
  - Token verification
  - Invalid token handling

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Prerequisites
- MongoDB running locally or connection string in .env.test
- All dependencies installed (`npm install`)
- Prisma client generated (`npm run prisma:generate`)

## Test Environment
Tests use a separate test database configured in `.env.test` to avoid affecting development data.
