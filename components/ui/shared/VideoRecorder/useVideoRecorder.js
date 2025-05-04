"use client";

import { useState, useRef, useEffect } from "react";

export default function useVideoRecorder({ onVideoRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const videoStreamRef = useRef(null);
  const chunksRef = useRef([]);

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    // Cleanup on unmount
    return () => {
      if (videoStreamRef.current) {
        videoStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoStreamRef.current = stream;
      setIsPreviewing(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const startRecording = () => {
    if (!videoStreamRef.current) return;

    const mediaRecorder = new MediaRecorder(videoStreamRef.current);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const file = new File([blob], `video-${Date.now()}.webm`, {
        type: "video/webm",
      });

      // Add preview URL to the file object
      Object.defineProperty(file, "preview", {
        value: URL.createObjectURL(blob),
        writable: true,
      });

      onVideoRecorded(file);
      chunksRef.current = [];
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      chunksRef.current = [];
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    isPreviewing,
    startRecording,
    stopRecording,
    cancelRecording,
    videoStreamRef,
  };
}
