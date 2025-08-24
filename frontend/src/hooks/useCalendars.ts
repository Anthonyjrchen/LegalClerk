import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Calendar {
  id: string;
  name: string;
  type: "personal" | "shared" | "group";
  groupName?: string;
  color?: string;
  isDefaultCalendar?: boolean;
}

interface UseCalendarsProps {
  user: any;
  accessToken: string | null;
}

const fetchCalendars = async (accessToken: string): Promise<Calendar[]> => {
  const res = await fetch("http://localhost:8080/api/msgraph/calendars", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.detail || "Failed to fetch calendars");
  }

  const data = await res.json();
  return data.calendars || [];
};

export const useCalendars = ({ user, accessToken }: UseCalendarsProps) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['calendars', user?.id],
    queryFn: () => fetchCalendars(accessToken!),
    enabled: !!user && !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const refreshCalendars = () => {
    queryClient.invalidateQueries({ queryKey: ['calendars', user?.id] });
  };

  return {
    ...query,
    refreshCalendars,
  };
};
