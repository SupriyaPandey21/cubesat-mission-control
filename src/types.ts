export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  operatorId: string;
  activeSession: string;
}

export interface Satellite {
  id: string;
  name: string;
  orbit: string;
  status: 'NOMINAL' | 'MAINT' | 'WARNING' | 'OFFLINE';
  health: number;
  battery: number;
  temp: number;
  signal: number;
  velocity: number;
  altitude: number;
  apogee: number;
  perigee: number;
  inclination: number;
  period: number;
  latitude: number;
  longitude: number;
  pitch: number;
  roll: number;
  yaw: number;
  mode: string;
  uplink: string;
}

export interface Telemetry {
  id: string;
  satelliteId: string;
  timestamp: string;
  battery: number;
  temp: number;
  signal: number;
  velocity: number;
  altitude: number;
  pitch: number;
  roll: number;
  yaw: number;
  powerDraw: number;
  dataBuffer: number;
}

export interface Alert {
  id: string;
  satelliteId: string;
  satelliteName: string;
  timestamp: string;
  level: 'CRIT' | 'WARN' | 'INFO';
  code: string;
  message: string;
  subsystem: string;
  status: 'ACTIVE' | 'RESOLVED';
  assignedTo?: string;
  recommendedAction?: string;
}

export interface Command {
  id: string;
  satelliteId: string;
  satelliteName: string;
  timestamp: string;
  code: string;
  operator: string;
  status: 'VERIFIED' | 'PENDING_ACK' | 'FAILED' | 'QUEUED' | 'COMPLETED';
}

export interface MissionLog {
  id: string;
  satelliteId: string;
  timestamp: string;
  level: 'CRIT' | 'WARN' | 'INFO' | 'DEBUG';
  subsystem: string;
  message: string;
  payload: string; // JSON string
}

export interface GroundStation {
  id: string;
  name: string;
  status: string;
  latitude: number;
  longitude: number;
  uplink: string;
  downlink: string;
  nextAos: string;
  duration: string;
  weather: string;
  interference: string;
  commsImpact: string;
}

export interface Settings {
  id: string;
  batteryCritical: number;
  thermalWarning: number;
  signalFloor: number;
  uplinkFreq: string;
  downlinkFreq: string;
  encryptionKey: string;
  adaptiveDataRate: string;
  hudPushAlerts: boolean;
  smsForwarding: boolean;
}
