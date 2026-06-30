import React, { useEffect, useState } from "react";
import { Satellite } from "../types";
import { getSatellites } from "../api";

interface AnalyticsViewProps {
  activeSatId?: string;
}

export default function AnalyticsView({ activeSatId = "aether-1" }: AnalyticsViewProps) {
  const [satellites, setSatellites] = useState<Satellite[]>([]);

  useEffect(() => {
    let active = true;
    async function fetchSats() {
      try {
        const sats = await getSatellites();
        if (!active) return;
        setSatellites(sats);
      } catch (err) {
        console.error(err);
      }
    }
    fetchSats();
    const timer = setInterval(fetchSats, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const totalHealth = satellites.length > 0
    ? parseFloat((satellites.reduce((acc, s) => acc + s.health, 0) / satellites.length).toFixed(1))
    : 94.2;

  return (
    <div id="analytics-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            Health &amp; Life Analytics
          </h1>
          <p className="font-body-md text-xs text-cyan-200-variant mt-1.5">
            AI-driven failure prediction models, atmospheric drag analysis, and solar degradation forecasts.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-container px-4 py-2 rounded-lg border border-primary/20 shadow-md">
          <span className="font-label-caps text-[10px] text-outline">AGGREGATE HEALTH:</span>
          <span className="font-label-caps text-xs text-tertiary-fixed bg-tertiary-fixed/10 px-2 py-0.5 rounded border border-tertiary-fixed/30 shadow-[0_0_5px_rgba(121,255,91,0.2)]">
            {totalHealth}%
          </span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Top Split Card: Aggregate Health vs Mission Life */}
        <div className="md:col-span-8 glass-card rounded-lg p-5 flex flex-col md:flex-row gap-6 h-[180px] shrink-0">
          <div className="flex-1 flex flex-col justify-center pr-6 border-r border-outline-variant/20">
            <h2 className="font-headline-sm text-xs text-primary mb-2 flex items-center gap-1.5 font-bold">
              <span className="material-symbols-outlined text-[16px]">vital_signs</span> COGNITIVE INTEGRITY SCORE
            </h2>
            <div className="text-4xl md:text-5xl font-data-mono text-primary-fixed leading-none drop-shadow-[0_0_10px_rgba(116,245,255,0.4)]">
              {totalHealth}%
            </div>
            <p className="font-label-caps text-[10px] text-outline uppercase mt-2">Spacecraft Avionics Integrity Nominal</p>
          </div>

          <div className="flex-1 flex flex-col justify-center pl-2">
            <h3 className="font-label-caps text-[10px] text-outline mb-2 tracking-widest font-bold">Avionics 90-Day Trend</h3>
            <div className="flex-1 relative border-l border-b border-outline-variant/30 flex items-end pb-1 pr-1">
              <svg className="w-full h-12" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path
                  className="drop-shadow-[0_0_5px_rgba(116,245,255,0.5)]"
                  d="M0,25 L10,23 L20,24 L30,20 L40,18 L50,15 L60,16 L70,12 L80,10 L90,8 L100,5"
                  fill="none"
                  stroke="#74f5ff"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
                <circle cx="100" cy="5" fill="#79ff5b" r="3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Estimated Remaining Mission Life */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col justify-center items-center h-[180px] border-primary-fixed/20">
          <h2 className="font-headline-sm text-xs text-primary mb-2 flex items-center gap-1.5 font-bold w-full text-left">
            <span className="material-symbols-outlined text-[16px]">update</span> EST REMAINING MISSION LIFE
          </h2>
          <div className="text-4xl font-data-mono text-tertiary-fixed drop-shadow-[0_0_10px_rgba(121,255,91,0.4)] font-bold">
            4.2 YRS
          </div>
          <span className="font-label-caps text-[9px] text-primary-fixed mt-2 border border-primary-fixed/30 bg-primary-fixed/10 px-3 py-1 rounded-full font-bold">
            92% ML CONFIDENCE
          </span>
        </div>

        {/* AI Prediction Models */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[280px]">
          <h2 className="font-headline-sm text-xs text-secondary-container mb-3 flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[16px]">psychology</span> AI PREGNANCY PREDICTIONS
          </h2>
          <div className="space-y-4 flex-1 flex flex-col justify-around">
            <div>
              <div className="flex justify-between text-xs mb-1 font-data-mono">
                <span className="text-outline">Battery Decay Forecast</span>
                <span className="text-error font-bold">Warning: 14 Mo</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                <div className="bg-error h-full rounded-full shadow-[0_0_5px_#ffb4ab]" style={{ width: "75%" }} />
              </div>
              <p className="font-data-mono text-[8px] text-outline text-right mt-1">PROJ FAIL POINT: 10.5V</p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-data-mono">
                <span className="text-outline">Reaction Wheels Friction</span>
                <span className="text-primary-fixed font-bold">NOMINAL</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-1.5">
                <div className="bg-primary-fixed h-full rounded-full" style={{ width: "25%" }} />
              </div>
              <p className="font-data-mono text-[8px] text-outline text-right">Anomaly prob: 2.1%</p>
            </div>
          </div>
        </div>

        {/* Failure Risk Matrix */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[280px]">
          <h2 class="font-headline-sm text-xs text-primary mb-3 flex items-center gap-1.5 uppercase tracking-widest border-b border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[16px]">crisis_alert</span> Failure Risk Matrix
          </h2>
          <div className="flex-1 flex flex-col justify-between font-data-mono text-xs">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
              <span className="text-cyan-200-variant font-bold">Power System (EPS)</span>
              <span className="text-error bg-error/10 px-2 py-0.5 rounded border border-error/30 text-[10px] font-bold">HIGH</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
              <span className="text-cyan-200-variant font-bold">Thermal System</span>
              <span className="text-secondary-fixed bg-secondary-fixed-dim/20 px-2 py-0.5 rounded border border-secondary-fixed/30 text-[10px] font-bold">MED</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
              <span className="text-cyan-200-variant font-bold">ADCS Gyro drift</span>
              <span className="text-tertiary-fixed bg-tertiary-fixed/10 px-2 py-0.5 rounded border border-tertiary-fixed/30 text-[10px] font-bold">LOW</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-2">
              <span className="text-cyan-200-variant font-bold">Communications Link</span>
              <span className="text-tertiary-fixed bg-tertiary-fixed/10 px-2 py-0.5 rounded border border-tertiary-fixed/30 text-[10px] font-bold">LOW</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="text-cyan-200-variant font-bold">Science Payloads</span>
              <span className="text-tertiary-fixed bg-tertiary-fixed/10 px-2 py-0.5 rounded border border-tertiary-fixed/30 text-[10px] font-bold">LOW</span>
            </div>
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[280px]">
          <h2 class="font-headline-sm text-xs text-primary mb-3 flex items-center gap-1.5 uppercase tracking-widest border-b border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[16px]">build_circle</span> PREDICTIVE ACTIONS
          </h2>
          <div className="space-y-3.5 overflow-y-auto flex-1 flex flex-col justify-center">
            <div className="flex gap-2.5 items-start bg-surface-container-high/30 p-2 border border-outline-variant/20 rounded">
              <span className="material-symbols-outlined text-sm text-secondary-container mt-0.5">battery_charging_full</span>
              <div>
                <div className="font-label-caps text-[10px] text-secondary-container font-bold">Schedule Reconditioning Cycle</div>
                <div className="font-body-md text-[10px] text-outline mt-0.5 leading-snug">
                  Optimal window: T+14 Days. Extends lithium cells life index.
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 items-start bg-surface-container-high/30 p-2 border border-outline-variant/20 rounded">
              <span className="material-symbols-outlined text-sm text-primary-fixed mt-0.5">settings_input_antenna</span>
              <div>
                <div className="font-label-caps text-[10px] text-primary-fixed font-bold">Recalibrate Attitudinal Offsets</div>
                <div className="font-body-md text-[10px] text-outline mt-0.5 leading-snug">
                  Routine gyro synchronization recommended on polar eclipse.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solar Array Efficiency */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[260px]">
          <h2 className="font-headline-sm text-xs text-primary mb-1 flex items-center gap-1.5 font-bold">
            <span className="material-symbols-outlined text-[16px]">solar_power</span> Solar Arrays Degradation
          </h2>
          <p className="font-body-md text-[10px] text-outline mb-3">Efficiency Coefficient Output (30 Days)</p>
          <div className="flex-1 relative border-l border-b border-outline-variant/40 flex items-end pb-1 px-1">
            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between font-data-mono text-[8px] text-outline">
              <span>100</span>
              <span>80</span>
              <span>60</span>
            </div>
            
            <div className="w-full h-full flex items-end justify-between gap-1 pl-1">
              <div className="w-full bg-primary-fixed/25 border-t border-primary-fixed h-[95%]" />
              <div className="w-full bg-primary-fixed/20 border-t border-primary-fixed h-[94%]" />
              <div className="w-full bg-primary-fixed/20 border-t border-primary-fixed h-[92%]" />
              <div class="w-full bg-primary-fixed/20 border-t border-primary-fixed h-[91%]" />
              <div className="w-full bg-primary-fixed/20 border-t border-primary-fixed h-[89%]" />
              <div className="w-full bg-primary-fixed/20 border-t border-primary-fixed h-[90%]" />
              <div className="w-full bg-primary-fixed/20 border-t border-primary-fixed h-[88%]" />
            </div>
          </div>
          <div className="flex justify-between w-full mt-1.5 font-data-mono text-[9px] text-outline pl-1">
            <span>T-30D</span>
            <span>T-15D</span>
            <span>TODAY</span>
          </div>
        </div>

        {/* Subsystem comparison progress */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[260px]">
          <h2 className="font-headline-sm text-xs text-primary mb-3 flex items-center gap-1.5 font-bold uppercase tracking-widest border-b border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[16px]">donut_small</span> Fleet Subsystem Comparison
          </h2>
          
          <div className="flex-1 flex flex-col justify-around">
            <div>
              <div className="flex justify-between font-label-caps text-[9px] text-outline mb-1">
                <span>EPS (POWER BUS)</span>
                <span>{activeSatId === "iris-4" ? "12%" : "98%"}</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${activeSatId === "iris-4" ? "bg-error" : "bg-tertiary-fixed"}`}
                  style={{ width: activeSatId === "iris-4" ? "12%" : "98%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-caps text-[9px] text-outline mb-1">
                <span>THERMAL OVERHEAT</span>
                <span>{activeSatId === "iris-4" ? "82%" : "38%"}</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${activeSatId === "iris-4" ? "bg-error" : "bg-primary-fixed"}`}
                  style={{ width: activeSatId === "iris-4" ? "82%" : "38%" }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-caps text-[9px] text-outline mb-1">
                <span>ADCS ORIENTATION LOCK</span>
                <span>95%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary-fixed h-full rounded-full" style={{ width: "95%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-label-caps text-[9px] text-outline mb-1">
                <span>COMMS TRANSMISSION LINK</span>
                <span>99%</span>
              </div>
              <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                <div className="bg-secondary-fixed h-full rounded-full" style={{ width: "99%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Orbital drag log */}
        <div className="md:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[260px] overflow-hidden">
          <h2 className="font-headline-sm text-xs text-primary mb-2 flex items-center gap-1.5 font-bold uppercase tracking-widest border-b border-outline-variant/20 pb-2">
            <span className="material-symbols-outlined text-[16px]">history</span> ORBITAL DECAY LOG
          </h2>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-data-mono text-[11px] border-collapse">
              <thead>
                <tr className="text-outline border-b border-outline-variant/15 text-[10px]">
                  <th className="py-2">TIMESTAMP</th>
                  <th className="py-2">ALTITUDE</th>
                  <th className="py-2 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5">
                <tr className="hover:bg-primary/5">
                  <td className="py-2 text-outline-variant">2026-06-29 14:12</td>
                  <td className="py-2 text-cyan-200 font-semibold">525.4 km</td>
                  <td className="py-2 text-right text-tertiary-fixed font-bold">STABLE</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="py-2 text-outline-variant">2026-06-29 08:33</td>
                  <td className="py-2 text-cyan-200 font-semibold">525.8 km</td>
                  <td className="py-2 text-right text-tertiary-fixed font-bold">STABLE</td>
                </tr>
                <tr className="hover:bg-primary/5">
                  <td className="py-2 text-outline-variant">2026-06-28 12:45</td>
                  <td className="py-2 text-cyan-200 font-semibold">526.1 km</td>
                  <td className="py-2 text-right text-secondary-fixed font-bold">DRAG_WARN</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
