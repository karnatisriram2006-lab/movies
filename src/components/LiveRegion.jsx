import React, { useEffect, useState } from "react";

export default function LiveRegion() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // expose a simple global announcer: window.announce(message)
    window.announce = (msg = "", politeness = "polite") => {
      setMessage("");
      // small delay to ensure assistive tech picks up repeated messages
      setTimeout(() => setMessage(msg), 50);
    };
    return () => {
      try {
        delete window.announce;
      } catch (e) {}
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
