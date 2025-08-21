import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [msConnected, setMsConnected] = useState<boolean | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const CLIENT_ID = "bdcf2624-e786-4a59-a8a2-eecabe38ffdd";
  const REDIRECT_URI = "http://localhost:5173/callback";
  const SCOPES = "openid offline_access Calendars.ReadWrite";
  const [eventResult, setEventResult] = useState<string | null>(null);
  async function handleTestEvent() {
    setEventResult(null);
    if (!accessToken || !selectedDate) return;
    // Format start and end time using selectedDate for all-day event
    const startDate = selectedDate.toISOString().split("T")[0]; // Get YYYY-MM-DD format
    const endDate = new Date(selectedDate);
    endDate.setDate(endDate.getDate() + 1); // Add 1 day for all-day events
    const endDateString = endDate.toISOString().split("T")[0];

    const testEvent = {
      subject: "Test Event",
      isAllDay: true,
      start: {
        dateTime: startDate,
        timeZone: "Pacific Standard Time",
      },
      end: {
        dateTime: endDateString,
        timeZone: "Pacific Standard Time",
      },
      body: { contentType: "HTML", content: "This is a test all-day event." },
    };
    try {
      const res = await fetch(
        "http://localhost:8080/api/msgraph/create-event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ event: testEvent }),
        }
      );
      const data = await res.json();
      console.log("Backend response:", data);
      if (data.error) {
        setEventResult(`Error: ${data.error}`);
      } else {
        setEventResult("Event created! ID: " + (data.id || "unknown"));
      }
    } catch (err) {
      setEventResult("Network error or server not reachable.");
    }
  }

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

  // Return JSX inside the function block
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
            <div>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded mb-2"
                disabled
              >
                Microsoft Account Connected
              </button>
              <div className="flex items-center gap-2 mb-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded border"
                    >
                      {selectedDate
                        ? selectedDate.toLocaleDateString()
                        : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border shadow-lg">
                    <Calendar
                      mode="single"
                      required={true}
                      selected={selectedDate ?? undefined}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <button
                  className="px-4 py-2 bg-yellow-500 text-white rounded"
                  onClick={handleTestEvent}
                  disabled={!selectedDate}
                >
                  Test Create Calendar Event
                </button>
              </div>
              {eventResult && (
                <div className="mt-2 text-sm text-gray-700">{eventResult}</div>
              )}
            </div>
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
