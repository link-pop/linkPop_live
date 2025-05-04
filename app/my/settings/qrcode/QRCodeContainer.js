"use client";

import QRCode from "@/app/my/settings/qrcode/QRCode";
import { useTranslation } from "@/components/Context/TranslationContext";
import QRCodeDownloadButton from "./QRCodeDownloadButton";
import { useTheme } from "@/components/ui/shared/ThemeProvider/ThemeProvider";
import { useRef } from "react";

export default function QRCodeContainer({
  profileUrl,
  avatar,
  showProfileUrl,
  showAvatar,
  userName,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Get the actual URL to use - always use the profile URL for the QR code
  const qrCodeUrl = profileUrl || "https://example.com";

  // Set container background color based on theme
  const containerBgColor = theme === "dark" ? "bg-gray-800" : "bg-gray-100";

  return (
    <div className="px15 flex flex-col items-center">
      <p className="text-center mb-4">{t("qrCodeDescription")}</p>
      <div ref={containerRef} className="flex flex-col items-center">
        <div className={`p-4 ${containerBgColor} rounded-lg shadow-sm mb-4`}>
          <div className={theme === "dark" ? "p-2 bg-gray-700 rounded" : ""}>
            <QRCode
              value={qrCodeUrl}
              logo={showAvatar ? avatar : ""}
              showLogo={showAvatar}
              size={256}
              ref={canvasRef}
            />
          </div>
        </div>
        {showProfileUrl && (
          <div className="px15 text-foreground font-bold text-base mb-4 text-center break-all">
            {profileUrl}
          </div>
        )}
      </div>
      <QRCodeDownloadButton
        profileUrl={qrCodeUrl}
        canvasRef={canvasRef}
        containerRef={containerRef}
        avatar={showAvatar ? avatar : ""}
        showAvatar={showAvatar}
        showProfileUrl={showProfileUrl}
        userName={userName}
      />
    </div>
  );
}
