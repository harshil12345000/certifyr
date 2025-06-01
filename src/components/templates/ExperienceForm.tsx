
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ExperienceData } from "@/types/templates";

const experienceSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  joinDate: z.string().min(1, "Join date is required"),
  resignationDate: z.string().min(1, "Resignation date is required"),
  workPeriod: z.string().min(1, "Work period is required"),
  workDescription: z.string().min(1, "Work description is required"),
  performance: z.string().min(1, "Performance is required"),
  reason: z.string().min(1, "Reason for leaving is required"),
  date: z.string().min(1, "Date is required"),
  place: z.string().min(1, "Place is required"),
  signatoryName: z.string().min(1, "Signatory name is required"),
  signatoryDesignation: z.string().min(1, "Signatory designation is required"),
  includeDigitalSignature: z.boolean().default(false),
});

interface ExperienceFormProps {
  onSubmit: (data: ExperienceData) => void;
  initialData?: Partial<ExperienceData>;
}

export function ExperienceForm({ onSubmit, initialData }: ExperienceFormProps) {
  const form = useForm<ExperienceData>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      fullName: "",
      employeeId: "",
      designation: "",
      department: "",
      joinDate: "",
      resignationDate: "",
      workPeriod: "",
      workDescription: "",
      performance: "Satisfactory",
      reason: "",
      date: new Date().toISOString().split('T')[0],
      place: "",
      signatoryName: "",
      signatoryDesignation: "",
      includeDigitalSignature: false,
      ...initialData,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
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
                <FormLabel>Employee ID *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter employee ID" {...field} />
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
                <FormLabel>Designation *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter designation" {...field} />
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
                <FormLabel>Department *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter department" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="joinDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Join Date *</FormLabel>
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
                <FormLabel>Resignation Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="workPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work Period *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2 years 3 months" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="performance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Performance *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select performance" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Excellent">Excellent</SelectItem>
                    <SelectItem value="Very Good">Very Good</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                    <SelectItem value="Satisfactory">Satisfactory</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="workDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the work responsibilities and achievements" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Leaving *</FormLabel>
              <FormControl>
                <Input placeholder="Enter reason for leaving" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Issue Date *</FormLabel>
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
                <FormLabel>Place *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter place" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="signatoryName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Signatory Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter signatory name" {...field} />
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
                <FormLabel>Signatory Designation *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter signatory designation" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="includeDigitalSignature"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Include Digital Signature</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Use uploaded digital signature in the certificate
                </div>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Generate Experience Certificate
        </Button>
      </form>
    </Form>
  );
}
