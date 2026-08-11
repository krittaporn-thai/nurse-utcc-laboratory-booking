import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Endpoints for simulation and system info
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Nursing Laboratory Reservation System", timestamp: new Date().toISOString() });
  });

  // Simulated Email Notification Endpoint
  app.post("/api/send-email", (req, res) => {
    const { to, subject, body, booking_id } = req.body;
    console.log(`[EMAIL SENT TO: ${to}] Subject: ${subject}`);
    console.log(`Body:\n${body}`);

    res.json({
      success: true,
      message: `อีเมลแจ้งเตือนถูกส่งไปยัง ${to} สำเร็จแล้ว`,
      log: {
        id: "EML-" + Date.now(),
        booking_id: booking_id || "N/A",
        recipient_email: to,
        subject,
        body,
        sent_at: new Date().toISOString(),
        status: "sent"
      }
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
