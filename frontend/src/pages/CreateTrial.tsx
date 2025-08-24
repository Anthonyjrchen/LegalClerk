import { useCreateTrial } from "../hooks/useCreateTrial";
import { useAuth } from "../AuthProvider";
import TrialDetailsCard from "../components/trial/TrialDetailsCard";
import CustomDatesCard from "../components/trial/CustomDatesCard";
import FormTemplatesCard from "../components/trial/FormTemplatesCard";
import CalendarIntegrationCard from "../components/trial/CalendarIntegrationCard";

export default function CreateTrial() {
  // Get user data and access token
  const { user, session, loading } = useAuth();
  const accessToken = session?.access_token || null; // Microsoft Graph access token from session

  const {
    formData,
    calendarSelections,
    formTemplateReminderSettings,
    customDates,
    selectedFormTemplates,
    calculatedDeadlines,
    availableCalendars,
    availableFormTemplates,
    loadingCalendars,
    handleInputChange,
    handleTargetCalendarToggle,
    handleReminderCalendarToggle,
    handleFormTemplateReminderToggle,
    addCustomDate,
    updateCustomDate,
    removeCustomDate,
    handleFormTemplateToggle,
    handleSubmit,
  } = useCreateTrial({ user, accessToken });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold">Create New Trial</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trial Details */}
        <div className="lg:col-span-2 space-y-6">
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
            calendarSelections={calendarSelections}
            formTemplateReminderSettings={formTemplateReminderSettings}
            selectedFormTemplates={selectedFormTemplates}
            availableFormTemplates={availableFormTemplates}
            loadingCalendars={loadingCalendars}
            onTargetCalendarToggle={handleTargetCalendarToggle}
            onReminderCalendarToggle={handleReminderCalendarToggle}
            onFormTemplateReminderToggle={handleFormTemplateReminderToggle}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
