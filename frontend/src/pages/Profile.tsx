import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { useCalendars } from "../hooks/useCalendars";
import { useUserProfile } from "../hooks/UserProfileState";

interface CalendarOption {
  id: string;
  name: string;
  type: "personal" | "shared" | "group";
  groupName?: string;
  color?: string;
  isDefaultCalendar?: boolean;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventResult, setEventResult] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] =
    useState<CalendarOption | null>(null);
  const { profile } = useUserProfile();

  // Use React Query for calendars (same cache as Dashboard!)
  const {
    data: calendars = [],
    isLoading: calendarsLoading,
    error: calendarsError,
    refreshCalendars,
  } = useCalendars({ user, accessToken });

  async function handleTestEvent() {
    setEventResult(null);
    if (!accessToken || !selectedDate || !selectedCalendar) return;

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
          body: JSON.stringify({
            event: testEvent,
            calendar_id: selectedCalendar.id,
          }),
        }
      );
      const data = await res.json();
      console.log("Backend response:", data);
      if (data.error) {
        setEventResult(`Error: ${data.error}`);
      } else {
        setEventResult(
          `Event created in "${selectedCalendar.name}"! ID: ` +
            (data.id || "unknown")
        );
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

  // Auto-select default calendar when calendars are loaded
  useEffect(() => {
    if (calendars.length > 0 && !selectedCalendar) {
      const defaultCalendar = calendars.find(
        (cal: CalendarOption) => cal.isDefaultCalendar
      );
      if (defaultCalendar) {
        setSelectedCalendar(defaultCalendar);
      }
    }
  }, [calendars, selectedCalendar]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      {/* User Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {profile?.display_name?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {profile?.display_name || "Retrieving User..."}
              </h3>
              <p className="text-gray-600">{user?.email || "Not logged in"}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Testing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Calendar Testing
        </h2>
        <p className="text-gray-600 mb-4">
          Test calendar event creation functionality. Make sure your Microsoft
          account is connected in the top bar.
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Calendar
              </label>
              <button
                onClick={refreshCalendars}
                className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
            {calendarsLoading ? (
              <div className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading calendars...</span>
              </div>
            ) : calendarsError ? (
              <div className="px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                Error loading calendars: {calendarsError.message}
              </div>
            ) : calendars.length === 0 ? (
              <div className="px-4 py-2 border border-red-300 rounded-lg bg-red-50 text-red-700">
                No calendars available. Make sure your Microsoft account is
                connected.
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span>
                        {selectedCalendar?.type === "personal" && "👤"}
                        {selectedCalendar?.type === "shared" && "🤝"}
                        {selectedCalendar?.type === "group" && "👥"}
                        {!selectedCalendar && "📅"}
                      </span>
                      <span className="text-gray-700">
                        {selectedCalendar
                          ? selectedCalendar.name
                          : "Select a calendar"}
                      </span>
                      {selectedCalendar?.groupName && (
                        <span className="text-xs text-gray-500">
                          ({selectedCalendar.groupName})
                        </span>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                </PopoverTrigger>
                <PopoverContent className="w-80 p-2 bg-white border shadow-lg">
                  <div className="space-y-1">
                    {calendars.map((calendar) => (
                      <button
                        key={calendar.id}
                        onClick={() => setSelectedCalendar(calendar)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-left hover:bg-gray-100 transition-colors ${
                          selectedCalendar?.id === calendar.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700"
                        }`}
                      >
                        <span className="text-lg">
                          {calendar.type === "personal" && "👤"}
                          {calendar.type === "shared" && "🤝"}
                          {calendar.type === "group" && "👥"}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium">{calendar.name}</div>
                          {calendar.groupName && (
                            <div className="text-xs text-gray-500">
                              {calendar.groupName}
                            </div>
                          )}
                          {calendar.isDefaultCalendar && (
                            <div className="text-xs text-blue-600">
                              Default Calendar
                            </div>
                          )}
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            calendar.type === "personal"
                              ? "bg-blue-100 text-blue-800"
                              : calendar.type === "shared"
                              ? "bg-green-100 text-green-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {calendar.type.charAt(0).toUpperCase() +
                            calendar.type.slice(1)}
                        </div>
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Pick a date"}
                  </span>
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
          </div>

          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            onClick={handleTestEvent}
            disabled={!selectedDate || !selectedCalendar}
          >
            Create Test Event
          </button>

          {(!selectedDate || !selectedCalendar) && (
            <p className="text-sm text-gray-500">
              Please select both a date and a calendar to create an event.
            </p>
          )}

          {eventResult && (
            <div
              className={`p-4 rounded-lg ${
                eventResult.includes("Error")
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-green-50 border border-green-200 text-green-700"
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="text-lg">
                  {eventResult.includes("Error") ? "❌" : "✅"}
                </div>
                <div>
                  <h4 className="font-medium">
                    {eventResult.includes("Error")
                      ? "Test Failed"
                      : "Test Successful"}
                  </h4>
                  <p className="text-sm mt-1">{eventResult}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Account Actions
        </h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="text-xl">🔐</div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Change Password</div>
                <div className="text-sm text-gray-600">
                  Update your account password
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="text-xl">📧</div>
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  Email Preferences
                </div>
                <div className="text-sm text-gray-600">
                  Manage notification settings
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-red-600">
            <div className="flex items-center space-x-3">
              <div className="text-xl">🗑️</div>
              <div className="text-left">
                <div className="font-medium">Delete Account</div>
                <div className="text-sm text-red-500">
                  Permanently delete your account
                </div>
              </div>
            </div>
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
