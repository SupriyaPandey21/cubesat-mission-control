import React, { useEffect, useState } from "react";
import { Satellite, Alert, Command, Telemetry } from "../types";
import { getSatellites, getAlerts, getCommands, getTelemetry, sendCommand } from "../api";

interface DashboardViewProps {
  activeSatId: string;
  setActiveSatId: (id: string) => void;
  onNavigate: (viewId: string) => void;
}

export default function DashboardView({ activeSatId, setActiveSatId, onNavigate }: DashboardViewProps) {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [history, setHistory] = useState<Telemetry[]>([]);
  const [pinging, setPingout] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        const sats = await getSatellites();
        const alts = await getAlerts();
        const cmds = await getCommands();
        if (!active) return;
        setSatellites(sats);
        setAlerts(alts.filter(a => a.status === "ACTIVE"));
        setCommands(cmds.slice(0, 5));
      } catch (err) {
        console.error("Dashboard failed to fetch live states:", err);
      }
    }

    async function fetchTrend() {
      try {
        const telHistory = await getTelemetry(activeSatId);
        if (!active) return;
        setHistory(telHistory);
      } catch (err) {
        console.error("Dashboard failed to fetch trend points:", err);
      }
    }

    fetchData();
    fetchTrend();

    const interval = setInterval(() => {
      fetchData();
      fetchTrend();
    }, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeSatId]);

  const activeSat = satellites.find(s => s.id === activeSatId) || satellites[0];

  const handlePing = async () => {
    if (!activeSat) return;
    setPingout(true);
    try {
      await sendCommand(activeSat.id, "SYS_PING_INIT");
      const updatedCmds = await getCommands();
      setCommands(updatedCmds.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setPingout(false), 1200);
  };

  // Sparkline paths helpers
  const generateSparkline = (data: number[], min: number, max: number) => {
    if (data.length === 0) return "M 0 20 L 100 20";
    const range = max - min || 1;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 200;
      const y = 60 - ((val - min) / range) * 50; // padding top/bottom
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const generateAreaSparkline = (data: number[], min: number, max: number) => {
    if (data.length === 0) return "M 0 60 L 100 60";
    const range = max - min || 1;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * 200;
      const y = 60 - ((val - min) / range) * 50;
      return `${x},${y}`;
    });
    return `M 0 60 L ${points.join(" L ")} L 200 60 Z`;
  };

  // Extract trend variables
  const batteryData = history.map(h => h.battery);
  const tempData = history.map(h => h.temp);
  const signalData = history.map(h => h.signal);

  // Live positions relative coordinates mapping for visual SVG map
  // Lat: -90 to 90 -> mapping to Y: 40 to 360
  // Lon: -180 to 180 -> mapping to X: 40 to 760
  const mapX = activeSat ? ((activeSat.longitude + 180) / 360) * 720 + 40 : 400;
  const mapY = activeSat ? ((90 - activeSat.latitude) / 180) * 320 + 40 : 200;

  // AI Anomaly risk score calculation based on payload state
  let riskScore = 12;
  let riskAdvice = "Subsystems operating inside optimal envelope margins.";
  if (activeSat) {
    if (activeSat.status === "WARNING") {
      riskScore = 68;
      riskAdvice = "Thermal subsystem overload. Execute Load-Shed payload script.";
    } else if (activeSat.status === "OFFLINE") {
      riskScore = 99;
      riskAdvice = "Uplink signal connection lost. Emergency transponders armed.";
    } else if (activeSat.battery < 30) {
      riskScore = 48;
      riskAdvice = "Battery voltage sag. Adjust attitude target toward optimal sun-pointing.";
    }
  }

  return (
    <div id="dashboard-view" className="flex flex-col gap-6 animate-fade-in">
      {/* SVG gradients loaded once */}
      <svg className="hidden">
        <defs>
          <linearGradient id="cyan-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#74f5ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#74f5ff" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="warn-gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary-fixed tracking-tighter uppercase glow-text">
            {activeSat ? activeSat.name : "AETHER-1"} OVERVIEW
          </h1>
          <p className="font-data-mono text-xs text-outline tracking-wider mt-1">
            ORBITAL MET: <span className="text-primary-fixed-dim">04y 12d 08h 42m 15s</span>
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handlePing}
            disabled={pinging}
            className={`border border-primary-fixed text-primary-fixed px-5 py-2 rounded-sm font-label-caps text-xs uppercase hover:bg-primary-fixed/10 transition-colors flex items-center gap-2 cursor-pointer ${pinging ? "animate-pulse border-tertiary-fixed text-tertiary-fixed bg-tertiary-fixed/5" : ""}`}
          >
            <span className="material-symbols-outlined text-[16px]">radar</span>
            {pinging ? "PING SENT ACK" : "Ping Satellite"}
          </button>
          <button
            onClick={() => onNavigate("telemetry")}
            className="bg-primary-fixed text-on-primary-fixed px-5 py-2 rounded-sm font-label-caps text-xs uppercase hover:shadow-[0_0_15px_rgba(116,245,255,0.4)] transition-all flex items-center gap-2 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">analytics</span>
            View Telemetry Stream
          </button>
        </div>
      </div>

      {/* Complex Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Monitoring (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Top Row: Health & Map */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Health Score Trend Panel */}
            <div className="md:col-span-4 glass-card rounded-lg p-6 flex flex-col relative overflow-hidden h-[350px]">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(121,255,91,0.6)] animate-pulse ${activeSat?.status === "NOMINAL" ? "bg-tertiary-fixed" : activeSat?.status === "WARNING" ? "bg-secondary-fixed shadow-[0_0_8px_#14d1ff]" : "bg-error shadow-[0_0_8px_#ffb4ab]"}`}></span>
                <span className={`font-label-caps text-[10px] tracking-widest ${activeSat?.status === "NOMINAL" ? "text-tertiary-fixed" : activeSat?.status === "WARNING" ? "text-secondary-fixed" : "text-error"}`}>
                  {activeSat?.status || "NOMINAL"}
                </span>
              </div>
              
              <h3 className="font-label-caps text-xs text-outline mb-2">SYS_HEALTH TREND</h3>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="font-headline-lg text-[44px] text-primary-fixed leading-none">
                  {activeSat ? activeSat.health : 94}%
                </span>
                <span className="font-data-mono text-xs text-tertiary-fixed flex items-center">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 1.2%
                </span>
              </div>
              
              <div className="w-full h-24 relative mt-auto border-b border-outline-variant/10">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                  <path
                    className="sparkline-area"
                    d="M0,50 L0,30 C20,25 40,40 60,35 C80,30 100,20 120,25 C140,30 160,15 180,10 L200,5 L200,60 Z"
                    fill="url(#cyan-gradient)"
                  />
                  <path
                    className="sparkline-path"
                    d="M0,30 C20,25 40,40 60,35 C80,30 100,20 120,25 C140,30 160,15 180,10 L200,5"
                    stroke="#74f5ff"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              
              <div className="w-full flex justify-between border-t border-primary/15 pt-4 mt-4">
                <div>
                  <p className="font-label-caps text-[9px] text-outline mb-1">MODE</p>
                  <p className="font-data-mono text-primary text-xs">{activeSat?.mode || "SCIENCE_OPS"}</p>
                </div>
                <div className="text-right">
                  <p className="font-label-caps text-[9px] text-outline mb-1">UPLINK</p>
                  <p className={`font-data-mono text-xs ${activeSat?.uplink === "SECURE" ? "text-tertiary-fixed" : "text-secondary-fixed"}`}>
                    {activeSat?.uplink || "SECURE"}
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive World Map Panel */}
            <div className="md:col-span-8 glass-card rounded-lg p-0 relative overflow-hidden h-[350px]">
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <h3 className="font-label-caps text-[10px] text-primary-fixed bg-surface-container-lowest/80 px-2.5 py-1 rounded border border-primary/15 shadow-[0_0_10px_rgba(0,219,231,0.2)]">
                  LIVE TRACKING MAP
                </h3>
              </div>
              
              {/* Map Canvas Visual Layer */}
              <div className="absolute inset-0 bg-surface-container-lowest overflow-hidden">
                <div
                  className="absolute inset-0 opacity-40 bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCrDkVhPq5k-ck1K-UswUz7VIHyQOnVSy-iQ_yy6KioyC6GPmN8SKINwWifu0jjE-8QlfWWtEqo7EFrDBjByVQcxb5zXDg2-esSJ_e7jZFKKlG2nhQQ2uu8lUMzYjR0MZtYb_ubv_f_DyalouM4K_i2iHQs1fUo4Ac9tG8G0YmQAb6mbdHvEBldKBx4x9sU5SPE6qH7eMw81NW9Ld9re4Av4cv1XkjqMVrduAZViHd3q9bx3hjRcXlGKh0Bl77R2zIZG34cBS_vP1k')",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50 pointer-events-none" />
                
                {/* Orbital Lines Plot */}
                <svg className="absolute inset-0 w-full h-full z-10" preserveAspectRatio="none" viewBox="0 0 800 400">
                  {/* Predicted Route (Faded polar projection wave) */}
                  <path
                    d="M 40,250 Q 200,80 380,250 T 700,250"
                    fill="none"
                    stroke="#74f5ff"
                    strokeDasharray="4,4"
                    strokeWidth="1"
                    opacity="0.25"
                  />
                  {/* Standard Orbit Wave */}
                  <path
                    d="M 0,180 Q 200,60 400,180 T 800,180"
                    fill="none"
                    stroke="#00dbe7"
                    strokeWidth="1.5"
                    opacity="0.4"
                    className="drop-shadow-[0_0_5px_rgba(0,219,231,0.3)]"
                  />
                  
                  {/* Ground Stations Blips */}
                  {/* Svalbard */}
                  <g transform="translate(420, 50)">
                    <circle r="3" fill="#79ff5b" className="animate-pulse" />
                    <circle r="8" fill="none" stroke="#79ff5b" strokeWidth="0.5" opacity="0.5" />
                    <text x="6" y="-5" fill="#79ff5b" className="font-bold text-[8px] font-data-mono">SVALBARD</text>
                  </g>
                  {/* Perth */}
                  <g transform="translate(680, 290)">
                    <circle r="3" fill="#79ff5b" className="animate-pulse" />
                    <circle r="8" fill="none" stroke="#79ff5b" strokeWidth="0.5" opacity="0.5" />
                    <text x="6" y="-5" fill="#79ff5b" className="font-bold text-[8px] font-data-mono">PERTH</text>
                  </g>
                  {/* Wallops */}
                  <g transform="translate(190, 160)">
                    <circle r="3" fill="#79ff5b" className="animate-pulse" />
                    <circle r="8" fill="none" stroke="#79ff5b" strokeWidth="0.5" opacity="0.5" />
                    <text x="6" y="-5" fill="#79ff5b" className="font-bold text-[8px] font-data-mono">WALLOPS</text>
                  </g>
                </svg>

                {/* Blinking Live Satellite Pointer */}
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
                  style={{ left: `${mapX}%`, top: `${mapY}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-12 h-12 border border-primary-fixed/40 rounded-full animate-ping pointer-events-none" />
                    <div className="absolute w-7 h-7 border border-primary-fixed/50 rounded-full pointer-events-none" />
                    <div className="w-3.5 h-3.5 bg-primary-fixed rounded-full shadow-[0_0_12px_#74f5ff]" />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container-lowest/95 border border-primary-fixed/30 px-2 py-0.5 rounded text-[10px] font-data-mono text-primary-fixed whitespace-nowrap shadow-lg">
                      {activeSat ? activeSat.name : "AETHER-1"} [LIVE]
                    </div>
                  </div>
                </div>
              </div>

              {/* Coordinates HUD Overlay */}
              <div className="absolute bottom-4 right-4 bg-surface-container-highest/90 backdrop-blur-md border border-primary/20 p-3 rounded font-data-mono text-[11px] flex gap-4 text-outline z-20 shadow-md">
                <div><span className="text-primary-fixed">LAT:</span> {activeSat ? activeSat.latitude.toFixed(2) : "45.23"}° N</div>
                <div><span className="text-primary-fixed">LON:</span> {activeSat ? activeSat.longitude.toFixed(2) : "12.87"}° E</div>
                <div><span className="text-primary-fixed">VEL:</span> {activeSat ? activeSat.velocity.toFixed(2) : "7.66"} km/s</div>
              </div>
            </div>

          </div>

          {/* Telemetry Sparklines Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Velocity Card */}
            <div className="glass-card rounded-lg p-5 flex flex-col justify-between h-[160px]">
              <div className="flex justify-between items-start">
                <h4 className="font-label-caps text-xs text-outline">VELOCITY (km/s)</h4>
                <span className="material-symbols-outlined text-outline text-lg">speed</span>
              </div>
              <div className="font-headline-md text-2xl text-primary font-data-mono drop-shadow-[0_0_10px_rgba(0,219,231,0.2)] mt-1">
                {activeSat ? activeSat.velocity.toFixed(2) : "7.66"}
              </div>
              <div className="h-10 w-full mt-2">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                  <path
                    d={generateSparkline(batteryData, 50, 100)}
                    fill="none"
                    stroke="#74f5ff"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>

            {/* Power Consumption Card */}
            <div className="glass-card rounded-lg p-5 flex flex-col justify-between h-[160px]">
              <div className="flex justify-between items-start">
                <h4 className="font-label-caps text-xs text-outline">PWR DRAW (W)</h4>
                <span className="material-symbols-outlined text-outline text-lg">bolt</span>
              </div>
              <div className="font-headline-md text-2xl text-primary font-data-mono drop-shadow-[0_0_10px_rgba(0,219,231,0.2)] mt-1">
                {activeSat ? parseFloat((14.2 + (activeSat.temp % 3) * 0.5).toFixed(1)) : "14.2"} W
              </div>
              <div className="h-10 w-full mt-2">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                  <path
                    d={generateSparkline(tempData, 10, 50)}
                    fill="none"
                    stroke="#ffb4ab"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>

            {/* Memory Buffer Card */}
            <div className="glass-card rounded-lg p-5 flex flex-col justify-between h-[160px]">
              <div className="flex justify-between items-start">
                <h4 className="font-label-caps text-xs text-outline">DATA BUFFER (%)</h4>
                <span className="material-symbols-outlined text-outline text-lg">memory</span>
              </div>
              <div className="font-headline-md text-2xl text-primary font-data-mono drop-shadow-[0_0_10px_rgba(0,219,231,0.2)] mt-1">
                {activeSat ? Math.floor(45 + (activeSat.longitude % 10) * 1.5) : "68"}%
              </div>
              <div className="h-10 w-full mt-2">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 200 60">
                  <path
                    d={generateAreaSparkline(signalData, -120, -60)}
                    fill="url(#cyan-gradient)"
                  />
                  <path
                    d={generateSparkline(signalData, -120, -60)}
                    fill="none"
                    stroke="#79ff5b"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </div>

          </div>

          {/* Bottom Row: Active Alerts & Command History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Active Alerts List */}
            <div className="glass-card rounded-lg p-6 flex flex-col h-[280px]">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
                <h3 className="font-label-caps text-xs text-outline flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">warning</span> ACTIVE SYSTEM ALERTS
                </h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-data-mono font-bold ${alerts.length > 0 ? "bg-error-container/30 text-error border border-error/20" : "bg-tertiary-fixed/15 text-tertiary-fixed border border-tertiary-fixed/20"}`}>
                  {alerts.length} ACTIVE
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-outline-variant py-8">
                    <span className="material-symbols-outlined text-[36px] text-outline/30 mb-2">verified</span>
                    <span className="font-label-caps text-[11px]">ALL SYSTEMS OPERATING NOMINALLY</span>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => onNavigate("alerts")}
                      className={`p-3 rounded border transition-all cursor-pointer flex gap-3 ${alert.level === "CRIT" ? "bg-error-container/10 border-error/30 hover:bg-error-container/20" : "bg-surface-container/40 border-primary/10 hover:bg-surface-container-high/50"}`}
                    >
                      <span className={`material-symbols-outlined shrink-0 mt-0.5 ${alert.level === "CRIT" ? "text-error" : "text-secondary-fixed"}`}>
                        {alert.level === "CRIT" ? "error" : "info"}
                      </span>
                      <div className="min-w-0">
                        <p className={`font-body-md text-xs font-semibold ${alert.level === "CRIT" ? "text-error-container" : "text-cyan-100"}`}>
                          {alert.satelliteName}: {alert.message}
                        </p>
                        <p className="font-data-mono text-[9px] text-outline mt-1 uppercase">
                          SYS: {alert.subsystem} // CODE: {alert.code}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Command History Panel */}
            <div className="glass-card rounded-lg p-6 flex flex-col h-[280px]">
              <div className="flex justify-between items-center mb-4 border-b border-outline-variant/20 pb-3">
                <h3 className="font-label-caps text-xs text-outline flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">terminal</span> RECENT UPLINK LOGS
                </h3>
                <span className="font-data-mono text-[9px] text-outline">SECURE TRANSLATIONS</span>
              </div>
              
              <div className="space-y-3.5 overflow-y-auto flex-1 pr-1 font-data-mono text-[11px]">
                {commands.map((cmd) => (
                  <div key={cmd.id} className="flex items-center justify-between border-b border-outline-variant/5 pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-sm ${cmd.status === "FAILED" ? "text-error" : "text-tertiary-fixed"}`}>
                        {cmd.status === "FAILED" ? "cancel" : "check_circle"}
                      </span>
                      <span className="text-outline w-16 shrink-0">
                        {new Date(cmd.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                      </span>
                      <span className="text-primary-fixed bg-primary-fixed/5 px-1.5 py-0.5 rounded border border-primary-fixed/20 text-[10px] font-bold">
                        {cmd.code}
                      </span>
                    </div>
                    <span className="text-outline-variant text-[10px] uppercase">
                      {cmd.operator.replace("usr-1", "OPERATOR")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: Analytics & Ops (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Orbital Parameters Card */}
          <div className="glass-card rounded-lg p-6">
            <h3 className="font-label-caps text-xs text-outline mb-4 uppercase tracking-widest border-b border-outline-variant/20 pb-2">
              ORBITAL PARAMETERS
            </h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
              <div>
                <p className="font-label-caps text-[9px] text-outline mb-1">APOGEE</p>
                <p className="font-data-mono text-primary text-base font-bold">{activeSat ? activeSat.apogee : 542} km</p>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline mb-1">PERIGEE</p>
                <p className="font-data-mono text-primary text-base font-bold">{activeSat ? activeSat.perigee : 518} km</p>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline mb-1">INCLINATION</p>
                <p className="font-data-mono text-primary text-base font-bold">{activeSat ? activeSat.inclination : 97.5}°</p>
              </div>
              <div>
                <p className="font-label-caps text-[9px] text-outline mb-1">PERIOD</p>
                <p className="font-data-mono text-primary text-base font-bold">{activeSat ? activeSat.period : 95.2} m</p>
              </div>
            </div>
            
            <div className="border-t border-primary/15 pt-4">
              <p className="font-label-caps text-[9px] text-outline mb-2 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">satellite_alt</span> NEXT AOS TRANSCEIVER
              </p>
              <div className="font-headline-md text-2xl text-primary-fixed flex items-baseline gap-2 font-data-mono font-bold">
                00:14:22
                <span className="font-data-mono text-[10px] text-outline font-normal">T-MINUS</span>
              </div>
            </div>
          </div>

          {/* AI Diagnostics Risk Gauge */}
          <div className="glass-card rounded-lg p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-fixed to-transparent opacity-60" />
            <h3 className="font-label-caps text-xs text-outline mb-4 flex items-center gap-2 border-b border-outline-variant/20 pb-2">
              <span className="material-symbols-outlined text-primary-fixed">smart_toy</span> COGNITIVE DIAGNOSTICS
            </h3>
            
            <div className="flex items-center gap-4 mb-5">
              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="42" stroke="rgba(255, 180, 171, 0.1)" strokeWidth="6" />
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="42"
                    stroke={riskScore > 50 ? "#ffb4ab" : "#00f2ff"}
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * riskScore) / 100}
                    strokeWidth="7"
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="text-center font-data-mono text-base font-bold">
                  {riskScore}%
                </div>
              </div>
              
              <div>
                <p className="font-label-caps text-[9px] text-outline">AI RISK FACTOR</p>
                <p className="font-body-md text-xs text-cyan-200 mt-0.5 leading-snug">
                  {riskScore > 50 ? "Elevated system degradation hazards flagged." : "Vitals nominal. Satellite orbiting inside healthy margins."}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-high/50 p-3 rounded text-xs border border-primary/10">
              <p className="font-data-mono text-[9px] text-primary-fixed mb-1 font-bold">RECOMMENDED COURSE</p>
              <p className="italic text-cyan-200-variant">"{riskAdvice}"</p>
            </div>
          </div>

          {/* Mission Objectives Tracker */}
          <div className="glass-card rounded-lg p-6">
            <h3 className="font-label-caps text-xs text-outline mb-4 border-b border-outline-variant/20 pb-2">
              MISSION TARGET STATUS
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-data-mono">
                  <span className="text-cyan-200">Scientific Payload Collection</span>
                  <span className="text-primary-fixed font-bold">78%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-primary-fixed w-[78%] shadow-[0_0_6px_#74f5ff]" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1 font-data-mono">
                  <span className="text-cyan-200">Surface Radar Terrain Mapping</span>
                  <span className="text-tertiary-fixed font-bold">45%</span>
                </div>
                <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary-fixed w-[45%] shadow-[0_0_6px_#79ff5b]" />
                </div>
              </div>
            </div>
          </div>

          {/* Fleet Status Summary Cards */}
          <div className="glass-card rounded-lg p-6 flex flex-col">
            <h3 className="font-label-caps text-xs text-outline mb-4 flex justify-between border-b border-outline-variant/20 pb-2">
              <span>FLEET COMM HANDOVERS</span>
              <span className="font-data-mono text-[10px] text-primary-fixed-dim">{satellites.length} NODES</span>
            </h3>
            
            <div className="space-y-3">
              {satellites.map((sat) => (
                <div
                  key={sat.id}
                  onClick={() => setActiveSatId(sat.id)}
                  className={`flex items-center justify-between p-2 rounded transition-colors cursor-pointer border ${activeSatId === sat.id ? "border-primary-fixed/30 bg-primary-fixed/5" : "border-transparent hover:bg-surface-container-high/40"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${sat.status === "NOMINAL" ? "bg-tertiary-fixed shadow-[0_0_5px_#79ff5b]" : sat.status === "WARNING" ? "bg-secondary-fixed shadow-[0_0_5px_#14d1ff]" : "bg-error shadow-[0_0_5px_#ffb4ab]"}`} />
                    <span className="font-data-mono text-sm font-semibold">{sat.name}</span>
                  </div>
                  <span className="font-label-caps text-[10px] text-outline uppercase">{sat.orbit.split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
