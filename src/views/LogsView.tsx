import React, { useEffect, useState } from "react";
import { MissionLog, Satellite } from "../types";
import { getLogs, getSatellites } from "../api";

export default function LogsView() {
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [selectedSatId, setSelectedSatId] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLevel, setActiveLevel] = useState<string>("ALL");
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const logsData = await getLogs();
        const sats = await getSatellites();
        if (!active) return;
        setLogs(logsData);
        setSatellites(sats);
        
        // Auto-select first log on startup
        if (!selectedLogId && logsData.length > 0) {
          setSelectedLogId(logsData[0].id);
        }
      } catch (err) {
        console.error("Logs View failed to fetch list:", err);
      }
    }

    loadData();
    const interval = setInterval(loadData, 4000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [selectedLogId]);

  const selectedLog = logs.find(l => l.id === selectedLogId);

  // Filters logic
  const filteredLogs = logs.filter((log) => {
    // Satellite filter
    if (selectedSatId !== "ALL" && log.satelliteId !== selectedSatId) return false;
    
    // Level filter
    if (activeLevel !== "ALL" && log.level !== activeLevel) return false;

    // Search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const messageMatch = log.message.toLowerCase().includes(term);
      const subsystemMatch = log.subsystem.toLowerCase().includes(term);
      const payloadMatch = log.payload.toLowerCase().includes(term);
      return messageMatch || subsystemMatch || payloadMatch;
    }

    return true;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const anchor = document.createElement("a");
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `mission_logs_${Date.now()}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8,ID,Timestamp,Level,Subsystem,Message\n" 
      + filteredLogs.map(l => `"${l.id}","${l.timestamp}","${l.level}","${l.subsystem}","${l.message.replace(/"/g, '""')}"`).join("\n");
    const anchor = document.createElement("a");
    anchor.setAttribute("href", encodeURI(csvContent));
    anchor.setAttribute("download", `mission_logs_${Date.now()}.csv`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div id="logs-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Top Header stats */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="font-headline-sm text-2xl text-primary drop-shadow-[0_0_10px_rgba(0,219,231,0.2)]">
            Spacecraft Telemetry logs
          </h1>

          <div className="flex gap-2">
            <div className="bg-surface-container-lowest border border-primary/15 rounded px-3 py-1 flex items-center gap-2 shadow-md">
              <span className="font-label-caps text-[9px] text-outline">TOTAL RECORDS</span>
              <span className="font-data-mono text-primary-fixed font-bold">{logs.length}</span>
            </div>
            <div className="bg-surface-container-lowest border border-error/20 rounded px-3 py-1 flex items-center gap-2 shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse-critical" />
              <span className="font-label-caps text-[9px] text-cyan-200">CRIT EXCPT</span>
              <span className="font-data-mono text-error font-bold">
                {logs.filter(l => l.level === "CRIT").length}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleExportJSON}
            className="px-4 py-1.5 bg-transparent border border-primary-fixed text-primary-fixed font-label-caps text-xs rounded-sm hover:bg-primary-fixed/10 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">download</span> EXPORT JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-1.5 bg-primary-fixed text-on-primary-fixed font-label-caps text-xs rounded-sm hover:shadow-[0_0_12px_rgba(116,245,255,0.4)] transition-all flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-[14px]">table_view</span> EXPORT CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="shrink-0 bg-surface-container-lowest border border-primary/15 rounded-lg p-3 shadow-md flex flex-col md:flex-row items-center gap-4">
        
        {/* Sat selector */}
        <div className="relative w-48 shrink-0">
          <select
            value={selectedSatId}
            onChange={(e) => setSelectedSatId(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant focus:border-primary-fixed focus:ring-0 text-cyan-200 font-label-caps text-xs px-3 py-2 rounded-sm cursor-pointer"
          >
            <option value="ALL">ALL SATELLITES</option>
            {satellites.map(s => (
              <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Text Search */}
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant focus:border-primary-fixed focus:ring-0 text-cyan-200 font-body-md text-xs pl-9 pr-3 py-2 rounded-sm transition-colors placeholder:text-outline/40"
            placeholder="Search payload metrics, error descriptors, or hex strings..."
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 shrink-0 px-2 border-l border-outline-variant/30 w-full md:w-auto">
          {["ALL", "CRIT", "WARN", "INFO", "DEBUG"].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`px-3 py-1 font-label-caps text-[9px] rounded-sm border transition-colors cursor-pointer ${activeLevel === lvl ? "bg-primary-fixed border-primary-fixed text-on-primary-fixed font-bold" : "border-outline-variant/50 text-outline hover:border-outline hover:text-on-surface"}`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Split view: Table list vs Detailed Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 h-[500px]">
        
        {/* Logs table list (70% split) */}
        <div className="lg:w-[70%] flex flex-col bg-surface-container-lowest/80 border border-primary/15 rounded-lg overflow-hidden shadow-lg h-full">
          
          <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-surface-container/50 border-b border-primary/15 font-label-caps text-[10px] text-outline shrink-0 font-bold">
            <div className="col-span-3">TIMESTAMP (UTC)</div>
            <div className="col-span-1 text-center">LEVEL</div>
            <div className="col-span-2">SUBSYSTEM</div>
            <div className="col-span-6">OPERATIONAL SUMMARY MESSAGE</div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-outline/5">
            {filteredLogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-outline-variant h-full">
                <span className="material-symbols-outlined text-[44px] mb-2 opacity-30">table_rows</span>
                <span className="font-label-caps text-xs">No matching log records retrieved</span>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const isCrit = log.level === "CRIT";
                const isWarn = log.level === "WARN";
                const isDebug = log.level === "DEBUG";
                
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLogId(log.id)}
                    className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center cursor-pointer transition-colors border-l-2 ${selectedLogId === log.id ? "bg-primary-fixed/5 border-l-primary-fixed" : "border-l-transparent hover:bg-surface-container-high/40"}`}
                  >
                    <div className="col-span-3 font-data-mono text-[11px] text-outline truncate">
                      {new Date(log.timestamp).toISOString()}
                    </div>
                    
                    <div className="col-span-1 text-center">
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${isCrit ? "bg-error shadow-[0_0_5px_#ffb4ab]" : isWarn ? "bg-secondary-fixed shadow-[0_0_5px_#14d1ff]" : isDebug ? "bg-outline" : "bg-tertiary-fixed shadow-[0_0_5px_#79ff5b]"}`} />
                    </div>

                    <div className="col-span-2 font-data-mono text-[11px] text-primary-fixed-dim font-bold truncate">
                      {log.subsystem}
                    </div>

                    <div className="col-span-6 font-data-mono text-[11px] text-cyan-200 truncate">
                      {log.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="shrink-0 border-t border-outline-variant/15 px-4 py-3 bg-surface-container/50 flex items-center justify-between text-[10px] font-label-caps text-outline">
            <span>RETRIEVED {filteredLogs.length} OF {logs.length} TOTAL METRIC FRAMES</span>
            <span>UPLINK SYNC RATE: SECURE 12.4 Mbps</span>
          </div>
        </div>

        {/* Detailed Inspector JSON panel (30% split) */}
        <div className="lg:w-[30%] flex flex-col bg-surface-container-lowest/80 border border-primary/15 rounded-lg overflow-hidden shadow-lg h-full">
          <div className="px-4 py-3 bg-surface-container/40 border-b border-primary/15 flex justify-between items-center shrink-0">
            <h3 className="font-label-caps text-xs text-primary font-bold">Telemetry Inspector</h3>
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed shadow-[0_0_4px_#79ff5b] animate-pulse" />
          </div>

          {selectedLog ? (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 border-b border-outline-variant/15 pb-4 font-data-mono text-xs">
                <div>
                  <span className="block font-label-caps text-[9px] text-cyan-200 mb-0.5">METRIC LOG ID</span>
                  <span className=" text-cyan-200font-semibold">{selectedLog.id}</span>
                </div>
                <div>
                  <span className="block font-label-caps text-[9px] text-outline mb-0.5">UPLINK TIME (UTC)</span>
                  <span className="text-cyan-200 font-semibold">
                    {new Date(selectedLog.timestamp).toLocaleTimeString("en-US", { hour12: false })}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <span className="block font-label-caps text-[9px] text-outline mb-2 tracking-widest font-bold">RAW TELEMETRY FRAME (JSON)</span>
                <div className="bg-background/95 rounded border border-outline-variant/40 p-4 font-data-mono text-[11px] leading-relaxed overflow-auto flex-1 shadow-inner max-h-[300px]">
                  <pre className="text-cyan-200-variant font-medium">
                    <code>{JSON.stringify(JSON.parse(selectedLog.payload), null, 2)}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-outline-variant">
              <span className="material-symbols-outlined text-[32px] opacity-35 mb-2">find_in_page</span>
              <p className="font-label-caps text-[10px]">Select a packet line to inspect coordinates</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
