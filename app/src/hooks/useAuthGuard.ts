import { useEffect } from "react";

export function useAuthGuard() {
  useEffect(() => {
    const granted = sessionStorage.getItem("bio_auth") === "true";
    if (!granted) {
      window.location.href = "/login";
    }
  }, []);
}
