import { type Control } from "react-hook-form";
import { videoVisibilityEnum } from "@/db/schema";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VisibilityFieldProps {
  formControl: Control<any>;
}

export const VisibilityField = ({ formControl }: VisibilityFieldProps) => {
  return (
    <FormField
      control={formControl}
      name="visibility"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Visibility</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {videoVisibilityEnum.enumValues.map((val) => (
                <SelectItem key={val} value={val} className="capitalize">
                  {val}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};