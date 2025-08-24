import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Calendar, Users, Bell, Save } from "lucide-react";

interface CalendarType {
  id: string;
  name: string;
  owner: string;
  color: string;
}

export default function CreateTrial() {
  const [formData, setFormData] = useState({
    courtFileNo: "",
    styleOfCause: "",
    trialDate: "",
    trialDuration: "",
    customStartDate: "",
    customEndDate: "",
    notes: "",
  });

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [reminderSettings, setReminderSettings] = useState<
    Record<string, boolean>
  >({});

  // Mock calendar data
  const availableCalendars: CalendarType[] = [
    { id: "1", name: "Personal Calendar", owner: "You", color: "blue" },
    { id: "2", name: "Team Calendar", owner: "Legal Team", color: "green" },
    {
      id: "3",
      name: "John Smith's Calendar",
      owner: "John Smith",
      color: "orange",
    },
    {
      id: "4",
      name: "Sarah Johnson's Calendar",
      owner: "Sarah Johnson",
      color: "purple",
    },
    { id: "5", name: "Court Calendar", owner: "Court Admin", color: "red" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedCalendars((prev) =>
      prev.includes(calendarId)
        ? prev.filter((id) => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  const handleReminderToggle = (calendarId: string) => {
    setReminderSettings((prev) => ({
      ...prev,
      [calendarId]: !prev[calendarId],
    }));
  };

  const handleSubmit = () => {
    alert("Trial created successfully!");
    console.log("Trial Data:", formData);
    console.log("Selected Calendars:", selectedCalendars);
    console.log("Reminder Settings:", reminderSettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold">Create New Trial</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trial Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Trial Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="courtFileNo">Court File Number</Label>
                  <Input
                    id="courtFileNo"
                    placeholder="e.g., S-123456"
                    value={formData.courtFileNo}
                    onChange={(e) =>
                      handleInputChange("courtFileNo", e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="trialDate">Trial Date</Label>
                  <Input
                    id="trialDate"
                    type="date"
                    value={formData.trialDate}
                    onChange={(e) =>
                      handleInputChange("trialDate", e.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="styleOfCause">Style of Cause</Label>
                <Input
                  id="styleOfCause"
                  placeholder="e.g., Smith v. Johnson Construction Ltd."
                  value={formData.styleOfCause}
                  onChange={(e) =>
                    handleInputChange("styleOfCause", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="trialDuration">Trial Duration</Label>
                <Select
                  onValueChange={(value) =>
                    handleInputChange("trialDuration", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent className="!bg-white border border-gray-300 shadow-sm">
                    <SelectItem value="1-day">1 Day</SelectItem>
                    <SelectItem value="2-days">2 Days</SelectItem>
                    <SelectItem value="3-days">3 Days</SelectItem>
                    <SelectItem value="1-week">1 Week</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Duration Fields - Show only when "custom" is selected */}
              {formData.trialDuration === "custom" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="customStartDate">Trial Start Date</Label>
                    <Input
                      id="customStartDate"
                      type="date"
                      value={formData.customStartDate}
                      onChange={(e) =>
                        handleInputChange("customStartDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customEndDate">Trial End Date</Label>
                    <Input
                      id="customEndDate"
                      type="date"
                      value={formData.customEndDate}
                      onChange={(e) =>
                        handleInputChange("customEndDate", e.target.value)
                      }
                    />
                  </div>
                </div>
              )}
              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  className="mt-1"
                  style={{ backgroundColor: "#fffafdff" }}
                  placeholder="Any additional details about the trial..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar Integration */}
        <div>
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
                        onCheckedChange={() =>
                          handleCalendarToggle(calendar.id)
                        }
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
                          onCheckedChange={() =>
                            handleReminderToggle(calendar.id)
                          }
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
                <Button
                  onClick={handleSubmit}
                  variant="pink"
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Trial
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
