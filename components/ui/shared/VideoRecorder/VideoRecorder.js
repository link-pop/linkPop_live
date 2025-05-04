"use client";

import { useRef, useEffect } from "react";
import { useTranslation } from "@/components/Context/TranslationContext";
import { useContext } from "@/components/Context/Context";
import { Video } from "lucide-react";
import useVideoRecorder from "./useVideoRecorder";
import IconButton from "../IconButton/IconButton";

// * main comp: VideoRecorder
const RecordButton = ({ isRecording, onClick }) => {
  const { t } = useTranslation();

  if (isRecording) {
    return (
      <div onClick={onClick} className={`f aic g5 cp`}>
        <div
          className={`f fwn aic g5 bg-accent/80 text-foreground px15 py5 br20 wsn fz16`}
        >
          <div className={`w-6 h-6 bg_brand`}></div>
          <span>{t("stopRecording")}</span>
        </div>
      </div>
    );
  }

  return (
    <div onClick={onClick} className={`f aic g5 cp`}>
      <div
        className={`f fwn aic g5 bg-accent/80 text-foreground px15 py5 br20 wsn fz16`}
      >
        <div
          className={`w-6 h-6 bg-destructive rounded-full animate-pulse`}
        ></div>
        <span>{t("startRecording")}</span>
      </div>
    </div>
  );
};

const RecorderContent = ({ onVideoRecorded }) => {
  const videoRef = useRef(null);
  const { dialogSet } = useContext();
  const { t } = useTranslation();
  const {
    isRecording,
    isPreviewing,
    startRecording,
    stopRecording,
    cancelRecording,
    videoStreamRef,
  } = useVideoRecorder({
    onVideoRecorded: (file) => {
      onVideoRecorded(file);
      dialogSet({ isOpen: false });
    },
  });

  useEffect(() => {
    if (videoRef.current && videoStreamRef.current && isPreviewing) {
      videoRef.current.srcObject = videoStreamRef.current;
    }
  }, [isPreviewing, videoStreamRef]);

  return (
    <div className={`fc aic jcc h-full`}>
      <div className={`flex-1 w-full bg-muted fcc relative`}>
        {isPreviewing ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            className={`w-full h-full object-cover`}
          />
        ) : (
          <div className={`text-muted-foreground`}>
            {t("cameraPreviewWillAppearHere")}
          </div>
        )}
      </div>

      <div className={`poa cx b15 f aic jcc g5 p-4`}>
        <RecordButton
          isRecording={isRecording}
          onClick={isRecording ? stopRecording : startRecording}
        />

        {/* // ! DON'T DELETE THIS hidden Cancel button  */}
        {/* {isRecording && (
          <div
            onClick={cancelRecording}
            className={`f aic g5 cp ml-4 text-muted-foreground`}
          >
            <VideoOff size={24} />
            <span>{t("cancel")}</span>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default function VideoRecorder({ onVideoRecorded }) {
  const { dialogSet } = useContext();

  const handleClick = () => {
    dialogSet({
      className: `fixed inset-0 w-screen h-screen`,
      contentClassName: `border-none max-w-full max-h-full h-screen w-screen m-0 rounded-none`,
      isOpen: true,
      showCancelBtn: true,
      hasCloseIcon: true,
      showBtns: false,
      comp: <RecorderContent onVideoRecorded={onVideoRecorded} />,
    });
  };

  return <IconButton icon={Video} onClick={handleClick} title="recordVideo" />;
}
