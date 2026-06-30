import React, { useEffect, useState } from "react";
import { User, Command, MissionLog } from "../types";
import { getCommands, getLogs } from "../api";

export default function UsersView() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [logs, setLogs] = useState<MissionLog[]>([]);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const cmds = await getCommands();
        const logsData = await getLogs();
        if (!active) return;
        setCommands(cmds);
        setLogs(logsData.slice(0, 10));
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
    const timer = setInterval(loadData, 4000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const handleLockdown = () => {
    alert("CRITICAL WARNING: Emergency operator lockdown triggered. All transponders are locked into telemetry-only beacon status. Ground Link uplink commands disabled.");
  };

  return (
    <div id="users-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            Identity &amp; Security (IAM)
          </h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed animate-pulse shadow-[0_0_8px_rgba(121,255,91,0.6)]" />
            <span className="font-label-caps text-[10px] text-cyan-200/70 tracking-widest uppercase">OPERATOR AUTHENTICATION GATEWAY: NOMINAL</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right font-data-mono text-xs text-outline hidden sm:block">
            <p>ACTIVE_SESSIONS: <span className="text-primary-fixed">08</span></p>
            <p className="mt-0.5">AUTH_LATENCY: <span className="text-tertiary-fixed">14ms</span></p>
          </div>
          <button
            onClick={handleLockdown}
            className="px-4 py-2 border border-error/50 text-error font-label-caps text-xs rounded hover:bg-error/10 transition-all flex items-center gap-2 cursor-pointer font-bold"
          >
            <span className="material-symbols-outlined text-sm">lock</span> EMERGENCY SYSTEM LOCKDOWN
          </button>
        </div>
      </div>

      {/* Row 1 Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-surface-container-lowest/60 border border-outline-variant/20 rounded-lg p-3 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group shadow-md">
          <span className="text-outline font-label-caps text-[10px] font-bold">TOTAL OPERATORS</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-headline-md font-bold text-primary">24</span>
            <span className="text-[9px] font-data-mono text-tertiary-fixed font-bold">+2 WK</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest/60 border border-outline-variant/20 rounded-lg p-3 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group shadow-md">
          <span className="text-outline font-label-caps text-[10px] font-bold">ONLINE NOW</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-headline-md font-bold text-tertiary-fixed">08</span>
            <span className="text-[9px] font-data-mono text-outline">33% CAP</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest/60 border border-outline-variant/20 rounded-lg p-3 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group shadow-md">
          <span className="text-outline font-label-caps text-[10px] font-bold">SECURITY RATING</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-headline-md font-bold text-primary-fixed-dim">98.2%</span>
            <span className="text-[9px] font-data-mono text-tertiary-fixed font-bold">OPTIMAL</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest/60 border border-outline-variant/20 rounded-lg p-3 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group shadow-md">
          <span className="text-outline font-label-caps text-[10px] font-bold">AUTH EXCEPTIONS</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-headline-md font-bold text-cyan-200">00</span>
            <span className="text-[9px] font-data-mono text-cyan-200">LAST 24H</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest/60 border border-primary/20 rounded-lg p-3 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden border-l-4 shadow-md col-span-2 md:col-span-1">
          <span className="text-primary font-label-caps text-[10px] font-bold">MFA TOKENS ENFORCED</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-headline-md font-bold text-primary-fixed">ENFORCED</span>
            <span className="text-[9px] font-data-mono text-tertiary-fixed font-bold">HARDWARE_KEY</span>
          </div>
        </div>
      </div>

      {/* Main Panels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Left operator lists (8 cols) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col backdrop-blur-xl h-[360px]">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/30">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
              <h3 className="font-headline-sm text-sm text-cyan-200 tracking-tight uppercase font-bold">
                Active Ground Station Operator Profiles
              </h3>
            </div>
            <span className="font-data-mono text-[10px] text-outline">AUTHENTICATION: ACTIVE</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
            
            {/* Engineer Profile 1 */}
            <div className="bg-surface-container/30 border border-outline-variant/20 rounded-lg p-4 flex gap-4 hover:border-primary/40 transition-all group relative overflow-hidden">
              <div className="shrink-0 w-16 h-16 rounded bg-surface-container-highest border border-outline-variant/30 relative">
                <img
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAzwENKRw1efXGqQlNT2C60g1GEnJHvk05CC0oj83kMSgM67ftRfu3pdus4UkmaUIVylER7fiKo9PWSv7BH7mwEe0adqhbQ_oA-_hC-l-89aqYUJtAutyRuJOPO855j8MSM5SAqI-aTanTqBKrXlMZYX10gvAzhLiCm5rcu_aWu46vekZgFglBqLZhAb7lDHM8wLIosks8QEWZh8HPrBEDY_kFVKbVLOplcWLlVbr7cOOoI3xa1iK4GJ_h1RwFShxweoPL6KmxiavE"
                  alt="Dr. Thorne"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary-fixed border-2 border-surface-container-lowest" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-headline-sm text-xs truncate text-primary group-hover:text-primary-fixed transition-colors font-bold">Dr. Aris Thorne</h4>
                    <span className="font-data-mono text-[9px] text-outline">ID: OP-7729-A</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary-fixed/10 text-primary-fixed text-[8px] font-label-caps border border-primary-fixed/20 font-bold">L5 ACCESS</span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2.5 font-data-mono text-[10px]">
                  <div>
                    <span className="text-outline block text-[8px] font-bold">ROLE:</span>
                    <span className="text-cyan-200 truncate block font-bold">Mission Cmdr</span>
                  </div>
                  <div>
                    <span className="text-outline block text-[8px] font-bold">SUBSYS:</span>
                    <span className="text-cyan-200 truncate block font-bold">GNC / Polar</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Engineer Profile 2 */}
            <div className="bg-surface-container/30 border border-outline-variant/20 rounded-lg p-4 flex gap-4 hover:border-primary/40 transition-all group relative overflow-hidden">
              <div className="shrink-0 w-16 h-16 rounded bg-surface-container-highest border border-outline-variant/30 relative">
                <img
                  className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwBkaM1bZZUwX_9QkZbnbNpabo-ZZcPj96WcI_1ALAd01zX7fenaRsjpdEi1ya56RKa3LVO5714YcZ2ipbSM_4O2WY-22mDG1JaVX7q2Ap_C1A0zXaqmnliodXdZdISXtHl2rB-ixvpxNO1ov4jcP5zcnTY68Iak1eBuEfVzzKNtUTvWA7wtHspIlX5IeoOA7RoCDWXPbvFhwTsV7edQUesJmO7zL8Tg9hm7gqr_MH-peNpeyTiClpNB9tMPgnObAkH1-c8JU6Lvc"
                  alt="Elena Rostova"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-tertiary-fixed border-2 border-surface-container-lowest" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-headline-sm text-xs truncate text-primary group-hover:text-primary-fixed transition-colors font-bold">Lt. Elena Rostova</h4>
                    <span className="font-data-mono text-[9px] text-outline">ID: TM-4410-B</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-primary-fixed/10 text-primary-fixed text-[8px] font-label-caps border border-primary-fixed/20 font-bold">L4 ACCESS</span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2.5 font-data-mono text-[10px]">
                  <div>
                    <span className="text-outline block text-[8px] font-bold">ROLE:</span>
                    <span className="text-cyan-200 truncate block font-bold">Telemetry Spec</span>
                  </div>
                  <div>
                    <span className="text-outline block text-[8px] font-bold">SUBSYS:</span>
                    <span className="text-cyan-200 truncate block font-bold">Comms Array</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RBAC Tables on Right (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest/80 border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col backdrop-blur-xl h-[360px]">
          <div className="p-3.5 border-b border-outline-variant/20 bg-surface-container-low/30 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">admin_panel_settings</span>
              <h3 className="font-label-caps text-[10px] text-cyan-200 tracking-widest font-bold uppercase">Role Permissions Matrix</h3>
            </div>
            <span className="text-[9px] font-data-mono text-cyan-200">SCH_V2.0</span>
          </div>

          <div className="flex-1 overflow-y-auto p-2 scrollbar-hide font-data-mono text-[11px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-cyan-200 border-b border-outline-variant/10 text-[9px] font-bold">
                  <th className="p-2 w-1/2">Permission</th>
                  <th className="p-2 text-center">CMD</th>
                  <th className="p-2 text-center">TEL</th>
                  <th className="p-2 text-center">SYS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 text-cyan-200 font-bold">
                <tr>
                  <td className="p-2">Orbit Thruster Control</td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                  <td className="p-2 text-center text-error"><span className="material-symbols-outlined text-sm">cancel</span></td>
                  <td className="p-2 text-center text-error"><span className="material-symbols-outlined text-sm">cancel</span></td>
                </tr>
                <tr>
                  <td className="p-2">Payload modulation</td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                  <td className="p-2 text-center text-error"><span className="material-symbols-outlined text-sm">cancel</span></td>
                </tr>
                <tr>
                  <td className="p-2">Emergency Safe Mode</td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                  <td className="p-2 text-center text-error"><span className="material-symbols-outlined text-sm">cancel</span></td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                </tr>
                <tr>
                  <td className="p-2">Telemetry export</td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                  <td className="p-2 text-center text-tertiary-fixed"><span className="material-symbols-outlined text-sm">check_circle</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Operator command audit log */}
      <div className="bg-surface-container-lowest/90 border border-outline-variant/20 rounded-xl flex flex-col overflow-hidden backdrop-blur-2xl relative shadow-md">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <div className="px-4 py-2.5 border-b border-outline-variant/20 bg-surface-container-low/40 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">terminal</span>
            <h3 className="font-label-caps text-[10px] text-cyan-200 tracking-[0.2em] font-bold uppercase">
              UPLINK COMMAND SECURITY AUDIT LOGS
            </h3>
          </div>
          <span className="font-data-mono text-[9px] text-cyan-200">STREAMING STATUS: ONLINE</span>
        </div>

        <div className="overflow-x-auto scrollbar-hide max-h-[300px]">
          <table className="w-full text-left border-collapse font-data-mono text-[11px]">
            <thead>
              <tr className="bg-surface-container-high/20 border-b border-outline-variant/10 text-cyan-200 text-[9px] font-bold">
                <th className="py-2 px-4">TIMESTAMP (UTC)</th>
                <th className="py-2 px-4">OPERATOR ID</th>
                <th className="py-2 px-4">SUBSYSTEM</th>
                <th className="py-2 px-4">TRANSMITTED ACTION CODE</th>
                <th className="py-2 px-4 text-right">METRIC SHA SIGNATURE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5 text-cyan-200 font-semibold">
              {commands.map((cmd) => (
                <tr key={cmd.id} className="hover:bg-primary/5 transition-colors">
                  <td className="py-2 px-4 text-cyan-200">{new Date(cmd.timestamp).toISOString()}</td>
                  <td className="py-2 px-4 text-cyan-200">{cmd.operator.replace("usr-1", "AX-774")}</td>
                  <td className="py-2 px-4 uppercase">
                    <span className="px-1.5 py-0.5 bg-primary/5 border border-primary/20 text-primary text-[9px] rounded font-bold">
                      {cmd.code.includes("COM") || cmd.code.includes("LINK") ? "COMMS" : "AVIONICS"}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-cyan-200">{cmd.code}</td>
                  <td className="py-2 px-4 text-right text-tertiary-fixed font-bold">0x{cmd.id.slice(-6).toUpperCase()}8F29</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
