import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { FileText, Clock } from "lucide-react";

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

interface FormTemplatesCardProps {
  availableFormTemplates: FormTemplate[];
  selectedFormTemplates: string[];
  calculatedDeadlines: Record<string, CalculatedDeadline[]>;
  onFormTemplateToggle: (templateId: string) => void;
}

export default function FormTemplatesCard({
  availableFormTemplates,
  selectedFormTemplates,
  calculatedDeadlines,
  onFormTemplateToggle,
}: FormTemplatesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Form Templates & Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p
          className="text-sm text-muted-foreground"
          style={{ color: "#902047" }}
        >
          Select form templates to attach to this trial. Deadlines will be
          automatically calculated based on your trial date:
        </p>

        <div className="space-y-4">
          {availableFormTemplates.map((template) => (
            <div
              key={template.id}
              className="border rounded-lg p-4"
              style={{ borderColor: "#ffd2f4" }}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={`template-${template.id}`}
                  checked={selectedFormTemplates.includes(template.id)}
                  onCheckedChange={() => onFormTemplateToggle(template.id)}
                  className="mt-1"
                />
                <div className="flex-1 space-y-2">
                  <div>
                    <Label
                      htmlFor={`template-${template.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {template.template_name}
                    </Label>
                    <p
                      className="text-xs text-muted-foreground"
                      style={{ color: "#902047" }}
                    >
                      {template.description}
                    </p>
                  </div>

                  {/* Show deadline preview if template is selected */}
                  {selectedFormTemplates.includes(template.id) &&
                    calculatedDeadlines[template.id] && (
                      <div
                        className="mt-3 p-3 rounded-md"
                        style={{ backgroundColor: "#fdf2f8" }}
                      >
                        <h4
                          className="text-xs font-medium mb-2 flex items-center gap-1"
                          style={{ color: "#000000CC" }}
                        >
                          <Clock className="h-3 w-3" />
                          Calculated Deadlines:
                        </h4>
                        <div className="space-y-2">
                          {calculatedDeadlines[template.id].map(
                            (deadline, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-xs"
                              >
                                <span style={{ color: "#902047" }}>
                                  {deadline.deadline_name}
                                </span>
                                <div className="text-right">
                                  {deadline.calculated_date ? (
                                    <>
                                      <div
                                        className="font-medium"
                                        style={{ color: "#902047" }}
                                      >
                                        {new Date(
                                          deadline.calculated_date
                                        ).toLocaleDateString()}
                                      </div>
                                      <div style={{ color: "#902047" }}>
                                        {deadline.days_before}{" "}
                                        {deadline.is_business_days
                                          ? "business"
                                          : ""}{" "}
                                        days before {deadline.reference_date}
                                      </div>
                                    </>
                                  ) : (
                                    <span style={{ color: "#902047" }}>
                                      No reference date set
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFormTemplates.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <FileText
              className="h-8 w-8 mx-auto mb-2"
              style={{ color: "#90204785" }}
            />
            <p className="text-sm" style={{ color: "#90204785" }}>
              No form templates selected
            </p>
            <p className="text-xs" style={{ color: "#90204785" }}>
              Select templates above to see calculated deadlines
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
