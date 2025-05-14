"use client";

import { AlertCircle, XCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "@/components/Context/TranslationContext";
import Image from "next/image";
import { useState } from "react";
import {
  EROTICA_THRESHOLD,
  WEAPONS_THRESHOLD,
  ALCOHOL_THRESHOLD,
  DRUGS_THRESHOLD,
  OFFENSIVE_THRESHOLD,
} from "@/lib/utils/constants";

/**
 * NSFW Content Alert Component
 * Displays a warning when inappropriate content is detected
 * Showing only selected moderation categories
 */
export default function NSFWContentAlert({ scores, onClose, image }) {
  const { t } = useTranslation();

  // Default scores if not provided
  const detectionScores = scores || {
    // Remaining intensity class
    eroticaScore: 0,

    // Other scores
    weaponsScore: 0,
    alcoholScore: 0,
    drugsScore: 0,
    offensiveScore: 0,
  };

  // Convert scores to percentages for display
  // Remaining intensity class
  const eroticaPercentage = Math.round(
    (detectionScores.eroticaScore || 0) * 100
  );

  // Other scores
  const weaponsPercentage = Math.round(
    (detectionScores.weaponsScore || 0) * 100
  );
  const alcoholPercentage = Math.round(
    (detectionScores.alcoholScore || 0) * 100
  );
  const drugsPercentage = Math.round((detectionScores.drugsScore || 0) * 100);
  const offensivePercentage = Math.round(
    (detectionScores.offensiveScore || 0) * 100
  );

  // Convert thresholds to percentages
  const eroticaThresholdPercentage = Math.round(EROTICA_THRESHOLD * 100);
  const weaponsThresholdPercentage = Math.round(WEAPONS_THRESHOLD * 100);
  const alcoholThresholdPercentage = Math.round(ALCOHOL_THRESHOLD * 100);
  const drugsThresholdPercentage = Math.round(DRUGS_THRESHOLD * 100);
  const offensiveThresholdPercentage = Math.round(OFFENSIVE_THRESHOLD * 100);

  // Check if content is appropriate based on all thresholds
  const isAppropriate =
    (detectionScores.eroticaScore || 0) < EROTICA_THRESHOLD &&
    (detectionScores.weaponsScore || 0) < WEAPONS_THRESHOLD &&
    (detectionScores.alcoholScore || 0) < ALCOHOL_THRESHOLD &&
    (detectionScores.drugsScore || 0) < DRUGS_THRESHOLD &&
    (detectionScores.offensiveScore || 0) < OFFENSIVE_THRESHOLD;

  return (
    <div className="w-full max-w-md mx-auto bg-background rounded-lg overflow-hidden shadow-lg">
      {/* Header with warning */}
      <div
        className={`p-4 ${
          isAppropriate
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        } flex items-center gap-2 justify-center`}
      >
        {isAppropriate ? (
          <CheckCircle className="text-green-600" size={24} />
        ) : (
          <XCircle className="text-red-600" size={24} />
        )}
        <h2 className="text-lg font-semibold">
          {isAppropriate
            ? t("contentIsAppropriate") || "Content is appropriate"
            : t("contentNotAppropriate") || "Content not appropriate"}
        </h2>
      </div>

      {/* Image preview if provided */}
      {image && (
        <div className="p-4 flex justify-center border-b border-gray-200">
          <div className="relative w-40 h-40 overflow-hidden rounded-md">
            <Image
              src={image}
              alt="Flagged content"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Detection scores */}
      <div className="p-4">
        <div className="space-y-3">
          {/* Erotica */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">{t("erotica") || "Erotica"}</span>
              <span className="text-sm font-medium">
                {eroticaPercentage}% / {eroticaThresholdPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${
                  eroticaPercentage >= eroticaThresholdPercentage
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${eroticaPercentage}%` }}
              />
              <div
                className="absolute top-0 h-full border-r-2 border-black"
                style={{ left: `${eroticaThresholdPercentage}%` }}
              />
            </div>
          </div>

          {/* Weapons score */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">{t("weapons") || "Weapons"}</span>
              <span className="text-sm font-medium">
                {weaponsPercentage}% / {weaponsThresholdPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${
                  weaponsPercentage >= weaponsThresholdPercentage
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${weaponsPercentage}%` }}
              />
              <div
                className="absolute top-0 h-full border-r-2 border-black"
                style={{ left: `${weaponsThresholdPercentage}%` }}
              />
            </div>
          </div>

          {/* Alcohol score */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">{t("alcohol") || "Alcohol"}</span>
              <span className="text-sm font-medium">
                {alcoholPercentage}% / {alcoholThresholdPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${
                  alcoholPercentage >= alcoholThresholdPercentage
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${alcoholPercentage}%` }}
              />
              <div
                className="absolute top-0 h-full border-r-2 border-black"
                style={{ left: `${alcoholThresholdPercentage}%` }}
              />
            </div>
          </div>

          {/* Drugs score */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">{t("drugs") || "Drugs"}</span>
              <span className="text-sm font-medium">
                {drugsPercentage}% / {drugsThresholdPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${
                  drugsPercentage >= drugsThresholdPercentage
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${drugsPercentage}%` }}
              />
              <div
                className="absolute top-0 h-full border-r-2 border-black"
                style={{ left: `${drugsThresholdPercentage}%` }}
              />
            </div>
          </div>

          {/* Offensive score */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">{t("offensive") || "Offensive"}</span>
              <span className="text-sm font-medium">
                {offensivePercentage}% / {offensiveThresholdPercentage}%
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden relative">
              <div
                className={`h-full ${
                  offensivePercentage >= offensiveThresholdPercentage
                    ? "bg-red-500"
                    : "bg-amber-500"
                }`}
                style={{ width: `${offensivePercentage}%` }}
              />
              <div
                className="absolute top-0 h-full border-r-2 border-black"
                style={{ left: `${offensiveThresholdPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <div className="p-4 bg-background border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center"
          >
            {t("ok") || "OK"}
          </button>
        </div>
      )}
    </div>
  );
}
