# System Architecture - JWT Authenticated Real-Time Chat

## Overview
This is a real-time chat application built with Node.js, Express, Socket.IO, Prisma, and MongoDB. It features JWT-based authentication and supports multiple users chatting in different rooms.

---

## 🏗️ Architecture Components

### 1. **Database Layer (MongoDB + Prisma)**

#### Two Separate Schemas:

**prisma/user.schema.prisma** - User authentication and profiles
```prisma
- Users (email, password, name, mobileNo, etc.)
- DeviceTokens (for push notifications)
- Seller (for e-commerce features)
```

**prisma/message.schema.prisma** - Chat messages
```prisma
- Messages (roomId, senderId, message, createdAt)
```

#### Why Separate Schemas?
- **Separation of Concerns**: User data and chat data are independent
- **Scalability**: Can scale databases independently
- **Different Prisma Clients**: Each schema generates its own client
  - `@prisma/client-user` for user operations
  - `@prisma/client-message` for message operations

#### Database Configuration:
- `src/config/database.js` - User database client
- `src/config/messageDatabase.js` - Message database client

---

### 2. **Authentication System**

#### Flow:
```
User → POST /api/auth/signin → Validate credentials → Generate JWT → Return token
```

#### Components:

**Routes** (`src/routes/authRoutes.js`):
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login existing user
- `GET /api/auth/profile` - Get user profile (protected)

**Controller** (`src/controllers/authController.js`):
- Handles business logic for auth operations
- Uses bcrypt to hash/compare passwords
- Generates JWT tokens on successful login

**Middleware** (`src/middleware/validate.js`):
- Validates request data using express-validator
- Ensures email format, password length, required fields

**JWT Utilities** (`src/config/jwt.js`):
- `generateToken(userId)` - Creates JWT with user ID
- `verifyToken(token)` - Validates and decodes JWT

#### JWT Token Structure:
```javascript
{
  id: "user_id_here",
  iat: 1234567890,  // issued at
  exp: 1234567890   // expires in 7 days
}
```

---

### 3. **Real-Time Chat System (Socket.IO)**

#### Architecture:

```
Client (Browser) ←→ Socket.IO ←→ Server ←→ MongoDB
                      ↓
                JWT Middleware
```

#### Socket.IO Setup (`src/app.js`):
```javascript
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});
```

#### Socket Authentication Middleware (`src/middleware/socketAuth.js`):

**How it works:**
1. Client connects with JWT token in handshake
2. Middleware intercepts connection
3. Verifies JWT token
4. Fetches user from database
5. Attaches user info to socket object
6. Allows or rejects connection

```javascript
socket.userId = user.id;
socket.user = user;
```

#### Socket Events (`src/server.js`):

**Server Events:**

1. **connection** - When user connects
   - Logs user connection
   - Socket is authenticated at this point

2. **joinRoom** - User joins a chat room
   ```javascript
   socket.on("joinRoom", (roomId) => {
     socket.join(roomId);  // Socket.IO room feature
   });
   ```

3. **sendMessage** - User sends a message
   ```javascript
   socket.on("sendMessage", async ({ roomId, message }) => {
     // 1. Save to MongoDB
     const savedMessage = await prismaMessage.message.create({...});
     
     // 2. Fetch sender info from user database
     const sender = await prisma.user.findUnique({...});
     
     // 3. Broadcast to all users in room
     io.to(roomId).emit("newMessage", payload);
   });
   ```

4. **getMessages** - Fetch message history
   ```javascript
   socket.on("getMessages", async ({ roomId, limit, skip }) => {
     // 1. Fetch messages from MongoDB
     const messages = await prismaMessage.message.findMany({...});
     
     // 2. Fetch sender info for each message
     const messagesWithSender = await Promise.all(...);
     
     // 3. Send to requesting user only
     socket.emit("messageHistory", messagesWithSender);
   });
   ```

5. **disconnect** - User disconnects
   - Logs disconnection
   - Socket.IO automatically removes from rooms

---

### 4. **Client-Side (Frontend)**

#### HTML Structure (`src/index.html`):

**Three Main Sections:**
1. **Authentication Section**
   - Email/Password inputs
   - Login/Logout buttons
   - Status display

2. **Room Section**
   - Room ID input
   - Join Room button
   - Load History button

3. **Chat Section**
   - Messages display area
   - Message input
   - Send button

#### Client-Side Flow:

**1. Login Process:**
```javascript
// 1. User enters credentials
// 2. POST request to /api/auth/signin
const response = await fetch('/api/auth/signin', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

// 3. Receive JWT token
const { token, user } = response.data;

// 4. Connect to Socket.IO with token
socket = io('http://localhost:3000', {
  auth: { token }
});
```

**2. Socket Connection:**
```javascript
socket.on('connect', () => {
  // Successfully connected and authenticated
});

socket.on('connect_error', (error) => {
  // Authentication failed
});
```

**3. Joining a Room:**
```javascript
// Client emits
socket.emit('joinRoom', 'room1');

// Server adds socket to room
socket.join('room1');
```

**4. Sending Messages:**
```javascript
// Client emits
socket.emit('sendMessage', {
  roomId: 'room1',
  message: 'Hello!'
});

// Server saves to DB and broadcasts
io.to('room1').emit('newMessage', {
  id: 'msg_id',
  message: 'Hello!',
  sender: { name: 'User' },
  createdAt: '2024-...'
});

// All clients in room receive
socket.on('newMessage', (data) => {
  // Display message in UI
});
```

**5. Logout:**
```javascript
// Disconnect socket
socket.disconnect();

// Clear token and reset UI
token = null;
```

---

## 🔄 Complete Message Flow

### Scenario: User A sends message to Room 1

```
1. User A types message and clicks Send
   ↓
2. Client emits: socket.emit('sendMessage', { roomId: 'room1', message: 'Hi' })
   ↓
3. Server receives event (socket.on('sendMessage'))
   ↓
4. Server saves to MongoDB:
   prismaMessage.message.create({
     roomId: 'room1',
     senderId: socket.userId,  // From JWT auth
     message: 'Hi'
   })
   ↓
5. Server fetches sender info:
   prisma.user.findUnique({ where: { id: socket.userId } })
   ↓
6. Server broadcasts to all users in room:
   io.to('room1').emit('newMessage', {
     id: 'msg_123',
     message: 'Hi',
     sender: { name: 'User A', email: '...' },
     createdAt: '2024-12-01...'
   })
   ↓
7. All clients in Room 1 receive the message
   ↓
8. Each client displays message in their UI
   - User A's message appears on right (own message)
   - Other users see it on left (other's message)
```

---

## 🔐 Security Features

### 1. **JWT Authentication**
- Tokens expire after 7 days
- Stored in client memory (not localStorage for security)
- Required for all socket connections

### 2. **Password Security**
- Passwords hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Never sent in responses

### 3. **Socket Authentication**
- Every socket connection must provide valid JWT
- Middleware validates before allowing connection
- Invalid tokens are rejected immediately

### 4. **Input Validation**
- Email format validation
- Password minimum length (6 characters)
- Required field checks
- Express-validator middleware

---

## 📁 Project Structure

```
auth-service/
├── prisma/
│   ├── user.schema.prisma          # User database schema
│   └── message.schema.prisma       # Message database schema
│
├── src/
│   ├── config/
│   │   ├── database.js             # User Prisma client
│   │   ├── messageDatabase.js      # Message Prisma client
│   │   └── jwt.js                  # JWT utilities
│   │
│   ├── controllers/
│   │   └── authController.js       # Auth business logic
│   │
│   ├── middleware/
│   │   ├── auth.js                 # HTTP JWT middleware
│   │   ├── socketAuth.js           # Socket.IO JWT middleware
│   │   └── validate.js             # Request validation
│   │
│   ├── routes/
│   │   └── authRoutes.js           # Auth API routes
│   │
│   ├── utils/
│   │   ├── hashPassword.js         # Bcrypt utilities
│   │   ├── jwt.js                  # JWT utilities
│   │   └── response.js             # Response formatters
│   │
│   ├── app.js                      # Express + Socket.IO setup
│   ├── server.js                   # Server startup + Socket events
│   └── index.html                  # Chat client UI
│
├── scripts/
│   ├── createDummyUser.js          # Create test user 1
│   └── createSecondUser.js         # Create test user 2
│
└── package.json                    # Dependencies & scripts
```

---

## 🚀 How to Use

### 1. **Setup**
```bash
# Install dependencies
npm install

# Generate Prisma clients
npm run prisma:generate

# Push schemas to MongoDB
npm run prisma:push

# Create test users
npm run seed:user
npm run seed:user2
```

### 2. **Start Server**
```bash
npm run dev
```

### 3. **Test Chat**
1. Open `http://localhost:3000/index.html` in two browser windows
2. Window 1: Login as `test@example.com` / `password123`
3. Window 2: Login as `user2@example.com` / `password123`
4. Both join room "room1"
5. Start chatting!

---

## 🔧 Key Technologies

### Backend:
- **Node.js** - Runtime environment
- **Express** - HTTP server framework
- **Socket.IO** - Real-time bidirectional communication
- **Prisma** - Database ORM
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing

### Frontend:
- **Vanilla JavaScript** - No framework needed
- **Socket.IO Client** - Real-time connection
- **Fetch API** - HTTP requests
- **CSS** - Styling

---

## 💡 Key Concepts

### 1. **Socket.IO Rooms**
- Virtual channels for grouping connections
- Users can join multiple rooms
- Messages sent to room reach all members
- Automatic cleanup when user disconnects

### 2. **JWT in Socket.IO**
- Token passed during handshake: `auth: { token }`
- Middleware validates before connection established
- User info attached to socket object
- Available in all event handlers

### 3. **Separate Prisma Clients**
- Each schema generates independent client
- Different output directories
- Import from different paths
- Can connect to different databases if needed

### 4. **Real-Time Broadcasting**
```javascript
// To specific room
io.to('room1').emit('event', data);

// To specific socket
socket.emit('event', data);

// To all except sender
socket.broadcast.emit('event', data);

// To all
io.emit('event', data);
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read properties of undefined (reading 'findUnique')"
**Cause**: Prisma client not generated
**Solution**: Run `npm run prisma:generate`

### Issue: "Unique constraint failed on cartId"
**Cause**: Multiple null values in unique field (MongoDB limitation)
**Solution**: Remove `@unique` from optional fields

### Issue: Socket connection fails
**Cause**: Invalid or missing JWT token
**Solution**: Check token is passed in `auth: { token }` during connection

### Issue: Messages not appearing
**Cause**: Users not in same room
**Solution**: Ensure both users emit `joinRoom` with same roomId

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (Client)   │
└──────┬──────┘
       │ 1. Login (HTTP POST)
       ↓
┌─────────────────────┐
│  Express Server     │
│  /api/auth/signin   │
└──────┬──────────────┘
       │ 2. Validate & Generate JWT
       ↓
┌─────────────────────┐
│  MongoDB (Users)    │
└──────┬──────────────┘
       │ 3. Return JWT Token
       ↓
┌─────────────┐
│   Browser   │
│ (Has Token) │
└──────┬──────┘
       │ 4. Connect Socket.IO with JWT
       ↓
┌─────────────────────┐
│  Socket.IO Server   │
│  (Auth Middleware)  │
└──────┬──────────────┘
       │ 5. Validate JWT & Attach User
       ↓
┌─────────────────────┐
│  Connected Socket   │
│  (Authenticated)    │
└──────┬──────────────┘
       │ 6. Join Room
       │ 7. Send Message
       ↓
┌─────────────────────┐
│ MongoDB (Messages)  │
└──────┬──────────────┘
       │ 8. Broadcast to Room
       ↓
┌─────────────────────┐
│  All Users in Room  │
│  (Receive Message)  │
└─────────────────────┘
```

---

## 🎯 Summary

This system demonstrates:
1. **JWT Authentication** - Secure token-based auth
2. **Real-Time Communication** - Socket.IO for instant messaging
3. **Database Separation** - Multiple Prisma schemas
4. **Room-Based Chat** - Users can join different conversations
5. **Message Persistence** - All messages saved to MongoDB
6. **Scalable Architecture** - Clean separation of concerns

The key innovation is combining HTTP-based authentication (JWT) with WebSocket-based real-time communication (Socket.IO), allowing secure, persistent, real-time chat functionality.
