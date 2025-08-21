import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";

export default function TopBar() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [msConnected, setMsConnected] = useState<boolean | null>(null);

  const CLIENT_ID = "bdcf2624-e786-4a59-a8a2-eecabe38ffdd";
  const REDIRECT_URI = "http://localhost:5173/callback";
  const SCOPES = "openid offline_access Calendars.ReadWrite User.Read";

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
      prompt: "consent", // Force consent dialog to appear
    });
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  }

  async function handleMicrosoftDisconnect() {
    if (!accessToken) return;

    try {
      const res = await fetch("http://localhost:8080/api/msgraph/disconnect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        setMsConnected(false);
        // Optionally show a success message
        alert(
          "Microsoft account disconnected. You can now reconnect with updated permissions."
        );
      }
    } catch (err) {
      console.error("Error disconnecting Microsoft account:", err);
      alert("Failed to disconnect Microsoft account.");
    }
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      {/* Left side - App info and current page */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="text-2xl">⚖️</div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">LegalClerk</h1>
            <p className="text-xs text-gray-500">Calendar Management</p>
          </div>
        </div>
      </div>

      {/* Center - Microsoft Connection Status */}
      <div className="flex items-center space-x-3">
        {msConnected === null ? (
          <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              Checking Microsoft connection...
            </span>
          </div>
        ) : msConnected ? (
          <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-800 font-medium">
              Microsoft Connected
            </span>
            <div className="text-green-600">✓</div>
            <button
              onClick={handleMicrosoftDisconnect}
              className="ml-2 px-2 py-1 text-xs bg-green-200 hover:bg-green-300 text-green-800 rounded transition-colors"
              title="Disconnect to refresh permissions"
            >
              Refresh
            </button>
          </div>
        ) : (
          <a
            href={getMicrosoftAuthUrl()}
            className="flex items-center space-x-2 px-3 py-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-800 font-medium">
              Connect Microsoft
            </span>
            <div className="text-red-600">⚠️</div>
          </a>
        )}
      </div>

      {/* Right side - User info and actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-4.5-4.5M9 7H4l4.5 4.5M15 17v-2a3 3 0 00-3-3H9m6 5v-2a3 3 0 00-3-3H9m6 5H9m6-5v-2a3 3 0 00-3-3H9"
            />
          </svg>
          {/* Notification badge */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
            <span className="text-[8px]">2</span>
          </div>
        </button>

        {/* User menu */}
        <div className="flex items-center space-x-3 pl-3 border-l border-gray-200">
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {user?.email?.split("@")[0] || "User"}
            </div>
            <div className="text-xs text-gray-500">
              {user?.email || "Not logged in"}
            </div>
          </div>

          <div className="relative">
            <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu - you can implement this with state later */}
            <div className="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
              <a
                href="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </a>
              <a
                href="/settings"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Settings
              </a>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
