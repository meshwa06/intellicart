"use client";
import { useEffect, useRef } from "react";
import { Detection } from "@/types";

const COLORS = [
  "#34d399", "#60a5fa", "#f472b6", "#fb923c",
  "#a78bfa", "#facc15", "#38bdf8", "#f87171",
];

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isStreaming: boolean;
  isDetecting: boolean;
  confirmedCount: number;
  detections: Detection[];
  inferenceTime: number | null;
  lastScanTime: Date | null;
  onStart: () => void;
  onStop: () => void;
  onStartDetect: () => void;
  onStopDetect: () => void;
}

export default function Camera({
  videoRef, isStreaming, isDetecting, confirmedCount, detections,
  inferenceTime, lastScanTime, onStart, onStop, onStartDetect, onStopDetect,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    detections.forEach((d, i) => {
      const color = COLORS[i % COLORS.length];
      const x = d.bbox.x1 * canvas.width;
      const y = d.bbox.y1 * canvas.height;
      const w = (d.bbox.x2 - d.bbox.x1) * canvas.width;
      const h = (d.bbox.y2 - d.bbox.y1) * canvas.height;

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, w, h);

      // Corner accents
      const cs = 12;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x, y + cs); ctx.lineTo(x, y); ctx.lineTo(x + cs, y);
      ctx.moveTo(x + w - cs, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cs);
      ctx.moveTo(x + w, y + h - cs); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - cs, y + h);
      ctx.moveTo(x + cs, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - cs);
      ctx.stroke();

      const label = `${d.class}  ${Math.round(d.confidence * 100)}%`;
      ctx.font = "bold 13px 'Inter', sans-serif";
      const tw = ctx.measureText(label).width;
      const lx = x, ly = y > 26 ? y - 26 : y + h + 2;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(lx, ly, tw + 10, 20, 4);
      ctx.fill();
      ctx.fillStyle = "#0f172a";
      ctx.fillText(label, lx + 5, ly + 14);
    });
  }, [detections, videoRef]);

  const lastScanStr = lastScanTime
    ? lastScanTime.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : null;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">Camera Feed</h2>
        {isStreaming ? (
          isDetecting ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              DETECTING
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              LIVE
            </span>
          )
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            OFFLINE
          </span>
        )}
      </div>

      {/* Video */}
      <div className="relative bg-slate-950 aspect-video w-full overflow-hidden">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Scan animation */}
        {isDetecting && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="animate-scanline absolute left-0 right-0 h-px"
              style={{
                background: "linear-gradient(to right, transparent, #34d399 30%, #34d399 70%, transparent)",
                boxShadow: "0 0 12px 3px rgba(52,211,153,0.5)",
              }}
            />
            <div className="absolute inset-0 bg-emerald-950/10" />
          </div>
        )}

        {/* Camera offline placeholder */}
        {!isStreaming && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950">
            <svg className="w-12 h-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <p className="text-slate-500 text-sm">Camera is offline</p>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 flex-wrap">
        <StatChip
          dot="bg-emerald-500"
          label={inferenceTime !== null ? `${inferenceTime} ms` : "— ms"}
          title="Inference time"
        />
        <StatChip
          dot="bg-purple-400"
          label={`${detections.length} object${detections.length !== 1 ? "s" : ""}`}
          title="Objects in current frame"
        />
        <StatChip
          dot="bg-blue-400"
          label={`${confirmedCount} confirmed`}
          title="Objects confirmed (visible > 10 frames)"
        />
        <StatChip
          dot="bg-slate-400"
          label={lastScanStr ?? "Not started"}
          title="Last inference time"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2.5 px-4 py-3">
        {!isStreaming ? (
          <button
            onClick={onStart}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
          >
            <CameraIcon />
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={onStop}
              disabled={isDetecting}
              className="flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 disabled:opacity-40 disabled:cursor-not-allowed text-rose-600 border border-rose-200 font-medium py-2.5 px-4 rounded-lg transition-colors text-sm"
            >
              <StopIcon />
              Stop Camera
            </button>
            {!isDetecting ? (
              <button
                onClick={onStartDetect}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                <ScanIcon />
                Start Detect
              </button>
            ) : (
              <button
                onClick={onStopDetect}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                <SpinnerIcon />
                Stop Detect
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function StatChip({ dot, label, title }: { dot: string; label: string; title: string }) {
  return (
    <span title={title} className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      <span className="font-mono">{label}</span>
    </span>
  );
}

function CameraIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
