const { Server } = require("socket.io");

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: function (origin, callback) {
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        if (!origin || origin === clientUrl || origin === "http://localhost:5173" || /\.vercel\.app$/.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join", (userId) => {
      if (!userId) return;

      if (userId === "admin") {
        socket.join("admin_room");
        console.log(`Socket ${socket.id} joined admin_room`);
      } else {
        socket.join(`user_${userId}`);
        console.log(`Socket ${socket.id} joined user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
}

module.exports = {
  initSocket,
  getIO,
};
