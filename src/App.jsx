import { useEffect, useState } from "react";
import "./App.css";
import BookingBoard from "./pages/admin/booking-board/BookingBoard";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <ReadyRoomLoader />;
  }

  return <BookingBoard />;
}

function ReadyRoomLoader() {
  return (
    <div className="readyroom-loader-page" style={loaderPage}>
      <style>
        {`
          @keyframes readyroom-spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          @keyframes readyroom-dot {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.55;
            }
            40% {
              transform: scale(1.12);
              opacity: 1;
            }
          }

          @media (max-width: 900px) {
            .readyroom-loader-page {
              padding: 20px !important;
            }

            .readyroom-loader-panel {
              width: 100% !important;
              min-height: auto !important;
              grid-template-columns: 1fr !important;
              border-radius: 28px !important;
              box-shadow: 8px 8px 0 #111827 !important;
            }

            .readyroom-loader-visual {
              min-height: 300px !important;
              border-right: none !important;
              border-bottom: 3px solid #111827 !important;
              padding: 34px 22px !important;
            }

            .readyroom-loader-content {
              align-items: center !important;
              text-align: center !important;
              padding: 34px 22px 38px !important;
            }

            .readyroom-spinner-ring {
              width: 160px !important;
              height: 160px !important;
              border-width: 7px !important;
              box-shadow: 6px 6px 0 #111827 !important;
            }

            .readyroom-spinner-r {
              width: 92px !important;
              height: 92px !important;
              font-size: 44px !important;
              border-radius: 22px !important;
              box-shadow: 5px 5px 0 #111827 !important;
            }
          }

          @media (max-width: 480px) {
            .readyroom-loader-page {
              padding: 14px !important;
              align-items: center !important;
            }

            .readyroom-loader-panel {
              border-radius: 24px !important;
              box-shadow: 6px 6px 0 #111827 !important;
            }

            .readyroom-loader-visual {
              min-height: 250px !important;
              padding: 28px 18px !important;
            }

            .readyroom-loader-content {
              padding: 28px 18px 32px !important;
            }

            .readyroom-spinner-ring {
              width: 132px !important;
              height: 132px !important;
              border-width: 6px !important;
            }

            .readyroom-spinner-r {
              width: 76px !important;
              height: 76px !important;
              font-size: 36px !important;
              border-radius: 18px !important;
            }

            .readyroom-brand-title {
              font-size: 42px !important;
              letter-spacing: -0.06em !important;
            }

            .readyroom-brand-subtitle {
              font-size: 14px !important;
            }
          }
        `}
      </style>

      <div className="readyroom-loader-panel" style={loaderPanel}>
        <div className="readyroom-loader-visual" style={loaderTop}>
          <div className="readyroom-spinner-ring" style={spinnerRing}>
            <div className="readyroom-spinner-r" style={spinnerR}>
              R
            </div>
          </div>
        </div>

        <div className="readyroom-loader-content" style={loaderContent}>
          <div style={eyebrow}>READYROOM INTERNAL</div>

          <h1 className="readyroom-brand-title" style={brandTitle}>
            ReadyRoom
          </h1>

          <p className="readyroom-brand-subtitle" style={brandSubtitle}>
            Loading workspace...
          </p>

          <div style={progressWrap}>
            <div style={progressBar} />
          </div>

          <div style={dotsRow}>
            <span style={{ ...dot, animationDelay: "0s" }} />
            <span style={{ ...dot, animationDelay: "0.16s" }} />
            <span style={{ ...dot, animationDelay: "0.32s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

const loaderPage = {
  minHeight: "100vh",
  width: "100vw",
  minWidth: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px",
  background:
    "radial-gradient(circle at top left, rgba(239,35,60,0.14), transparent 32%), linear-gradient(135deg, #F7F3EA 0%, #FFF5E8 45%, #FDECEC 100%)",
  overflow: "hidden",
};

const loaderPanel = {
  width: "min(1120px, 100%)",
  minHeight: "min(78vh, 760px)",
  background: "#FFFFFF",
  border: "3px solid #111827",
  borderRadius: "36px",
  boxShadow: "12px 12px 0 #111827",
  display: "grid",
  gridTemplateColumns: "1.12fr 1fr",
  overflow: "hidden",
};

const loaderTop = {
  background:
    "linear-gradient(160deg, #FFF4C2 0%, #FFE8B6 48%, #FFD6D6 100%)",
  borderRight: "3px solid #111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "40px",
  minHeight: "100%",
};

const spinnerRing = {
  width: "220px",
  height: "220px",
  borderRadius: "50%",
  border: "8px solid #111827",
  borderTopColor: "#EF233C",
  borderRightColor: "#EF233C",
  background: "#FFF8DB",
  boxShadow: "8px 8px 0 #111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animation: "readyroom-spin 1.1s linear infinite",
};

const spinnerR = {
  width: "124px",
  height: "124px",
  borderRadius: "28px",
  background: "#EF233C",
  color: "#FFFFFF",
  border: "4px solid #111827",
  boxShadow: "6px 6px 0 #111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "60px",
  fontWeight: 950,
  letterSpacing: "-0.06em",
};

const loaderContent = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "flex-start",
  padding: "52px",
};

const eyebrow = {
  display: "inline-flex",
  alignItems: "center",
  width: "fit-content",
  padding: "8px 12px",
  marginBottom: "18px",
  border: "2px solid #111827",
  borderRadius: "999px",
  background: "#FFB703",
  color: "#111827",
  fontSize: "12px",
  fontWeight: 950,
  letterSpacing: "0.08em",
  boxShadow: "4px 4px 0 #111827",
};

const brandTitle = {
  margin: 0,
  fontSize: "clamp(46px, 6vw, 78px)",
  lineHeight: 0.96,
  fontWeight: 950,
  letterSpacing: "-0.075em",
  color: "#111827",
};

const brandSubtitle = {
  marginTop: "16px",
  marginBottom: 0,
  fontSize: "clamp(15px, 2vw, 20px)",
  fontWeight: 800,
  color: "#475569",
};

const progressWrap = {
  width: "min(340px, 100%)",
  height: "16px",
  marginTop: "26px",
  border: "2px solid #111827",
  borderRadius: "999px",
  background: "#FFFFFF",
  overflow: "hidden",
  boxShadow: "4px 4px 0 #111827",
};

const progressBar = {
  width: "68%",
  height: "100%",
  background: "#EF233C",
  borderRight: "2px solid #111827",
};

const dotsRow = {
  marginTop: "22px",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const dot = {
  width: "14px",
  height: "14px",
  borderRadius: "999px",
  background: "#EF233C",
  border: "2px solid #111827",
  animation: "readyroom-dot 0.9s infinite ease-in-out",
};