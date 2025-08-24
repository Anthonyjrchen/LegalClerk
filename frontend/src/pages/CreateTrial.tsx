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
        </div>
      </div>
    </div>
  );
}
