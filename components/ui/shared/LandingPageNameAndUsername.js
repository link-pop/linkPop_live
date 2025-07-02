export default function LandingPageNameAndUsername({
  name,
  username,
  className = "",
  children,
}) {
  return (
    <div className={`px10 fcc g5 wf ${className}`.trim()}>
      <h1 className="fz28 fw600 Username landing-page-text">{name}</h1>
      <span className="text-sm landing-page-text opacity-85 mt-1">•</span>
      <div className="text-sm landing-page-text opacity-85 mt-1">
        @{username}
      </div>
      {children}
    </div>
  );
}
