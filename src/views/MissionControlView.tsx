import React, { useEffect, useState } from "react";
import { Satellite, Command, MissionLog } from "../types";
import { getSatellites, getCommands, sendCommand, getLogs } from "../api";

interface MissionControlViewProps {
  activeSatId: string;
  setActiveSatId: (id: string) => void;
}

export default function MissionControlView({ activeSatId, setActiveSatId }: MissionControlViewProps) {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [commands, setCommands] = useState<Command[]>([]);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [showSafeModeModal, setShowSafeModeModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [twoFactorError, setTwoFactorError] = useState("");
  const [isExecuting, setIsExecuting] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const sats = await getSatellites();
        const cmds = await getCommands();
        const logsData = await getLogs();
        if (!active) return;
        setSatellites(sats);
        setCommands(cmds);
        setLogs(logsData.slice(0, 15));
      } catch (err) {
        console.error("Mission Control failed to poll backend stats:", err);
      }
    }

    loadData();
    const interval = setInterval(loadData, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const activeSat = satellites.find(s => s.id === activeSatId) || satellites[0];

  const handleUplink = async (code: string) => {
    if (!activeSat) return;
    setIsExecuting(code);
    try {
      await sendCommand(activeSat.id, code, "CHIEF_MISSION_ENG");
      const updatedCmds = await getCommands();
      const updatedLogs = await getLogs();
      setCommands(updatedCmds);
      setLogs(updatedLogs.slice(0, 15));
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsExecuting(null), 1000);
  };

  const handleSafeModeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorCode !== "1234") {
      setTwoFactorError("INVALID SECONDARY AUTHORIZATION CODE");
      return;
    }
    if (!activeSat) return;

    setTwoFactorError("");
    setTwoFactorCode("");
    setShowSafeModeModal(false);

    setIsExecuting("SAFE_MODE");
    try {
      await sendCommand(activeSat.id, "SAFE_MODE", "CHIEF_MISSION_ENG");
      const updatedCmds = await getCommands();
      const updatedLogs = await getLogs();
      setCommands(updatedCmds);
      setLogs(updatedLogs.slice(0, 15));
      const updatedSats = await getSatellites();
      setSatellites(updatedSats);
    } catch (err) {
      console.error(err);
    }
    setTimeout(() => setIsExecuting(null), 1000);
  };

  const handleResetSimulation = async () => {
    if (!confirm("Are you sure you want to completely RESET the telemetry simulation, commands list, active alarms, and restore default parameters?")) return;
    setIsExecuting("RESET_SIMULATION");
    try {
      await sendCommand(activeSat?.id || "aether-1", "RESET_SIMULATION", "CHIEF_MISSION_ENG");
      const updatedCmds = await getCommands();
      const updatedLogs = await getLogs();
      setCommands(updatedCmds);
      setLogs(updatedLogs.slice(0, 15));
      const updatedSats = await getSatellites();
      setSatellites(updatedSats);
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => setIsExecuting(null), 1000);
  };

  return (
    <div id="mission-control-view" className="flex flex-col gap-6 animate-fade-in relative">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-md text-2xl md:text-3xl text-primary flex items-center gap-3">
            <span className="w-2.5 h-6 bg-primary-fixed inline-block rounded-full shadow-[0_0_12px_rgba(116,245,255,0.8)]" />
            Command Authority & Mission Operations
          </h1>
          <p className="font-data-mono text-xs text-outline mt-1.5 uppercase">
            UPLINK FREQUENCY: <span className="text-primary-fixed">2250.500 MHz</span> // ENCRYPTED STATUS: NOMINAL
          </p>
        </div>
        
        {/* Rapid Stats summary */}
        <div className="flex gap-3 text-xs">
          <div className="bg-surface-container-lowest/80 border border-primary/15 rounded-lg px-4 py-2 flex flex-col shadow-md">
            <span className="font-label-caps text-[9px] text-outline mb-0.5">Uplinked Count</span>
            <span className="font-data-mono text-primary-fixed text-sm font-bold">{commands.length}</span>
          </div>
          <div className="bg-surface-container-lowest/80 border border-primary/15 rounded-lg px-4 py-2 flex flex-col shadow-md">
            <span className="font-label-caps text-[9px] text-outline mb-0.5">Uplink Success</span>
            <span className="font-data-mono text-tertiary-fixed text-sm font-bold">
              {commands.length > 0 ? ((commands.filter(c => c.status !== "FAILED").length / commands.length) * 100).toFixed(1) : "100"}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Controls & Console (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* Executive commands panel */}
          <section className="bg-surface-container-lowest/80 border border-primary/15 rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-4 right-4 flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary-fixed opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary-fixed" />
            </div>
            
            <h2 className="font-label-caps text-xs text-secondary-fixed mb-5 flex items-center gap-2 border-b border-outline-variant/10 pb-2">
              <span className="material-symbols-outlined text-[16px]">grid_view</span> MISSION CRITICAL UPLINK DECK
            </h2>

            {/* Target Selector */}
            <div className="flex items-center gap-3 bg-surface-container/60 border border-outline-variant/20 px-3 py-2 rounded mb-6 text-xs">
              <span className="font-label-caps text-[9px] text-outline">SELECT DESTINATION SATELLITE:</span>
              <div className="flex gap-2">
                {satellites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSatId(s.id)}
                    className={`px-3 py-1 font-data-mono text-xs rounded border transition-all cursor-pointer ${activeSatId === s.id ? "bg-primary-fixed/20 border-primary-fixed text-primary-fixed" : "border-outline-variant/50 text-outline hover:border-primary-fixed/30 hover:text-cyan-100"}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              {/* Ping command */}
              <button
                onClick={() => handleUplink("SYS_PING_INIT")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-primary-fixed/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(0,219,231,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-fixed/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary-fixed text-lg">wifi</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-green-300 mb-0.5 group-hover:text-primary-fixed transition-colors font-bold">Transmit Ping</div>
                  <div className="font-data-mono text-[9px] text-outline">SYS_PING_INIT // LATENCY CHECK</div>
                </div>
              </button>

              {/* Request Telemetry */}
              <button
                onClick={() => handleUplink("REQ_TELEMETRY_BLOCK_A")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-primary-fixed/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(0,219,231,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-fixed/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary-fixed text-lg">download</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-green-300 mb-0.5 group-hover:text-primary-fixed transition-colors font-bold">Request Logs Block</div>
                  <div className="font-data-mono text-[9px] text-outline">REQ_TELEMETRY_BLOCK_A // FLUSH DB</div>
                </div>
              </button>

              {/* Align star-trackers */}
              <button
                onClick={() => handleUplink("CMD_ACS_STAB")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-primary-fixed/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(0,219,231,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-fixed/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary-fixed text-lg">explore</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-green-300 mb-0.5 group-hover:text-primary-fixed transition-colors font-bold">Stab Orientation</div>
                  <div className="font-data-mono text-[9px] text-outline">CMD_ACS_STAB // CALIBRATE ADCS</div>
                </div>
              </button>

              {/* Power On Payload */}
              <button
                onClick={() => handleUplink("CMD_PAYLOAD_ON")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-secondary-container/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(20,209,255,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-secondary-container/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary-container text-lg">videocam</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-green-300 mb-0.5 group-hover:text-secondary-container transition-colors font-bold">Initialize Payload</div>
                  <div className="font-data-mono text-[9px] text-outline">CMD_PAYLOAD_ON // INT_CAMERA</div>
                </div>
              </button>

              {/* Power Off Payload */}
              <button
                onClick={() => handleUplink("CMD_PAYLOAD_OFF")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-secondary-container/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(20,209,255,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-secondary-container/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary-container text-lg">videocam_off</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-cyan-100 mb-0.5 group-hover:text-secondary-container transition-colors font-bold">Disable Payload</div>
                  <div className="font-data-mono text-[9px] text-outline">CMD_PAYLOAD_OFF // COLD_STANDBY</div>
                </div>
              </button>

              {/* Link est */}
              <button
                onClick={() => handleUplink("CMD_LINK_EST")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-tertiary-fixed/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(121,255,91,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-tertiary-fixed/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-tertiary-fixed text-lg">sensors</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm  mb-0.5 group-hover:text-tertiary-fixed transition-colors font-bold">Secure Downlink</div>
                  <div className="font-data-mono text-[9px] text-outline">CMD_LINK_EST // S_BAND_SECURE</div>
                </div>
              </button>

              {/* Heater off */}
              <button
                onClick={() => handleUplink("CMD_HTR_OFF")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-primary-fixed/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(0,219,231,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-fixed/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary-fixed text-lg">device_thermostat</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-on-surface mb-0.5 group-hover:text-primary-fixed transition-colors font-bold">Heater Deactivate</div>
                  <div className="font-data-mono text-[9px] text-outline">CMD_HTR_OFF // THERMAL_COOL</div>
                </div>
              </button>

              {/* Heater on */}
              <button
                onClick={() => handleUplink("CMD_HTR_ON")}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container border border-outline-variant hover:border-primary-fixed/50 rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_10px_rgba(0,219,231,0.2)]"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-primary-fixed/20 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary-fixed text-lg">thermostat</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-on-surface mb-0.5 group-hover:text-primary-fixed transition-colors font-bold">Heater Activate</div>
                  <div className="font-data-mono text-[9px] text-outline">CMD_HTR_ON // THERMAL_WARM</div>
                </div>
              </button>

              {/* Trigger simulation reset */}
              <button
                onClick={handleResetSimulation}
                disabled={isExecuting !== null}
                className="group relative bg-surface-container-high/40 border border-outline-variant hover:border-outline rounded p-4 flex flex-col items-start gap-3 transition-all cursor-pointer text-left"
              >
                <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <span className="material-symbols-outlined text-outline group-hover:text-white text-lg">restart_alt</span>
                </div>
                <div>
                  <div className="font-headline-sm text-sm text-on-surface mb-0.5 group-hover:text-white transition-colors font-bold">Reset Simulation</div>
                  <div className="font-data-mono text-[9px] text-outline">RESET_SIMULATION // RESTORE STATE</div>
                </div>
              </button>

              {/* Safe Mode critical link trigger */}
              <button
                onClick={() => setShowSafeModeModal(true)}
                disabled={isExecuting !== null}
                className="group relative sm:col-span-2 bg-error-container/10 border border-error/30 hover:border-error hover:bg-error-container/20 rounded p-4 flex items-center justify-between gap-3 transition-all cursor-pointer text-left hover:shadow-[0_0_20px_rgba(255,180,171,0.15)]"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-error font-bold">warning</span>
                  </div>
                  <div>
                    <div className="font-headline-sm text-sm text-error font-bold mb-0.5">Activate Emergency Safe Mode</div>
                    <div className="font-data-mono text-[9px] text-error/70">SAFE_MODE // HALT NON-ESSENTIALS</div>
                  </div>
                </div>
                <div className="hidden sm:flex px-4 py-2 bg-error text-on-error font-label-caps text-[10px] rounded hover:shadow-[0_0_12px_rgba(255,180,171,0.5)] transition-all items-center gap-1">
                  INITIATE <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </div>
              </button>

            </div>
          </section>

          {/* Real-time terminal output readout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <section className="col-span-12 md:col-span-12 bg-surface-container-highest/90 border border-outline-variant rounded-xl flex flex-col overflow-hidden h-[380px]">
              
              <div className="bg-surface-container-lowest px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="font-label-caps text-xs text-secondary-fixed flex items-center gap-2 font-bold">
                  <span className="material-symbols-outlined text-[16px]">terminal</span> LIVE SPACE-TRANSMISSION CODES (OBDH)
                </div>
                <span className="font-data-mono text-[9px] text-outline">LOCK: SECURE</span>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto font-data-mono text-cyan-300 flex flex-col gap-2 text-xs leading-relaxed scrollbar-hide">
                <div className="text-outline border-b border-outline-variant/15 pb-2 mb-1">
                  Uplink communication matrix secure. Reading telemetry frames...
                </div>
                
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2.5 items-start">
                    <span className="text-outline w-20 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-widest shrink-0 ${log.level === "CRIT" ? "bg-error/15 text-error" : log.level === "WARN" ? "bg-secondary-fixed-dim/20 text-secondary-fixed-dim" : "bg-tertiary-fixed/15 text-tertiary-fixed"}`}>
                      {log.level}
                    </span>
                    <span className="text-outline shrink-0 font-bold">&gt;</span>
                    <span className="text-cyan-200 font-semibold">{log.message}</span>
                  </div>
                ))}
                
                <div className="mt-2 text-primary-fixed-dim animate-pulse border-l-2 border-primary-fixed pl-2">
                  Awaiting secondary transponder packet... _
                </div>
              </div>

            </section>
          </div>

        </div>

        {/* RIGHT COLUMN: Static telemetry details HUD (4 cols) */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          
          <div className="bg-surface-container-lowest/80 border border-primary/15 rounded-xl shadow-lg overflow-hidden">
            <div className="p-5 border-b border-primary/10">
              <span className="font-label-caps text-[9px] text-outline uppercase block mb-1">Satellite State</span>
              <div className="flex items-end justify-between">
                <span className="font-headline-md text-xl text-primary font-bold">{activeSat?.status === "NOMINAL" ? "NOMINAL" : "ALERT STATE"}</span>
                <span className={`px-2 py-0.5 rounded font-label-caps text-[9px] flex items-center gap-1 border ${activeSat?.status === "NOMINAL" ? "bg-tertiary-fixed/10 border-tertiary-fixed/40 text-tertiary-fixed" : "bg-error/10 border-error/40 text-error animate-pulse"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${activeSat?.status === "NOMINAL" ? "bg-tertiary-fixed" : "bg-error"}`} />
                  {activeSat?.status === "NOMINAL" ? "ACTIVE" : "EXCPT"}
                </span>
              </div>
              <p className="font-data-mono text-[10px] text-secondary-fixed mt-2">MODE: {activeSat?.mode || "SCIENCE_OPS"}</p>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs font-data-mono">
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <span className="text-outline">Power Bus:</span>
                <span className="text-cyan-200 font-bold">14.2 V</span>
              </div>
              <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
                <span className="text-outline">Satellite Temp:</span>
                <span className="text-cyan-200 font-bold">{activeSat ? activeSat.temp : "22.1"}°C</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-outline">Battery Remaining:</span>
                <span className={`font-bold ${activeSat && activeSat.battery < 20 ? "text-error" : "text-tertiary-fixed"}`}>
                  {activeSat ? activeSat.battery : "92.4"}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest/80 border border-secondary-fixed/20 rounded-xl p-5 shadow-lg flex flex-col gap-3 font-data-mono text-xs">
            <h3 className="font-label-caps text-[10px] text-secondary-fixed flex items-center gap-1.5 border-b border-outline-variant/10 pb-2 font-bold">
              <span className="material-symbols-outlined text-sm">schedule</span> COMMS PASS OPPORTUNITY
            </h3>
            <div className="flex justify-between items-center">
              <span className="text-outline">Next AOS:</span>
              <span className="text-primary-fixed font-bold">+00:14:22 <span className="text-[9px] text-outline font-normal">(GS-ALPHA)</span></span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-outline">Duration window:</span>
              <span className="text-cyan-200">12m 40s</span>
            </div>
            <div className="flex justify-between items-center text-secondary-fixed">
              <span className="text-outline">S-Band Antenna Status:</span>
              <span className="flex items-center gap-1 font-bold animate-pulse">
                <span className="material-symbols-outlined text-[15px]">sensors</span> ACQUIRING...
              </span>
            </div>
          </div>

          {/* AI recommendations */}
          <div className="bg-primary-container/5 border border-primary-fixed/30 rounded-xl p-5 flex flex-col gap-3 shadow-md">
            <h3 className="font-label-caps text-[10px] text-primary-fixed flex items-center gap-1.5 border-b border-primary-fixed/15 pb-2 font-bold">
              <span className="material-symbols-outlined text-[16px]">psychology</span> COGNITIVE UPLINK SUGGESTION
            </h3>
            <div>
              <p className="font-label-caps text-[9px] text-cyan-200 mb-0.5">SUGGESTED PILOT ACTION</p>
              <p className="font-headline-sm text-sm text-cyan-200 font-bold">Initiate Spacecraft Attitude Stabilization</p>
            </div>
            <div>
              <p className="font-label-caps text-[9px] text-cyan-200 mb-0.5">PROACTIVE REASONING</p>
              <p className="italic text-cyan-200 text-[11px] leading-relaxed">
                "ADCS sensor drift detected on polar axis loop. Calibrating gyros prior to Ground Station Beta handover prevents pointing errors."
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-primary-fixed/15 pt-3 mt-1">
              <span className="text-tertiary-fixed text-[10px] font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">shield</span> RISK: MINIMAL
              </span>
              <button
                onClick={() => handleUplink("CMD_ACS_STAB")}
                className="bg-primary-fixed/20 hover:bg-primary-fixed hover:text-on-primary-fixed border border-primary-fixed/50 text-primary-fixed text-[10px] font-label-caps py-1.5 px-3 rounded-sm transition-colors cursor-pointer"
              >
                EXECUTE ACTION
              </button>
            </div>
          </div>

        </aside>

      </div>

      {/* Safe Mode Authorization Modal popup */}
      {showSafeModeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={() => setShowSafeModeModal(false)} />
          <div className="relative bg-surface-container-highest border-2 border-error shadow-[0_0_5px_#ffb4ab] rounded-xl w-full max-w-lg p-8 flex flex-col gap-5 overflow-hidden z-10 animate-fade-in">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-error animate-pulse" />
            
            <div className="flex items-center gap-4 border-b border-outline-variant pb-4">
              <div className="w-12 h-12 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error text-[28px]">warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-lg text-error font-bold">EMERGENCY SAFE_MODE OVERRIDE</h3>
                <p className="font-label-caps text-[10px] text-outline tracking-wider mt-0.5">2-FA PROTOCOL REQUIRED</p>
              </div>
            </div>

            <p className="text-sm text-cyan-200 leading-relaxed">
              You are authorizing the emergency shutdown payload. This will halt all non-essential scientific instruments, lock gyros into Sun-Point alignment, and reduce radio signals to beacon status.
            </p>

            <form onSubmit={handleSafeModeSubmit} className="space-y-4">
              <div className="bg-surface-container p-4 rounded border border-error/30 text-center">
                <span className="font-data-mono text-error/80 uppercase tracking-widest text-[11px] font-bold block mb-2">
                  Operator Authorization Pin Code
                </span>
                <input
                  type="password"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="ENTER 2-FA OPERATOR CODE (use '1234')"
                  className="bg-background border border-outline-variant/50 rounded px-3 py-2 font-data-mono text-cyan-200 text-center tracking-[0.2em] outline-none focus:border-error focus:ring-1 focus:ring-error w-full max-w-[280px]"
                />
                {twoFactorError && <p className="text-error font-data-mono text-[9px] mt-2 font-bold tracking-wider">{twoFactorError}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowSafeModeModal(false); setTwoFactorError(""); }}
                  className="px-5 py-2 border border-outline-variant text-cyan-200 rounded hover:bg-surface-container font-label-caps text-xs cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-error text-on-error rounded hover:bg-error/95 font-label-caps text-xs font-bold cursor-pointer"
                >
                  CONFIRM OVERRIDE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
