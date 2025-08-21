import { useState, useEffect } from "react";
import { supabase } from "../SupabaseClient";

interface Calendar {
  id: string;
  name: string;
  type: "personal" | "shared" | "group";
  groupName?: string;
  color?: string;
  isDefaultCalendar?: boolean;
}

interface CalendarEvent {
  id: string;
  subject: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  location?: {
    displayName: string;
  };
  organizer?: {
    emailAddress: {
      name: string;
      address: string;
    };
  };
  isAllDay: boolean;
  bodyPreview?: string;
  webLink?: string;
  categories?: string[];
  formattedStartDate?: string;
  formattedStartTime?: string;
  formattedEndTime?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<Calendar | null>(
    null
  );
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);

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
    async function fetchCalendars() {
      if (!user || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await fetch("http://localhost:8080/api/msgraph/calendars", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({}),
        });

        if (res.ok) {
          const data = await res.json();
          setCalendars(data.calendars || []);
        } else {
          const errorData = await res.json();
          setError(errorData.detail || "Failed to fetch calendars");
        }
      } catch (err) {
        setError("Network error or server not reachable");
        console.error("Error fetching calendars:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendars();
  }, [user, accessToken]);

  const fetchCalendarEvents = async (calendar: Calendar) => {
    if (!accessToken) return;

    try {
      setEventsLoading(true);
      setEventsError(null);
      setSelectedCalendar(calendar);

      const res = await fetch(
        "http://localhost:8080/api/msgraph/calendar-events",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ calendar_id: calendar.id }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      } else {
        const errorData = await res.json();
        setEventsError(errorData.detail || "Failed to fetch events");
      }
    } catch (err) {
      setEventsError("Network error or server not reachable");
      console.error("Error fetching events:", err);
    } finally {
      setEventsLoading(false);
    }
  };

  const handleViewEvents = (calendar: Calendar) => {
    if (selectedCalendar?.id === calendar.id) {
      // If same calendar is clicked, toggle the view
      setSelectedCalendar(null);
      setEvents([]);
    } else {
      // Fetch events for the new calendar
      fetchCalendarEvents(calendar);
    }
  };

  const getCalendarTypeColor = (type: string) => {
    switch (type) {
      case "personal":
        return "bg-blue-100 text-blue-800";
      case "shared":
        return "bg-green-100 text-green-800";
      case "group":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCalendarTypeIcon = (type: string) => {
    switch (type) {
      case "personal":
        return "👤";
      case "shared":
        return "🤝";
      case "group":
        return "👥";
      default:
        return "📅";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading calendars...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">⚠️</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">
              Error Loading Calendars
            </h3>
            <p className="text-red-600 mt-1">{error}</p>
            {error.includes("Microsoft account not connected") && (
              <p className="text-sm text-red-500 mt-2">
                Please connect your Microsoft account in the Profile page.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Calendar Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage and view all your connected calendars
        </p>
      </div>

      {/* Calendar Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">📅</div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {calendars.length}
              </div>
              <div className="text-sm text-gray-600">Total Calendars</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👤</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {calendars.filter((cal) => cal.type === "personal").length}
              </div>
              <div className="text-sm text-gray-600">Personal Calendars</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👥</div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {
                  calendars.filter(
                    (cal) => cal.type === "shared" || cal.type === "group"
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Shared Calendars</div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendars List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Your Calendars
          </h2>
        </div>

        {calendars.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No calendars found
            </h3>
            <p className="text-gray-600">
              Connect your Microsoft account to see your calendars here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {calendars.map((calendar) => (
              <div key={calendar.id}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {getCalendarTypeIcon(calendar.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {calendar.name}
                        </h3>
                        {calendar.groupName && (
                          <p className="text-sm text-gray-600">
                            Group: {calendar.groupName}
                          </p>
                        )}
                        {calendar.isDefaultCalendar && (
                          <p className="text-xs text-blue-600 font-medium">
                            Default Calendar
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getCalendarTypeColor(
                          calendar.type
                        )}`}
                      >
                        {calendar.type.charAt(0).toUpperCase() +
                          calendar.type.slice(1)}
                      </span>

                      <button
                        onClick={() => handleViewEvents(calendar)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          selectedCalendar?.id === calendar.id
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        }`}
                      >
                        {selectedCalendar?.id === calendar.id
                          ? "Hide Events"
                          : "View Events"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Events Display */}
                {selectedCalendar?.id === calendar.id && (
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="mb-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        Upcoming Events - {calendar.name}
                      </h4>
                      <p className="text-sm text-gray-600">Next 30 days</p>
                    </div>

                    {eventsLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-gray-600">Loading events...</div>
                      </div>
                    ) : eventsError ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="text-red-600 mr-2">⚠️</div>
                          <div>
                            <h5 className="font-medium text-red-800">
                              Error Loading Events
                            </h5>
                            <p className="text-sm text-red-600">
                              {eventsError}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : events.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-3xl mb-2">📅</div>
                        <h5 className="text-lg font-medium text-gray-900 mb-1">
                          No upcoming events
                        </h5>
                        <p className="text-gray-600">
                          This calendar has no events in the next 30 days.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {events.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-1">
                                  {event.subject || "Untitled Event"}
                                </h5>

                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  <div className="flex items-center space-x-1">
                                    <span>📅</span>
                                    <span>{event.formattedStartDate}</span>
                                  </div>

                                  {!event.isAllDay && (
                                    <div className="flex items-center space-x-1">
                                      <span>🕐</span>
                                      <span>
                                        {event.formattedStartTime} -{" "}
                                        {event.formattedEndTime}
                                      </span>
                                    </div>
                                  )}

                                  {event.isAllDay && (
                                    <div className="flex items-center space-x-1">
                                      <span>🌅</span>
                                      <span>All day</span>
                                    </div>
                                  )}
                                </div>

                                {event.location?.displayName && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                    <span>📍</span>
                                    <span>{event.location.displayName}</span>
                                  </div>
                                )}

                                {event.organizer && (
                                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                                    <span>👤</span>
                                    <span>
                                      {event.organizer.emailAddress.name}
                                    </span>
                                  </div>
                                )}

                                {event.bodyPreview && (
                                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                    {event.bodyPreview}
                                  </p>
                                )}

                                {event.categories &&
                                  event.categories.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {event.categories.map(
                                        (category, index) => (
                                          <span
                                            key={index}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                          >
                                            {category}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  )}
                              </div>

                              {event.webLink && (
                                <a
                                  href={event.webLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-4 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                >
                                  Open
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mr-3">➕</div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Create Event</div>
              <div className="text-sm text-gray-600">Schedule a new event</div>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mr-3">🔄</div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Refresh Calendars</div>
              <div className="text-sm text-gray-600">Update calendar list</div>
            </div>
          </button>

          <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="text-2xl mr-3">⚙️</div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-600">Manage preferences</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
