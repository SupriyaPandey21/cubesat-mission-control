import { Satellite, Telemetry, Alert, Command, MissionLog, GroundStation, Settings, User } from "./types";

const BASE_URL = ""; // Relative paths since they share the port 3000

export async function login(username: string): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: "" })
  });
  return res.json();
}

export async function getSatellites(): Promise<Satellite[]> {
  const res = await fetch(`${BASE_URL}/api/satellites`);
  if (!res.ok) throw new Error("Failed to fetch satellites");
  return res.json();
}

export async function getTelemetry(satelliteId?: string): Promise<Telemetry[]> {
  const url = satelliteId ? `${BASE_URL}/api/telemetry?satelliteId=${satelliteId}` : `${BASE_URL}/api/telemetry`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch telemetry");
  return res.json();
}

export async function getAlerts(): Promise<Alert[]> {
  const res = await fetch(`${BASE_URL}/api/alerts`);
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function resolveAlert(id: string, status: "RESOLVED", assignedTo?: string): Promise<{ success: boolean; alert: Alert }> {
  const res = await fetch(`${BASE_URL}/api/alerts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, assignedTo })
  });
  if (!res.ok) throw new Error("Failed to resolve alert");
  return res.json();
}

export async function getCommands(): Promise<Command[]> {
  const res = await fetch(`${BASE_URL}/api/commands`);
  if (!res.ok) throw new Error("Failed to fetch commands");
  return res.json();
}

export async function sendCommand(satelliteId: string, code: string, operator?: string): Promise<{ success: boolean; command: Command; satellite: Satellite }> {
  const res = await fetch(`${BASE_URL}/api/commands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ satelliteId, code, operator })
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to execute command");
  }
  return res.json();
}

export async function getLogs(): Promise<MissionLog[]> {
  const res = await fetch(`${BASE_URL}/api/logs`);
  if (!res.ok) throw new Error("Failed to fetch mission logs");
  return res.json();
}

export async function getGroundStations(): Promise<GroundStation[]> {
  const res = await fetch(`${BASE_URL}/api/ground_stations`);
  if (!res.ok) throw new Error("Failed to fetch ground stations");
  return res.json();
}

export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${BASE_URL}/api/settings`);
  if (!res.ok) throw new Error("Failed to fetch settings");
  return res.json();
}

export async function updateSettings(settings: Partial<Settings>): Promise<{ success: boolean; settings: Settings }> {
  const res = await fetch(`${BASE_URL}/api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings)
  });
  if (!res.ok) throw new Error("Failed to update settings");
  return res.json();
}
