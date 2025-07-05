import React from "react";
import { ExperienceData } from "@/types/templates";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface ExperienceFormProps {
  onSubmit: (data: ExperienceData) => void;
  initialData: ExperienceData;
}

const formSchema = z.object({
  fullName: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" }),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  designation: z.string().min(2, { message: "Designation is required" }),
  department: z.string().min(2, { message: "Department is required" }),
  joinDate: z.string().min(1, { message: "Join date is required" }),
  resignationDate: z
    .string()
    .min(1, { message: "Resignation date is required" }),
  workDescription: z
    .string()
    .min(2, { message: "Work description is required" }),
  salary: z.string().min(1, { message: "Salary is required" }),
  institutionName: z
    .string()
    .min(2, { message: "Institution name is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  place: z.string().min(2, { message: "Place is required" }),
  signatoryName: z.string().min(2, { message: "Signatory name is required" }),
  signatoryDesignation: z
    .string()
    .min(2, { message: "Designation is required" }),
  includeDigitalSignature: z.boolean().default(false),
});

export function ExperienceForm({ onSubmit, initialData }: ExperienceFormProps) {
  const form = useForm<ExperienceData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const handleFormSubmit = (values: ExperienceData) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Details Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Employee Details</h3>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Employment Period Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Employment Period</h3>

            <FormField
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Join Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resignationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resignation Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g., ₹50,000 per month" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="institutionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Institution Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Work Description Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Work Description</h3>

          <FormField
            control={form.control}
            name="workDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe the employee's work responsibilities and achievements"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Issue Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Place</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Signatory Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Signatory Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="signatoryName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Signatory Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="signatoryDesignation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Designation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Digital Signature Toggle */}
          <FormField
            control={form.control}
            name="includeDigitalSignature"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Digital Signature</FormLabel>
                  <FormDescription className="text-sm text-muted-foreground">
                    Include digital signature in the certificate
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full">
          Update Preview
        </Button>
      </form>
    </Form>
  );
}
