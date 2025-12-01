# Chat System with JWT Authentication

## Setup

1. Generate Prisma clients for both schemas:
```bash
npm run prisma:generate
```

2. Push schemas to database:
```bash
npm run prisma:push
```

3. Start the server:
```bash
npm run dev
```

### Individual Schema Commands
```bash
# Generate only user schema
npm run prisma:generate:user

# Generate only message schema
npm run prisma:generate:message

# Push only user schema
npm run prisma:push:user

# Push only message schema
npm run prisma:push:message
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register new user
  - Required: `{ name, email, password }`
  - Password must be at least 6 characters
- `POST /api/auth/signin` - Login existing user
  - Required: `{ email, password }`
- `GET /api/auth/profile` - Get user profile (requires JWT token)

## How It Works

### Authentication
- Socket.io connections require a valid JWT token
- Token is passed via `auth.token` during connection
- Middleware validates the token and attaches user info to the socket

### Features
- **JWT Authentication**: Only authenticated users can connect
- **Message Storage**: All messages are saved to MongoDB
- **Room-based Chat**: Users can join different chat rooms
- **Message History**: Retrieve previous messages from a room

## Socket Events

### Client → Server

**Connect with JWT:**
```javascript
const socket = io('http://localhost:3000', {
  auth: { token: 'your-jwt-token' }
});
```

**Join a room:**
```javascript
socket.emit('joinRoom', 'room1');
```

**Send a message:**
```javascript
socket.emit('sendMessage', {
  roomId: 'room1',
  message: 'Hello everyone!'
});
```

**Get message history:**
```javascript
socket.emit('getMessages', {
  roomId: 'room1',
  limit: 50,
  skip: 0
});
```

### Server → Client

**New message received:**
```javascript
socket.on('newMessage', (data) => {
  console.log(data);
  // {
  //   id: '...',
  //   roomId: 'room1',
  //   message: 'Hello!',
  //   senderId: '...',
  //   sender: { id, email, firstName, lastName, profilePic },
  //   createdAt: '2024-...'
  // }
});
```

**Message history:**
```javascript
socket.on('messageHistory', (messages) => {
  console.log(messages); // Array of message objects
});
```

**Error:**
```javascript
socket.on('error', (error) => {
  console.error(error.message);
});
```

## Testing

1. First, register/login to get a JWT token:
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

2. Open the chat client at: `http://localhost:3000/chat-client.html`

3. Paste your JWT token and click "Connect"

4. Enter a room ID and click "Join Room"

5. Start chatting!

## Database Schema

The project uses two separate Prisma schemas:

**prisma/user.schema.prisma** - User authentication and profile data
**prisma/message.schema.prisma** - Chat messages

```prisma
// message.schema.prisma
model Message {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  roomId    String
  senderId  String   @db.ObjectId
  message   String
  createdAt DateTime @default(now())
}
```

Messages reference users by `senderId` but are stored in a separate schema for better separation of concerns.
