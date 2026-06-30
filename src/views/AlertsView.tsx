import React, { useEffect, useState } from "react";
import { Alert, Satellite } from "../types";
import { getAlerts, resolveAlert, getSatellites } from "../api";

export default function AlertsView() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>("ALL");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [resolutionSuccess, setResolutionSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const alts = await getAlerts();
        const sats = await getSatellites();
        if (!active) return;
        setAlerts(alts);
        setSatellites(sats);
        
        // Auto-select first active alert if nothing is selected
        if (!selectedAlertId && alts.length > 0) {
          const firstActive = alts.find(a => a.status === "ACTIVE");
          if (firstActive) {
            setSelectedAlertId(firstActive.id);
          } else {
            setSelectedAlertId(alts[0].id);
          }
        }
      } catch (err) {
        console.error("Alerts View failed to load active state:", err);
      }
    }

    loadData();
    const interval = setInterval(loadData, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedAlertId]);

  const handleResolve = async (id: string) => {
    setResolutionSuccess(id);
    try {
      await resolveAlert(id, "RESOLVED", "Chief Engineer");
      const updatedAlerts = await getAlerts();
      setAlerts(updatedAlerts);
    } catch (err) {
      console.error("Failed to resolve alert:", err);
    }
    setTimeout(() => setResolutionSuccess(null), 1500);
  };

  const handleEscalate = (id: string) => {
    alert(`Alert ${id} successfully escalated to Level 3 Mission Advisory Team.`);
  };

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);
  const selectedSat = selectedAlert ? satellites.find(s => s.id === selectedAlert.satelliteId) : null;

  const filteredAlerts = alerts.filter((alert) => {
    if (filterLevel === "ALL") return true;
    if (filterLevel === "ACTIVE") return alert.status === "ACTIVE";
    return alert.level === filterLevel;
  });

  return (
    <div id="alerts-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            System Health &amp; Anomalies
          </h1>
          <p className="font-body-md text-xs text-cyan-200-variant mt-1.5">
            Real-time telemetry threshold verification and autonomous risk mitigation panels.
          </p>
        </div>

        {/* Rapid Stats summary */}
        <div className="flex gap-3 text-xs">
          <div className="bg-surface-container-lowest/80 border border-primary/15 rounded-lg px-4 py-2 flex flex-col shadow-md">
            <span className="font-label-caps text-[9px] text-outline mb-0.5">Active Alerts</span>
            <span className="font-data-mono text-error text-sm font-bold">
              {alerts.filter(a => a.status === "ACTIVE").length}
            </span>
          </div>
          <div className="bg-surface-container-lowest/80 border border-primary/15 rounded-lg px-4 py-2 flex flex-col shadow-md">
            <span className="font-label-caps text-[9px] text-outline mb-0.5">Critical Alarms</span>
            <span className="font-data-mono text-error text-sm font-bold animate-pulse-critical">
              {alerts.filter(a => a.status === "ACTIVE" && a.level === "CRIT").length}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Panels (4 columns layout matching Stitch) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Column 1: Filter Feed & Trends (3 cols) */}
        <div className="col-span-12 lg:col-span-3 flex flex-col gap-6 h-[600px] overflow-hidden">
          <div className="flex justify-between items-center">
            <h2 className="font-label-caps text-xs text-outline uppercase tracking-wider font-bold">Alert Feed</h2>
            
            {/* Filter buttons */}
            <div className="flex bg-surface-container border border-outline-variant/50 rounded overflow-hidden text-[9px]">
              {["ALL", "ACTIVE", "CRIT", "WARN"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-1 font-label-caps cursor-pointer transition-colors ${filterLevel === lvl ? "bg-primary-fixed/20 text-primary-fixed font-bold" : "text-outline hover:text-cyan-200"}`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
            {filteredAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-outline-variant text-center h-full">
                <span className="material-symbols-outlined text-[36px] mb-2 opacity-30">check_circle</span>
                <p className="font-label-caps text-[10px]">No alerts found matching filter</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isCrit = alert.level === "CRIT";
                const isActive = alert.status === "ACTIVE";

                return (
                  <div
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      selectedAlertId === alert.id
                        ? isCrit
                          ? "bg-error-container/30 border-error shadow-[0_0_10px_rgba(255,180,171,0.2)]"
                          : "bg-primary-fixed/10 border-primary-fixed shadow-[0_0_10px_rgba(0,219,231,0.2)]"
                        : isCrit
                        ? "bg-error-container/10 border-error/20 hover:bg-error-container/20"
                        : "bg-surface-container-lowest/60 border-outline-variant/30 hover:bg-surface-container-high/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded flex items-center justify-center shrink-0 ${isCrit ? "bg-error/20 text-error" : "bg-secondary-container/20 text-secondary-fixed"}`}>
                        <span className="material-symbols-outlined text-sm font-bold">
                          {isCrit ? "thermostat" : "settings_input_antenna"}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-label-caps border leading-none font-bold ${isCrit ? "bg-error/15 text-error border-error/30" : "bg-secondary-fixed/15 text-secondary-fixed border-secondary-fixed/30"}`}>
                            {alert.level}
                          </span>
                          <span className="font-data-mono text-[9px] text-outline">
                            {new Date(alert.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                          </span>
                        </div>

                        <h3 className={`font-headline-sm text-xs truncate font-bold ${!isActive ? "line-through text-outline" : "text-cyan-200"}`}>
                          {alert.satelliteName}: {alert.message}
                        </h3>
                        <p className="font-data-mono text-[9px] text-outline mt-1 uppercase">
                          ID: {alert.code} // {alert.status}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Selected Details Panel (5 cols) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 h-[600px]">
          <h2 className="font-label-caps text-xs text-outline uppercase tracking-wider font-bold">Anomaly Inspector</h2>
          
          {selectedAlert ? (
            <div className={`rounded-xl flex flex-col border flex-1 overflow-hidden shadow-lg relative ${selectedAlert.level === "CRIT" ? "border-error/30 bg-error-container/5" : "border-primary/20 bg-surface-container-lowest/60"}`}>
              <div className={`absolute top-0 left-0 w-full h-1 ${selectedAlert.level === "CRIT" ? "bg-error" : "bg-primary-fixed"}`} />
              
              {/* Card Header */}
              <div className="p-5 border-b border-outline-variant/20 bg-surface-container/20">
                <div className="flex justify-between items-start mb-2">
                  <span className={`font-data-mono text-sm font-bold ${selectedAlert.level === "CRIT" ? "text-error" : "text-primary-fixed"}`}>
                    {selectedAlert.code}
                  </span>
                  <span className="font-data-mono text-[10px] text-outline">
                    {new Date(selectedAlert.timestamp).toLocaleString("en-US", { hour12: false })} UTC
                  </span>
                </div>
                
                <h3 className="font-headline-sm text-base text-cyan-200 leading-snug font-bold mb-1">
                  {selectedAlert.satelliteName}: {selectedAlert.message}
                </h3>
                
                <div className="flex items-center gap-2 mt-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${selectedAlert.status === "ACTIVE" ? "bg-error animate-pulse-critical" : "bg-tertiary-fixed"}`} />
                  <span className={`font-label-caps text-[10px] font-bold ${selectedAlert.status === "ACTIVE" ? "text-error" : "text-tertiary-fixed"}`}>
                    {selectedAlert.status}
                  </span>
                  <span className="text-outline text-xs">•</span>
                  <span className="font-label-caps text-[9px] text-outline uppercase tracking-wider bg-surface-container-high px-2 py-0.5 rounded">
                    SUBSYSTEM: {selectedAlert.subsystem}
                  </span>
                </div>
              </div>

              {/* Data & Telemetry Readings */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                <div>
                  <h4 className="font-label-caps text-[10px] text-outline mb-2 tracking-widest font-bold">ALARM COINCIDENT TELEMETRY</h4>
                  
                  <div className="bg-background rounded border border-outline-variant/30 p-4 font-data-mono text-xs text-cyan-200-variant space-y-2.5">
                    <div className="flex justify-between">
                      <span className="text-outline">EPS_BUS_VOLTAGE_SAG</span>
                      <span className={`font-bold ${selectedAlert.level === "CRIT" ? "text-error" : "text-cyan-200"}`}>
                        {selectedSat ? `${selectedSat.battery.toFixed(1)}%` : "12.0%"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">THERMAL_CORE_SENSOR</span>
                      <span className="text-cyan-200">{selectedSat ? `${selectedSat.temp.toFixed(1)}°C` : "45.5°C"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">COMMS_LINK_DEGRADATION</span>
                      <span className="text-cyan-200">{selectedSat ? `${selectedSat.signal.toFixed(1)} dBm` : "-115.0 dBm"}</span>
                    </div>
                    <div className="w-full h-px bg-outline-variant/30 my-2" />
                    <div className="flex justify-between font-bold">
                      <span className="text-outline">MOCK ESCALATION TIMEOUT</span>
                      <span className="text-error animate-pulse">00:14:22 MINS</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-label-caps text-[10px] text-outline mb-2 tracking-widest font-bold">COGNITIVE RECOMMENDED ACTION</h4>
                  <p className="font-body-md text-xs text-cyan-200 bg-primary-fixed/5 border-l-2 border-primary-fixed p-3 rounded-r-md leading-relaxed">
                    {selectedAlert.recommendedAction || "Execute transponder re-alignment gain patterns."}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant text-xs font-bold font-data-mono text-primary-fixed-dim shrink-0">
                    OP
                  </div>
                  <div>
                    <span className="font-label-caps text-[9px] text-outline block leading-none">PRIMARY HANDLER ASSIGNED:</span>
                    <span className="font-data-mono text-xs text-cyan-200 font-semibold">{selectedAlert.assignedTo || "Unassigned"}</span>
                  </div>
                </div>
              </div>

              {/* Action Handlers */}
              <div className="p-4 border-t border-outline-variant/20 bg-surface-container-lowest/50 shrink-0 flex flex-col gap-2">
                {selectedAlert.status === "ACTIVE" ? (
                  <>
                    <button
                      onClick={() => handleResolve(selectedAlert.id)}
                      disabled={resolutionSuccess !== null}
                      className={`w-full py-2.5 rounded font-label-caps text-xs text-on-primary-fixed tracking-widest font-bold cursor-pointer transition-all ${
                        resolutionSuccess === selectedAlert.id
                          ? "bg-tertiary-fixed border border-tertiary-fixed"
                          : "bg-primary-fixed hover:bg-primary hover:shadow-[0_0_12px_rgba(116,245,255,0.4)]"
                      }`}
                    >
                      {resolutionSuccess === selectedAlert.id ? "RESOLVING CONSOLE STATUS..." : "EXECUTE RESOLUTION SCRIPT"}
                    </button>
                    <button
                      onClick={() => handleEscalate(selectedAlert.id)}
                      className="w-full py-2 bg-transparent border border-error/50 hover:bg-error/10 text-error rounded font-label-caps text-xs tracking-widest cursor-pointer transition-colors"
                    >
                      ESCALATE ACCORDING TO PROTOCOL
                    </button>
                  </>
                ) : (
                  <div className="p-3 bg-tertiary-fixed/10 border border-tertiary-fixed/30 text-tertiary-fixed rounded text-center text-xs font-data-mono font-bold">
                    ✓ ANOMALY DEGRADATION RE-RESOLVED ONCE AT {new Date().toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl flex-1 flex flex-col items-center justify-center p-8 text-center text-outline-variant">
              <span className="material-symbols-outlined text-[48px] opacity-35 mb-2">assignment</span>
              <p className="font-label-caps text-xs">Select an anomaly to inspect vitals</p>
            </div>
          )}
        </div>

        {/* Column 3: Impact Analysis & Visualizers (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-[600px] overflow-hidden">
          
          {/* Risk Impact Matrix */}
          <div className="bg-surface-container-low/80 border border-outline-variant/30 rounded-xl p-5 flex flex-col relative overflow-hidden shrink-0">
            <h2 className="font-headline-sm text-xs text-primary mb-3 flex items-center gap-2 border-b border-outline-variant/10 pb-2 uppercase tracking-widest">
              <span className="material-symbols-outlined text-[16px]">crisis_alert</span> MISSION ASSURANCE MATRIX
            </h2>
            
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-outline-variant/20">
              <div className={`p-2 rounded border ${selectedAlert?.level === "CRIT" ? "bg-error/15 border-error/40 text-error" : "bg-secondary-container/15 border-secondary-fixed/40 text-secondary-fixed"}`}>
                <span className="material-symbols-outlined text-[20px] font-bold">warning</span>
              </div>
              <div>
                <span className="font-label-caps text-[9px] text-outline block mb-0.5">CRITICAL IMPACT VALUE:</span>
                <span className={`font-headline-sm text-sm font-bold block leading-none ${selectedAlert?.level === "CRIT" ? "text-error" : "text-secondary-fixed"}`}>
                  {selectedAlert?.level === "CRIT" ? "HIGH RISK EXPOSURE" : "MODERATE OVERLOAD"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="font-label-caps text-[9px] text-outline block mb-1">AFFECTED INSTRUMENTS</span>
                <div className="bg-surface-container/50 border border-outline-variant/30 rounded p-2.5 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-primary-fixed text-base">camera</span>
                  <div className="min-w-0">
                    <span className="font-data-mono text-xs text-cyan-200 block font-bold truncate">HSI-1 Hyperspectral Camera</span>
                    <span className="text-[10px] text-outline block truncate">Resolution degraded due to cooling constraints.</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-label-caps text-[9px] text-outline block mb-1">OPERATIONAL DELAYS</span>
                <div className="bg-surface-container/50 border border-outline-variant/30 rounded p-2.5 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-secondary-container text-base">map</span>
                  <div className="min-w-0">
                    <span className="font-data-mono text-xs text-cyan-200 block font-bold truncate">Terrain Mapping Schedule</span>
                    <span className="text-[10px] text-outline block truncate">Failsafe timeout extended by 2.4 orbital periods.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historical alarms summaries */}
          <div className="glass-card rounded-xl p-5 flex flex-col flex-1 overflow-hidden">
            <h2 className="font-headline-sm text-xs text-primary mb-3 flex items-center gap-2 border-b border-outline-variant/10 pb-2 uppercase tracking-widest shrink-0">
              <span className="material-symbols-outlined text-[16px]">history</span> PREVIOUS EXCEPTION HISTORY
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
              <div className="p-3 bg-surface-container/20 border border-outline-variant/10 rounded flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-data-mono text-outline">NAV-C-008</span>
                  <span className="font-data-mono text-outline">T-Minus 04h</span>
                </div>
                <h4 className="text-xs text-cyan-200 font-semibold">Star tracker lost lock during eclipse handover</h4>
                <p className="text-[10px] text-tertiary-fixed font-bold uppercase mt-1">✓ RESOLVED AUTO-CORRECTION</p>
              </div>

              <div className="p-3 bg-surface-container/20 border border-outline-variant/10 rounded flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="font-data-mono text-cyan-200">COM-I-994</span>
                  <span className="font-data-mono text-outline">T-Minus 12h</span>
                </div>
                <h4 className="text-xs text-cyan-200 font-semibold">Failsafe uplink handshake timeout on polar pass</h4>
                <p className="text-[10px] text-tertiary-fixed font-bold uppercase mt-1">✓ RESOLVED BY OPERATOR</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
