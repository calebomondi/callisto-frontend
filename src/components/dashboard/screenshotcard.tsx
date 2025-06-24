import { forwardRef } from "react";

interface ScreenshotCardProps {
  emoji: string;
  name: string;
  score: string | number;
  message: string;
}

// Apply prop types and ref type to forwardRef
const ScreenshotCard = forwardRef<HTMLDivElement, ScreenshotCardProps>(
  ({ emoji, name, score, message }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
          border: "none",
          pointerEvents: "none",
          backgroundColor: "#1a1a2e",
          width: "500px",
          padding: "24px",
          borderRadius: "16px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            border: "none",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "192px",
              height: "192px",
              borderRadius: "9999px",
              overflow: "hidden",
              border: "4px solid #a855f7",
            }}
          >
            <img
              src={emoji}
              alt="Character"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <h1
            style={{
              color: "#d8b4fe",
              textAlign: "center",
              border: "none",
              fontSize: "2.5em",
              fontWeight: 700,
              backgroundImage: "linear-gradient(to right, #c084fc, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {name}
          </h1>
          <div
            style={{
                border: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center"
            }}
          >
            <div
                style={{
                fontSize: "1.3em",
                fontWeight: "bold",
                border: "none",
                color: "#d8b4fe"
                }}
            >
                Wallet Score
            </div>
            <div
                style={{
                fontSize: "2em",
                fontWeight: "bold",
                border: "none",
                backgroundImage: "linear-gradient(to right, #c084fc, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                }}
            >
                {score}
            </div>
          </div>
          <p
            style={{
              color: "#d8b4fe",
              textAlign: "center",
              border: "none",
              fontSize: "18px",
              fontWeight: 500,
              padding: "0 12px",
            }}
          >
            “{message}”
          </p>
          <p
            style={{
              color: "#d8b4fe",
              textAlign: "center",
              border: "none",
              fontSize: "16px",
              fontWeight: 500,
              padding: "0 12px",
            }}
          >
            To check your wallet health score, visit fvp.finance
          </p>
        </div>
      </div>
    );
  }
);

export default ScreenshotCard;
