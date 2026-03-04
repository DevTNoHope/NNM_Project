const app = require("./app");
const env = require("./config/env");
const pool = require("./config/db");

function start() {
  // test DB connection once before listen
  pool.getConnection((err, conn) => {
    if (err) {
      console.error("❌ Database connection failed:", err.message);
      process.exit(1);
    }

    console.log("✅ Database connected");
    conn.release();

    app.listen(env.port, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${env.port}`);
    });
  });
}

start();