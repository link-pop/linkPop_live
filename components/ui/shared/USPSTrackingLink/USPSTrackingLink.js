"use client";

import { ExternalLink } from "lucide-react";

export default function USPSTrackingLink({
  trackingNumber,
  className = "",
  showIcon = true,
  children,
}) {
  if (!trackingNumber) return null;

  const uspsTrackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`;

  return (
    <a
      href={uspsTrackingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline transition-colors ${className}`}
      title={`Track package ${trackingNumber} on USPS`}
      aria-label={`Track package ${trackingNumber} on USPS website`}
    >
      {children || trackingNumber}
      {showIcon && <ExternalLink size={12} className="flex-shrink-0" />}
    </a>
  );
}
