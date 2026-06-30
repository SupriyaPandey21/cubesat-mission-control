import React, { useEffect, useState } from "react";
import { GroundStation, Satellite } from "../types";
import { getGroundStations, getSatellites } from "../api";

interface GroundStationViewProps {
  activeSatId: string;
}

export default function GroundStationView({ activeSatId }: GroundStationViewProps) {
  const [stations, setStations] = useState<GroundStation[]>([]);
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const gsData = await getGroundStations();
        const sats = await getSatellites();
        if (!active) return;
        setStations(gsData);
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

  const activeSat = satellites.find(s => s.id === activeSatId) || satellites[0];

  return (
    <div id="ground-station-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            Ground Link Status
          </h1>
          <p className="font-data-mono text-xs text-outline mt-1 uppercase">
            GS-ALPHA // N 45° 24' 12" E 10° 43' 01" // COORDINATED UNIVERSAL TIME
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-lg border border-primary/20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed shadow-[0_0_8px_#79ff5b] animate-pulse" />
            <span className="font-data-mono text-xs text-on-surface-variant font-bold">UHF NOMINAL</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-lg border border-primary/20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed shadow-[0_0_8px_#79ff5b] animate-pulse" />
            <span className="font-data-mono text-xs text-on-surface-variant font-bold">S-BAND LOCKED</span>
          </div>
        </div>
      </div>

      {/* Main Grid Panels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Connection Status (Spans 12 col top row) */}
        <div className="col-span-12 glass-card rounded-xl p-5 flex flex-col md:flex-row justify-between gap-6 shrink-0 relative">
          <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-tertiary-fixed shadow-[0_0_8px_#79ff5b]" />
          
          {/* Downlink */}
          <div className="flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-primary/10 pb-4 md:pb-0 md:pr-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary-fixed text-sm">download</span>
                </div>
                <div>
                  <h3 className="font-label-caps text-[9px] text-outline uppercase font-bold">DOWNLINK (RX)</h3>
                  <div className="font-headline-sm text-sm text-primary font-bold">S-BAND 2.2 GHz</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-tertiary-fixed/10 text-tertiary-fixed border border-tertiary-fixed/30 font-label-caps text-[9px] font-bold tracking-widest">ACTIVE</span>
            </div>
            
            <div className="flex items-end justify-between bg-surface-container-lowest/50 rounded-lg p-3 border border-outline-variant/20">
              <div>
                <div className="font-data-mono text-[9px] text-outline mb-1 font-bold">DOWNLINK DATA RATE</div>
                <div className="font-headline-md text-xl text-primary-fixed-dim font-data-mono font-bold">
                  12.4 <span className="text-xs text-outline font-normal">Mbps</span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-8">
                <div className="w-1.5 bg-primary-fixed h-1/5 rounded-t-sm animate-pulse" />
                <div className="w-1.5 bg-primary-fixed h-3/5 rounded-t-sm" />
                <div className="w-1.5 bg-primary-fixed h-2/5 rounded-t-sm animate-pulse" />
                <div className="w-1.5 bg-primary-fixed h-4/5 rounded-t-sm" />
                <div className="w-1.5 bg-primary-fixed h-full rounded-t-sm shadow-[0_0_8px_#74f5ff]" />
              </div>
            </div>
          </div>

          {/* Uplink */}
          <div className="flex-1 flex flex-col justify-between border-b md:border-b-0 md:border-r border-primary/10 pb-4 md:pb-0 md:pr-6 md:pl-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary-fixed text-sm">upload</span>
                </div>
                <div>
                  <h3 className="font-label-caps text-[9px] text-outline uppercase font-bold">UPLINK (TX)</h3>
                  <div className="font-headline-sm text-sm text-secondary-fixed font-bold">UHF 435 MHz</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline border border-outline-variant font-label-caps text-[9px] font-bold">IDLE</span>
            </div>
            
            <div className="flex items-end justify-between bg-surface-container-lowest/50 rounded-lg p-3 border border-outline-variant/20 opacity-70">
              <div>
                <div className="font-data-mono text-[9px] text-outline mb-1 font-bold">TX AMPLITUDE POWER</div>
                <div className="font-headline-md text-xl text-outline font-data-mono font-bold">
                  0.0 <span className="text-xs text-outline font-normal">W</span>
                </div>
              </div>
              <div className="flex items-end gap-1 h-8 opacity-45">
                <div className="w-1.5 bg-outline h-1/5 rounded-t-sm" />
                <div className="w-1.5 bg-outline h-1/5 rounded-t-sm" />
                <div className="w-1.5 bg-outline h-1/5 rounded-t-sm" />
                <div className="w-1.5 bg-outline h-1/5 rounded-t-sm" />
                <div className="w-1.5 bg-outline h-1/5 rounded-t-sm" />
              </div>
            </div>
          </div>

          {/* Countdown timer */}
          <div className="flex-1 flex flex-col justify-between md:pl-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary-fixed text-sm">satellite_alt</span>
                </div>
                <div>
                  <h3 className="font-label-caps text-[9px] text-outline uppercase font-bold">NEXT CONTACT</h3>
                  <div className="font-headline-sm text-sm text-on-surface font-bold">{activeSat?.name || "AETHER-1"}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-outline border border-outline-variant font-label-caps text-[9px] font-bold">AOS</span>
            </div>
            
            <div className="flex items-end justify-between bg-surface-container-lowest/50 rounded-lg p-3 border border-outline-variant/20">
              <div>
                <div className="font-data-mono text-[9px] text-outline mb-1 font-bold">UPLINK COUNTDOWN</div>
                <div className="font-headline-md text-xl text-tertiary-fixed font-data-mono font-bold animate-pulse">
                  {stations[0]?.nextAos || "00:14:22"}
                </div>
              </div>
              <div className="text-right">
                <div className="font-data-mono text-[9px] text-outline mb-1 font-bold">DURATION</div>
                <div className="font-data-mono text-xs text-outline font-bold">8m 45s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Charts and GS environmental analysis */}
        {/* Signal Doppler tracking */}
        <div className="col-span-12 md:col-span-6 glass-card rounded-xl p-5 flex flex-col h-[280px]">
          <div className="flex justify-between items-center mb-4 border-b border-outline-variant/15 pb-2">
            <h3 className="font-label-caps text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">monitor_heart</span> SIGNAL DOPPLER TRACKING
            </h3>
            <span className="font-data-mono text-[9px] text-primary-fixed bg-primary-fixed/15 border border-primary-fixed/20 px-2 py-0.5 rounded uppercase">LIVE OSCILLATING</span>
          </div>

          <div className="flex gap-6 mb-3 font-data-mono text-xs">
            <div>
              <p className="text-outline text-[9px] font-bold">SIGNAL SNR</p>
              <p className="text-base text-primary font-bold">18.4 dB</p>
            </div>
            <div>
              <p className="text-outline text-[9px] font-bold">DOPPLER SHIFT</p>
              <p className="text-base text-primary font-bold flex items-center gap-1.5 font-bold">
                +12.05 kHz <span className="material-symbols-outlined text-xs text-secondary-fixed">trending_up</span>
              </p>
            </div>
            <div>
              <p className="text-outline text-[9px] font-bold">BIT ERROR RATE (BER)</p>
              <p className="text-base text-tertiary-fixed font-bold">1e-6</p>
            </div>
          </div>

          {/* Mock Waveform */}
          <div className="flex-1 rounded bg-surface-container-lowest border border-outline-variant/30 overflow-hidden relative flex items-end">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
            <div className="w-full h-1/2 relative z-10 flex items-end justify-around px-2 pb-2">
              <div className="w-1.5 bg-primary-fixed/40 h-[20%] rounded-t-sm" />
              <div className="w-1.5 bg-primary-fixed/60 h-[40%] rounded-t-sm" />
              <div className="w-1.5 bg-primary-fixed/80 h-[30%] rounded-t-sm animate-pulse" />
              <div className="w-1.5 bg-primary-fixed/90 h-[60%] rounded-t-sm shadow-[0_0_10px_#00f2ff]" />
              <div className="w-1.5 bg-primary-fixed h-[80%] rounded-t-sm shadow-[0_0_10px_#00f2ff]" />
              <div className="w-1.5 bg-primary h-[95%] rounded-t-sm shadow-[0_0_15px_#e1fdff] animate-pulse" />
              <div className="w-1.5 bg-primary-fixed h-[85%] rounded-t-sm shadow-[0_0_10px_#00f2ff]" />
              <div className="w-1.5 bg-primary-fixed/90 h-[50%] rounded-t-sm shadow-[0_0_10px_#00f2ff] animate-pulse" />
              <div className="w-1.5 bg-primary-fixed/70 h-[35%] rounded-t-sm" />
              <div className="w-1.5 bg-primary-fixed/50 h-[15%] rounded-t-sm" />
            </div>
          </div>
        </div>

        {/* Coverage panel */}
        <div className="col-span-12 md:col-span-3 glass-card rounded-xl p-5 flex flex-col h-[280px]">
          <h3 className="font-label-caps text-xs text-primary mb-3 border-b border-outline-variant/15 pb-2 uppercase tracking-widest font-bold">
            GROUND STATIONS COVERAGE
          </h3>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1 font-data-mono text-xs">
            {stations.map((gs) => (
              <div
                key={gs.id}
                className={`p-2.5 rounded border flex justify-between items-center ${gs.status === "ACTIVE" ? "bg-primary-fixed/10 border-primary-fixed/40 text-primary-fixed shadow-[0_0_10px_rgba(0,219,231,0.1)]" : "border-outline-variant/30 text-on-surface"}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${gs.status === "ACTIVE" ? "bg-tertiary-fixed animate-pulse" : "bg-outline"}`} />
                  <span className="font-bold">{gs.name.toUpperCase()}</span>
                </div>
                <span className="text-[10px] text-outline font-bold">LAT {gs.latitude.toFixed(1)}°N</span>
              </div>
            ))}
          </div>
        </div>

        {/* Local conditions */}
        <div className="col-span-12 md:col-span-3 glass-card rounded-xl p-5 flex flex-col h-[280px]">
          <h3 className="font-label-caps text-xs text-primary mb-3 border-b border-outline-variant/15 pb-2 uppercase tracking-widest font-bold">
            GS ENVIRONMENTAL HUD
          </h3>
          
          <div className="space-y-4 flex-1 flex flex-col justify-around text-xs font-data-mono border-outline-variant/15">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-base">air</span>
                <span className="text-outline text-[10px] font-bold">LOCAL CONDITIONS</span>
              </div>
              <div className="text-right">
                <p className="font-bold">18°C, CLEAR SKY</p>
                <p className="text-[10px] text-outline">Wind SE 12km/h</p>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-base">wifi_tethering_error</span>
                <span className="text-outline text-[10px] font-bold">INTERFERENCE RISK</span>
              </div>
              <span className="text-tertiary-fixed font-bold">LOW RISK</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-outline text-base">speed</span>
                <span className="text-outline text-[10px] font-bold">COMMS COEF</span>
              </div>
              <span className="text-tertiary-fixed font-bold">NOMINAL (99.9%)</span>
            </div>
          </div>
        </div>

        {/* Row 3: PassOpportunities (8 cols) and Hardware pointing (4 cols) */}
        {/* Pass opportunities list table */}
        <div className="col-span-12 md:col-span-8 glass-card rounded-xl p-5 flex flex-col h-[280px] overflow-hidden">
          <h2 className="font-label-caps text-xs text-primary mb-3 border-b border-outline-variant/15 pb-2 uppercase tracking-widest font-bold">
            AETHER PASS SCHEDULER
          </h2>
          <div className="overflow-auto flex-1">
            <table className="w-full text-left font-data-mono text-xs border-collapse">
              <thead>
                <tr className="text-outline border-b border-outline-variant/20 font-label-caps text-[10px] sticky top-0 bg-surface-container-lowest z-10 pb-2">
                  <th className="py-2">ORBIT NODE ID</th>
                  <th className="py-2">AOS PASS TIME (UTC)</th>
                  <th className="py-2">LOS LOSS TIME (UTC)</th>
                  <th className="py-2 text-center">MAX ELEVATION</th>
                  <th className="py-2 text-right">UPLINK STATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 text-cyan-200-variant font-semibold">
                <tr className="hover:bg-primary/5">
                  <td className="py-3 text-primary-fixed-dim font-bold">AETHER-1</td>
                  <td className="py-3">14:22:05</td>
                  <td className="py-3">14:31:10</td>
                  <td className="py-3 text-center">45.2°</td>
                  <td className="py-3 text-right text-tertiary-fixed font-bold animate-pulse">ACTIVE COMMS</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="py-3 text-cyan-200-variant">AETHER-2</td>
                  <td className="py-3">15:40:00</td>
                  <td className="py-3">15:52:30</td>
                  <td className="py-3 text-center">78.1°</td>
                  <td className="py-3 text-right text-cyan-200-variant">SCHEDULED</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="py-3 text-cyan-200-variant">IRIS-4</td>
                  <td className="py-3">18:10:15</td>
                  <td className="py-3">18:18:45</td>
                  <td className="py-3 text-center">22.4°</td>
                  <td className="py-3 text-right text-cyan-200-variant">SCHEDULED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Antenna Hardware */}
        <div className="col-span-12 md:col-span-4 glass-card rounded-xl p-5 flex flex-col h-[280px]">
          <h3 className="font-label-caps text-xs text-primary mb-3 border-b border-outline-variant/15 pb-2 uppercase tracking-widest font-bold">
            ANTENNA POINTING SYSTEM
          </h3>
          
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Azimuth / Elevation */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded p-4 flex flex-col justify-center items-center relative overflow-hidden group">
              <span className="material-symbols-outlined text-outline text-3xl mb-2 group-hover:text-primary-fixed transition-colors">explore</span>
              
              <div className="text-center w-full border-b border-outline-variant/20 pb-2 mb-2">
                <div className="font-data-mono text-[9px] text-outline font-bold">AZIMUTH ENCODER</div>
                <div className="font-data-mono text-sm text-cyan-200 font-bold">145.2°</div>
              </div>
              <div className="text-center w-full">
                <div className="font-data-mono text-[9px] text-outline font-bold">ELEVATION ANGLE</div>
                <div className="font-data-mono text-sm text-primary-fixed-dim drop-shadow-[0_0_5px_rgba(0,219,231,0.5)] font-bold">32.8°</div>
              </div>
            </div>

            {/* System Temps */}
            <div className="bg-surface-container-lowest border border-outline-variant/20 rounded p-4 flex flex-col justify-around gap-2 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-data-mono text-[9px] text-outline font-bold">LNA TEMP</span>
                  <span className="font-data-mono text-tertiary-fixed font-bold">12°C</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded overflow-hidden">
                  <div className="bg-tertiary-fixed h-full w-[30%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-data-mono text-[9px] text-outline font-bold">ROTATORS</span>
                  <span className="font-data-mono text-secondary-fixed font-bold">45°C</span>
                </div>
                <div className="w-full bg-surface-container-highest h-1.5 rounded overflow-hidden">
                  <div className="bg-secondary-fixed h-full w-[60%]" />
                </div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 flex justify-between items-center">
                <span className="font-data-mono text-[9px] text-outline font-bold">TRACKING MODE</span>
                <span className="px-2 py-0.5 rounded bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/30 font-data-mono text-[9px] font-bold">AUTO_GPS</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
