export default function SubHeading({ children, className = "" }) {
  return <h2 className={`tac fz20 fw600 ${className}`}>{children}</h2>;
}
