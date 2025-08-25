import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Calendar, Plus, X } from "lucide-react";

interface CustomDate {
  id: string;
  name: string;
  date: string;
}

interface CustomDatesCardProps {
  customDates: CustomDate[];
  onAddCustomDate: () => void;
  onUpdateCustomDate: (
    id: string,
    field: "name" | "date",
    value: string
  ) => void;
  onRemoveCustomDate: (id: string) => void;
}

export default function CustomDatesCard({
  customDates,
  onAddCustomDate,
  onUpdateCustomDate,
  onRemoveCustomDate,
}: CustomDatesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Custom Milestone Dates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p
          className="text-sm text-muted-foreground"
          style={{ color: "#902047" }}
        >
          Add important dates related to this trial (e.g., Discovery Deadline,
          Expert Report Due, Pre-trial Conference):
        </p>

        <div className="space-y-3">
          {customDates.map((customDate) => (
            <div
              key={customDate.id}
              className="grid grid-cols-2 gap-3 p-3 border rounded-lg"
            >
              <div>
                <Label htmlFor={`date-name-${customDate.id}`}>Date Name</Label>
                <Input
                  id={`date-name-${customDate.id}`}
                  placeholder="e.g., Discovery Deadline"
                  value={customDate.name}
                  onChange={(e) =>
                    onUpdateCustomDate(customDate.id, "name", e.target.value)
                  }
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor={`date-value-${customDate.id}`}>Date</Label>
                  <Input
                    id={`date-value-${customDate.id}`}
                    type="date"
                    value={customDate.date}
                    onChange={(e) =>
                      onUpdateCustomDate(customDate.id, "date", e.target.value)
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemoveCustomDate(customDate.id)}
                    className="h-10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="pink"
            onClick={onAddCustomDate}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Date
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
