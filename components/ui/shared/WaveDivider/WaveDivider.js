export default function WaveDivider({ 
  className = "", 
  fill = "white", 
  position = "bottom",
  flip = false 
}) {
  const positionClass = position === "top" ? "top-0" : "bottom-0";
  const flipClass = flip ? "rotate-180" : "";

  return (
    <div className={`absolute ${positionClass} left-0 w-full ${className}`}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        fill={fill}
        className={`w-full h-[60px] ${flipClass}`}
      >
        <path d="M0,0 C480,100 960,100 1440,0 L1440,120 L0,120 Z" />
      </svg>
    </div>
  );
}
