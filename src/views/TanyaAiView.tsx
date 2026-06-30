import React, { useState, useEffect } from "react";
import { Satellite, Settings } from "../types";
import { getSatellites, getSettings } from "../api";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function TanyaAiView() {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [activeEngine, setActiveEngine] = useState<"gemini" | "groq" | "claude" | "deepseek">("gemini");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "ai-initial",
      sender: "ai",
      text: "Ground Station Cognitive AI Advisor online. Uplink locked. Choose your engine and transmit queries regarding satellite orbital drift, power anomalies, thermal shielding, or general aerospace housekeeping.",
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false })
    }
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        const sats = await getSatellites();
        const config = await getSettings();
        setSatellites(sats);
        setSettings(config);
      } catch (err) {
        console.error(err);
      }
    }
    loadStats();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    const userText = input;
    setInput("");
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    
    setMessages((prev) => [
      ...prev,
      { id: `usr-${Date.now()}`, sender: "user", text: userText, timestamp }
    ]);

    setSending(true);

    // AI Request Handling
    try {
      let replyText = "";
      const chosenKey = settings?.encryptionKey; // using encryptionKey space as mock or local key

      if (activeEngine === "gemini") {
        // Build payload for real Gemini call if user provided a key
        // Otherwise, utilize a highly sophisticated, deterministic aerospace advisor reply
        const hasKey = chosenKey && chosenKey !== "xk9-delta-protocol-77a";
        const targetKey = hasKey ? chosenKey : null;

        if (targetKey) {
          try {
            const apiRes = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${targetKey}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `You are CubeSat Mission Control AI. Context: We have 3 active satellites (Aether-1, Aether-2, Iris-4). Operator query: ${userText}` }] }]
                })
              }
            );
            const data = await apiRes.json();
            replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response text received from Gemini server.";
          } catch (err) {
            console.error("Gemini API call error, falling back:", err);
            replyText = `[GEMINI_API_ERROR] Handshake failed. Fallback Cognitive Reply: I've evaluated your query regarding spacecraft parameters. Our telemetry suggests current temperatures are ${satellites[0]?.temp || "22"}°C and battery is ${satellites[0]?.battery || "92"}%. Please re-run attitude stabilization if gyro drift continues.`;
          }
        } else {
          // Autonomous fallback simulator
          replyText = getDeterministicReply(userText, satellites);
        }
      } else {
        // Groq, Claude, DeepSeek simulated answers
        replyText = `[${activeEngine.toUpperCase()}_ENGINE] Telemetry handshake locked. Processing operator instruction: "${userText}". Aerospace telemetry constraints check: AETHER-1 Polar orbit is nominal. Suggest performing GYRO stabilization if pitch drift exceeds warnings limits.`;
      }

      setMessages((prev) => [
        ...prev,
        { id: `ai-${Date.now()}`, sender: "ai", text: replyText, timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }) }
      ]);
    } catch (err) {
      console.error(err);
    }
    setSending(false);
  };

  return (
    <div id="tanya-ai-view" className="flex flex-col gap-6 animate-fade-in">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 shrink-0 border-b border-outline-variant/20 pb-4">
        <div>
          <h1 className="font-headline-lg text-[32px] md:text-[40px] text-primary glow-text uppercase">
            Cognitive AI Assistant
          </h1>
          <p className="font-body-md text-xs text-cyan-100-variant mt-1.5">
            Inter-satellite neural advisor. Transmit questions about telemetry anomalies, orbital drag, or custom commands.
          </p>
        </div>

        {/* Engine dropdown */}
        <div className="flex items-center gap-2 bg-surface-container border border-primary/20 px-3 py-1.5 rounded-sm text-xs">
          <span className="font-label-caps text-[9px] text-outline font-bold">COGNITIVE ENGINE:</span>
          <select
            value={activeEngine}
            onChange={(e) => setActiveEngine(e.target.value as any)}
            className="bg-transparent border-none outline-none font-label-caps text-xs text-primary-fixed focus:ring-0 cursor-pointer p-0 font-bold"
          >
            <option value="gemini" className="bg-surface-container-highest">GOOGLE GEMINI (2.5)</option>
            <option value="groq" className="bg-surface-container-highest">GROQ ADVISOR (Llama3)</option>
            <option value="claude" className="bg-surface-container-highest">ANTHROPIC CLAUDE (3.5)</option>
            <option value="deepseek" className="bg-surface-container-highest">DEEPSEEK REASONER (R1)</option>
          </select>
        </div>
      </div>

      {/* Main Terminal Window */}
      <div className="glass-card rounded-xl flex flex-col h-[480px] overflow-hidden shadow-lg border-primary-fixed/20 relative">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Chat Stream Header */}
        <div className="px-4 py-3 bg-surface-container/50 border-b border-outline-variant/20 flex items-center justify-between text-outline text-xs">
          <span className="font-label-caps font-bold">TRANSMISSION FEED</span>
          <span className="font-data-mono text-[9px]">ENCRYPTED STATUS: AES-256</span>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-data-mono text-xs">
          {messages.map((msg) => {
            const isAi = msg.sender === "ai";
            return (
              <div key={msg.id} className={`flex flex-col ${isAi ? "items-start" : "items-end"}`}>
                <div className="flex items-center gap-2 mb-1 text-[10px] text-outline">
                  <span className="font-bold">{isAi ? `${activeEngine.toUpperCase()} COGNITIVE ADVISOR` : "CHIEF_MISSION_ENG"}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div className={`max-w-[75%] rounded p-3 leading-relaxed border font-semibold ${isAi ? "bg-[#181233]/70 border-primary/10 text-primary" : "bg-primary-fixed/15 border-primary-fixed/30 text-primary-fixed"}`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex flex-col items-start animate-pulse">
              <span className="text-[10px] text-outline mb-1 font-bold">{activeEngine.toUpperCase()} REASONING...</span>
              <div className="bg-[#181233]/70 border border-primary/10 rounded p-3 text-outline italic">
                Uplinking brain stems. Resolving telemetry coordinates...
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 bg-surface-container/50 border-t border-outline-variant/20 flex gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={sending}
            placeholder={`Transmit queries to ${activeEngine.toUpperCase()}... (e.g., 'What is Aether-1 temperature?')`}
            className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded px-3 py-2 text-cyan-100text-xs focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none placeholder:text-outline/40 font-data-mono"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="bg-primary-fixed text-[#002022] font-label-caps text-[10px] font-bold px-5 rounded-sm hover:shadow-[0_0_12px_rgba(116,245,255,0.4)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            TRANSMIT
          </button>
        </form>
      </div>

    </div>
  );
}

// Deterministic aerospace replies fallback helper
function getDeterministicReply(query: string, satellites: Satellite[]) {
  const text = query.toLowerCase();
  const aether1 = satellites.find(s => s.id === "aether-1");
  const iris4 = satellites.find(s => s.id === "iris-4");

  if (text.includes("temp") || text.includes("heat")) {
    return `[COGNITIVE_REPLY] Temperature frames analyzed. Primary node (Aether-1) internal core temp is currently at ${aether1 ? aether1.temp : "22.1"}°C. Secondary node (Iris-4) temperature is elevated at ${iris4 ? iris4.temp : "45.5"}°C. Advise activating secondary radiator loop if temperature exceeds 55°C limit.`;
  }
  if (text.includes("battery") || text.includes("power") || text.includes("charge")) {
    return `[COGNITIVE_REPLY] Power bus logs resolved. Aether-1 battery level is optimal at ${aether1 ? aether1.battery : "92.4"}%. Iris-4 is demonstrating critical undervoltage at ${iris4 ? iris4.battery : "12.0"}%. Advise immediate payload load-shed (CMD_PAYLOAD_OFF) on Iris-4 or toggling SAFE_MODE.`;
  }
  if (text.includes("orbit") || text.includes("altitude") || text.includes("coordinate")) {
    return `[COGNITIVE_REPLY] Orbital coordinates matched. Aether-1 is orbiting polar orbit LEO-A at an altitude of ${aether1 ? aether1.altitude : "525.4"} km with velocity ${aether1 ? aether1.velocity : "7.66"} km/s. Orbit paths suggest nominal stationkeeping.`;
  }
  if (text.includes("safe_mode") || text.includes("safe")) {
    return `[COGNITIVE_REPLY] Emergency failsafe sequence ready. Transitioning to SAFE_MODE will halt payloads, align attitude target toward solar vectors, and resolve active battery/temperature anomalies. Operator signature and 2-FA code '1234' is required on the Command Authority view.`;
  }
  return `[COGNITIVE_REPLY] Instruction received and parsed. Our telemetry systems represent all three orbit vectors (Aether-1, Aether-2, Iris-4) communicating with Ground Stations. Please adjust parameters in the Settings tab if warning floors need modification.`;
}
