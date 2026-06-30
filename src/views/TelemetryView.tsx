import React, { useEffect, useState } from "react";
import { Satellite, Telemetry } from "../types";
import { getSatellites, getTelemetry } from "../api";

interface TelemetryViewProps {
  activeSatId: string;
  setActiveSatId: (id: string) => void;
}

export default function TelemetryView({ activeSatId, setActiveSatId }: TelemetryViewProps) {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [history, setHistory] = useState<Telemetry[]>([]);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [chartRange, setChartRange] = useState("1H");

  useEffect(() => {
    let active = true;

    async function fetchSats() {
      try {
        const sats = await getSatellites();
        if (!active) return;
        setSatellites(sats);
      } catch (err) {
        console.error("Telemetry view failed to load satellites:", err);
      }
    }

    async function fetchVitals() {
      try {
        const data = await getTelemetry(activeSatId);
        if (!active) return;
        setHistory(data);
      } catch (err) {
        console.error("Telemetry view failed to load history:", err);
      }
    }

    fetchSats();
    fetchVitals();

    const timer = setInterval(() => {
      fetchSats();
      fetchVitals();
    }, 4000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [activeSatId]);

  const activeSat = satellites.find(s => s.id === activeSatId) || satellites[0];

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telemetry_${activeSatId}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 2000);
  };

  // Sparkline builder helpers
  const buildSvgPath = (values: number[], min: number, max: number, width = 300, height = 120) => {
    if (values.length === 0) return `M 0 ${height / 2} L ${width} ${height / 2}`;
    const range = max - min || 1;
    const points = values.map((v, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const buildSvgAreaPath = (values: number[], min: number, max: number, width = 300, height = 120) => {
    if (values.length === 0) return `M 0 ${height} L ${width} ${height}`;
    const range = max - min || 1;
    const points = values.map((v, idx) => {
      const x = (idx / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * (height - 20) - 10;
      return `${x},${y}`;
    });
    return `M 0 ${height} L ${points.join(" L ")} L ${width} ${height} Z`;
  };

  return (
    <div id="telemetry-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            Live Telemetry Stream
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse shadow-[0_0_8px_rgba(121,255,91,0.8)]" />
              <span className="font-label-caps text-[10px] text-tertiary-fixed tracking-widest uppercase">LIVE SENSOR TELEMETRY</span>
            </div>
            <span className="text-outline text-xs">•</span>
            <span className="font-data-mono text-[11px] text-outline">Polling session interval: 4.0s</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Satellite Selection Selector */}
          <div className="flex items-center gap-2 bg-surface-container-high/50 border border-primary/20 px-3 py-1.5 rounded-sm">
            <span className="font-label-caps text-[9px] text-outline">TARGET:</span>
            <select
              value={activeSatId}
              onChange={(e) => setActiveSatId(e.target.value)}
              className="bg-transparent border-none outline-none font-label-caps text-xs text-primary-fixed focus:ring-0 cursor-pointer p-0"
            >
              {satellites.map((s) => (
                <option key={s.id} value={s.id} className="bg-surface-container-highest text-cyan-100">
                  {s.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExport}
            className={`flex items-center gap-2 bg-transparent border px-4 py-1.5 rounded-sm font-label-caps text-xs tracking-widest cursor-pointer hover:bg-primary-fixed/10 transition-colors ${exportSuccess ? "border-tertiary-fixed text-tertiary-fixed bg-tertiary-fixed/5" : "border-primary-fixed text-primary-fixed"}`}
          >
            <span className="material-symbols-outlined text-sm">download</span>
            {exportSuccess ? "EXPORT COMPLETE" : "EXPORT JSON LOG"}
          </button>

          <div className="flex gap-1 font-data-mono text-xs">
            {["1H", "6H", "24H"].map((range) => (
              <button
                key={range}
                onClick={() => setChartRange(range)}
                className={`px-3 py-1 border rounded-sm cursor-pointer transition-colors ${chartRange === range ? "bg-primary-fixed/20 border-primary-fixed/50 text-primary-fixed" : "border-transparent text-outline hover:bg-surface-container"}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subsystem status pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2 bg-surface-container-lowest/40 border-y border-outline-variant/10 px-4 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-outline text-[10px]">EPS STATE:</span>
          <span className={`bg-tertiary-fixed/10 text-tertiary-fixed border border-tertiary-fixed/30 px-2 py-0.5 rounded text-[10px] font-bold ${activeSat?.battery < 20 ? "bg-error-container/20 text-error border-error/30" : ""}`}>
            {activeSat ? (activeSat.battery < 20 ? "CRITICAL" : "NOMINAL") : "NOMINAL"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-outline text-[10px]">THERMAL:</span>
          <span className="bg-tertiary-fixed/10 text-tertiary-fixed border border-tertiary-fixed/30 px-2 py-0.5 rounded text-[10px] font-bold">
            {activeSat ? (activeSat.temp > 40 ? "WARN" : "NOMINAL") : "NOMINAL"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-outline text-[10px]">SIG SNR:</span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeSat && activeSat.signal < -110 ? "bg-error-container/20 text-error border border-error/30" : "bg-tertiary-fixed/10 text-tertiary-fixed border border-tertiary-fixed/30"}`}>
            {activeSat ? (activeSat.signal < -110 ? "DEGRADED" : "NOMINAL") : "NOMINAL"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-caps text-outline text-[10px]">ADCS LOCK:</span>
          <span className="bg-primary-container/20 text-primary-fixed border border-primary/20 px-2 py-0.5 rounded text-[10px] font-bold">
            STABLE
          </span>
        </div>
      </div>

      {/* Main Charts Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Battery Level Chart */}
        <div className="glass-card rounded-lg p-5 flex flex-col h-[260px] relative overflow-hidden">
          <div className="absolute top-4 right-4 w-2 h-2 bg-tertiary-fixed rounded-full shadow-[0_0_5px_#79ff5b] animate-pulse" />
          <div className="flex justify-between items-center mb-3 border-b border-outline-variant/20 pb-2">
            <h3 className="font-label-caps text-xs text-outline tracking-wider">EPS BATTERY STABILITY (%)</h3>
            <span className="font-data-mono text-base font-bold text-primary-fixed">{activeSat ? activeSat.battery.toFixed(1) : "92.4"}%</span>
          </div>
          <div className="flex-1 w-full h-full relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 120">
              <path
                d={buildSvgAreaPath(history.map(h => h.battery), 0, 100, 300, 120)}
                fill="url(#cyan-gradient)"
              />
              <path
                d={buildSvgPath(history.map(h => h.battery), 0, 100, 300, 120)}
                fill="none"
                stroke="#00f2ff"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Temperature Thermal Chart */}
        <div className="glass-card rounded-lg p-5 flex flex-col h-[260px] relative overflow-hidden">
          <div className="absolute top-4 right-4 w-2 h-2 bg-tertiary-fixed rounded-full shadow-[0_0_5px_#79ff5b]" />
          <div className="flex justify-between items-center mb-3 border-b border-outline-variant/20 pb-2">
            <h3 className="font-label-caps text-xs text-outline tracking-wider">THERMAL CORE (°C)</h3>
            <span className="font-data-mono text-base font-bold text-secondary">{activeSat ? activeSat.temp.toFixed(1) : "22.1"}°C</span>
          </div>
          <div className="flex-1 w-full h-full relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 120">
              <path
                d={buildSvgPath(history.map(h => h.temp), -10, 60, 300, 120)}
                fill="none"
                stroke="#a6e6ff"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Signal SNR Chart */}
        <div className="glass-card rounded-lg p-5 flex flex-col h-[260px] relative overflow-hidden">
          <div className="absolute top-4 right-4 w-2 h-2 bg-tertiary-fixed rounded-full shadow-[0_0_5px_#79ff5b] animate-pulse" />
          <div className="flex justify-between items-center mb-3 border-b border-outline-variant/20 pb-2">
            <h3 className="font-label-caps text-xs text-outline tracking-wider">SIGNAL LEVEL (dBm)</h3>
            <span className="font-data-mono text-base font-bold text-tertiary-fixed">{activeSat ? activeSat.signal : "-110"} dBm</span>
          </div>
          <div className="flex-1 w-full h-full relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 300 120">
              <path
                d={buildSvgAreaPath(history.map(h => h.signal), -140, -50, 300, 120)}
                fill="url(#cyan-gradient)"
                opacity="0.15"
              />
              <path
                d={buildSvgPath(history.map(h => h.signal), -140, -50, 300, 120)}
                fill="none"
                stroke="#79ff5b"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* Speed & Altitude Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Altitude trend */}
        <div className="md:col-span-6 glass-card rounded-lg p-5 flex flex-col h-[240px]">
          <div className="flex justify-between items-center mb-3 border-b border-outline-variant/20 pb-2">
            <h3 className="font-label-caps text-xs text-outline tracking-wider">ALTITUDE PROFILE (km)</h3>
            <span className="font-data-mono text-base font-bold text-primary-fixed">{activeSat ? activeSat.altitude.toFixed(1) : "525"} km</span>
          </div>
          <div className="flex-1 w-full h-full relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
              <path
                d={buildSvgPath(history.map(h => h.altitude), 500, 560, 400, 100)}
                fill="none"
                stroke="#00dbe7"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

        {/* Velocity trend */}
        <div className="md:col-span-6 glass-card rounded-lg p-5 flex flex-col h-[240px]">
          <div className="flex justify-between items-center mb-3 border-b border-outline-variant/20 pb-2">
            <h3 className="font-label-caps text-xs text-outline tracking-wider">VELOCITY TRACKING (km/s)</h3>
            <span className="font-data-mono text-base font-bold text-secondary-container">{activeSat ? activeSat.velocity.toFixed(2) : "7.66"} km/s</span>
          </div>
          <div className="flex-1 w-full h-full relative">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
              <path
                d={buildSvgPath(history.map(h => h.velocity), 7.4, 7.8, 400, 100)}
                fill="none"
                stroke="#ff4cd6"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* Orientation Attitude & Sensor Matrix Table */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Spacecraft Attitude Roll/Pitch/Yaw HUD */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[260px]">
          <h3 className="font-label-caps text-xs text-outline mb-4 border-b border-outline-variant/20 pb-2 uppercase tracking-widest">
            ADCS ATTITUDE ADJUSTMENTS
          </h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            <div>
              <div className="flex justify-between font-data-mono text-xs mb-1">
                <span className="text-outline">PITCH</span>
                <span className="text-primary-fixed font-bold">{activeSat ? (activeSat.pitch > 0 ? "+" : "") + activeSat.pitch : "+12.4"}°</span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden w-full relative">
                <div
                  className="absolute h-full bg-primary-container shadow-[0_0_6px_#00f2ff] transition-all duration-500 rounded-full"
                  style={{ left: "50%", width: `${Math.min(50, Math.max(5, Math.abs(activeSat ? activeSat.pitch : 12.4) * 2))}%`, transform: (activeSat ? activeSat.pitch : 12.4) < 0 ? "translateX(-100%)" : "none" }}
                />
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-outline z-10" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-data-mono text-xs mb-1">
                <span className="text-outline">ROLL</span>
                <span className="text-secondary font-bold">{activeSat ? (activeSat.roll > 0 ? "+" : "") + activeSat.roll : "-3.2"}°</span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden w-full relative">
                <div
                  className="absolute h-full bg-secondary-container shadow-[0_0_6px_#14d1ff] transition-all duration-500 rounded-full"
                  style={{ left: "50%", width: `${Math.min(50, Math.max(5, Math.abs(activeSat ? activeSat.roll : -3.2) * 2))}%`, transform: (activeSat ? activeSat.roll : -3.2) < 0 ? "translateX(-100%)" : "none" }}
                />
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-outline z-10" />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-data-mono text-xs mb-1">
                <span className="text-outline">YAW</span>
                <span className="text-tertiary-fixed font-bold">{activeSat ? (activeSat.yaw > 0 ? "+" : "") + activeSat.yaw : "+0.1"}°</span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden w-full relative">
                <div
                  className="absolute h-full bg-tertiary-container shadow-[0_0_6px_#34fc0d] transition-all duration-500 rounded-full"
                  style={{ left: "50%", width: `${Math.min(50, Math.max(5, Math.abs(activeSat ? activeSat.yaw : 0.1) * 4))}%`, transform: (activeSat ? activeSat.yaw : 0.1) < 0 ? "translateX(-100%)" : "none" }}
                />
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-outline z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Sensor Vitals Matrix Table */}
        <div className="md:col-span-8 glass-card rounded-lg p-5 flex flex-col h-[260px]">
          <h3 className="font-label-caps text-xs text-outline mb-3 border-b border-outline-variant/20 pb-2 uppercase tracking-widest">
            Onboard Sensor Vitals Health Matrix
          </h3>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left font-data-mono text-xs">
              <thead>
                <tr className="text-outline border-b border-outline-variant/15 font-label-caps text-[10px]">
                  <th className="py-2 px-3">SUBSYSTEM MODULE</th>
                  <th className="py-2 px-3">HEALTH SCORE</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3 text-right">LAST METRIC RECORD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 text-cyan-100-variant">
                <tr className="hover:bg-primary/5 transition-colors">
                  <td className="py-2.5 px-3 text-primary-fixed-dim font-bold">OBDH (Onboard Data Handling)</td>
                  <td className="py-2.5 px-3">99.4%</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-tertiary-fixed/10 text-tertiary-fixed px-2 py-0.5 rounded-[2px] border border-tertiary-fixed/20 text-[10px]">NOMINAL</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-100">14.64 Kb block OK</td>
                </tr>
                <tr className="hover:bg-primary/5 transition-colors">
                  <td className="py-2.5 px-3 text-primary-fixed-dim font-bold">ADCS (Attitude Orientation)</td>
                  <td className="py-2.5 px-3">95.0%</td>
                  <td className="py-2.5 px-3">
                    <span className="bg-tertiary-fixed/10 text-tertiary-fixed px-2 py-0.5 rounded-[2px] border border-tertiary-fixed/20 text-[10px]">NOMINAL</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-100">0.02° pointing jitter</td>
                </tr>
                <tr className="hover:bg-primary/5 transition-colors">
                  <td className="py-2.5 px-3 text-primary-fixed-dim font-bold">EPS (Electrical Power)</td>
                  <td className="py-2.5 px-3">{activeSat ? activeSat.health : 94}%</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-[2px] border text-[10px] ${activeSat && activeSat.battery < 20 ? "bg-error-container/20 text-error border-error/30" : "bg-tertiary-fixed/10 text-tertiary-fixed border-tertiary-fixed/20"}`}>
                      {activeSat && activeSat.battery < 20 ? "CRITICAL" : "NOMINAL"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-100">{activeSat ? activeSat.battery : 92.4}% charge</td>
                </tr>
                <tr className="hover:bg-primary/5 transition-colors">
                  <td className="py-2.5 px-3 text-primary-fixed-dim font-bold">COMMS (Uplink Transceiver)</td>
                  <td className="py-2.5 px-3">91.2%</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-[2px] border text-[10px] ${activeSat && activeSat.signal < -110 ? "bg-error-container/20 text-error border-error/30" : "bg-tertiary-fixed/10 text-tertiary-fixed border-tertiary-fixed/20"}`}>
                      {activeSat && activeSat.signal < -110 ? "DEGRADED" : "NOMINAL"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-cyan-100">{activeSat ? activeSat.signal : -74.2} dBm RSSI</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
