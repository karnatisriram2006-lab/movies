import React, { useEffect, useState } from "react";

export default function LiveRegion() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    window.announce = (msg = "") => {
      setMessage("");
      setTimeout(() => setMessage(msg), 50);
    };
    return () => {
      try {
        delete window.announce;
      } catch {
        // ignore cleanup errors
      }
    };
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      id="app-live-region"
    >
      {message}
    </div>
  );
}
