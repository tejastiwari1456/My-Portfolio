import React, { useState } from 'react';
import {
  Database,
  Bot,
  MessageSquare,
  KeyRound,
  CheckCircle2,
  Sliders,
  Send,
  Sparkles,
} from 'lucide-react';

/**
 * Interactive Simulation Visual for SimLab Competency Hub
 * Real ray refraction physics and Ohm's law in a colorful scientific palette
 */
export const SimLabVisual: React.FC = () => {
  const [focalLength] = useState(60); // f in mm/units
  const [objectDistance, setObjectDistance] = useState(120); // d_o in units
  const [activeLabTab, setActiveLabTab] = useState<'optics' | 'electronics'>('optics');
  const [voltage, setVoltage] = useState(5); // V
  const resistance = 10; // R in Ohms

  // Lens equation: 1/f = 1/do + 1/di => di = (f * do) / (do - f)
  const isAtFocus = Math.abs(objectDistance - focalLength) < 1;
  const imageDistance = isAtFocus ? 300 : (focalLength * objectDistance) / (objectDistance - focalLength);
  const magnification = isAtFocus ? 0 : -imageDistance / objectDistance;

  // Electronics current: I = V / R
  const current = (voltage / resistance).toFixed(2);

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-md flex flex-col select-none overflow-hidden">
      {/* Simulation Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveLabTab('optics')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
              activeLabTab === 'optics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Optics: Convex Lens Bench
          </button>
          <button
            type="button"
            onClick={() => setActiveLabTab('electronics')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
              activeLabTab === 'electronics'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Electronics: Ohm&apos;s Law
          </button>
        </div>
        <span className="text-[11px] font-mono-code font-semibold text-blue-600 hidden sm:inline">
          RBAC + Gemini Viva Voce
        </span>
      </div>

      {activeLabTab === 'optics' ? (
        <div className="p-4 flex flex-col gap-3">
          {/* SVG Optical Bench Diagram */}
          <div className="relative w-full h-36 bg-slate-900 rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
            <svg viewBox="0 0 400 140" className="w-full h-full">
              {/* Principal Axis */}
              <line x1="10" y1="70" x2="390" y2="70" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />

              {/* Lens at center x=200 */}
              <ellipse cx="200" cy="70" rx="6" ry="50" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
              <line x1="200" y1="15" x2="200" y2="125" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />

              {/* Focal points F1 (x=200-60=140) and F2 (x=200+60=260) */}
              <circle cx="140" cy="70" r="3" fill="#38BDF8" />
              <text x="136" y="85" fill="#94A3B8" fontSize="8" fontFamily="monospace">F</text>
              <circle cx="260" cy="70" r="3" fill="#38BDF8" />
              <text x="258" y="85" fill="#94A3B8" fontSize="8" fontFamily="monospace">F&apos;</text>

              {/* Object Arrow at x = 200 - objectDistance */}
              {(() => {
                const objX = Math.max(20, 200 - objectDistance);
                const objHeight = 35;
                const objTop = 70 - objHeight;

                // Image calculation in SVG coordinate space
                const imgX = 200 + Math.min(180, Math.max(-180, imageDistance));
                const imgHeight = Math.min(60, Math.max(-60, objHeight * magnification));
                const imgTop = 70 - imgHeight;

                return (
                  <g>
                    {/* Object */}
                    <line x1={objX} y1="70" x2={objX} y2={objTop} stroke="#10B981" strokeWidth="2.5" />
                    <polygon points={`${objX},${objTop} ${objX - 3},${objTop + 6} ${objX + 3},${objTop + 6}`} fill="#10B981" />
                    <text x={objX - 10} y="85" fill="#10B981" fontSize="8" fontFamily="monospace" fontWeight="bold">Obj</text>

                    {/* Ray 1: Parallel to axis, then through F2 */}
                    <line x1={objX} y1={objTop} x2="200" y2={objTop} stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.9" />
                    <line x1="200" y1={objTop} x2={imgX} y2={imgTop} stroke="#F59E0B" strokeWidth="1.5" strokeOpacity="0.9" />

                    {/* Ray 2: Through optical center (200, 70) */}
                    <line x1={objX} y1={objTop} x2={imgX} y2={imgTop} stroke="#60A5FA" strokeWidth="1.5" strokeOpacity="0.9" />

                    {/* Formed Image Arrow */}
                    {isFinite(imageDistance) && (
                      <g>
                        <line x1={imgX} y1="70" x2={imgX} y2={imgTop} stroke="#F43F5E" strokeWidth="2.5" strokeDasharray={imageDistance < 0 ? "2 2" : "none"} />
                        <text x={imgX - 8} y="85" fill="#F43F5E" fontSize="8" fontFamily="monospace" fontWeight="bold">Img</text>
                      </g>
                    )}
                  </g>
                );
              })()}
            </svg>

            <div className="absolute top-2 right-2 text-[10px] font-mono-code bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded text-cyan-300 font-semibold">
              Real-Time Physics Engine
            </div>
          </div>

          {/* Interactive Controls & Real-Time Readout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <div className="flex justify-between text-slate-700 mb-1 font-semibold">
                <span>Object Distance (u):</span>
                <span className="font-mono-code text-blue-600">-{objectDistance} cm</span>
              </div>
              <input
                type="range"
                min="70"
                max="170"
                value={objectDistance}
                onChange={(e) => setObjectDistance(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
                aria-label="Adjust Object Distance"
              />
              <span className="text-[10px] text-slate-500">Drag slider to calculate ray refraction</span>
            </div>

            <div className="font-mono-code space-y-1 text-[11px] text-slate-700 border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-3 pt-2 sm:pt-0 font-medium">
              <div className="flex justify-between">
                <span>Focal Length (f):</span>
                <span className="text-blue-600 font-bold">+{focalLength} cm</span>
              </div>
              <div className="flex justify-between">
                <span>Image Distance (v):</span>
                <span className="text-rose-600 font-bold">
                  {isAtFocus ? 'Infinity' : `+${imageDistance.toFixed(1)} cm`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Magnification (m):</span>
                <span className="text-emerald-700 font-bold">
                  {isAtFocus ? 'Undefined' : `${magnification.toFixed(2)}x`}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3">
          {/* Electronics Ohm's Law Simulator */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col justify-center items-center gap-3">
            <div className="flex items-center justify-around w-full max-w-sm text-center">
              <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Voltage (V)</span>
                <span className="text-xl font-extrabold font-mono-code text-blue-600">{voltage}V</span>
              </div>
              <span className="text-lg font-mono-code text-slate-400 font-bold">/</span>
              <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Resistance (R)</span>
                <span className="text-xl font-extrabold font-mono-code text-amber-600">{resistance}Ω</span>
              </div>
              <span className="text-lg font-mono-code text-slate-400 font-bold">=</span>
              <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Current (I)</span>
                <span className="text-xl font-extrabold font-mono-code text-emerald-600">{current}A</span>
              </div>
            </div>

            <div className="w-full max-w-xs mt-2">
              <div className="flex justify-between text-xs text-slate-700 font-semibold mb-1">
                <span>Adjust DC Power Supply:</span>
                <span className="font-mono-code text-blue-600">{voltage} Volts</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
                aria-label="Adjust Voltage"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Interactive Visual for AI Interview System
 * Toggle between Chat Interview & Automated Evaluation and Admin Access-Code & Prompt Dashboard
 */
export const AIInterviewVisual: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'interview' | 'admin'>('interview');
  const [accessCode, setAccessCode] = useState('INT-8472-TS');
  const [difficulty, setDifficulty] = useState<'Intermediate' | 'Senior'>('Intermediate');

  const regenerateCode = () => {
    const num = Math.floor(1000 + Math.random() * 9000);
    setAccessCode(`INT-${num}-TS`);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 shadow-md flex flex-col select-none overflow-hidden">
      {/* Toolbar */}
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('interview')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'interview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>AI Interview Flow</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Admin Console</span>
          </button>
        </div>
        <span className="text-[11px] font-mono-code font-semibold text-indigo-600 hidden sm:inline">
          Supabase + OpenAI
        </span>
      </div>

      {activeTab === 'interview' ? (
        <div className="p-4 space-y-3">
          {/* Simulated Technical Chat */}
          <div className="bg-slate-900 rounded-lg p-3.5 space-y-2.5 text-xs border border-slate-800">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <div className="bg-slate-800/90 text-slate-200 px-3 py-2 rounded-lg rounded-tl-none text-[11px] leading-relaxed">
                Explain how JWT stateless verification works alongside database-backed session revocation.
              </div>
            </div>

            <div className="flex items-start gap-2.5 justify-end">
              <div className="bg-blue-600 text-white px-3 py-2 rounded-lg rounded-tr-none text-[11px] leading-relaxed max-w-[85%]">
                Short-lived JWT access tokens carry signed claims, while refresh session IDs in PostgreSQL support instant revocation on logout or breach.
              </div>
            </div>
          </div>

          {/* Automated AI Evaluation Metrics */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-white rounded-md border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-semibold block">Technical Accuracy</span>
              <span className="text-sm font-extrabold font-mono-code text-emerald-600">9.2 / 10</span>
            </div>
            <div className="p-2 bg-white rounded-md border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-semibold block">Transcript Sync</span>
              <span className="text-xs font-bold text-indigo-600 flex items-center justify-center gap-1 mt-0.5">
                <Database className="w-3 h-3" />
                PostgreSQL
              </span>
            </div>
            <div className="p-2 bg-white rounded-md border border-slate-200/80">
              <span className="text-[10px] text-slate-500 font-semibold block">Status</span>
              <span className="text-xs font-bold text-emerald-700 flex items-center justify-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3" />
                Evaluated
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {/* Admin Dashboard Access Code & Prompt Config */}
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                Candidate Access Code
              </span>
              <button
                type="button"
                onClick={regenerateCode}
                className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                Generate Code
              </button>
            </div>

            <div className="flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-md font-mono-code">
              <span className="font-bold text-slate-900 tracking-wider">{accessCode}</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active · Single Candidate
              </span>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-semibold text-slate-600">Evaluation Prompt Profile:</span>
              <div className="flex items-center gap-1">
                {(['Intermediate', 'Senior'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                      difficulty === lvl
                        ? 'bg-slate-900 text-white'
                        : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono-code">
              <span>Edge Host: Cloudflare</span>
              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                <Send className="w-3 h-3" />
                Prompt Ready
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
