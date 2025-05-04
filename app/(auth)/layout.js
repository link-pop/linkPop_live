import Logo from "@/components/Nav/Header/Logo";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SITE1, SITE2 } from "@/config/env";
import ThemeDetector from "./ThemeDetector";
import ClerkThemeStyles from "./ClerkThemeStyles";
import AuthContentWrapper from "./AuthContentWrapper";

const Layout = async ({ children }) => {
  const user = await currentUser();

  // If user is logged in, redirect to home page
  if (user?.id) {
    // Redirect to home page regardless of site type
    redirect("/");
  }

  // Site2 layout
  if (SITE2) {
    return (
      <div className={`!z51 poa l0 t0 f wf min-h-screen bg-background`}>
        <ThemeDetector />
        <ClerkThemeStyles />
        {/* Background SVG */}
        <div className={`dn min-[900px]:fcc w-1/2 oh relative bg-pink-500`}>
          <div
            style={{
              position: "absolute",
              width: "100vw",
              height: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#ffb6c1", // Light pink background
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              version="1.1"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              width="960"
              height="1080"
              preserveAspectRatio="none"
              viewBox="0 0 960 1080"
            >
              <defs>
                <mask id="SvgjsMask1088">
                  <rect width="960" height="1080" fill="#ffffff" />
                </mask>
                <style>
                  {`
              @keyframes float1 {
                0% { transform: translate(0, 0); }
                50% { transform: translate(-10px, 0); }
                100% { transform: translate(0, 0); }
              }
              
              .triangle-float1 {
                animation: float1 5s infinite;
              }
              
              @keyframes float2 {
                0% { transform: translate(0, 0); }
                50% { transform: translate(-5px, -5px); }
                100% { transform: translate(0, 0); }
              }

              .triangle-float2 {
                animation: float2 4s infinite;
              }

              @keyframes float3 {
                0% { transform: translate(0, 0); }
                50% { transform: translate(0, -10px); }
                100% { transform: translate(0, 0); }
              }

              .triangle-float3 {
                animation: float3 6s infinite;
              }
            `}
                </style>
              </defs>

              <g mask="url(#SvgjsMask1088)" fill="none">
                <rect
                  width="960"
                  height="1080"
                  x="0"
                  y="0"
                  fill="rgba(219, 112, 147, 1)" // Palevioletred color
                />

                <path
                  d="M930.585,389.511C1018.839,392.992,1103.495,350.252,1149.662,274.956C1197.983,196.147,1207.396,95.37,1159.362,16.386C1112.888,-60.033,1019.936,-89.282,930.585,-85.277C848.488,-81.597,774.667,-36.427,734.771,35.418C696.021,105.198,700.901,188.93,739.527,258.778C779.552,331.156,847.941,386.251,930.585,389.511"
                  fill="rgba(255,255,255, 0.2)"
                  className="triangle-float2"
                />

                <path
                  d="M591.72 611.57 a170.83 170.83 0 1 0 341.66 0 a170.83 170.83 0 1 0 -341.66 0z"
                  fill="rgba(255,255,255, 0.2)"
                  className="triangle-float1"
                />

                <path
                  d="M692.905,1195.655C745.011,1194.516,781.715,1149.824,806.287,1103.862C829.182,1061.038,839.062,1010.089,814.515,968.19C790.194,926.676,741.019,910.138,692.905,910.332C645.183,910.525,598.002,928.526,572.985,969.165C546.789,1011.719,547.216,1064.852,570.599,1109.015C595.656,1156.34,639.369,1196.825,692.905,1195.655"
                  fill="rgba(255,255,255, 0.2)"
                  className="triangle-float1"
                />

                <path
                  d="M20.48 504.94 a303.96 303.96 0 1 0 607.92 0 a303.96 303.96 0 1 0 -607.92 0z"
                  fill="rgba(255,255,255, 0.2)"
                  className="triangle-float3"
                />
              </g>
            </svg>
          </div>

          {/* left Content */}
          <div className="fc">
            <div className="p30">
              <AuthContentWrapper />
            </div>
          </div>
        </div>

        {/* CLERK */}
        <div className={`wf min-[900px]:w-1/2 fcc bg-card dark:bg-card`}>
          <div className={`w-full fc aic p15`}>
            <div className={`fcc`}>
              <Logo className="mb20 scale-[1.2]" />
            </div>
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Original SITE1 layout
  return (
    <div className={`!z51 poa l0 t0 f wf min-h-screen bg-background`}>
      <ThemeDetector />
      <ClerkThemeStyles />
      {/* Background SVG */}
      <div className={`dn min-[900px]:fcc w-1/2 oh relative bg-blue-500`}>
        <div
          style={{
            position: "absolute",
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#8cf1d7",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="960"
            height="1080"
            preserveAspectRatio="none"
            viewBox="0 0 960 1080"
          >
            <defs>
              <mask id="SvgjsMask1087">
                <rect width="960" height="1080" fill="#ffffff" />
              </mask>
              <style>
                {`
            @keyframes float1 {
              0% { transform: translate(0, 0); }
              50% { transform: translate(-10px, 0); }
              100% { transform: translate(0, 0); }
            }
            
            .triangle-float1 {
              animation: float1 5s infinite;
            }
            
            @keyframes float2 {
              0% { transform: translate(0, 0); }
              50% { transform: translate(-5px, -5px); }
              100% { transform: translate(0, 0); }
            }

            .triangle-float2 {
              animation: float2 4s infinite;
            }

            @keyframes float3 {
              0% { transform: translate(0, 0); }
              50% { transform: translate(0, -10px); }
              100% { transform: translate(0, 0); }
            }

            .triangle-float3 {
              animation: float3 6s infinite;
            }
          `}
              </style>
            </defs>

            <g mask="url(#SvgjsMask1087)" fill="none">
              <rect
                width="960"
                height="1080"
                x="0"
                y="0"
                fill="rgba(0, 175, 240, 1)"
              />

              <path
                d="M930.585,389.511C1018.839,392.992,1103.495,350.252,1149.662,274.956C1197.983,196.147,1207.396,95.37,1159.362,16.386C1112.888,-60.033,1019.936,-89.282,930.585,-85.277C848.488,-81.597,774.667,-36.427,734.771,35.418C696.021,105.198,700.901,188.93,739.527,258.778C779.552,331.156,847.941,386.251,930.585,389.511"
                fill="rgba(255,255,255, 0.2)"
                className="triangle-float2"
              />

              <path
                d="M591.72 611.57 a170.83 170.83 0 1 0 341.66 0 a170.83 170.83 0 1 0 -341.66 0z"
                fill="rgba(255,255,255, 0.2)"
                className="triangle-float1"
              />

              <path
                d="M692.905,1195.655C745.011,1194.516,781.715,1149.824,806.287,1103.862C829.182,1061.038,839.062,1010.089,814.515,968.19C790.194,926.676,741.019,910.138,692.905,910.332C645.183,910.525,598.002,928.526,572.985,969.165C546.789,1011.719,547.216,1064.852,570.599,1109.015C595.656,1156.34,639.369,1196.825,692.905,1195.655"
                fill="rgba(255,255,255, 0.2)"
                className="triangle-float1"
              />

              <path
                d="M20.48 504.94 a303.96 303.96 0 1 0 607.92 0 a303.96 303.96 0 1 0 -607.92 0z"
                fill="rgba(255,255,255, 0.2)"
                className="triangle-float3"
              />
            </g>
          </svg>
        </div>

        {/* left Content */}
        <div className="fc">
          <div className="p30">
            <AuthContentWrapper />
          </div>
        </div>
      </div>

      {/* CLERK */}
      <div className={`wf min-[900px]:w-1/2 fcc bg-card dark:bg-card`}>
        <div className={`w-full fc aic p15`}>
          <div className={`fcc`}>
            <Logo className="mb20 scale-[1.2]" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
