// 'use client';
// import React from "react";
// import { Spin } from "antd";
// import { LoadingOutlined } from "@ant-design/icons";
// import { PRIMARY_COLOR } from "../app/comman";
// import { useGlobalLoading } from "../app/loadingContext";

// const DocklyLoader = (props: any) => {
//   const { loading } = useGlobalLoading();

//   return loading ? (
// <div
//   style={{
//     position: "fixed",
//     top: 0,
//     left: 0,
//     height: "100vh",
//     width: "100vw",
//     display: "flex",
//     flexDirection: "column",
//     alignItems: "center",
//     justifyContent: "center",
//     zIndex: 10000,
//     backgroundColor: "#ffffff", // <- white background
//   }}
// >
//   <Spin
//     indicator={
//       <LoadingOutlined
//         style={{ fontSize: 64, color: PRIMARY_COLOR }}
//         spin
//       />
//     }
//     size="large"
//   />
// </div>
//   ) : null;
// };

// export default DocklyLoader;
// 'use client';
// import React, { useEffect } from "react";
// import { useGlobalLoading } from "../app/loadingContext";

// const LOADER_IMAGE_URL = "/dockly-logo.png";

// const DocklyLoader = () => {
//   const { loading } = useGlobalLoading();

//   // Hide body scroll when loading
//   useEffect(() => {
//     if (loading) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }

//     // Cleanup on unmount
//     return () => {
//       document.body.style.overflow = '';
//     };
//   }, [loading]);

//   return loading ? (
//     <div
//       style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         height: "100vh",
//         width: "100vw",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         zIndex: 10000,
//         backgroundColor: "#ffffff",
//         backdropFilter: "blur(8px)",
//       }}
//     >
//       {/* Logo */}
//       <div className="logo-container">
//         <img
//           src={LOADER_IMAGE_URL}
//           alt="Dockly Logo"
//           className="logo-collapsed"
//           style={{ width: 270, transition: "all 0.3s ease-in-out" }}
//         />
//       </div>

//       {/* Loading text */}
//       <div className="loading-text">
//         <span>Loading</span>
//         <div className="loading-dots-text">
//           <span>.</span>
//           <span>.</span>
//           <span>.</span>
//         </div>
//       </div>

//       <style jsx>{`
//         .logo-container {
//           position: relative;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//         }

//         .logo-collapsed {
//           animation: logo-rotate 8s linear infinite;
//         }

//         .loading-text {
//           display: flex;
//           align-items: center;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//           font-size: 18px;
//           font-weight: 500;
//           color: #6b7280;
//           letter-spacing: 0.5px;
//           margin-top: -24px;
//         }

//         .loading-dots-text {
//           display: flex;
//           margin-left: 4px;
//         }

//         .loading-dots-text span {
//           animation: textDots 1.5s ease-in-out infinite;
//         }

//         .loading-dots-text span:nth-child(1) {
//           animation-delay: 0s;
//         }

//         .loading-dots-text span:nth-child(2) {
//           animation-delay: 0.2s;
//         }

//         .loading-dots-text span:nth-child(3) {
//           animation-delay: 0.4s;
//         }

//         @keyframes logo-rotate {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }

//         @keyframes textDots {
//           0%, 20% {
//             opacity: 0.2;
//             transform: scale(1);
//           }
//           50% {
//             opacity: 1;
//             transform: scale(1.2);
//           }
//           100% {
//             opacity: 0.2;
//             transform: scale(1);
//           }
//         }

//         @media (max-width: 768px) {
//           .logo-collapsed {
//             width: 120px;
//             height: 120px;
//           }

//           .loading-text {
//             font-size: 16px;
//           }
//         }

//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: scale(0.9);
//           }
//           to {
//             opacity: 1;
//             transform: scale(1);
//           }
//         }

//         div[style*="position: fixed"] {
//           animation: fadeIn 0.3s ease-out;
//         }
//       `}</style>
//     </div>
//   ) : null;
// };

// export default DocklyLoader;


'use client';
import React, { useEffect } from "react";
import { useGlobalLoading } from "../app/loadingContext";

interface DocklyLoaderProps {
  loading?: boolean;
}

const DocklyLoader: React.FC<DocklyLoaderProps> = () => {
  // Hide body scroll when loadingconst { loading } = useGlobalLoading();
  const { loading } = useGlobalLoading();
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="loader-overlay">
      {/* Animated background gradient */}
      <div className="background-gradient" />

      {/* Floating particles */}
      <div className="particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`} />
        ))}
      </div>

      {/* Main content container */}
      <div className="content-container">
        {/* Logo container with glow effect */}
        <div className="logo-container">
          <div className="logo-glow" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="96"
            height="96"
            viewBox="0 0 128 128"
            aria-hidden="true"
            className="logo-svg"
          >
            <g fill="#6366F1">
              {/* Top bar */}
              <rect x="34" y="28" width="60" height="16" rx="8">
                <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0s" repeatCount="indefinite" />
              </rect>

              {/* Middle bar */}
              <rect x="26" y="56" width="76" height="16" rx="8">
                <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="0.5s" repeatCount="indefinite" />
              </rect>

              {/* Bottom bar */}
              <rect x="18" y="84" width="92" height="16" rx="8">
                <animate attributeName="opacity" values="0;1;0" dur="1.5s" begin="1s" repeatCount="indefinite" />
              </rect>
            </g>
          </svg>
        </div>

        {/* Enhanced loading text with progress bar */}
        <div className="loading-section">
          <div className="loading-text">
            <span className="loading-label">Loading</span>
            <div className="loading-dots">
              <span className="dot dot-1">.</span>
              <span className="dot dot-2">.</span>
              <span className="dot dot-3">.</span>
            </div>
          </div>

          {/* Progress bar */}
          {/* <div className="progress-container">
            <div className="progress-bar" />
          </div> */}
        </div>
      </div>

      <style jsx>{`
        .loader-overlay {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: 100vw;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          animation: fadeIn 0.4s ease-out;
          overflow: hidden;
        }

        .background-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
          animation: gradientPulse 4s ease-in-out infinite;
        }

        .particles {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(99, 102, 241, 0.3);
          border-radius: 50%;
          animation: float 8s ease-in-out infinite;
        }

        .particle-1 { top: 10%; left: 10%; animation-delay: 0s; }
        .particle-2 { top: 20%; right: 15%; animation-delay: 1s; }
        .particle-3 { top: 60%; left: 20%; animation-delay: 2s; }
        .particle-4 { bottom: 30%; right: 25%; animation-delay: 3s; }
        .particle-5 { top: 80%; left: 60%; animation-delay: 4s; }
        .particle-6 { top: 15%; left: 70%; animation-delay: 0.5s; }
        .particle-7 { bottom: 60%; left: 80%; animation-delay: 1.5s; }
        .particle-8 { top: 40%; right: 30%; animation-delay: 2.5s; }
        .particle-9 { bottom: 20%; left: 40%; animation-delay: 3.5s; }
        .particle-10 { top: 70%; right: 60%; animation-delay: 4.5s; }
        .particle-11 { top: 25%; left: 45%; animation-delay: 1.2s; }
        .particle-12 { bottom: 40%; right: 20%; animation-delay: 2.2s; }
        .particle-13 { top: 55%; left: 15%; animation-delay: 3.2s; }
        .particle-14 { top: 35%; right: 45%; animation-delay: 4.2s; }
        .particle-15 { bottom: 70%; left: 75%; animation-delay: 0.8s; }
        .particle-16 { top: 85%; right: 35%; animation-delay: 1.8s; }
        .particle-17 { top: 5%; left: 55%; animation-delay: 2.8s; }
        .particle-18 { bottom: 15%; right: 65%; animation-delay: 3.8s; }
        .particle-19 { top: 45%; left: 85%; animation-delay: 0.3s; }
        .particle-20 { bottom: 80%; right: 10%; animation-delay: 1.3s; }

        .content-container {
          position: relative;
          z-index: 2;
          text-align: center;
          animation: contentSlideUp 0.6s ease-out 0.2s both;
        }

        .logo-container {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          animation: logoBreath 3s ease-in-out infinite;
        }

        .logo-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: glowPulse 2s ease-in-out infinite;
          filter: blur(20px);
        }

        .logo-svg {
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 4px 20px rgba(99, 102, 241, 0.3));
        }

        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .loading-text {
          display: flex;
          align-items: center;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'SF Pro Display', Roboto, sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #475569;
          letter-spacing: 0.5px;
        }

        .loading-label {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: textShimmer 2s ease-in-out infinite;
        }

        .loading-dots {
          display: flex;
          margin-left: 6px;
          gap: 2px;
        }

        .dot {
          color: #6366f1;
          font-weight: bold;
          animation: dotBounce 1.4s ease-in-out infinite;
        }

        .dot-1 { animation-delay: 0s; }
        .dot-2 { animation-delay: 0.2s; }
        .dot-3 { animation-delay: 0.4s; }

        .progress-container {
          width: 200px;
          height: 3px;
          background: rgba(99, 102, 241, 0.1);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
          background-size: 200% 100%;
          border-radius: 2px;
          animation: progressSlide 2s ease-in-out infinite;
        }

        /* Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }

        @keyframes contentSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes logoBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes glowPulse {
          0%, 100% { 
            opacity: 0.6;
            transform: translate(-50%, -50%) scale(1);
          }
          50% { 
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.1);
          }
        }

        @keyframes gradientPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) translateX(0px);
            opacity: 0.3;
          }
          33% { 
            transform: translateY(-15px) translateX(10px);
            opacity: 0.6;
          }
          66% { 
            transform: translateY(-8px) translateX(-10px);
            opacity: 0.4;
          }
        }

        @keyframes textShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes dotBounce {
          0%, 20%, 80%, 100% {
            opacity: 0.3;
            transform: scale(1) translateY(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) translateY(-8px);
          }
        }

        @keyframes progressSlide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .logo-svg {
            width: 72px;
            height: 72px;
          }

          .logo-glow {
            width: 120px;
            height: 120px;
          }

          .loading-text {
            font-size: 18px;
          }

          .progress-container {
            width: 160px;
          }

          .particle {
            width: 3px;
            height: 3px;
          }
        }

        @media (max-width: 480px) {
          .logo-svg {
            width: 64px;
            height: 64px;
          }

          .logo-glow {
            width: 100px;
            height: 100px;
          }

          .loading-text {
            font-size: 16px;
          }

          .progress-container {
            width: 140px;
            height: 2px;
          }
        }
      `}</style>
    </div>
  );
};

export default DocklyLoader;