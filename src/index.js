const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");
const path = require("path");
const GameController = require("./controllers/GameController");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const gameController = new GameController(io);

app.get("/test", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/test.html"));
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("join", (data) => {
    gameController.handlePlayerJoin(socket, data);
  });

  socket.on("move", (position) => {
    gameController.handlePlayerMove(socket, position);
  });

  socket.on("attack", (targetId) => {
    gameController.handleAttack(socket, targetId);
  });

  socket.on("disconnect", () => {
    gameController.handlePlayerDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test client available at: http://localhost:${PORT}/test`);
});
