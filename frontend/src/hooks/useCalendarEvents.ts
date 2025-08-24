import { useQuery, useQueryClient } from '@tanstack/react-query';

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

interface UseCalendarEventsProps {
  calendarId: string | null;
  accessToken: string | null;
}

const fetchCalendarEvents = async (
  calendarId: string,
  accessToken: string
): Promise<CalendarEvent[]> => {
  const res = await fetch("http://localhost:8080/api/msgraph/calendar-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ calendar_id: calendarId }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to fetch events");
  }

  const data = await res.json();
  return data.events || [];
};

export const useCalendarEvents = ({ calendarId, accessToken }: UseCalendarEventsProps) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['calendarEvents', calendarId],
    queryFn: () => fetchCalendarEvents(calendarId!, accessToken!),
    enabled: !!calendarId && !!accessToken,
    staleTime: 2 * 60 * 1000, // 2 minutes (events change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const refreshEvents = () => {
    if (calendarId) {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents', calendarId] });
    }
  };

  return {
    ...query,
    refreshEvents,
  };
};
