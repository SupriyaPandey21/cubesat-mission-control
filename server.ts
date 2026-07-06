import dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";
import path from "path";
import fs from "fs";
import AlertModel from "./models/Alert";
import MissionLogModel from "./models/MissionLog";
import SatelliteModel from "./models/Satellite";
import UserModel from "./models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createServer as createViteServer } from "vite";
import { Satellite, Telemetry, Alert, Command, MissionLog, GroundStation, Settings, User } from "./src/types";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Create data directory for JSON persistence if needed
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, "db.json");

// In-Memory Database Structure
interface Database {
  users: User[];
  satellites: Satellite[];
  telemetry: Telemetry[];
  alerts: Alert[];
  commands: Command[];
  missionLogs: MissionLog[];
  groundStations: GroundStation[];
  settings: Settings;
}

// Initial Seed Data
const defaultDb: Database = {
  users: [
    {
      id: "usr-1",
      username: "engineer",
      email: "supriya9452312599@gmail.com",
      role: "Chief Mission Engineer",
      operatorId: "AX-774",
      activeSession: "04:12:00"
    }
  ],
  satellites: [
    {
      id: "aether-1",
      name: "Aether-1",
      orbit: "LEO-A (Polar)",
      status: "NOMINAL",
      health: 94,
      battery: 92.4,
      temp: 22.1,
      signal: -74.2,
      velocity: 7.66,
      altitude: 525.4,
      apogee: 542,
      perigee: 518,
      inclination: 97.5,
      period: 95.2,
      latitude: 45.23,
      longitude: 12.87,
      pitch: 12.4,
      roll: -3.2,
      yaw: 0.1,
      mode: "SCIENCE_OPS",
      uplink: "SECURE"
    },
    {
      id: "aether-2",
      name: "Aether-2",
      orbit: "LEO-B (Sunsync)",
      status: "NOMINAL",
      health: 88,
      battery: 76.0,
      temp: 18.5,
      signal: -82.1,
      velocity: 7.58,
      altitude: 540.2,
      apogee: 550,
      perigee: 530,
      inclination: 98.2,
      period: 96.1,
      latitude: 34.0,
      longitude: -118.24,
      pitch: -1.5,
      roll: 0.4,
      yaw: -1.2,
      mode: "IDLE",
      uplink: "STDBY"
    },
    {
      id: "iris-4",
      name: "Iris-4",
      orbit: "GEO-1 (Equatorial)",
      status: "WARNING",
      health: 65,
      battery: 12.0,
      temp: 45.5,
      signal: -115.0,
      velocity: 3.07,
      altitude: 35786.0,
      apogee: 35790,
      perigee: 35782,
      inclination: 0.05,
      period: 1436.1,
      latitude: 0.0,
      longitude: -45.0,
      pitch: 0.5,
      roll: -0.1,
      yaw: 0.0,
      mode: "MAINT",
      uplink: "DEGRADED"
    }
  ],
  telemetry: [], // Seeded on startup below
  alerts: [
    {
      id: "alt-1",
      satelliteId: "iris-4",
      satelliteName: "Iris-4",
      timestamp: new Date().toISOString(),
      level: "CRIT",
      code: "SYS-T-049",
      message: "Low Power Warning - Critical battery level (12.0%) detected.",
      subsystem: "SYS_POWER_MGMT",
      status: "ACTIVE",
      assignedTo: "J. Miller",
      recommendedAction: "Execute secondary radiator loop and load-shed non-essential science systems."
    },
    {
      id: "alt-2",
      satelliteId: "iris-4",
      satelliteName: "Iris-4",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: "WARN",
      code: "COM-L-882",
      message: "Intermittent Comms Handover Latency - Exceeding 1400ms delay.",
      subsystem: "COMMS_ARRAY_A",
      status: "ACTIVE",
      assignedTo: "Lt. Elena Rostova",
      recommendedAction: "Reposition Ground Station Alpha transceiver pointing offset by +1.5 degrees."
    }
  ],
  commands: [
    {
      id: "cmd-1",
      satelliteId: "aether-1",
      satelliteName: "Aether-1",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      code: "CMD_HTR_OFF",
      operator: "CHIEF_ENG_KIM",
      status: "VERIFIED"
    },
    {
      id: "cmd-2",
      satelliteId: "aether-1",
      satelliteName: "Aether-1",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      code: "CMD_ACS_STAB",
      operator: "CHIEF_ENG_KIM",
      status: "VERIFIED"
    },
    {
      id: "cmd-3",
      satelliteId: "iris-4",
      satelliteName: "Iris-4",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      code: "CMD_PAYLOAD_ON",
      operator: "SYS_ADMIN_ROB",
      status: "FAILED"
    }
  ],
  missionLogs: [
    {
      id: "log-1",
      satelliteId: "aether-1",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      level: "INFO",
      subsystem: "EPS",
      message: "CMD_HTR_OFF executed successfully - Bus thermal loads stabilizing.",
      payload: JSON.stringify({ power_gain_w: 4.5, current_temp_c: 22.1 })
    },
    {
      id: "log-2",
      satelliteId: "aether-1",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      level: "INFO",
      subsystem: "ADCS",
      message: "CMD_ACS_STAB orientation sync success - Pitch/Roll drift compensated.",
      payload: JSON.stringify({ drift_pitch: 0.05, drift_roll: -0.1 })
    },
    {
      id: "log-3",
      satelliteId: "iris-4",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: "CRIT",
      subsystem: "SYS",
      message: "INIT_PURGE_TELEMETRY_CACHE rejected - Insufficient authorization level.",
      payload: JSON.stringify({ user_level: "L2", required_level: "L4" })
    }
  ],
  groundStations: [
    {
      id: "gs-alpha",
      name: "Ground Station Alpha",
      status: "ACTIVE",
      latitude: 45.4,
      longitude: 10.72,
      uplink: "UHF 435.0 MHz",
      downlink: "S-Band 2.2 GHz",
      nextAos: "00:14:22",
      duration: "8m 45s",
      weather: "Clear, 18°C, Wind SE 12km/h",
      interference: "LOW",
      commsImpact: "NOMINAL"
    },
    {
      id: "gs-beta",
      name: "Ground Station Beta",
      status: "STDBY",
      latitude: 34.0,
      longitude: -118.24,
      uplink: "UHF 436.5 MHz",
      downlink: "S-Band 2.25 GHz",
      nextAos: "01:22:04",
      duration: "6m 12s",
      weather: "Overcast, 15°C, Wind W 8km/h",
      interference: "LOW",
      commsImpact: "NOMINAL"
    },
    {
      id: "gs-gamma",
      name: "Ground Station Gamma",
      status: "STDBY",
      latitude: 51.5,
      longitude: -0.12,
      uplink: "UHF 437.2 MHz",
      downlink: "S-Band 2.3 GHz",
      nextAos: "02:40:15",
      duration: "11m 30s",
      weather: "Rain, 11°C, Wind N 22km/h",
      interference: "MODERATE",
      commsImpact: "NOMINAL"
    }
  ],
  settings: {
    id: "global-settings",
    batteryCritical: 15.0,
    thermalWarning: 65.5,
    signalFloor: -110.0,
    uplinkFreq: "2250.500",
    downlinkFreq: "8450.000",
    encryptionKey: "xk9-delta-protocol-77a",
    adaptiveDataRate: "AUTO (DYN_NEG)",
    hudPushAlerts: true,
    smsForwarding: false
  }
};

// Seed historical telemetry points (30 historical points for charts)
const satellitesToSeed = ["aether-1", "aether-2", "iris-4"];
satellitesToSeed.forEach((satId) => {
  const isAether1 = satId === "aether-1";
  const isAether2 = satId === "aether-2";
  const startBattery = isAether1 ? 95 : isAether2 ? 80 : 18;
  const startTemp = isAether1 ? 20 : isAether2 ? 17 : 42;
  const startSignal = isAether1 ? -70 : isAether2 ? -78 : -112;
  const baseVelocity = isAether1 ? 7.6 : isAether2 ? 7.5 : 3.0;
  const baseAltitude = isAether1 ? 520 : isAether2 ? 535 : 35780;

  for (let i = 29; i >= 0; i--) {
    const timeOffset = i * 60 * 1000; // minutes
    const timestamp = new Date(Date.now() - timeOffset).toISOString();
    defaultDb.telemetry.push({
      id: `tel-${satId}-${30 - i}`,
      satelliteId: satId,
      timestamp,
      battery: parseFloat((startBattery - (29 - i) * 0.1 + Math.sin(i / 2) * 0.5).toFixed(1)),
      temp: parseFloat((startTemp + Math.sin(i / 3) * 0.8).toFixed(1)),
      signal: parseFloat((startSignal + Math.cos(i / 4) * 1.5).toFixed(1)),
      velocity: parseFloat((baseVelocity + Math.sin(i / 10) * 0.02).toFixed(2)),
      altitude: parseFloat((baseAltitude + Math.cos(i / 5) * 2).toFixed(1)),
      pitch: parseFloat((Math.sin(i / 2) * 5).toFixed(1)),
      roll: parseFloat((Math.cos(i / 3) * 2).toFixed(1)),
      yaw: parseFloat((Math.sin(i / 5) * 0.5).toFixed(1)),
      powerDraw: parseFloat((14.2 + Math.sin(i / 4) * 0.5).toFixed(1)),
      dataBuffer: parseFloat((40 + (29 - i) * 1.0).toFixed(0))
    });
  }
});

// Load Database
let db: Database = { ...defaultDb };
if (fs.existsSync(DB_FILE)) {
  try {
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    db = JSON.parse(rawData);
    console.log("Database successfully loaded from storage.");
  } catch (err) {
    console.error("Failed to load existing database file. Bootstrapping defaults...", err);
  }
} else {
//  saveDb();
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save database file:", err);
  }
}

// Background Simulation Loop
// Runs every 4 seconds to update telemetry, increment orbits, and check safety thresholds
setInterval(() => {
  const now = new Date().toISOString();

  db.satellites = db.satellites.map((sat) => {
    // Generate slight orbital motion
    let nextLat = sat.latitude + (Math.random() - 0.5) * 0.8;
    let nextLon = sat.longitude + 0.5;

    // Boundary wrapping
    if (nextLat > 90) nextLat = 90 - (nextLat - 90);
    if (nextLat < -90) nextLat = -90 + (-90 - nextLat);
    if (nextLon > 180) nextLon = -180 + (nextLon - 180);

    // Minor telemetry oscillations
    let batOffset = (Math.random() - 0.5) * 0.4;
    // Iris-4 slowly charges if sunlight, otherwise drains.
    if (sat.id === "iris-4") {
      batOffset = Math.random() > 0.45 ? 0.3 : -0.5; // steady power trouble
    } else {
      batOffset = Math.random() > 0.4 ? 0.1 : -0.1;
    }

    let nextBattery = Math.max(0, Math.min(100, sat.battery + batOffset));
    let nextTemp = sat.temp + (Math.random() - 0.5) * 0.3;
    let nextSignal = Math.max(-140, Math.min(-40, sat.signal + (Math.random() - 0.5) * 1.2));

    // Dynamic velocities & altitudes
    let nextVelocity = sat.velocity + (Math.random() - 0.5) * 0.01;
    let nextAltitude = sat.altitude + (Math.random() - 0.5) * 0.2;

    // Attitude jitter
    let nextPitch = parseFloat((sat.pitch + (Math.random() - 0.5) * 0.6).toFixed(1));
    let nextRoll = parseFloat((sat.roll + (Math.random() - 0.5) * 0.4).toFixed(1));
    let nextYaw = parseFloat((sat.yaw + (Math.random() - 0.5) * 0.2).toFixed(1));

    // Round calculations
    nextBattery = parseFloat(nextBattery.toFixed(1));
    nextTemp = parseFloat(nextTemp.toFixed(1));
    nextSignal = parseFloat(nextSignal.toFixed(1));
    nextVelocity = parseFloat(nextVelocity.toFixed(2));
    nextAltitude = parseFloat(nextAltitude.toFixed(1));

    // Evaluate Settings Alarm Thresholds
    checkVitalsThresholds(sat.id, sat.name, nextBattery, nextTemp, nextSignal);

    // Save active telemetry point to history array
    const newTel: Telemetry = {
      id: `tel-${sat.id}-${Date.now()}`,
      satelliteId: sat.id,
      timestamp: now,
      battery: nextBattery,
      temp: nextTemp,
      signal: nextSignal,
      velocity: nextVelocity,
      altitude: nextAltitude,
      pitch: nextPitch,
      roll: nextRoll,
      yaw: nextYaw,
      powerDraw: parseFloat((12.0 + Math.random() * 3).toFixed(1)),
      dataBuffer: Math.min(100, Math.max(0, Math.floor(Math.random() * 50 + 30)))
    };

    // Append to telemetry table
    db.telemetry.push(newTel);

    // Maintain a max trend buffer size of 50 points per satellite to save space/performance
    const satTels = db.telemetry.filter(t => t.satelliteId === sat.id);
    if (satTels.length > 50) {
      const itemsToRemove = satTels.length - 50;
      let removed = 0;
      db.telemetry = db.telemetry.filter((t) => {
        if (t.satelliteId === sat.id && removed < itemsToRemove) {
          removed++;
          return false;
        }
        return true;
      });
    }

    // Update status based on alarms
    let finalStatus: Satellite["status"] = sat.status;
    const activeSatAlerts = db.alerts.filter(a => tId(a.satelliteId) === tId(sat.id) && a.status === "ACTIVE");
    if (activeSatAlerts.some(a => a.level === "CRIT")) {
      finalStatus = "WARNING"; // Show warning/critical
    } else if (activeSatAlerts.some(a => a.level === "WARN")) {
      finalStatus = "WARNING";
    } else {
      finalStatus = "NOMINAL";
    }

    // Special offline status if battery = 0
    if (nextBattery <= 0) {
      finalStatus = "OFFLINE";
    }

    return {
      ...sat,
      latitude: parseFloat(nextLat.toFixed(2)),
      longitude: parseFloat(nextLon.toFixed(2)),
      battery: nextBattery,
      temp: nextTemp,
      signal: nextSignal,
      velocity: nextVelocity,
      altitude: nextAltitude,
      pitch: nextPitch,
      roll: nextRoll,
      yaw: nextYaw,
      status: finalStatus
    };
  });

  // Periodically tick Ground Station Countdown
  db.groundStations = db.groundStations.map((gs) => {
    const parts = gs.nextAos.split(":");
    let h = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let s = parseInt(parts[2]);

    s -= 4;
    if (s < 0) {
      s = 59;
      m -= 1;
      if (m < 0) {
        m = 59;
        h -= 1;
        if (h < 0) {
          h = 2; // Reset cycle
          m = 15;
          s = 0;
          // Generate GS handover log
          const handoverLog: MissionLog = {
            id: `log-auto-${Date.now()}`,
            satelliteId: "aether-1",
            timestamp: now,
            level: "INFO",
            subsystem: "COMMS",
            message: `Orbital Handover to ${gs.name} completed successfully. Strong S-Band locking locked.`,
            payload: JSON.stringify({ gs_id: gs.id, rssi_dbm: -72 })
          };
          db.missionLogs.unshift(handoverLog);
        }
      }
    }

    const pad = (n: number) => n.toString().padStart(2, "0");
    return {
      ...gs,
      nextAos: `${pad(h)}:${pad(m)}:${pad(s)}`
    };
  });

  saveDb();
}, 4000);

// Helper for exact casing comparison
function tId(id: string) {
  return id.toLowerCase().trim();
}

// Check thresholds helper
function checkVitalsThresholds(satId: string, satName: string, battery: number, temp: number, signal: number) {
  const settings = db.settings;
  const now = new Date().toISOString();

  // Battery critical check
  if (battery <= settings.batteryCritical) {
    const alertId = `alt-auto-bat-${satId}`;
    const exists = db.alerts.some(
      a => a.satelliteId === satId && a.code === "SYS-T-049" && a.status === "ACTIVE"
    );

    if (!exists) {
      const newAlert: Alert = {
        id: alertId,
        satelliteId: satId,
        satelliteName: satName,
        timestamp: now,
        level: "CRIT",
        code: "SYS-T-049",
        message: `Low Battery Fault - Satellite is at ${battery}% battery (threshold: ${settings.batteryCritical}%).`,
        subsystem: "SYS_POWER_MGMT",
        status: "ACTIVE",
        assignedTo: "Chief Engineer",
        recommendedAction: "Immediately send CMD_HTR_OFF or SAFE_MODE payload command to conserve remaining bus charge."
      };
      db.alerts.unshift(newAlert);
    }
  }

  // Thermal critical check
  if (temp >= settings.thermalWarning) {
    const alertId = `alt-auto-tmp-${satId}`;
    const exists = db.alerts.some(
      a => a.satelliteId === satId && a.code === "SYS-T-082" && a.status === "ACTIVE"
    );

    if (!exists) {
      const newAlert: Alert = {
        id: alertId,
        satelliteId: satId,
        satelliteName: satName,
        timestamp: now,
        level: "WARN",
        code: "SYS-T-082",
        message: `Thermal Limit Exceeded - System temp is at ${temp}°C (warning limit: ${settings.thermalWarning}°C).`,
        subsystem: "THERMAL_CTRL",
        status: "ACTIVE",
        assignedTo: "Chief Engineer",
        recommendedAction: "Reposition solar array shadowing or align spacecraft cooling surfaces to deep space."
      };
      db.alerts.unshift(newAlert);
    }
  }

  // Signal critical floor check
  if (signal <= settings.signalFloor) {
    const alertId = `alt-auto-sig-${satId}`;
    const exists = db.alerts.some(
      a => a.satelliteId === satId && a.code === "COM-S-110" && a.status === "ACTIVE"
    );

    if (!exists) {
      const newAlert: Alert = {
        id: alertId,
        satelliteId: satId,
        satelliteName: satName,
        timestamp: now,
        level: "WARN",
        code: "COM-S-110",
        message: `Signal Strength Floor Fault - Link degradation at ${signal} dBm (minimum: ${settings.signalFloor} dBm).`,
        subsystem: "COMMS_ARRAY_A",
        status: "ACTIVE",
        assignedTo: "Lt. Elena Rostova",
        recommendedAction: "Switch uplink transceiver from UHF to S-Band high-gain mode."
      };
      db.alerts.unshift(newAlert);
    }
  }
}

// Start Server Routine
async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  app.get("/api/seed-user", async (req, res) => {
  const hashedPassword = await bcrypt.hash("password123", 10);

  await UserModel.findOneAndUpdate(
    { username: "engineer" },
    {
      username: "engineer",
      password: hashedPassword,
      name: "Mission Engineer",
      role: "ADMIN",
    },
    { upsert: true, new: true }
  );

  res.json({ message: "Engineer password reset successfully" });
});

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // Auth endpoint
 app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await UserModel.findOne({ username });

    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid operator credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");

    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid operator credentials" });
    }

    const token = jwt.sign(
   {
  id: user._id,
  username: user.username,
  role: user.role,
},
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.json({
  success: true,
  token,
  user: {
    id: user._id,
    username: user.username,
    name: user.name,
    role: user.role,
  },
});
  } catch (error) {
    res.status(500).json({ success: false, error: "Login failed" });
  }
});

  // Satellites endpoints
  app.get("/api/satellites", async (req, res) => {
  try {
    const satellites = await SatelliteModel.find();
    res.json(satellites);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch satellites" });
  }
});
app.post("/api/satellites", async (req, res) => {
  try {
    const satellite = await SatelliteModel.create(req.body);
    res.json({ success: true, satellite });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create satellite" });
  }
});

  // Telemetry endpoint
  app.get("/api/telemetry", (req, res) => {
    const { satelliteId } = req.query;
    if (satelliteId) {
      const data = db.telemetry.filter(t => tId(t.satelliteId) === tId(satelliteId as string));
      res.json(data);
    } else {
      res.json(db.telemetry);
    }
  });

  // Alerts endpoints
     app.get("/api/alerts", async (req, res) => {
  try {
    const alerts = await AlertModel.find().sort({ timestamp: -1 });
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});
app.post("/api/alerts", async (req, res) => {
  try {
    const alert = await AlertModel.create({
      ...req.body,
      id: `alt-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, alert });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create alert" });
  }
});

 app.put("/api/alerts/:id", async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  const alert = await AlertModel.findOneAndUpdate(
    { id },
    {
      $set: {
        ...(status && { status }),
        ...(assignedTo && { assignedTo }),
      },
    },
    { new: true }
  );

  if (alert) {

      // Create log about alert resolution
      if (status === "RESOLVED") {
  const satId = alert.satelliteId as string;
const alertCode = alert.code as string;

  const satIndex = db.satellites.findIndex(s => s.id === satId);

  if (satIndex !== -1) {
    if (alertCode === "SYS-T-049") {
      db.satellites[satIndex].battery = 30;
      db.satellites[satIndex].status = "NOMINAL";
      db.satellites[satIndex].mode = "SAFE_MODE";
    }

    if (alertCode === "COM-S-110") {
      db.satellites[satIndex].signal = -90;
      db.satellites[satIndex].status = "NOMINAL";
      db.satellites[satIndex].uplink = "SECURE";
    }
  }
        const resolveLog: MissionLog = {
          id: `log-resolv-${Date.now()}`,
          satelliteId: satId,
          timestamp: new Date().toISOString(),
          level: "INFO",
          subsystem: alert.subsystem || "Unknown",
          message: `Alert resolved: ${alert.code} - ${alert.message}`,
          payload: JSON.stringify({ resolver: "Chief Engineer", alert_id: id })
        };
        db.missionLogs.unshift(resolveLog);
      }

      saveDb();
      res.json({ success: true, alert });
    } else {
      res.status(404).json({ success: false, error: "Alert not found" });
    }
  });

  // Commands endpoints
  app.get("/api/commands", (req, res) => {
    res.json(db.commands);
  });

  app.post("/api/commands", (req, res) => {
    const { satelliteId, code, operator } = req.body;
    const satIndex = db.satellites.findIndex(s => tId(s.id) === tId(satelliteId));

    if (satIndex === -1) {
      return res.status(404).json({ success: false, error: "Satellite target not found" });
    }

    const sat = db.satellites[satIndex];
    const timestamp = new Date().toISOString();

    const cmd: Command = {
      id: `cmd-${Date.now()}`,
      satelliteId,
      satelliteName: sat.name,
      timestamp,
      code,
      operator: operator || "CHIEF_MISSION_ENG",
      status: "VERIFIED"
    };

    // Log the command receipt
    const cmdLog: MissionLog = {
      id: `log-cmd-${Date.now()}`,
      satelliteId,
      timestamp,
      level: "INFO",
      subsystem: "SYS",
      message: `Command authority verification success: received ${code}. Uplinking...`,
      payload: JSON.stringify({ code, operator: cmd.operator, status: "SUCCESS" })
    };
    db.missionLogs.unshift(cmdLog);

    // Apply command simulation changes immediately to satellite profile
    let detailMsg = "";
    if (code === "CMD_HTR_OFF") {
      sat.temp = parseFloat((sat.temp - 4.5).toFixed(1));
      sat.mode = "SCIENCE_OPS";
      detailMsg = "Spacecraft heaters deactivated. Conserving battery.";
    } else if (code === "CMD_HTR_ON") {
      sat.temp = parseFloat((sat.temp + 5.2).toFixed(1));
      sat.mode = "SCIENCE_OPS";
      detailMsg = "Spacecraft heaters powered on. Internal temp rising.";
    } else if (code === "CMD_ACS_STAB") {
      sat.pitch = 0.1;
      sat.roll = -0.2;
      sat.yaw = 0.0;
      sat.mode = "SCIENCE_OPS";
      detailMsg = "Star-trackers re-synced. Attitude coordinates centered successfully.";
    } else if (code === "CMD_PAYLOAD_ON") {
      sat.mode = "SCIENCE_OPS";
      sat.health = Math.min(100, sat.health + 5);
      detailMsg = "Main scientific payloads fully initialized.";
    } else if (code === "CMD_PAYLOAD_OFF") {
      sat.mode = "IDLE";
      detailMsg = "Scientific payloads powered down cleanly.";
    } else if (code === "CMD_LINK_EST") {
      sat.signal = -60.0;
      sat.uplink = "SECURE";
      detailMsg = "Acquiring lock. Signal gain re-calibrated. Strong secure downlink.";
    } else if (code === "SAFE_MODE") {
      sat.mode = "SAFE_MODE";
      sat.status = "NOMINAL";
      sat.temp = 15.0;
      sat.uplink = "STDBY";
      sat.health = 99;
      // Resolve any active alerts on this satellite!
      db.alerts = db.alerts.map((a) => {
        if (tId(a.satelliteId) === tId(satelliteId) && a.status === "ACTIVE") {
          return { ...a, status: "RESOLVED" };
        }
        return a;
      });
      detailMsg = "CRITICAL COOLDOWN: Spacecraft entered autonomous SAFE_MODE. Payload halted.";
    } else if (code === "RESET_SIMULATION") {
      // Re-seed all tables to start state
      db.satellites = [...defaultDb.satellites];
      db.alerts = [...defaultDb.alerts];
      db.commands = [...defaultDb.commands];
      db.missionLogs = [...defaultDb.missionLogs];
      db.settings = { ...defaultDb.settings };
      detailMsg = "System configuration logs and anomaly thresholds fully reset to original state.";
    }

    // Append executed action log
    db.missionLogs.unshift({
      id: `log-exec-${Date.now()}`,
      satelliteId,
      timestamp: new Date(Date.now() + 500).toISOString(),
      level: "INFO",
      subsystem: sat.id === "iris-4" ? "EPS" : "ADCS",
      message: `${code} Uplink success: ${detailMsg}`,
      payload: JSON.stringify({ satellite: sat.name, command: code, timestamp })
    });

    db.commands.unshift(cmd);
    saveDb();
    res.json({ success: true, command: cmd, satellite: sat });
  });

  // Mission Logs endpoints
  app.get("/api/logs", async (req, res) => {
  try {
    const logs = await MissionLogModel.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch logs" });
  }
});
  
  app.post("/api/logs", async (req, res) => {
  try {
    const log = await MissionLogModel.create({
      ...req.body,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
    });

    res.json({ success: true, log });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create log" });
  }
});
  // Ground stations endpoint
  app.get("/api/ground_stations", (req, res) => {
    res.json(db.groundStations);
  });

  // Settings endpoint
  app.get("/api/settings", (req, res) => {
    res.json(db.settings);
  });

  app.put("/api/settings", (req, res) => {
    db.settings = {
      ...db.settings,
      ...req.body
    };

    // Log the configuration changes
    const configLog: MissionLog = {
      id: `log-cfg-${Date.now()}`,
      satelliteId: "aether-1",
      timestamp: new Date().toISOString(),
      level: "INFO",
      subsystem: "SYS",
      message: `Global telemetry parameters and threshold constraints modified. Syncing...`,
      payload: JSON.stringify(db.settings)
    };
    db.missionLogs.unshift(configLog);

    saveDb();
    res.json({ success: true, settings: db.settings });
  });

  // Serve static files / Vite middleware
  if (process.env.DISABLE_HMR === "true" || process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    const vite = await createViteServer({
  server: { middlewareMode: true,
    watch: {
  ignored: ["**/data/**"]
   }
  },
  appType: "spa",
});
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started. Running on port ${PORT}`);
  });
}
startServer();
