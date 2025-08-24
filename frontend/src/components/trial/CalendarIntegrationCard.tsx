import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Users, Bell, Save } from "lucide-react";

interface CalendarType {
  id: string;
  name: string;
  owner: string;
  color: string;
}

interface CalendarIntegrationCardProps {
  availableCalendars: CalendarType[];
  selectedCalendars: string[];
  reminderSettings: Record<string, boolean>;
  onCalendarToggle: (calendarId: string) => void;
  onReminderToggle: (calendarId: string) => void;
  onSubmit: () => void;
}

export default function CalendarIntegrationCard({
  availableCalendars,
  selectedCalendars,
  reminderSettings,
  onCalendarToggle,
  onReminderToggle,
  onSubmit,
}: CalendarIntegrationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Select which calendars to add this trial to:
        </p>

        <div className="space-y-3">
          {availableCalendars.map((calendar) => (
            <div key={calendar.id} className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`calendar-${calendar.id}`}
                  checked={selectedCalendars.includes(calendar.id)}
                  onCheckedChange={() => onCalendarToggle(calendar.id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-3 h-3 rounded-full`}
                    style={{
                      backgroundColor:
                        calendar.color === "blue"
                          ? "#f871c0ff"
                          : calendar.color === "green"
                          ? "#10b981"
                          : calendar.color === "orange"
                          ? "#f97316"
                          : calendar.color === "purple"
                          ? "#8b5cf6"
                          : "#ef4444",
                    }}
                  />
                  <Label
                    htmlFor={`calendar-${calendar.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {calendar.name}
                  </Label>
                </div>
              </div>

              {selectedCalendars.includes(calendar.id) && (
                <div className="ml-6 flex items-center space-x-2">
                  <Checkbox
                    id={`reminder-${calendar.id}`}
                    checked={reminderSettings[calendar.id] || false}
                    onCheckedChange={() => onReminderToggle(calendar.id)}
                  />
                  <Label
                    htmlFor={`reminder-${calendar.id}`}
                    className="text-xs text-muted-foreground flex items-center gap-1"
                  >
                    <Bell className="h-3 w-3" />
                    Send reminders to {calendar.owner}
                  </Label>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={onSubmit} variant="pink" className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Create Trial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
