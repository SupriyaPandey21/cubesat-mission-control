import React, { useEffect, useState } from "react";
import { Settings, MissionLog } from "../types";
import { getSettings, updateSettings, getLogs } from "../api";

export default function SettingsView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [logs, setLogs] = useState<MissionLog[]>([]);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Local state form variables
  const [batteryCrit, setBatteryCrit] = useState(15);
  const [thermalWarn, setThermalWarn] = useState(65.5);
  const [signalFloor, setSignalFloor] = useState(-110);
  const [uplink, setUplink] = useState("2250.500");
  const [downlink, setDownlink] = useState("8450.000");
  const [encryptionKey, setEncryptionKey] = useState("xk9-delta-protocol-77a");
  const [adaptiveDataRate, setAdaptiveDataRate] = useState("AUTO (DYN_NEG)");
  const [hudPush, setHudPush] = useState(true);
  const [smsForwarding, setSmsForwarding] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const config = await getSettings();
        const logsData = await getLogs();
        if (!active) return;
        setSettings(config);
        setLogs(logsData.filter(l => l.message.includes("threshold") || l.message.includes("parameter")).slice(0, 5));

        // Sync local forms
        setBatteryCrit(config.batteryCritical);
        setThermalWarn(config.thermalWarning);
        setSignalFloor(config.signalFloor);
        setUplink(config.uplinkFreq);
        setDownlink(config.downlinkFreq);
        setEncryptionKey(config.encryptionKey);
        setAdaptiveDataRate(config.adaptiveDataRate);
        setHudPush(config.hudPushAlerts);
        setSmsForwarding(config.smsForwarding);
      } catch (err) {
        console.error(err);
      }
    }

    loadData();
    return () => { active = false; };
  }, []);

  const handleApply = async () => {
    setSaving(true);
    try {
      const payload: Partial<Settings> = {
        batteryCritical: batteryCrit,
        thermalWarning: thermalWarn,
        signalFloor,
        uplinkFreq: uplink,
        downlinkFreq: downlink,
        encryptionKey,
        adaptiveDataRate,
        hudPushAlerts: hudPush,
        smsForwarding
      };
      await updateSettings(payload);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2000);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  const handleRevert = () => {
    if (!settings) return;
    setBatteryCrit(settings.batteryCritical);
    setThermalWarn(settings.thermalWarning);
    setSignalFloor(settings.signalFloor);
    setUplink(settings.uplinkFreq);
    setDownlink(settings.downlinkFreq);
    setEncryptionKey(settings.encryptionKey);
    setAdaptiveDataRate(settings.adaptiveDataRate);
    setHudPush(settings.hudPushAlerts);
    setSmsForwarding(settings.smsForwarding);
  };

  return (
    <div id="settings-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            Platform Configuration
          </h1>
          <p className="font-body-md text-xs text-on-surface-variant mt-1.5">
            Core hardware alarm thresholds, transponder synchronizations, and communication frequency protocols.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRevert}
            className="px-5 py-2 border border-primary/30 text-primary-fixed font-label-caps text-[10px] rounded hover:bg-primary-fixed/10 transition-colors cursor-pointer"
          >
            REVERT CHANGES
          </button>
          <button
            onClick={handleApply}
            disabled={saving}
            className="px-5 py-2 bg-primary-fixed text-on-primary-fixed font-label-caps text-[10px] rounded hover:shadow-[0_0_12px_rgba(116,245,255,0.4)] transition-all font-bold cursor-pointer"
          >
            {saving ? "SAVING CONFIG..." : "APPLY ALL MODIFICATIONS"}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 bg-tertiary-fixed/10 border border-tertiary-fixed/30 text-tertiary-fixed font-data-mono text-xs rounded text-center font-bold">
          ✓ MISSION CONFIGURATION SYNCHRONIZED SUCCESSFULLY ACROSS ALL OPERATING FLEETS
        </div>
      )}

      {/* Grid Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Alert Thresholds */}
        <section className="col-span-12 lg:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary-fixed">
              <span className="material-symbols-outlined text-[20px]">tune</span>
              <h2 className="font-headline-sm text-sm font-bold">Alarms Threshold Ranges</h2>
            </div>
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse shadow-[0_0_6px_#79ff5b]" />
          </div>
          
          <div className="space-y-4 flex-1 flex flex-col justify-around text-xs">
            <div>
              <div className="flex justify-between mb-1 font-label-caps text-[10px] text-outline font-bold">
                <span>Battery Critical Fault</span>
                <span className="font-data-mono text-error font-bold">{batteryCrit.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                value={batteryCrit}
                onChange={(e) => setBatteryCrit(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-surface-container rounded-lg appearance-none"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-label-caps text-[10px] text-outline font-bold">
                <span>Thermal Overheat limit</span>
                <span className="font-data-mono text-secondary-fixed font-bold">{thermalWarn.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="30"
                max="100"
                value={thermalWarn}
                onChange={(e) => setThermalWarn(parseFloat(e.target.value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-surface-container rounded-lg appearance-none"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 font-label-caps text-[10px] text-outline font-bold">
                <span>Signal RSSI Floor</span>
                <span className="font-data-mono text-primary-fixed-dim font-bold">{signalFloor} dBm</span>
              </div>
              <input
                type="range"
                min="-135"
                max="-80"
                value={signalFloor}
                onChange={(e) => setSignalFloor(parseInt(e.target.value))}
                className="w-full accent-primary cursor-pointer h-1.5 bg-surface-container rounded-lg appearance-none"
              />
            </div>
          </div>
        </section>

        {/* Communication params */}
        <section className="col-span-12 lg:col-span-4 glass-card rounded-lg p-5 flex flex-col h-[280px]">
          <div className="flex items-center gap-2 text-primary-fixed mb-4">
            <span className="material-symbols-outlined text-[20px]">cell_tower</span>
            <h2 className="font-headline-sm text-sm font-bold">Uplink Carrier Parameters</h2>
          </div>
          
          <div className="space-y-3.5 flex-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] font-label-caps text-outline block mb-1 font-bold">UPLINK CARRIER (MHz)</label>
                <input
                  type="text"
                  value={uplink}
                  onChange={(e) => setUplink(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-primary/20 rounded px-2.5 py-1.5 font-data-mono text-xs text-primary focus:border-primary-fixed outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] font-label-caps text-outline block mb-1 font-bold">DOWNLINK CARRIER (MHz)</label>
                <input
                  type="text"
                  value={downlink}
                  onChange={(e) => setDownlink(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-primary/20 rounded px-2.5 py-1.5 font-data-mono text-xs text-primary focus:border-primary-fixed outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-label-caps text-outline block mb-1 font-bold">MASTER ENCRYPTION KEY HANDSHAKE</label>
              <div className="relative">
                <input
                  type="password"
                  value={encryptionKey}
                  onChange={(e) => setEncryptionKey(e.target.value)}
                  className="w-full bg-surface-container-lowest/50 border border-primary/20 rounded px-2.5 py-1.5 pl-8 font-data-mono text-xs text-primary focus:border-primary-fixed outline-none"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-outline">key</span>
              </div>
            </div>

            <div>
              <label className="text-[9px] font-label-caps text-outline block mb-1 font-bold">ADAPTIVE BANDWIDTH DATA RATE</label>
              <select
                value={adaptiveDataRate}
                onChange={(e) => setAdaptiveDataRate(e.target.value)}
                className="w-full bg-surface-container border border-primary/20 rounded px-2.5 py-1.5 font-data-mono text-xs text-primary focus:border-primary-fixed outline-none cursor-pointer"
              >
                <option>AUTO (DYN_NEG)</option>
                <option>FIXED_10M</option>
                <option>EMERGENCY_BEACON_ONLY</option>
              </select>
            </div>
          </div>
        </section>

        {/* Security Status */}
        <section className="col-span-12 lg:col-span-4 glass-card rounded-lg p-5 flex flex-col justify-between h-[180px] lg:h-[280px]">
          <div>
            <div className="flex items-center gap-2 text-primary-fixed mb-4">
              <span className="material-symbols-outlined text-[20px]">verified_user</span>
              <h2 className="font-headline-sm text-sm font-bold">AES-256 Security Status</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-y-4 font-data-mono text-xs">
              <div className="flex flex-col">
                <span className="text-[9px] font-label-caps text-outline font-bold">ENCRYPTION PROTOCOL:</span>
                <span className="text-tertiary-fixed font-bold">AES-256 ACTIVE</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-label-caps text-outline font-bold">AUTH CONTROLLERS:</span>
                <span className="text-tertiary-fixed font-bold">NOMINAL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-label-caps text-outline font-bold">UPLINK CRYPTO KEY:</span>
                <span className="text-tertiary-fixed font-bold">VERIFIED</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-label-caps text-outline font-bold">THREAT SIGNATURES:</span>
                <span className="text-secondary-fixed font-bold">LOW WARNINGS</span>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/10 pt-3 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-primary-fixed">verified</span>
              <span className="font-label-caps font-bold">SYSTEM INTEGRITY SIGNED v2.4.0</span>
            </div>
          </div>
        </section>

        {/* Preferences & Integrations */}
        <section className="col-span-12 lg:col-span-5 glass-card rounded-lg p-5 flex flex-col h-[280px]">
          <div className="flex items-center gap-2 text-primary-fixed mb-4">
            <span className="material-symbols-outlined text-[20px]">display_settings</span>
            <h2 className="font-headline-sm text-sm font-bold">Desktop HUD Prefs</h2>
          </div>
          
          <div className="space-y-4 flex-1 text-xs">
            <div>
              <h3 className="text-[9px] font-label-caps text-outline mb-2 font-bold">UI GROUND OS SKIN ENGINE</h3>
              <div className="flex gap-2">
                <button className="flex-1 border border-primary-fixed bg-primary-fixed/10 p-2 rounded flex items-center justify-between text-xs">
                  <span className="text-primary font-bold">Aether-OS Slate</span>
                  <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                </button>
                <button className="flex-1 border border-primary/20 bg-surface-container-lowest/50 p-2 rounded flex items-center justify-between opacity-50 text-xs">
                  <span className="text-outline">Soft Neomorphic</span>
                </button>
              </div>
            </div>

            <div className="space-y-3.5">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-primary font-bold">Display HUD Alerts</div>
                  <div className="text-[10px] text-outline">Pop push warnings on the screen</div>
                </div>
                <input
                  type="checkbox"
                  checked={hudPush}
                  onChange={(e) => setHudPush(e.target.checked)}
                  className="rounded bg-surface-container-lowest border border-primary/30 text-primary-fixed focus:ring-0 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <div className="text-primary font-bold">Off-Duty SMS Alerts Forwarding</div>
                  <div className="text-[10px] text-outline">Forward critical faults to operator phone</div>
                </div>
                <input
                  type="checkbox"
                  checked={smsForwarding}
                  onChange={(e) => setSmsForwarding(e.target.checked)}
                  className="rounded bg-surface-container-lowest border border-primary/30 text-primary-fixed focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Enhanced External Integrations */}
        <section className="col-span-12 lg:col-span-7 glass-card rounded-lg p-5 flex flex-col h-[280px]">
          <div className="flex items-center justify-between mb-4 border-b border-outline-variant/15 pb-2">
            <div className="flex items-center gap-2 text-primary-fixed">
              <span className="material-symbols-outlined text-[20px]">api</span>
              <h2 className="font-headline-sm text-sm font-bold">External API Handshakes</h2>
            </div>
            <span className="font-data-mono text-[9px] text-outline">2 ACTIVE DIRECTORIES</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 text-xs">
            <div className="p-3 border border-primary/10 bg-surface-container-lowest/40 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline">public</span>
                <div>
                  <div className="font-label-caps text-xs text-primary font-bold">NORAD TLE Orbit Ingest</div>
                  <div className="font-data-mono text-[9px] text-outline mt-0.5">SRC: Space-Track.org // HASH: 0x4f9a</div>
                </div>
              </div>
              <span className="font-data-mono text-[10px] text-tertiary-fixed font-bold">✓ SYNC_OK</span>
            </div>

            <div className="p-3 border border-primary/10 bg-surface-container-lowest/40 rounded flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline">satellite</span>
                <div>
                  <div className="font-label-caps text-xs text-primary font-bold">NASA-JPL Horizons Ephemeris</div>
                  <div className="font-data-mono text-[9px] text-outline mt-0.5">SRC: horizons.jpl.nasa.gov // HASH: 0x882b</div>
                </div>
              </div>
              <span className="font-data-mono text-[10px] text-tertiary-fixed font-bold">✓ SYNC_OK</span>
            </div>
          </div>
        </section>

        {/* Rules Modification Audit Logs */}
        <section className="col-span-12 glass-card rounded-lg p-5 flex flex-col h-[260px] overflow-hidden shadow-md">
          <h2 className="font-label-caps text-xs text-primary mb-3 flex items-center gap-2 border-b border-outline-variant/15 pb-2 font-bold uppercase tracking-widest shrink-0">
            <span className="material-symbols-outlined text-[16px]">history_edu</span> CONFIGURATION CHANGE LOGS
          </h2>
          
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left font-data-mono text-xs border-collapse">
              <thead>
                <tr className="text-outline border-b border-outline-variant/10 text-[10px] font-bold">
                  <th className="py-2 px-3">Timestamp (UTC)</th>
                  <th className="py-2 px-3">Operator ID</th>
                  <th className="py-2 px-3">Subsystem Code</th>
                  <th className="py-2 px-3">Adjustment Summary</th>
                  <th className="py-2 px-3 text-right">Handshake</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline/5 text-on-surface-variant font-semibold">
                <tr className="hover:bg-primary/5">
                  <td className="py-2 px-3 text-outline-variant">2026-06-29 15:12</td>
                  <td className="py-2 px-3 text-primary-fixed">CHIEF_ENG_KIM</td>
                  <td className="py-2 px-3">COMM_UPLINK_FREQ</td>
                  <td className="py-2 px-3 text-on-surface">Uplink frequency modified to {uplink} MHz</td>
                  <td className="py-2 px-3 text-right text-tertiary-fixed">VERIFIED</td>
                </tr>
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-primary/5">
                    <td className="py-2 px-3 text-outline-variant">{new Date(log.timestamp).toISOString().slice(0, 16).replace("T", " ")}</td>
                    <td className="py-2 px-3 text-primary-fixed">CHIEF_MISSION_ENG</td>
                    <td className="py-2 px-3">ALARM_SETTINGS</td>
                    <td className="py-2 px-3 text-on-surface truncate max-w-sm">{log.message}</td>
                    <td className="py-2 px-3 text-right text-tertiary-fixed">VERIFIED</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

    </div>
  );
}
