import React, { useEffect, useState } from "react";
import { Satellite, Command } from "../types";
import { getSatellites, sendCommand, getCommands } from "../api";

interface FleetViewProps {
  activeSatId: string;
  setActiveSatId: (id: string) => void;
}

export default function FleetView({ activeSatId, setActiveSatId }: FleetViewProps) {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [compSatIdA, setCompSatIdA] = useState<string>("aether-1");
  const [compSatIdB, setCompSatIdB] = useState<string>("aether-2");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskSatId, setTaskSatId] = useState("aether-1");
  const [taskSuccess, setTaskSuccess] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const sats = await getSatellites();
        if (!active) return;
        setSatellites(sats);
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    const interval = setInterval(loadData, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleTaskUplink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskDesc) return;
    try {
      // Mock ulinking of a custom scheduled task
      await sendCommand(taskSatId, `TASK: ${taskDesc.toUpperCase()}`, "CHIEF_MISSION_ENG");
      setTaskSuccess(true);
      setTaskDesc("");
      setTimeout(() => setTaskSuccess(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const satA = satellites.find(s => s.id === compSatIdA) || satellites[0];
  const satB = satellites.find(s => s.id === compSatIdB) || satellites[1];

  return (
    <div id="fleet-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            Fleet Operations
          </h1>
          <p className="font-data-mono text-xs text-outline mt-1 uppercase tracking-widest">
            Multi-Node Transponder Arrays &amp; Telemetry Aggregation
          </p>
        </div>

        <div className="flex gap-4 border-y border-outline-variant/20 bg-surface-container-lowest/30 px-4 py-2 rounded-lg text-xs font-data-mono font-bold">
          <div className="flex items-center gap-2">
            <span className="text-outline text-[10px]">TOTAL ARRAYS:</span>
            <span className="text-primary-fixed">12</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed shadow-[0_0_5px_#79ff5b]" />
            <span className="text-outline text-[10px]">ACTIVE:</span>
            <span className="text-tertiary-fixed">9</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed shadow-[0_0_5px_#14d1ff]" />
            <span className="text-outline text-[10px]">WARN:</span>
            <span className="text-secondary-fixed">2</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-error shadow-[0_0_5px_#ffb4ab]" />
            <span className="text-outline text-[10px]">OFFLINE:</span>
            <span className="text-error">1</span>
          </div>
        </div>
      </div>

      {/* Fleet Level Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total health */}
        <div className="glass-card rounded-lg p-4 flex flex-col justify-between h-[120px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary-fixed/5 rounded-full blur-xl -mr-4 -mt-4" />
          <div className="flex justify-between items-start text-xs font-bold text-outline uppercase font-label-caps">
            <span>Overall Fleet Vitals</span>
            <span className="text-tertiary-fixed">+2.4%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold font-data-mono text-primary">94.2%</h2>
            <span className="text-[10px] text-outline">Avg Health</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-2">
            <div className="bg-primary-fixed h-full w-[94%]" />
          </div>
        </div>

        {/* Downlink volume */}
        <div className="glass-card rounded-lg p-4 flex flex-col justify-between h-[120px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary-fixed/5 rounded-full blur-xl -mr-4 -mt-4" />
          <div className="flex justify-between items-start text-xs font-bold text-outline uppercase font-label-caps">
            <span>Downlink bandwidth</span>
            <span className="text-primary-fixed">LAST 24H</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold font-data-mono text-secondary-fixed">84.6</h2>
            <span className="text-[10px] text-outline">Gigabits Sync</span>
          </div>
          <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden mt-2">
            <div className="bg-secondary-fixed h-full w-[80%]" />
          </div>
        </div>

        {/* Active warnings */}
        <div className="glass-card rounded-lg p-4 flex flex-col justify-between h-[120px] relative overflow-hidden border-error/30">
          <div className="absolute top-0 right-0 w-16 h-16 bg-error/5 rounded-full blur-xl -mr-4 -mt-4" />
          <div className="flex justify-between items-start text-xs font-bold text-error uppercase font-label-caps">
            <span>Active Anomalies</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold font-data-mono text-error">03</h2>
            <span className="text-[10px] text-outline">Faults Handled</span>
          </div>
          <p className="text-[9px] font-data-mono text-outline-variant mt-2 uppercase">Iris-4 battery critical warning active</p>
        </div>

        {/* Fleet Allocation */}
        <div className="glass-card rounded-lg p-4 flex flex-col justify-between h-[120px] relative overflow-hidden border-primary-fixed/20">
          <div className="flex justify-between items-start text-xs font-bold text-outline uppercase font-label-caps">
            <span>Bandwidth allocation</span>
          </div>
          <div className="space-y-2 mt-1">
            <div>
              <div className="flex justify-between text-[8px] font-data-mono mb-0.5">
                <span className="text-outline">COMM SPECTRUM</span>
                <span className="text-primary-fixed font-bold">68%</span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary-fixed w-[68%]" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Selector List on Left & Comparison / Task Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left list (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="font-headline-sm text-sm text-primary flex items-center gap-2 border-b border-outline-variant/10 pb-2">
            <span className="material-symbols-outlined text-[18px]">format_list_bulleted</span> ACTIVE FLEET DIRECTORY
          </h3>
          
          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {satellites.map((sat) => {
              const isSelected = activeSatId === sat.id;
              return (
                <div
                  key={sat.id}
                  onClick={() => setActiveSatId(sat.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all relative ${isSelected ? "border-primary-fixed/40 bg-primary-fixed/5" : "border-outline-variant/20 hover:bg-surface-container-high/40"}`}
                >
                  {isSelected && <div className="absolute left-0 top-0 h-full w-1 bg-primary-fixed shadow-[0_0_8px_#74f5ff]" />}
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <h4 className="font-headline-sm text-sm font-bold text-cyan-200">{sat.name}</h4>
                      <span className="font-data-mono text-[10px] text-cyan-200 uppercase tracking-wider">{sat.orbit}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-label-caps border font-bold ${sat.status === "NOMINAL" ? "bg-tertiary-fixed/10 border-tertiary-fixed/30 text-tertiary-fixed shadow-[0_0_5px_rgba(121,255,91,0.2)]" : sat.status === "WARNING" ? "bg-secondary-fixed/15 border-secondary-fixed/30 text-secondary-fixed" : "bg-error/10 border-error/30 text-error"}`}>
                      {sat.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-3 text-xs font-data-mono text-outline">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">battery_charging_full</span>
                      <span className="font-bold text-cyan-200-variant">{sat.battery.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">device_thermostat</span>
                      <span className="font-bold text-cyan-200-variant">{sat.temp.toFixed(1)}°C</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Details / Comparer (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Comparison Tool */}
          <div className="glass-card rounded-lg flex flex-col h-[320px]">
            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
              <h3 className="font-label-caps text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">compare_arrows</span> TELEMETRY PAIRING ESTIMATOR
              </h3>
              
              <div className="flex gap-4 items-center">
                <select
                  value={compSatIdA}
                  onChange={(e) => setCompSatIdA(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-sm text-cyan-200 font-data-mono text-[11px] py-1 pl-2 pr-8 focus:ring-1 focus:ring-primary-fixed focus:border-primary-fixed"
                >
                  {satellites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <span className="text-outline font-data-mono text-[11px] font-bold">VS</span>
                <select
                  value={compSatIdB}
                  onChange={(e) => setCompSatIdB(e.target.value)}
                  className="bg-surface-container border border-outline-variant rounded-sm text-cyan-200 font-data-mono text-[11px] py-1 pl-2 pr-8 focus:ring-1 focus:ring-primary-fixed focus:border-primary-fixed"
                >
                  {satellites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-2 p-5 gap-6 relative">
              <div className="absolute left-1/2 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-outline-variant/30 to-transparent -translate-x-1/2" />
              
              {/* Sat A */}
              <div className="flex flex-col gap-3.5 font-data-mono text-xs">
                <div className="bg-surface-container/30 border border-outline-variant/20 rounded p-2.5 flex justify-between items-center">
                  <span className="text-outline">THERMAL DEGREE</span>
                  <span className="text-primary-fixed font-bold">{satA ? satA.temp.toFixed(1) : "22.1"}°C</span>
                </div>
                <div className="bg-surface-container/30 border border-outline-variant/20 rounded p-2.5 flex justify-between items-center">
                  <span className="text-outline">POWER CHARGE</span>
                  <span className="text-primary-fixed font-bold">{satA ? satA.battery.toFixed(1) : "92.4"}%</span>
                </div>
                <div className="bg-surface-container/30 border border-outline-variant/20 rounded p-2.5 flex justify-between items-center">
                  <span className="text-outline">ATTITUDE</span>
                  <span className="text-primary-fixed text-[11px] font-bold">
                    {satA ? `${satA.pitch > 0 ? "+" : ""}${satA.pitch} / ${satA.roll > 0 ? "+" : ""}${satA.roll}` : "+12.4 / -3.2"}
                  </span>
                </div>
              </div>

              {/* Sat B */}
              <div className="flex flex-col gap-3.5 font-data-mono text-xs">
                <div className="bg-surface-container/30 border border-outline-variant/20 rounded p-2.5 flex justify-between items-center">
                  <span className="text-outline">THERMAL DEGREE</span>
                  <span className="text-cyan-200 font-bold">{satB ? satB.temp.toFixed(1) : "18.5"}°C</span>
                </div>
                <div className="bg-surface-container/30 border border-outline-variant/20 rounded p-2.5 flex justify-between items-center">
                  <span className="text-outline">POWER CHARGE</span>
                  <span className="text-cyan-200 font-bold">{satB ? satB.battery.toFixed(1) : "76.0"}%</span>
                </div>
                <div className="bg-surface-container/30 border border-outline-variant/20 rounded p-2.5 flex justify-between items-center">
                  <span className="text-outline">ATTITUDE</span>
                  <span className="text-cyan-200 text-[11px] font-bold">
                    {satB ? `${satB.pitch > 0 ? "+" : ""}${satB.pitch} / ${satB.roll > 0 ? "+" : ""}${satB.roll}` : "-1.5 / +0.4"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Task Operations Assigner */}
          <div className="glass-card rounded-lg p-5 flex flex-col flex-1 border-primary-fixed/20 relative overflow-hidden h-[180px]">
            <div className="absolute top-0 right-0 border-t-2 border-r-2 border-primary-fixed w-4 h-4 mt-[-1px] mr-[-1px]" />
            
            <h3 className="font-label-caps text-xs text-primary mb-3 flex items-center gap-2 font-bold uppercase tracking-widest border-b border-outline-variant/10 pb-2">
              <span className="material-symbols-outlined text-sm text-primary-fixed">event_upcoming</span> SCHEDULE STATION OPERATIONS TASK
            </h3>

            <form onSubmit={handleTaskUplink} className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-label-caps text-outline font-bold">QUICK CHOOSE ARRAYS DESTINATION</label>
                  <select
                    value={taskSatId}
                    onChange={(e) => setTaskSatId(e.target.value)}
                    className="bg-surface-container-highest border border-outline-variant/40 rounded text-cyan-200 py-1 focus:border-primary-fixed focus:ring-0 font-data-mono text-xs w-full cursor-pointer"
                  >
                    {satellites.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                  </select>
                </div>

                <button
                  type="submit"
                  className="bg-primary-fixed text-[#002022] font-label-caps text-[10px] py-1.5 rounded-sm font-bold tracking-widest cursor-pointer hover:shadow-[0_0_10px_rgba(116,245,255,0.4)] transition-shadow"
                >
                  UPLINK SCHEDULED PROTOCOL
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[9px] font-label-caps text-outline font-bold">TASK OPERATIONAL SUMMARY</label>
                <textarea
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  placeholder="E.g. Schedule solar panels array reconditioning at polar pass AOS window..."
                  className="bg-surface-container-highest border border-outline-variant/40 rounded text-cyan-200 p-2 focus:border-primary-fixed focus:ring-0 text-xs flex-1 outline-none resize-none h-[64px]"
                />
                {taskSuccess && (
                  <p className="text-tertiary-fixed font-data-mono text-[9px] font-bold tracking-wider text-right uppercase">
                    ✓ Task uplink queue success
                  </p>
                )}
              </div>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
