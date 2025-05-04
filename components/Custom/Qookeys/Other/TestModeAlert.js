"use client";

import { useContext } from "@/components/Context/Context";
import { FlaskConical } from "lucide-react";

export default function TestModeAlert() {
  const { dialogSet } = useContext();

  const handleClick = () => {
    dialogSet({
      isOpen: true,
      title: "FOR TESTING PURPOSES",
      comp: (
        <>
          <div>- Every user receives 80% of the admin privileges. </div>
          <div>
            - Use the bank card number 4242 4242 4242 4242 for testing
            purchases.
          </div>
        </>
      ),
      showCancelBtn: false,
    });
  };

  return (
    <div
      onClick={handleClick}
      className="opacity-80 hover:opacity-50 active:opacity-30 w45 h45 fcc bg_white fixed b15 l15 p-3 rounded-full shadow-lg transition-colors duration-300 z-50 overflow-hidden cursor-pointer"
      title="Test Mode Info"
    >
      <FlaskConical
        className="w-6 h-6 text-red-400"
        style={{
          animation: "pulse 1s infinite",
        }}
      />
      <style jsx>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.07);
            opacity: 0.7;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
