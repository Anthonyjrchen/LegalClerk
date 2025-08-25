import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Users, Calendar, Bell, Save, Loader2 } from "lucide-react";

interface MicrosoftGraphCalendar {
  id: string;
  name: string;
  owner: {
    name: string;
    address: string;
  };
  color: string;
  canEdit: boolean;
  isShared: boolean;
}

interface CalendarSelections {
  targetCalendars: string[];
  reminderCalendars: string[];
}

interface FormTemplateReminderSettings {
  [templateId: string]: {
    [calendarId: string]: boolean;
  };
}

interface CalendarIntegrationCardProps {
  availableCalendars: MicrosoftGraphCalendar[];
  calendarSelections: CalendarSelections;
  formTemplateReminderSettings: FormTemplateReminderSettings;
  selectedFormTemplates: string[];
  availableFormTemplates: any[];
  loadingCalendars: boolean;
  onTargetCalendarToggle: (calendarId: string) => void;
  onReminderCalendarToggle: (calendarId: string) => void;
  onFormTemplateReminderToggle: (
    templateId: string,
    calendarId: string
  ) => void;
  onSubmit: () => void;
}

export default function CalendarIntegrationCard({
  availableCalendars,
  calendarSelections,
  formTemplateReminderSettings,
  selectedFormTemplates,
  availableFormTemplates,
  loadingCalendars,
  onTargetCalendarToggle,
  onReminderCalendarToggle,
  onFormTemplateReminderToggle,
  onSubmit,
}: CalendarIntegrationCardProps) {
  const getCalendarColor = (color: string, index: number) => {
    const colors = [
      "#3b82f6",
      "#10b981",
      "#f97316",
      "#8b5cf6",
      "#ef4444",
      "#ec4899",
    ];
    return colors[index % colors.length];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Calendar Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loadingCalendars ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading calendars...</span>
          </div>
        ) : (
          <>
            {/* Target Calendars Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <h4 className="font-medium">Target Calendars</h4>
              </div>
              <p
                className="text-sm text-muted-foreground"
                style={{ color: "#902047" }}
              >
                Select calendars where trial events will be created:
              </p>

              <div className="space-y-2">
                {availableCalendars.map((calendar, index) => (
                  <div
                    key={`target-${calendar.id}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`target-calendar-${calendar.id}`}
                      checked={calendarSelections.targetCalendars.includes(
                        calendar.id
                      )}
                      onCheckedChange={() =>
                        onTargetCalendarToggle(calendar.id)
                      }
                      disabled={!calendar.canEdit}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCalendarColor(
                            calendar.color,
                            index
                          ),
                        }}
                      />
                      <Label
                        htmlFor={`target-calendar-${calendar.id}`}
                        className={`text-sm cursor-pointer ${
                          !calendar.canEdit ? "text-gray-400" : ""
                        }`}
                      >
                        {calendar.name}
                        {calendar.isShared && " (Shared)"}
                        {!calendar.canEdit && " (Read-only)"}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reminder Calendars Section */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <h4 className="font-medium">Reminder Calendars</h4>
              </div>
              <p
                className="text-sm text-muted-foreground"
                style={{ color: "#902047" }}
              >
                Select calendars where deadline reminders will be created:
              </p>

              <div className="space-y-2">
                {availableCalendars.map((calendar, index) => (
                  <div
                    key={`reminder-${calendar.id}`}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`reminder-calendar-${calendar.id}`}
                      checked={calendarSelections.reminderCalendars.includes(
                        calendar.id
                      )}
                      onCheckedChange={() =>
                        onReminderCalendarToggle(calendar.id)
                      }
                      disabled={!calendar.canEdit}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCalendarColor(
                            calendar.color,
                            index
                          ),
                        }}
                      />
                      <Label
                        htmlFor={`reminder-calendar-${calendar.id}`}
                        className={`text-sm cursor-pointer ${
                          !calendar.canEdit ? "text-gray-400" : ""
                        }`}
                      >
                        {calendar.name}
                        {calendar.isShared && " (Shared)"}
                        {!calendar.canEdit && " (Read-only)"}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Template Specific Reminder Settings */}
            {selectedFormTemplates.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="font-medium">
                  Template-Specific Reminder Settings
                </h4>
                <p className="text-sm text-muted-foreground">
                  Choose which calendars get reminders for each form template:
                </p>

                <div className="space-y-4">
                  {selectedFormTemplates.map((templateId) => {
                    const template = availableFormTemplates.find(
                      (t) => t.id === templateId
                    );
                    if (!template) return null;

                    return (
                      <div
                        key={templateId}
                        className="p-3 border rounded-lg space-y-2"
                      >
                        <h5 className="text-sm font-medium">
                          {template.template_name}
                        </h5>
                        <div className="grid grid-cols-1 gap-2">
                          {calendarSelections.reminderCalendars.map(
                            (calendarId) => {
                              const calendar = availableCalendars.find(
                                (c) => c.id === calendarId
                              );
                              if (!calendar) return null;

                              return (
                                <div
                                  key={`${templateId}-${calendarId}`}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`template-${templateId}-calendar-${calendarId}`}
                                    checked={
                                      formTemplateReminderSettings[
                                        templateId
                                      ]?.[calendarId] || false
                                    }
                                    onCheckedChange={() =>
                                      onFormTemplateReminderToggle(
                                        templateId,
                                        calendarId
                                      )
                                    }
                                  />
                                  <Label
                                    htmlFor={`template-${templateId}-calendar-${calendarId}`}
                                    className="text-xs cursor-pointer"
                                  >
                                    {calendar.name}
                                  </Label>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        <div className="pt-4 border-t">
          <Button
            onClick={onSubmit}
            variant="pink"
            className="w-full"
            disabled={loadingCalendars}
          >
            <Save className="h-4 w-4 mr-2" />
            Create Trial
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
