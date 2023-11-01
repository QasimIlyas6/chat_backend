const express = require("express");
const app = express();
const http = require("http").Server(app);
const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const cors = require("cors");

const PORT = 3000;

app.use(cors());

let users = [];


socketIO.on("connection", (socket) => {
  console.log(`${socket.id} user just connected!`);

  socket.on('login', (username) => {
    console.log("the user name is :", username)
    users.push(socket.id, { username, status: 'online' });

    // Notify all clients about the new user
    socketIO.emit('user-login', { username, socketId: socket.id });
  });

  socket.on('update-status', (status) => {
    console.log("the status is :", status)
    const user = users.find((user) => user.socketId === socket.id);
    if (user) {
      user.status = status;
      socketIO.emit('status-updated', { username: user.username, status });
    }
  });

  socket.on('disconnect', () => {
    const userIndex = users.findIndex((user) => user.socketId === socket.id);
    if (userIndex !== -1) {
      const user = users[userIndex];
      users.splice(userIndex, 1);
      socketIO.emit('user-logout', { username: user.username });
    }
  });


});



app.get("/", (req, res) => {
  res.send("Welcome to the chat app");
});

http.listen(3000, () => {
  console.log(`Server listening on 3000`);
});