import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "lucide-react";

interface TrialDetailsProps {
  formData: {
    courtFileNo: string;
    styleOfCause: string;
    trialDate: string;
    trialDuration: string;
    customStartDate: string;
    customEndDate: string;
    notes: string;
  };
  onInputChange: (field: string, value: string) => void;
}

export default function TrialDetailsCard({
  formData,
  onInputChange,
}: TrialDetailsProps) {
  return (
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
              onChange={(e) => onInputChange("courtFileNo", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="trialDate">Trial Date</Label>
            <Input
              id="trialDate"
              type="date"
              value={formData.trialDate}
              onChange={(e) => onInputChange("trialDate", e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="styleOfCause">Style of Cause</Label>
          <Input
            id="styleOfCause"
            placeholder="e.g., Smith v. Johnson Construction Ltd."
            value={formData.styleOfCause}
            onChange={(e) => onInputChange("styleOfCause", e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="trialDuration">Trial Duration</Label>
          <Select
            onValueChange={(value) => onInputChange("trialDuration", value)}
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
                  onInputChange("customStartDate", e.target.value)
                }
              />
            </div>
            <div>
              <Label htmlFor="customEndDate">Trial End Date</Label>
              <Input
                id="customEndDate"
                type="date"
                value={formData.customEndDate}
                onChange={(e) => onInputChange("customEndDate", e.target.value)}
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
            onChange={(e) => onInputChange("notes", e.target.value)}
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}
