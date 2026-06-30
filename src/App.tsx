import React, { useState, useEffect } from "react";
import DashboardView from "./views/DashboardView";
import TelemetryView from "./views/TelemetryView";
import MissionControlView from "./views/MissionControlView";
import AlertsView from "./views/AlertsView";
import LogsView from "./views/LogsView";
import AnalyticsView from "./views/AnalyticsView";
import GroundStationView from "./views/GroundStationView";
import FleetView from "./views/FleetView";
import UsersView from "./views/UsersView";
import TanyaAiView from "./views/TanyaAiView";
import SettingsView from "./views/SettingsView";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedUser, setSelectedUser] = useState("LIPZX");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeSatId, setActiveSatId] = useState("aether-1");
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeStr, setTimeStr] = useState("");
  const [systemAlertCount, setSystemAlertCount] = useState(3);

  // UTC clock update
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTimeStr(d.toISOString().slice(11, 19) + " UTC");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simple Synthesizer Audio Feedback
  const playSound = (freq = 800, type: "sine" | "triangle" = "sine", duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored
    }
  };

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    playSound(1000, "sine", 0.05);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Support password gate or allow custom bypass for Developer
    if (password === "1234" || password === "developer" || password.trim() !== "") {
      playSound(1200, "triangle", 0.15);
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      playSound(300, "sine", 0.25);
      setLoginError("INVALID HANDSHAKE ACCESS SIGNATURE");
    }
  };

  const handleLogout = () => {
    playSound(400, "sine", 0.1);
    setIsLoggedIn(false);
    setPassword("");
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard Hub", icon: "dashboard" },
    { id: "telemetry", label: "Live Telemetry", icon: "insights" },
    { id: "mission-control", label: "Mission Control", icon: "satellite_alt" },
    { id: "alerts", label: "Active Alerts", icon: "warning", alertBadge: true },
    { id: "logs", label: "Mission Logs", icon: "receipt_long" },
    { id: "analytics", label: "Health Analytics", icon: "analytics" },
    { id: "ground-station", label: "Ground Station", icon: "settings_input_antenna" },
    { id: "fleet", label: "Fleet Command", icon: "hub" },
    { id: "users", label: "Security (IAM)", icon: "admin_panel_settings" },
    { id: "tanya-ai", label: "Tanya AI Assistant", icon: "psychology" },
    { id: "settings", label: "Mission Settings", icon: "settings" },
  ];

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-surface-container-lowest bg-grid-pattern text-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Retro visual accents */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00dbe7]/2 to-[#00dbe7]/5 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-fixed/5 rounded-full blur-3xl pointer-events-none" />

        {/* Login Form Card */}
        <div className="w-full max-w-md glass-card rounded-xl p-8 relative border-primary-fixed/20 animate-fade-in shadow-2xl">
          <div className="absolute top-0 right-0 border-t-2 border-r-2 border-primary-fixed w-6 h-6 mt-[-1px] mr-[-1px]" />
          <div className="absolute bottom-0 left-0 border-b-2 border-l-2 border-primary-fixed w-6 h-6 mb-[-1px] ml-[-1px]" />

          {/* Heading Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-surface-container border border-primary/25 rounded-lg mb-3 shadow-[0_0_15px_rgba(0,219,231,0.15)]">
              <span className="material-symbols-outlined text-[32px] text-primary animate-pulse">satellite_alt</span>
            </div>
            <h1 className="font-headline-lg text-xl tracking-widest text-primary font-bold uppercase glow-text">
              AETHER GATEWAY
            </h1>
            <p className="font-data-mono text-[9px] text-outline tracking-[0.2em] uppercase mt-1">
              CubeSat Ground Command // GS-ALPHA
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Operator select */}
            <div>
              <label className="block font-label-caps text-[9px] text-outline font-bold uppercase mb-1.5">
                OPERATOR PROFILE IDENTITY
              </label>
              <select
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                  playSound(800, "sine", 0.05);
                }}
                className="w-full bg-surface-container border border-outline-variant focus:border-primary-fixed focus:ring-0 text-cyan-100 font-label-caps text-xs px-3.5 py-2.5 rounded-sm cursor-pointer"
              >
                <option value="LIPZX">OPERATOR: LIPZX (CHIEF ENGINEER)</option>
                <option value="ARIF">OPERATOR: ARIF (AVIONICS SPECIALIST)</option>
                <option value="ZAKY">OPERATOR: ZAKY (ORBITAL TRACKER)</option>
              </select>
            </div>

            {/* Password input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block font-label-caps text-[9px] text-outline font-bold uppercase">
                  SECURITY KEYHANDSHAKE
                </label>
                <span className="text-[9px] font-data-mono text-outline-variant">(Hint: '1234')</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access credentials key..."
                className="w-full bg-surface-container border border-outline-variant focus:border-primary-fixed focus:ring-0 text-cyan-100 font-data-mono text-xs px-3.5 py-2.5 rounded-sm"
              />
            </div>

            {loginError && (
              <p className="font-data-mono text-[10px] text-error font-bold border border-error/25 bg-error/5 p-2 rounded text-center animate-pulse">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-primary-fixed text-[#002022] hover:shadow-[0_0_15px_rgba(116,245,255,0.5)] transition-all font-label-caps text-xs py-3 rounded-sm font-bold tracking-widest cursor-pointer mt-2 uppercase"
            >
              INITIALIZE COMMAND HANDSHAKE
            </button>
          </form>

          {/* Footnotes */}
          <div className="text-center mt-6 pt-4 border-t border-outline-variant/15 text-[8px] font-data-mono text-outline/50 uppercase">
            SECURE GROUND INTERFACE SYSTEM v2.4 // LEVEL L5 CLEARANCE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-cyan-100 flex overflow-hidden font-sans">
      
      {/* Sidebar navigation (Left panel) */}
      <aside className="w-64 bg-surface-container border-r border-outline-variant/30 flex flex-col shrink-0">
        
        {/* Logo brand */}
        <div className="p-4 border-b border-outline-variant/30 flex items-center gap-3 bg-surface-container-lowest/50 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-surface-container border border-primary/25 flex items-center justify-center shadow-[0_0_8px_rgba(0,219,231,0.1)]">
            <span className="material-symbols-outlined text-primary text-lg">satellite_alt</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-xs font-bold text-primary tracking-widest leading-none glow-text">
              AETHER-OS
            </h1>
            <span className="font-data-mono text-[8px] text-outline tracking-wider uppercase mt-1 block">
              MISSION COMMAND GROUND
            </span>
          </div>
        </div>

        {/* Tab Links list */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-sm transition-all text-left font-label-caps text-[10px] uppercase font-bold cursor-pointer border ${isActive ? "bg-primary-fixed/5 border-primary-fixed/20 text-primary-fixed shadow-[inset_0_0_8px_rgba(0,219,231,0.05)]" : "border-transparent text-outline hover:text-cyan-100 hover:bg-surface-container-high/30"}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`material-symbols-outlined text-[16px] ${isActive ? "text-primary-fixed" : "text-outline"}`}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>

                {tab.alertBadge && (
                  <span className="w-2 h-2 rounded-full bg-error shadow-[0_0_5px_#ffb4ab] animate-pulse-critical" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer operator info */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/40 space-y-3 text-xs shrink-0 font-data-mono">
          <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed shadow-[0_0_5px_#79ff5b] animate-pulse" />
              <span className="text-[10px] text-outline uppercase font-bold">GS LINK: OK</span>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playSound(1200, "sine", 0.05);
              }}
              className="text-outline hover:text-primary-fixed transition-colors flex items-center justify-center p-0.5 rounded cursor-pointer"
              title={soundEnabled ? "Mute audio diagnostics" : "Enable audio diagnostics"}
            >
              <span className="material-symbols-outlined text-[14px]">
                {soundEnabled ? "volume_up" : "volume_off"}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-surface-container border border-outline-variant/30 flex items-center justify-center text-primary font-bold text-[10px]">
              {selectedUser.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-[9px] text-outline font-bold uppercase leading-none">OPERATOR</p>
              <p className="text-[11px] text-primary-fixed-dim font-bold truncate mt-1">Lt. {selectedUser}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-center py-1.5 border border-outline-variant/50 hover:border-error/40 hover:text-error rounded-sm text-[9px] font-bold tracking-widest uppercase transition-all cursor-pointer"
          >
            DISCONNECT LINK
          </button>
        </div>

      </aside>

      {/* Main Workspace (Right panel) */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-container-lowest/30 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
        
        {/* Global topbar header */}
        <header className="h-14 bg-surface-container/60 border-b border-outline-variant/20 px-6 flex items-center justify-between relative shrink-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-6">
            <span className="font-data-mono text-[10px] text-outline font-bold tracking-wider hidden sm:block">
              STATION_STATUS: <span className="text-tertiary-fixed">NOMINAL_99%</span>
            </span>

            {/* Active satellite badge */}
            <div className="flex items-center gap-2 text-xs font-data-mono bg-surface-container-lowest border border-primary/15 rounded px-2.5 py-1">
              <span className="text-[10px] text-outline font-bold">LOCK_NODE:</span>
              <span className="text-primary-fixed font-bold uppercase">{activeSatId}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Clock display */}
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded px-3 py-1 font-data-mono text-xs text-primary-fixed font-bold tracking-widest shadow-inner">
              {timeStr || "00:00:00 UTC"}
            </div>
          </div>
        </header>

        {/* Central Workspace display with padding */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 relative z-10">
          
          {/* Main conditional tab routing */}
          {currentTab === "dashboard" && (
            <DashboardView
              activeSatId={activeSatId}
              setActiveSatId={setActiveSatId}
              onNavigate={handleTabChange}
            />
          )}
          {currentTab === "telemetry" && (
            <TelemetryView
              activeSatId={activeSatId}
              setActiveSatId={setActiveSatId}
            />
          )}
          {currentTab === "mission-control" && (
            <MissionControlView
              activeSatId={activeSatId}
              setActiveSatId={setActiveSatId}
            />
          )}
          {currentTab === "alerts" && <AlertsView activeSatId={activeSatId} />}
          {currentTab === "logs" && <LogsView />}
          {currentTab === "analytics" && <AnalyticsView activeSatId={activeSatId} />}
          {currentTab === "ground-station" && <GroundStationView activeSatId={activeSatId} />}
          {currentTab === "fleet" && <FleetView activeSatId={activeSatId} setActiveSatId={setActiveSatId} />}
          {currentTab === "users" && <UsersView />}
          {currentTab === "tanya-ai" && <TanyaAiView />}
          {currentTab === "settings" && <SettingsView />}

        </div>

      </main>

    </div>
  );
}
