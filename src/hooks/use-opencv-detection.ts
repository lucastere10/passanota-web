"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const FRAME_INTERVAL_MS = 100;
const SHARPNESS_BLUR_THRESHOLD = 18;
const COOLDOWN_MS = 8000;
const CAPTURE_FLASH_MS = 150;
const SHARPNESS_CROP_SIZE = 100;

type UseOpencvDetectionOptions = {
  enabled?: boolean;
  onCapture: (file: File, thumbnailDataUrl: string) => void;
};

function computeSharpness(imageData: ImageData): number {
  const { data, width, height } = imageData;
  const cropW = Math.min(SHARPNESS_CROP_SIZE, width);
  const cropH = Math.min(SHARPNESS_CROP_SIZE, height);
  const startX = Math.floor((width - cropW) / 2);
  const startY = Math.floor((height - cropH) / 2);

  let sum = 0;
  let sum2 = 0;
  let n = 0;

  for (let y = startY; y < startY + cropH; y++) {
    for (let x = startX; x < startX + cropW; x++) {
      const i = (y * width + x) * 4;
      const g = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
      sum += g;
      sum2 += g * g;
      n++;
    }
  }

  if (n === 0) return 0;
  const mean = sum / n;
  return sum2 / n - mean * mean;
}

function playShutterSound() {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = 800;
    gain.gain.value = 0.15;
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.08);
    oscillator.onended = () => void ctx.close();
  } catch {
    // Audio not available
  }
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return "Permissão da câmera negada. Autorize o acesso nas configurações do navegador.";
    }
    if (error.name === "NotFoundError") {
      return "Nenhuma câmera encontrada neste dispositivo.";
    }
    if (error.name === "NotReadableError") {
      return "A câmera está em uso por outro aplicativo.";
    }
  }
  return "Não foi possível iniciar a câmera. Tente novamente.";
}

export function useOpencvDetection({
  enabled = true,
  onCapture,
}: UseOpencvDetectionOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const analysisCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const cooldownEndsAtRef = useRef(0);
  const isCapturingRef = useRef(false);
  const onCaptureRef = useRef(onCapture);

  const [isCooldown, setIsCooldown] = useState(false);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);
  const [isBlurry, setIsBlurry] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    pendingStreamRef.current = null;
    setVideoReady(false);
  }, []);

  const attachStreamToVideo = useCallback(async (video: HTMLVideoElement, stream: MediaStream) => {
    video.srcObject = stream;
    video.muted = true;
    video.setAttribute("playsinline", "true");

    if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
      await new Promise<void>((resolve, reject) => {
        const onReady = () => {
          video.removeEventListener("loadedmetadata", onReady);
          video.removeEventListener("error", onError);
          resolve();
        };
        const onError = () => {
          video.removeEventListener("loadedmetadata", onReady);
          video.removeEventListener("error", onError);
          reject(new Error("Falha ao carregar stream da câmera"));
        };
        video.addEventListener("loadedmetadata", onReady);
        video.addEventListener("error", onError);
      });
    }

    await video.play();
    setVideoReady(true);
    setCameraError(null);
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Câmera não suportada neste navegador");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;

      if (video) {
        await attachStreamToVideo(video, stream);
      } else {
        pendingStreamRef.current = stream;
      }
    } catch (error) {
      stopCamera();
      setCameraError(cameraErrorMessage(error));
    }
  }, [attachStreamToVideo, stopCamera]);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;

      if (!node) {
        setVideoReady(false);
        return;
      }

      const stream = pendingStreamRef.current ?? streamRef.current;
      if (!stream) return;

      pendingStreamRef.current = null;
      void attachStreamToVideo(node, stream).catch((error) => {
        stopCamera();
        setCameraError(cameraErrorMessage(error));
      });
    },
    [attachStreamToVideo, stopCamera],
  );

  const captureFrame = useCallback((): { file: File; thumbnailDataUrl: string } | null => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0);
    const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.7);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    const byteString = atob(dataUrl.split(",")[1] ?? "");
    const buffer = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }
    const file = new File([buffer], `nota-${Date.now()}.jpg`, { type: "image/jpeg" });

    return { file, thumbnailDataUrl };
  }, []);

  const triggerCapture = useCallback(() => {
    const captured = captureFrame();
    if (!captured) return;

    playShutterSound();
    isCapturingRef.current = true;
    setIsCapturing(true);
    onCaptureRef.current(captured.file, captured.thumbnailDataUrl);

    window.setTimeout(() => {
      isCapturingRef.current = false;
      setIsCapturing(false);

      const endsAt = Date.now() + COOLDOWN_MS;
      cooldownEndsAtRef.current = endsAt;
      setIsCooldown(true);

      const tickInterval = window.setInterval(() => {
        const left = Math.ceil((cooldownEndsAtRef.current - Date.now()) / 1000);
        setCooldownSecondsLeft(Math.max(0, left));
        if (left <= 0) window.clearInterval(tickInterval);
      }, 500);

      window.setTimeout(() => {
        window.clearInterval(tickInterval);
        setCooldownSecondsLeft(0);
        setIsCooldown(false);
      }, COOLDOWN_MS);
    }, CAPTURE_FLASH_MS);
  }, [captureFrame]);

  const manualCapture = useCallback(() => {
    if (isCapturingRef.current || Date.now() < cooldownEndsAtRef.current) {
      return;
    }
    triggerCapture();
  }, [triggerCapture]);

  useEffect(() => {
    if (!enabled) return;

    const frameId = requestAnimationFrame(() => {
      void startCamera();
    });
    return () => cancelAnimationFrame(frameId);
  }, [enabled, startCamera]);

  useEffect(() => {
    if (!enabled) {
      stopCamera();
      return;
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
      stopCamera();
    };
  }, [enabled, stopCamera]);

  useEffect(() => {
    if (!enabled || !videoReady) return;

    if (!analysisCanvasRef.current) {
      analysisCanvasRef.current = document.createElement("canvas");
    }

    const processFrame = (timestamp: number) => {
      rafRef.current = requestAnimationFrame(processFrame);

      if (timestamp - lastFrameTimeRef.current < FRAME_INTERVAL_MS) {
        return;
      }
      lastFrameTimeRef.current = timestamp;

      const video = videoRef.current;
      const analysisCanvas = analysisCanvasRef.current;

      if (
        !video ||
        !analysisCanvas ||
        video.videoWidth === 0 ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        isCapturingRef.current
      ) {
        return;
      }

      analysisCanvas.width = video.videoWidth;
      analysisCanvas.height = video.videoHeight;
      const ctx = analysisCanvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);
      const sharpness = computeSharpness(imageData);
      setIsBlurry(sharpness < SHARPNESS_BLUR_THRESHOLD);
    };

    rafRef.current = requestAnimationFrame(processFrame);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, videoReady]);

  return {
    setVideoRef,
    isCooldown,
    cooldownSecondsLeft,
    isBlurry,
    isCapturing,
    cameraError,
    videoReady,
    retryCamera: startCamera,
    manualCapture,
    captureFrame,
  };
}
