import { useEffect, useState } from "react";
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
    <div style={loaderPage}>
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
        `}
      </style>

      <div style={loaderPanel}>
        <div style={loaderTop}>
          <div style={spinnerRing}>
            <div style={spinnerR}>R</div>
          </div>
        </div>

        <div style={loaderContent}>
          <h1 style={brandTitle}>ReadyRoom</h1>
          <p style={brandSubtitle}>Loading workspace...</p>

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
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "28px",
  background:
    "linear-gradient(135deg, #F7F3EA 0%, #FFF5E8 45%, #FDECEC 100%)",
};

const loaderPanel = {
  width: "min(1100px, 100%)",
  minHeight: "min(78vh, 760px)",
  background: "#FFFFFF",
  border: "3px solid #111827",
  borderRadius: "36px",
  boxShadow: "12px 12px 0 #111827",
  display: "grid",
  gridTemplateColumns: "1.1fr 1fr",
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
  padding: "48px",
};

const brandTitle = {
  margin: 0,
  fontSize: "clamp(42px, 6vw, 74px)",
  lineHeight: 1,
  fontWeight: 950,
  letterSpacing: "-0.07em",
  color: "#111827",
};

const brandSubtitle = {
  marginTop: "14px",
  marginBottom: 0,
  fontSize: "clamp(15px, 2vw, 20px)",
  fontWeight: 800,
  color: "#475569",
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