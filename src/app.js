const express = require('express');
const http = require("http");
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: "*", // in production: ["https://your-web-app.com"]
    methods: ["GET", "POST"],
  },
});

app.use('/api/auth', authRoutes);


app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.get("/",(req, res)=>{
    res.json({status: "Ok", message: "Helloooo What's UP"})
})


app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = { app: server, io };
