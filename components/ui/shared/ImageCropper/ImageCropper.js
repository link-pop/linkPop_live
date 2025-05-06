"use client";

import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import Button from "@/components/ui/shared/Button/Button2";
import { useTranslation } from "@/components/Context/TranslationContext";
import { ZoomIn, ZoomOut } from "lucide-react";

// ! code start ImageCropper
const ImageCropper = ({
  image,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  cropShape = "round", // 'round' or 'rect'
  minZoom = 1,
  maxZoom = 3,
}) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="fc g20 h-full">
      <div className="relative w-full h-[70dvh]">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onCropComplete={handleCropComplete}
          onZoomChange={setZoom}
          cropShape={cropShape}
          minZoom={minZoom}
          maxZoom={maxZoom}
          showGrid={true}
        />
      </div>

      <div className="flex items-center justify-center gap-4 p-4 bg-background/80 rounded-lg">
        <div className="flex items-center space-x-2">
          <ZoomOut size={20} className="text-muted-foreground" />
          <input
            type="range"
            value={zoom}
            min={minZoom}
            max={maxZoom}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-48 h-2"
          />
          <ZoomIn size={20} className="text-muted-foreground" />
        </div>
      </div>

      <div className="fcc g15">
        <Button variant="outline" onClick={onCancel} className="min-w-24">
          {t("cancel")}
        </Button>
        <Button onClick={handleCrop} className="min-w-24">
          {t("applyCrop")}
        </Button>
      </div>
    </div>
  );
};
// ? code end ImageCropper

export default ImageCropper;
