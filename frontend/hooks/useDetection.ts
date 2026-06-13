"use client";
import { useState, useCallback, useRef } from "react";
import { Detection, CartItem } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const CONFIDENCE_THRESHOLD = 0.65;
const FRAME_THRESHOLD = 5;

interface TrackedObject {
  frames: number;
  maxCount: number;
  unitPrice: number;
}

export function useDetection() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [inferenceTime, setInferenceTime] = useState<number | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);

  const loopRef = useRef(false);
  const trackedRef = useRef<Record<string, TrackedObject>>({});

  const startDetection = useCallback((captureFrame: () => Promise<Blob>) => {
    loopRef.current = true;
    trackedRef.current = {};
    setIsDetecting(true);
    setDetections([]);
    setConfirmedCount(0);

    const loop = async () => {
      if (!loopRef.current) return;

      try {
        const t0 = performance.now();
        const frame = await captureFrame();

        const formData = new FormData();
        formData.append("file", frame, "frame.jpg");

        const res = await fetch(`${API_URL}/detect`, { method: "POST", body: formData });
        if (!res.ok) throw new Error("Detection failed");

        const data: { detections: Detection[] } = await res.json();
        setInferenceTime(Math.round(performance.now() - t0));
        setLastScanTime(new Date());

        // Only keep detections above confidence threshold
        const confident = data.detections.filter(d => d.confidence >= CONFIDENCE_THRESHOLD);
        setDetections(confident);

        // Group by class to count simultaneous instances
        const byClass: Record<string, Detection[]> = {};
        for (const d of confident) {
          if (!byClass[d.class]) byClass[d.class] = [];
          byClass[d.class].push(d);
        }

        // Update per-class tracking using ref (no re-render on every frame)
        for (const [cls, instances] of Object.entries(byClass)) {
          const best = instances.reduce((a, b) => a.confidence > b.confidence ? a : b);
          const prev = trackedRef.current[cls];
          trackedRef.current[cls] = {
            frames: prev ? prev.frames + 1 : 1,
            maxCount: prev ? Math.max(prev.maxCount, instances.length) : instances.length,
            unitPrice: best.price,
          };
        }

        // Update confirmed count for live UI display
        const confirmed = Object.values(trackedRef.current)
          .filter(t => t.frames > FRAME_THRESHOLD).length;
        setConfirmedCount(confirmed);

      } catch {
        // silently continue loop on network/inference errors
      }

      if (loopRef.current) {
        setTimeout(loop, 120); // ~8 fps
      }
    };

    loop();
  }, []);

  const stopDetection = useCallback(() => {
    loopRef.current = false;
    setIsDetecting(false);
    setDetections([]);

    // Build bill from confirmed objects only
    const confirmed = Object.entries(trackedRef.current)
      .filter(([_, t]) => t.frames > FRAME_THRESHOLD)
      .map(([name, t]) => ({
        name,
        quantity: t.maxCount,
        unitPrice: t.unitPrice,
      }));

    setCart(confirmed);
    trackedRef.current = {};
    setConfirmedCount(0);
  }, []);

  const loadDemo = useCallback(() => {
    setCart([
      { name: "Chocolate", quantity: 2, unitPrice: 4.00 },
      { name: "Instant Noodles", quantity: 3, unitPrice: 2.00 },
      { name: "Drink", quantity: 1, unitPrice: 3.00 },
      { name: "Milk", quantity: 1, unitPrice: 4.50 },
      { name: "Puffed Food", quantity: 2, unitPrice: 3.50 },
    ]);
    setInferenceTime(47);
    setLastScanTime(new Date());
  }, []);

  const removeFromCart = useCallback((name: string) => {
    setCart(prev => prev.filter(item => item.name !== name));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setDetections([]);
    trackedRef.current = {};
    setConfirmedCount(0);
    setInferenceTime(null);
    setLastScanTime(null);
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return {
    detections, cart, isDetecting, inferenceTime, lastScanTime,
    subtotal, confirmedCount,
    startDetection, stopDetection, loadDemo, removeFromCart, clearCart,
  };
}
