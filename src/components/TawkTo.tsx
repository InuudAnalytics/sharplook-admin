import { useEffect } from "react";

const TawkTo = () => {
  useEffect(() => {
    // Prevent script from being added multiple times
    if (document.getElementById("tawkto-script")) return;

    const s1 = document.createElement("script");
    s1.id = "tawkto-script";
    s1.async = true;
    s1.src = "https://embed.tawk.to/68962bc4a4fc79192a7be4d6/1j259lvhl";
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.body.appendChild(s1);

    // Cleanup on unmount
    return () => {
      if (s1.parentNode) {
        s1.parentNode.removeChild(s1);
      }
    };
  }, []);

  return null;
};

export default TawkTo;
