import { useState, useEffect } from "react";

interface CustomDate {
  id: string;
  name: string;
  date: string;
}

interface FormTemplateDeadline {
  id: string;
  deadline_name: string;
  days_before: number;
  is_business_days: boolean;
  reference_type: string;
  custom_reference_name?: string;
}

interface FormTemplate {
  id: string;
  template_name: string;
  description: string;
  deadlines: FormTemplateDeadline[];
}

interface CalculatedDeadline {
  deadline_name: string;
  calculated_date: string;
  reference_date: string;
  reference_type: string;
  days_before: number;
  is_business_days: boolean;
}

interface CalendarType {
  id: string;
  name: string;
  owner: string;
  color: string;
}

export function useCreateTrial() {
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
  const [reminderSettings, setReminderSettings] = useState<Record<string, boolean>>({});
  const [customDates, setCustomDates] = useState<CustomDate[]>([]);
  const [selectedFormTemplates, setSelectedFormTemplates] = useState<string[]>([]);
  const [calculatedDeadlines, setCalculatedDeadlines] = useState<Record<string, CalculatedDeadline[]>>({});

  // Mock data
  const availableCalendars: CalendarType[] = [
    { id: "1", name: "Personal Calendar", owner: "You", color: "blue" },
    { id: "2", name: "Team Calendar", owner: "Legal Team", color: "green" },
    { id: "3", name: "John Smith's Calendar", owner: "John Smith", color: "orange" },
    { id: "4", name: "Sarah Johnson's Calendar", owner: "Sarah Johnson", color: "purple" },
    { id: "5", name: "Court Calendar", owner: "Court Admin", color: "red" },
  ];

  const availableFormTemplates: FormTemplate[] = [
    {
      id: "1",
      template_name: "Civil Litigation Package",
      description: "Standard deadlines for civil litigation cases",
      deadlines: [
        {
          id: "1",
          deadline_name: "File Statement of Defense",
          days_before: 21,
          is_business_days: true,
          reference_type: "trial_date",
        },
        {
          id: "2",
          deadline_name: "Discovery Deadline",
          days_before: 120,
          is_business_days: true,
          reference_type: "trial_date",
        },
        {
          id: "3",
          deadline_name: "Expert Report Deadline",
          days_before: 90,
          is_business_days: true,
          reference_type: "trial_date",
        },
      ],
    },
    {
      id: "2",
      template_name: "Family Law Package",
      description: "Deadlines for family law proceedings",
      deadlines: [
        {
          id: "4",
          deadline_name: "File Financial Statement",
          days_before: 30,
          is_business_days: true,
          reference_type: "trial_date",
        },
        {
          id: "5",
          deadline_name: "Parenting Assessment Due",
          days_before: 60,
          is_business_days: true,
          reference_type: "trial_date",
        },
      ],
    },
    {
      id: "3",
      template_name: "Criminal Defense Package",
      description: "Standard deadlines for criminal defense cases",
      deadlines: [
        {
          id: "6",
          deadline_name: "Disclosure Review",
          days_before: 45,
          is_business_days: true,
          reference_type: "trial_date",
        },
        {
          id: "7",
          deadline_name: "Expert Evidence Notice",
          days_before: 30,
          is_business_days: true,
          reference_type: "trial_date",
        },
      ],
    },
  ];

  // Helper function to calculate business days
  const addBusinessDays = (startDate: Date, businessDays: number): Date => {
    const result = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0 && result.getDay() !== 6) {
        daysAdded++;
      }
    }

    return result;
  };

  // Calculate deadline date based on reference date and deadline settings
  const calculateDeadlineDate = (referenceDate: string, deadline: FormTemplateDeadline): string => {
    if (!referenceDate) return "";

    const refDate = new Date(referenceDate);
    let deadlineDate: Date;

    if (deadline.is_business_days) {
      deadlineDate = addBusinessDays(refDate, -deadline.days_before);
    } else {
      deadlineDate = new Date(refDate);
      deadlineDate.setDate(deadlineDate.getDate() - deadline.days_before);
    }

    return deadlineDate.toISOString().split("T")[0];
  };

  // Update calculated deadlines when templates or dates change
  const updateCalculatedDeadlines = (templateIds: string[]) => {
    const newCalculatedDeadlines: Record<string, CalculatedDeadline[]> = {};

    templateIds.forEach((templateId) => {
      const template = availableFormTemplates.find((t) => t.id === templateId);
      if (!template) return;

      const deadlines: CalculatedDeadline[] = template.deadlines.map((deadline) => {
        let referenceDate = "";
        let referenceDateValue = "";

        if (deadline.reference_type === "trial_date") {
          referenceDate = "Trial Date";
          referenceDateValue = formData.trialDate;
        } else if (deadline.custom_reference_name) {
          const customDate = customDates.find((cd) => cd.name === deadline.custom_reference_name);
          referenceDate = deadline.custom_reference_name;
          referenceDateValue = customDate?.date || "";
        }

        return {
          deadline_name: deadline.deadline_name,
          calculated_date: calculateDeadlineDate(referenceDateValue, deadline),
          reference_date: referenceDate,
          reference_type: deadline.reference_type,
          days_before: deadline.days_before,
          is_business_days: deadline.is_business_days,
        };
      });

      newCalculatedDeadlines[templateId] = deadlines;
    });

    setCalculatedDeadlines(newCalculatedDeadlines);
  };

  // Event handlers
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

  const addCustomDate = () => {
    const newDate: CustomDate = {
      id: Date.now().toString(),
      name: "",
      date: "",
    };
    setCustomDates((prev) => [...prev, newDate]);
  };

  const updateCustomDate = (id: string, field: "name" | "date", value: string) => {
    setCustomDates((prev) =>
      prev.map((date) => (date.id === id ? { ...date, [field]: value } : date))
    );
  };

  const removeCustomDate = (id: string) => {
    setCustomDates((prev) => prev.filter((date) => date.id !== id));
  };

  const handleFormTemplateToggle = (templateId: string) => {
    setSelectedFormTemplates((prev) => {
      const newSelection = prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId];

      updateCalculatedDeadlines(newSelection);
      return newSelection;
    });
  };

  const handleSubmit = () => {
    alert("Trial created successfully!");
    console.log("Trial Data:", formData);
    console.log("Selected Calendars:", selectedCalendars);
    console.log("Reminder Settings:", reminderSettings);
    console.log("Custom Dates:", customDates);
    console.log("Selected Form Templates:", selectedFormTemplates);
    console.log("Calculated Deadlines:", calculatedDeadlines);
  };

  // Recalculate deadlines when trial date or custom dates change
  useEffect(() => {
    if (selectedFormTemplates.length > 0) {
      updateCalculatedDeadlines(selectedFormTemplates);
    }
  }, [formData.trialDate, customDates]);

  return {
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
  };
}
