import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [msConnected, setMsConnected] = useState<boolean | null>(null);
  const CLIENT_ID = "bdcf2624-e786-4a59-a8a2-eecabe38ffdd";
  const REDIRECT_URI = "http://localhost:5173/callback";
  const SCOPES = "openid offline_access Calendars.ReadWrite";

  useEffect(() => {
    async function getSessionAndUser() {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setUser(data.session.user);
        setAccessToken(data.session.access_token);
      }
    }
    getSessionAndUser();
  }, []);

  useEffect(() => {
    async function fetchMsStatus() {
      if (!user || !accessToken) return;
      try {
        const res = await fetch("http://localhost:8080/api/msgraph/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        });
        const data = await res.json();
        setMsConnected(data.connected);
      } catch (err) {
        setMsConnected(false);
      }
    }
    fetchMsStatus();
  }, [user, accessToken]);

  function getMicrosoftAuthUrl() {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      response_mode: "query",
      scope: SCOPES,
      state: "random_state_123",
    });
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      <div className="mb-6">
        <span className="font-semibold">Email:</span>
        <span className="ml-2 text-gray-700">
          {user?.email ?? "Not logged in"}
        </span>
      </div>
      <div className="mb-6">
        <span className="font-semibold">
          Microsoft Graph / Outlook Connection:
        </span>
        <div className="mt-2">
          {msConnected === null ? (
            <span className="text-gray-500">Checking connection...</span>
          ) : msConnected ? (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              disabled
            >
              Microsoft Account Connected
            </button>
          ) : (
            <a
              href={getMicrosoftAuthUrl()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Connect to Microsoft
            </a>
          )}
        </div>
      </div>
      {/* You can show connection status or additional info here */}
    </div>
  );
}
