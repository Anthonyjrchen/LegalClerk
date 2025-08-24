import { useCreateTrial } from "../hooks/useCreateTrial";
import TrialDetailsCard from "../components/trial/TrialDetailsCard";
import CustomDatesCard from "../components/trial/CustomDatesCard";
import FormTemplatesCard from "../components/trial/FormTemplatesCard";
import CalendarIntegrationCard from "../components/trial/CalendarIntegrationCard";

export default function CreateTrial() {
  const {
    formData,
    selectedCalendars,
    reminderSettings,
    customDates,
    selectedFormTemplates,
    calculatedDeadlines,
    availableCalendars,
    availableFormTemplates,
    handleInputChange,
    handleCalendarToggle,
    handleReminderToggle,
    addCustomDate,
    updateCustomDate,
    removeCustomDate,
    handleFormTemplateToggle,
    handleSubmit,
  } = useCreateTrial();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold">Create New Trial</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trial Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card style={{ borderColor: "#ecdbe2" }}>
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
                  placeholder="Any additional details about the trial..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
          <TrialDetailsCard
            formData={formData}
            onInputChange={handleInputChange}
          />

          <CustomDatesCard
            customDates={customDates}
            onAddCustomDate={addCustomDate}
            onUpdateCustomDate={updateCustomDate}
            onRemoveCustomDate={removeCustomDate}
          />

          <FormTemplatesCard
            availableFormTemplates={availableFormTemplates}
            selectedFormTemplates={selectedFormTemplates}
            calculatedDeadlines={calculatedDeadlines}
            onFormTemplateToggle={handleFormTemplateToggle}
          />
        </div>

        {/* Calendar Integration */}
        <div>
          <CalendarIntegrationCard
            availableCalendars={availableCalendars}
            selectedCalendars={selectedCalendars}
            reminderSettings={reminderSettings}
            onCalendarToggle={handleCalendarToggle}
            onReminderToggle={handleReminderToggle}
            onSubmit={handleSubmit}
          />
          <Card style={{ borderColor: "#ecdbe2" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Calendar Integration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm" style={{ color: "#902047" }}>
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
