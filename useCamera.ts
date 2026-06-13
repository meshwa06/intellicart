"use client";
import { useRef, useState, useCallback } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    setIsStreaming(false);
  }, []);

  const captureFrame = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = videoRef.current;
      if (!video || !video.videoWidth) return reject("Video not ready");

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")!.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject("Capture failed")),
        "image/jpeg",
        0.85
      );
    });
  }, []);

  return { videoRef, isStreaming, error, startCamera, stopCamera, captureFrame };
}
