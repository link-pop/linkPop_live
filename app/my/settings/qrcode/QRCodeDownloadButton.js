"use client";

import Button2 from "@/components/ui/shared/Button/Button2";
import { useTranslation } from "@/components/Context/TranslationContext";
import { Download } from "lucide-react";
import QRCodeLib from "qrcode";
import { useTheme } from "@/components/ui/shared/ThemeProvider/ThemeProvider";
import html2canvas from "html2canvas";

export default function QRCodeDownloadButton({ 
  profileUrl, 
  canvasRef, 
  containerRef,
  avatar, 
  showAvatar,
  showProfileUrl,
  userName = "user"
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Prepare the file name based on the user's name
  const getFileName = () => {
    const sanitizedName = userName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    return `${sanitizedName}.png`;
  };

  const createHighQualityQRCode = async () => {
    // Create a high-quality QR code with custom rendering
    const canvas = document.createElement("canvas");
    const size = 1200; // Very large size for high quality
    canvas.width = size;
    canvas.height = size + (showProfileUrl ? 200 : 0); // Add space for text if needed
    
    const ctx = canvas.getContext("2d");
    
    // Fill with white background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate the QR code at high resolution
    try {
      // Create a temporary canvas just for the QR code
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = size;
      tempCanvas.height = size;
      
      await QRCodeLib.toCanvas(tempCanvas, profileUrl || "https://example.com", {
        width: size,
        margin: 4, // Larger margin for better scanning
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: 'H' // Highest error correction for better scanning
      });
      
      // Draw the QR code onto our main canvas
      ctx.drawImage(tempCanvas, 0, 0);
      
      // Add the avatar if needed
      if (showAvatar && avatar && avatar.trim() !== "") {
        try {
          // We'll manually add the avatar instead of using the built-in logo option
          // This gives us more control over the quality
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          // Wait for the image to load
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = avatar;
          });
          
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
          
          // Draw white background behind logo
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(logoX, logoY, logoSize, logoSize);
          
          // Draw logo
          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          ctx.restore();
        } catch (logoError) {
          console.error("Error adding logo to QR code:", logoError);
        }
      }
      
      // Add the URL text if needed
      if (showProfileUrl && profileUrl) {
        const textY = size + 50; // Position below the QR code
        
        ctx.fillStyle = "#000000";
        ctx.font = "bold 40px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Handle long URLs by breaking them if needed
        const maxWidth = size - 100;
        const words = profileUrl.split('');
        let line = '';
        let lines = [];
        
        for (let i = 0; i < words.length; i++) {
          const testLine = line + words[i];
          const metrics = ctx.measureText(testLine);
          
          if (metrics.width > maxWidth && i > 0) {
            lines.push(line);
            line = words[i];
          } else {
            line = testLine;
          }
        }
        lines.push(line);
        
        // Draw each line
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], size / 2, textY + (i * 50));
        }
      }
      
      return canvas.toDataURL("image/png");
    } catch (error) {
      console.error("Error creating high-quality QR code:", error);
      throw error;
    }
  };

  const handleDownload = async () => {
    try {
      // Try to create a high-quality QR code directly
      const dataUrl = await createHighQualityQRCode();
      
      // Download the image
      const link = document.createElement("a");
      link.download = getFileName();
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading QR code:", error);
      
      // Fallback to the old method if the new one fails
      try {
        // Last resort: Generate a basic QR code
        const dataUrl = await QRCodeLib.toDataURL(profileUrl || "https://example.com", {
          width: 1200,
          margin: 4,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
          errorCorrectionLevel: 'H'
        });
        
        const link = document.createElement("a");
        link.download = getFileName();
        link.href = dataUrl;
        link.click();
      } catch (fallbackError) {
        console.error("Error with fallback QR code generation:", fallbackError);
      }
    }
  };

  return (
    <Button2
      text={t("downloadQRCode")}
      leftIcon={Download}
      onClick={handleDownload}
      className="w-full mt-4"
    />
  );
}
