const http = require("http");
const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");
const { initSocket } = require("./utils/socket");

function start() {
  // test DB connection once before listen
  pool.getConnection((err, conn) => {
    if (err) {
      console.error("❌ Database connection failed:", err.message);
      process.exit(1);
    }

    console.log("✅ Database connected");
    conn.release();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.port, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${env.port}`);
    });
  });
}

start();