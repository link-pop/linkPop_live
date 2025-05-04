import "./HeroBannerCTAButton.css";

export default function HeroBannerCTAButton({ text }) {
  return (
    <button className="h60 fz12 ttu HeroBannerCTAButton">
      <i className="animation-dot" />
      {text}
      <i className="animation-dot" />
    </button>
  );
}
