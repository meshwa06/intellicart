"use client";
import { useState } from "react";
import Camera from "@/components/Camera";
import CartPanel from "@/components/CartPanel";
import Receipt from "@/components/Receipt";
import { useCamera } from "@/hooks/useCamera";
import { useDetection } from "@/hooks/useDetection";

export default function Home() {
  const [showReceipt, setShowReceipt] = useState(false);
  const { videoRef, isStreaming, error, startCamera, stopCamera, captureFrame } = useCamera();
  const {
    detections, cart, isDetecting, inferenceTime, lastScanTime,
    subtotal, confirmedCount, startDetection, stopDetection, removeFromCart, clearCart, loadDemo,
  } = useDetection();

  const itemCount = cart.reduce((n, item) => n + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundImage: "url('/background_image.png')", backgroundSize: "cover", backgroundRepeat: "repeat", backgroundAttachment: "fixed" }}>
      {/* Header */}
      <header className="bg-slate-900 text-white px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none">IntelliCart</h1>
              <p className="text-xs text-slate-400 mt-0.5">Object Detection &amp; Auto-Billing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isStreaming && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Camera Live
              </div>
            )}
            {itemCount > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-slate-400">Items:</span>
                <span className="font-bold text-white">{itemCount}</span>
                <span className="text-slate-500 mx-1">·</span>
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-bold text-emerald-400">${subtotal.toFixed(2)}</span>
              </div>
            )}
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-medium border border-slate-700">
              YOLOv26 Powered
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 items-start">
          {/* Camera card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100">
            <Camera
              videoRef={videoRef}
              isStreaming={isStreaming}
              isDetecting={isDetecting}
              confirmedCount={confirmedCount}
              detections={detections}
              inferenceTime={inferenceTime}
              lastScanTime={lastScanTime}
              onStart={startCamera}
              onStop={() => { stopCamera(); clearCart(); }}
              onStartDetect={() => startDetection(captureFrame)}
              onStopDetect={stopDetection}
            />
          </div>

          {/* Billing card */}
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-100 lg:min-h-[540px] flex flex-col">
            <CartPanel
              cart={cart}
              onRemove={removeFromCart}
              onClear={clearCart}
              onReceipt={() => setShowReceipt(true)}
              onDemo={loadDemo}
            />
          </div>
        </div>
      </main>

      {showReceipt && (
        <Receipt cart={cart} onClose={() => setShowReceipt(false)} />
      )}

      <footer className="text-center py-4 text-xs text-slate-600">
        &copy; 2026 IntelliCart. All rights reserved.
      </footer>
    </div>
  );
}
