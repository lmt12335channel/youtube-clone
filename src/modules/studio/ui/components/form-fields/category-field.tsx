import { type Control } from "react-hook-form";
import { z } from "zod";
import { categorySelectSchema } from "@/db/schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Dùng z.infer để tạo ra type từ Zod schema
type SelectCategory = z.infer<typeof categorySelectSchema>;

interface CategoryFieldProps {
  formControl: Control<any>;
  categories: SelectCategory[];
}

export const CategoryField = ({ formControl, categories }: CategoryFieldProps) => {
  return (
    <FormField
      control={formControl}
      name="categoryId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value ?? undefined} // Xử lý trường hợp value là null
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
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