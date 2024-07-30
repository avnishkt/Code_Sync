const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const { ACTIONS } = require("./actions");
const { generateFile } = require("./services/generateFile");
const {
  cCodeRunner,
  cppCodeRunner,
  javaCodeRunner,
  pythonCodeRunner,
  jsCodeRunner,
} = require("./services/codeRunner");
const roomRoutes = require("./routes/roomRoutes");
const { mapUserToRoom, getCurrentUser, deleteUser } = require("./services/room.service");
const connectDataBase = require("./config/db");

dotenv.config({ path: path.join(__dirname, `./.env`) });

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use("/room", roomRoutes);
app.use(express.static('dist'));
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Socket: Handle disconnection
const handleDisconnect = async (socket) => {
  const rooms = [...socket.rooms];
  const user = await getCurrentUser(socket.id);
  rooms.forEach((room) => {
    socket.in(room).emit(ACTIONS.DISCONNECTED, {
      socketId: socket.id,
      user
    });
  });
  await deleteUser(socket.id);
  socket.leave();
};

// Socket: Handle code run events
const handleCodeRun = async (socket, { roomId, code, extension = "c", input = null }) => {
  try {
    let res;
    switch (extension) {
      case "c":
        res = await cCodeRunner(code, input);
        break;
      case "cpp":
        res = await cppCodeRunner(code, input);
        break;
      case "java":
        res = await javaCodeRunner(code, input);
        break;
      case "py":
        res = await pythonCodeRunner(code, input);
        break;
      case "js":
        res = await jsCodeRunner(code, input);
        break;
      default:
        throw new Error("Unsupported code extension");
    }
    const output = res.response?.data.error ? res.response.data.output : res.data.output;
    const cpuTime = res.response?.data.error ? null : res.data.cpuTime;
    const memory = res.response?.data.error ? null : res.data.memory;

    io.in(roomId).emit(ACTIONS.RETURN, {
      output,
      success: true,
      cpuTime,
      memory,
    });
  } catch (err) {
    io.in(roomId).emit(ACTIONS.RETURN, {
      output: err.message || "An error occurred",
      success: false,
    });
  }
};

// Socket: Handle join events
const handleJoin = async (socket, { roomId, username }) => {
  socket.join(roomId);
  const room = await mapUserToRoom(roomId, username, socket.id);
  const users = room.users;
  const currentUser = await getCurrentUser(socket.id);

  users.forEach(({ socketId }) => {
    io.to(socketId).emit(ACTIONS.JOINED, {
      users,
      currentUser,
      socketId: socket.id,
    });
  });
};

// Socket: Handle code synchronization
const handleCodeSync = (socket, { socketId, roomId }) => {
  socket.to(roomId).emit(ACTIONS.SYNC_CODE, {
    socketId,
  });
};

// Socket: Handle code changes
const handleCodeChange = (socket, { roomId, code }) => {
  socket.in(roomId).emit(ACTIONS.CODE_CHANGE, {
    code,
  });
};

io.on("connection", (socket) => {
  socket.on("disconnecting", () => handleDisconnect(socket));
  socket.on(ACTIONS.RUN, (data) => handleCodeRun(socket, data));
  socket.on(ACTIONS.JOIN, (data) => handleJoin(socket, data));
  socket.on(ACTIONS.SYNC_CODE, (data) => handleCodeSync(socket, data));
  socket.on(ACTIONS.CODE_CHANGE, (data) => handleCodeChange(socket, data));
});



const PORT = process.env.PORT || 5000;
connectDataBase().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
});
