"use client";

import { useEffect, useRef, forwardRef } from "react";
import QRCodeLib from "qrcode";
import { useTheme } from "@/components/ui/shared/ThemeProvider/ThemeProvider";

const QRCode = forwardRef(function QRCode({ value, logo, size = 256, showLogo = false }, ref) {
  const internalCanvasRef = useRef(null);
  const canvasRef = ref || internalCanvasRef;
  const { theme } = useTheme();

  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Use a default value if none is provided
    const qrValue = value || "https://example.com";

    const generateQRCode = async () => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Always use standard QR code colors for better scanning
        // QR codes are designed to be dark on light background
        const darkColor = "#000000";
        const lightColor = "#ffffff";

        // Generate QR code
        await QRCodeLib.toCanvas(canvas, qrValue, {
          width: size,
          margin: 1,
          color: {
            dark: darkColor,
            light: lightColor,
          },
        });

        // Add logo in the center if provided
        if (showLogo && logo && logo.trim() !== "") {
          try {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Try to avoid tainting the canvas
            
            img.onload = () => {
              // Calculate logo size (about 20% of QR code)
              const logoSize = size * 0.2;
              const logoX = (size - logoSize) / 2;
              const logoY = (size - logoSize) / 2;

              // Create circular clipping path for the logo
              ctx.save();
              ctx.beginPath();
              ctx.arc(
                logoX + logoSize / 2,
                logoY + logoSize / 2,
                logoSize / 2,
                0,
                Math.PI * 2
              );
              ctx.closePath();
              ctx.clip();

              // Draw logo
              ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
              ctx.restore();
            };
            
            img.onerror = (err) => {
              console.error("Error loading logo image:", err);
            };
            
            img.src = logo;
          } catch (logoError) {
            console.error("Error processing logo:", logoError);
          }
        }
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, [value, logo, size, showLogo, theme, canvasRef]);

  return (
    <div className="flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        id="qrcode-canvas"
      />
    </div>
  );
});

QRCode.displayName = "QRCode";

export default QRCode;
