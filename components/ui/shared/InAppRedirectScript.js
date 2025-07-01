import Script from "next/script";

export default function InAppRedirectScript() {
  if (process.env.NODE_ENV !== "production") return null;
  return (
    <Script
      id="iar"
      src="https://auditzy-rum.s3.ap-south-1.amazonaws.com/ixAOuGGu-www.linkpop.net-iar.js"
      strategy="afterInteractive"
    />
  );
}
