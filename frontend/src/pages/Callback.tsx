import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Callback() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const jwt = session?.access_token || "";
        fetch("http://localhost:8080/api/msgraph/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ code }),
          credentials: "include",
        })
          .then((res) => res.json())
          .then(() => {
            // Handle token storage or status
            navigate("/home/profile");
          });
      });
    }
  }, [navigate]);

  return <div>Connecting to Microsoft...</div>;
}
