import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

interface DbSchema {
  laboratories: any[];
  bookings: any[];
  pre_inspection: any[];
  post_inspection: any[];
  damages: any[];
  admin_settings: any[];
  [key: string]: any[];
}

const DEFAULT_LABS = [
  {
    id: "lab-1",
    code: "NLAB-101",
    name: "ห้องปฏิบัติการการพยาบาลพื้นฐาน 1 (Basic Nursing Skill Lab 1)",
    building: "อาคารเฉลิมพระเกียรติ (อาคาร 3)",
    floor: "ชั้น 4",
    capacity: 30,
    description: "ห้องปฏิบัติการสำหรับการฝึกทักษะการพยาบาลพื้นฐาน เตียงฝึกปฏิบัติ หุ่นฝึกฉีดยา และการดูแลผู้ป่วย",
    image_url: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&q=80&w=800",
    is_ready: true,
    created_at: new Date().toISOString()
  },
  {
    id: "lab-2",
    code: "NLAB-102",
    name: "ห้องปฏิบัติการการพยาบาลพื้นฐาน 2 (Basic Nursing Skill Lab 2)",
    building: "อาคารเฉลิมพระเกียรติ (อาคาร 3)",
    floor: "ชั้น 4",
    capacity: 30,
    description: "ห้องปฏิบัติการทักษะหัตถการพื้นฐาน เครื่องมือการพยาบาลขั้นพื้นฐานครบครัน",
    image_url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
    is_ready: true,
    created_at: new Date().toISOString()
  },
  {
    id: "lab-3",
    code: "NLAB-201",
    name: "ห้องปฏิบัติการการประเมินภาวะสุขภาพ (Health Assessment Lab)",
    building: "อาคารเฉลิมพระเกียรติ (อาคาร 3)",
    floor: "ชั้น 5",
    capacity: 25,
    description: "อุปกรณ์ตรวจประเมินภาวะสุขภาพครบชุด หูฟังตรวจปอดและหัวใจ อุปกรณ์วัดสัญญาณชีพ",
    image_url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800",
    is_ready: true,
    created_at: new Date().toISOString()
  },
  {
    id: "lab-4",
    code: "NLAB-301",
    name: "ห้องปฏิบัติการการพยาบาลผู้ป่วยวิกฤต (Critical Care Simulation Lab)",
    building: "อาคารเฉลิมพระเกียรติ (อาคาร 3)",
    floor: "ชั้น 5",
    capacity: 20,
    description: "ห้องจำลองการพยาบาลผู้ป่วยวิกฤต พร้อมหุ่นจำลองเสมือนจริง และเครื่องติดตามสัญญาณชีพ",
    image_url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800",
    is_ready: true,
    created_at: new Date().toISOString()
  },
  {
    id: "lab-5",
    code: "NLAB-302",
    name: "ห้องปฏิบัติการการพยาบาลมารดา ทารก และการคลอด (Maternal & Child Lab)",
    building: "อาคารเฉลิมพระเกียรติ (อาคาร 3)",
    floor: "ชั้น 6",
    capacity: 25,
    description: "ห้องปฏิบัติการทำคลอดจำลอง เตียงทำคลอด หุ่นจำลองทารกแรกเกิด และเครื่องฟังเสียงหัวใจทารกในครรภ์",
    image_url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800",
    is_ready: true,
    created_at: new Date().toISOString()
  },
  {
    id: "lab-6",
    code: "NLAB-401",
    name: "ห้องปฏิบัติการทักษะการพยาบาลขั้นสูง (Advanced Clinical Skill Lab)",
    building: "อาคารเฉลิมพระเกียรติ (อาคาร 3)",
    floor: "ชั้น 6",
    capacity: 30,
    description: "ห้องปฏิบัติการทักษะคลินิกขั้นสูง อุปกรณ์ใส่สายยาง ให้สารน้ำ และทำหัตถการพิเศษ",
    image_url: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800",
    is_ready: true,
    created_at: new Date().toISOString()
  }
];

function loadDb(): DbSchema {
  let db: DbSchema = {
    laboratories: [],
    bookings: [],
    pre_inspection: [],
    post_inspection: [],
    damages: [],
    admin_settings: [
      { setting_key: "admin_passcode", setting_value: "NURSEUTCC01" }
    ]
  };

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      db = JSON.parse(content);
    }
  } catch (e) {
    console.error("Error reading db.json:", e);
  }

  let dbChanged = false;

  if (!db.laboratories || db.laboratories.length === 0) {
    db.laboratories = DEFAULT_LABS;
    dbChanged = true;
  } else if (db.laboratories.length < DEFAULT_LABS.length) {
    for (const lab of DEFAULT_LABS) {
      if (!db.laboratories.some((l) => l.id === lab.id)) {
        db.laboratories.push(lab);
        dbChanged = true;
      }
    }
  }

  if (!db.bookings) { db.bookings = []; dbChanged = true; }
  if (!db.pre_inspection) { db.pre_inspection = []; dbChanged = true; }
  if (!db.post_inspection) { db.post_inspection = []; dbChanged = true; }
  if (!db.damages) { db.damages = []; dbChanged = true; }

  if (dbChanged) {
    saveDb(db);
  }

  return db;
}

function saveDb(db: DbSchema) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing db.json:", e);
  }
}

let sseClients: express.Response[] = [];

function notifyRealtimeClients() {
  sseClients = sseClients.filter((res) => {
    try {
      res.write(`data: ${JSON.stringify({ event: "change", timestamp: Date.now() })}\n\n`);
      return true;
    } catch (e) {
      return false;
    }
  });
}

function parsePostgRestFilters(query: Record<string, any>) {
  const filters: { col: string; op: string; val: string }[] = [];
  for (const [key, rawVal] of Object.entries(query)) {
    if (["select", "order", "limit", "offset"].includes(key)) continue;
    const strVal = String(rawVal);
    if (strVal.startsWith("eq.")) {
      filters.push({ col: key, op: "eq", val: strVal.slice(3) });
    } else if (strVal.startsWith("neq.")) {
      filters.push({ col: key, op: "neq", val: strVal.slice(4) });
    }
  }
  return filters;
}

function matchesFilters(item: any, filters: { col: string; op: string; val: string }[]) {
  return filters.every((f) => {
    const itemVal = item[f.col];
    if (f.op === "eq") {
      return String(itemVal) === f.val;
    }
    if (f.op === "neq") {
      return String(itemVal) !== f.val;
    }
    return true;
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // CORS Middleware for cross-browser / cross-domain synchronization
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, apikey, prefer, x-client-info, range");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

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

  // Realtime Event Endpoint
  app.get("/rest/v1/realtime", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
    sseClients.push(res);

    req.on("close", () => {
      sseClients = sseClients.filter((client) => client !== res);
    });
  });

  // Periodic SSE ping to prevent proxy/idle timeouts
  setInterval(() => {
    sseClients = sseClients.filter((res) => {
      try {
        res.write(`: ping\n\n`);
        return true;
      } catch (e) {
        return false;
      }
    });
  }, 20000);

  // Supabase REST Protocol compatibility layer
  app.get("/rest/v1/:table", (req, res) => {
    const table = req.params.table;
    const db = loadDb();
    let records = db[table] || [];

    const filters = parsePostgRestFilters(req.query);
    if (filters.length > 0) {
      records = records.filter((r) => matchesFilters(r, filters));
    }

    if (req.query.order) {
      const [col, dir] = String(req.query.order).split(".");
      records.sort((a, b) => {
        const valA = a[col] || "";
        const valB = b[col] || "";
        if (dir === "desc") return valA > valB ? -1 : 1;
        return valA > valB ? 1 : -1;
      });
    }

    const acceptHeader = req.headers["accept"] || "";
    if (typeof acceptHeader === "string" && acceptHeader.includes("vnd.pgrst.object+json")) {
      return res.json(records[0] || null);
    }

    res.json(records);
  });

  app.post("/rest/v1/:table", (req, res) => {
    const table = req.params.table;
    const db = loadDb();
    if (!db[table]) db[table] = [];

    const body = req.body;
    const itemsToInsert = Array.isArray(body) ? body : [body];

    const inserted: any[] = [];
    for (const item of itemsToInsert) {
      const record = {
        ...item,
        created_at: item.created_at || new Date().toISOString()
      };
      // Upsert logic if id exists
      if (record.id) {
        const existingIdx = db[table].findIndex((r) => String(r.id) === String(record.id));
        if (existingIdx >= 0) {
          db[table][existingIdx] = { ...db[table][existingIdx], ...record };
          inserted.push(db[table][existingIdx]);
          continue;
        }
      }
      db[table].unshift(record);
      inserted.push(record);
    }

    saveDb(db);
    notifyRealtimeClients();

    console.log(`[SUPABASE DB INSERT RESULT ${table}]`, inserted);
    res.status(201).json(inserted);
  });

  app.patch("/rest/v1/:table", (req, res) => {
    const table = req.params.table;
    const db = loadDb();
    if (!db[table]) db[table] = [];

    const filters = parsePostgRestFilters(req.query);
    const updates = req.body || {};

    const updated: any[] = [];
    db[table] = db[table].map((r) => {
      if (filters.length === 0 || matchesFilters(r, filters)) {
        const newRecord = { ...r, ...updates };
        updated.push(newRecord);
        return newRecord;
      }
      return r;
    });

    saveDb(db);
    notifyRealtimeClients();

    console.log(`[SUPABASE DB UPDATE RESULT ${table}]`, updated);
    res.json(updated);
  });

  app.delete("/rest/v1/:table", (req, res) => {
    const table = req.params.table;
    const db = loadDb();
    if (!db[table]) db[table] = [];

    const filters = parsePostgRestFilters(req.query);
    const remaining: any[] = [];
    const deleted: any[] = [];

    for (const r of db[table]) {
      if (filters.length > 0 && matchesFilters(r, filters)) {
        deleted.push(r);
      } else {
        remaining.push(r);
      }
    }

    db[table] = remaining;
    saveDb(db);
    notifyRealtimeClients();

    console.log(`[SUPABASE DB DELETE RESULT ${table}]`, deleted);
    res.json(deleted);
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
