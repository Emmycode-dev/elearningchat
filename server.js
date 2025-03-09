const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require("uuid");
const { generateMessage, generateLocationMessage } = require('./utils/message');
const { isRealString } = require('./utils/isRealString');
const { Users } = require('./utils/users');
const bodyparser = require("body-parser");
const session = require("express-session");
const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const users = new Users();

const port = process.env.PORT || 3000;

// Session Middleware
app.use(session({
  secret: uuidv4(),
  resave: false,
  saveUninitialized: true
}));

// Body Parser Middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

// Set View Engine
app.set('view engine', 'html');
app.engine('html', require('ejs').renderFile);

// Routes
app.use('/route', router);

// Static Files (Ensure public folder is exposed)
app.use(express.static(path.join(__dirname, 'public')));

// Home Route
app.get('/', (req, res) => {
  res.render('index.html');
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log("A new user just connected");

  socket.on('join', (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback('Name and room are required');
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit('updateUsersList', users.getUserList(params.room));
    socket.emit('newMessage', generateMessage('Admin', `Welcome to ${params.room}!`));
    socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', "New User Joined!"));

    callback();
  });

  socket.on('createMessage', (message, callback) => {
    let user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
    }
    callback('This is the server:');
  });

  socket.on('createLocationMessage', (coords) => {
    let user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.lat, coords.lng));
    }
  });

  socket.on('disconnect', () => {
    let user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('updateUsersList', users.getUserList(user.room));
      io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left ${user.room} chat room.`));
    }
  });
});

module.exports = app; // Export for Vercel
